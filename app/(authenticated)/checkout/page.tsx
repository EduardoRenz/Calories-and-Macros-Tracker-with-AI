'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { Plan } from '../../../domain/entities/payment';
import { CheckoutSummary } from '../../../components/payment/CheckoutSummary';
import { ClientGatewayFactory } from '../../../data/ClientGatewayFactory';
import { RepositoryFactory } from '../../../data/RepositoryFactory';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get('planId');
    const { user, loading: authLoading } = useAuth();
    const { language } = useLanguage();
    const { t } = useTranslation();

    const [plan, setPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If not authenticated, the layout ProtectedRoute should handle it, 
        // but just in case or for better UX we might want to ensure we have a planId
        if (!planId) {
            router.push('/plans');
            return;
        }

        const fetchPlan = async () => {
            try {
                const plansRepository = RepositoryFactory.getPlansRepository();
                const plans = await plansRepository.getPlans(language);
                const selected = plans.find((p: Plan) => p.id === planId);
                if (selected) {
                    setPlan(selected);
                } else {
                    // Invalid plan
                    router.push('/plans');
                }
            } catch (error) {
                console.error('Failed to load plan', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlan();
    }, [planId, language, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan || !user) return;

        setIsProcessing(true);
        setError(null);
        try {
            const plansRepository = RepositoryFactory.getPlansRepository();
            const mapping = await plansRepository.getProviderMapping(plan.id, 'abacatepay');

            if (!mapping) {
                throw new Error('Payment mapping not found for this plan');
            }

            const paymentGateway = ClientGatewayFactory.getPaymentGateway();

            const baseUrl = window.location.origin;
            const result = await paymentGateway.createHostedSubscriptionCheckout({
                userId: user.uid,
                planCode: plan.id,
                providerProductId: mapping.providerProductId,
                providerPriceAmount: mapping.providerPriceAmount,
                currency: mapping.currency,
                successUrl: `${baseUrl}/dashboard?payment_success=true`,
                cancelUrl: `${baseUrl}/plans`,
                customerEmail: user.email || undefined,
            });

            if (result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
                return;
            }

            throw new Error('Failed to retrieve checkout URL');
        } catch (error: unknown) {
            console.error('Checkout creation failed', error);
            const message = error instanceof Error ? error.message : String(error);
            setError(message || t('checkout.redirect_failed') || t('checkout.payment_failed'));
        } finally {
            setIsProcessing(false);
        }
    };

    if (authLoading || isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (!plan) return null;

    return (
        <div className="max-w-7xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-colors"
            >
                <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </div>
                <span>{t('checkout.back')}</span>
            </button>

            <h1 className="text-3xl font-bold mb-2 text-white">{t('checkout.title')}</h1>
            <p className="text-gray-400 mb-8">{t('checkout.subtitle')}</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Contact Info */}
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </div>
                            <h2 className="text-lg font-semibold text-white">{t('checkout.contact_information')}</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">{t('checkout.email_address')}</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                className="w-full rounded-lg border border-gray-800 bg-black/50 p-3 text-white focus:outline-none cursor-not-allowed opacity-75"
                            />
                        </div>
                    </div>

                    {/* Checkout Action Section */}
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>
                            </div>
                            <h2 className="text-lg font-semibold text-white">{t('checkout.confirm_purchase')}</h2>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500">
                                <div className="flex items-center gap-2 mb-2 font-semibold">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>{t('common.error') || 'Error'}</span>
                                </div>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <p className="text-gray-400 mb-8">
                            {t('checkout.hosted_redirect_notice') || 'You will be redirected to a secure payment page provided by AbacatePay to complete your subscription.'}
                        </p>

                        <form onSubmit={handleSubmit}>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full rounded-xl bg-healthpal-green py-4 text-center font-bold text-black transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? t('checkout.processing_payment') : (t('checkout.confirm_and_pay') || 'Confirm and Pay →')}
                            </button>
                        </form>
                        <p className="mt-4 text-center text-xs text-gray-500">
                            {t('checkout.secure_payments')}
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <CheckoutSummary plan={plan} taxRate={0} />
                </div>
            </div>

            {isProcessing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                        <h3 className="text-xl font-semibold text-white">{t('checkout.processing_payment')}</h3>
                        <p className="text-sm text-gray-400">{t('checkout.processing_message')}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
