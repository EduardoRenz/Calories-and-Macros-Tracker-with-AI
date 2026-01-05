'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RepositoryFactory } from '../../../data/RepositoryFactory';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Plan, PaymentMethodType } from '../../../domain/entities/payment';
import { CheckoutSummary } from '../../../components/payment/CheckoutSummary';
import { PaymentMethodSelector } from '../../../components/payment/PaymentMethodSelector';
import { CheckoutForm } from '../../../components/payment/CheckoutForm';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get('planId');
    const { user, loading: authLoading } = useAuth();
    const { language } = useLanguage();

    const [plan, setPlan] = useState<Plan | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('card');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // If not authenticated, the layout ProtectedRoute should handle it, 
        // but just in case or for better UX we might want to ensure we have a planId
        if (!planId) {
            router.push('/plans');
            return;
        }

        const fetchPlan = async () => {
            try {
                const paymentRepo = RepositoryFactory.getPaymentRepository();
                const plans = await paymentRepo.getPlans(language);
                const selected = plans.find(p => p.id === planId);
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
        try {
            const paymentRepo = RepositoryFactory.getPaymentRepository();
            // Since we are mocking, we just collect arbitrary form data or pass basic info
            await paymentRepo.processPayment({
                userId: user.uid,
                planId: plan.id,
                paymentMethod: selectedMethod,
            });

            // Redirect to success or history
            // Ideally show a success modal or page.
            // For now, redirect to dashboard with a query param
            router.push('/dashboard?payment_success=true');
        } catch (error) {
            console.error('Payment failed', error);
            alert('Payment failed. Please try again.');
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
                <span>Back</span>
            </button>

            <h1 className="text-3xl font-bold mb-2 text-white">Checkout</h1>
            <p className="text-gray-400 mb-8">Complete your secure payment to upgrade</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Contact Info */}
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </div>
                            <h2 className="text-lg font-semibold text-white">Contact Information</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email address</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                className="w-full rounded-lg border border-gray-800 bg-black/50 p-3 text-white focus:outline-none cursor-not-allowed opacity-75"
                            />
                        </div>
                    </div>

                    {/* Payment Method Section */}
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>
                            </div>
                            <h2 className="text-lg font-semibold text-white">Payment Method</h2>
                        </div>

                        <div className="mb-6">
                            <PaymentMethodSelector selectedMethod={selectedMethod} onSelect={setSelectedMethod} />
                        </div>

                        <form id="checkout-form" onSubmit={handleSubmit}>
                            {selectedMethod === 'card' && <CheckoutForm />}
                            {selectedMethod === 'paypal' && <div className="text-center py-8 text-gray-400">PayPal integration mock</div>}
                            {selectedMethod === 'pix' && <div className="text-center py-8 text-gray-400">Pix integration mock (QR Code generation)</div>}
                            {selectedMethod === 'crypto' && <div className="text-center py-8 text-gray-400">Crypto integration mock</div>}
                        </form>
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
                        <h3 className="text-xl font-semibold text-white">Processing Payment...</h3>
                        <p className="text-sm text-gray-400">Please do not close this window</p>
                    </div>
                </div>
            )}
        </div>
    );
}
