'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Currency, Plan } from '../../domain/entities/payment';
import { BILLING_CONSTANTS } from '../../domain/constants/billing';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import { PlanCard } from '../../components/payment/PlanCard';
import PublicNavbar from '../../components/PublicNavbar';
import { Footer } from '../../components/Footer';
import { RepositoryFactory } from '../../data/RepositoryFactory';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { FeatureFlags } from '../../domain/repositories/FeatureFlagRepository';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

function PlansContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const { language } = useLanguage();
    const { isFeatureEnabled, loading: flagsLoading } = useFeatureFlags();
    const { user } = useAuth();
    const { subscription, loading: subscriptionLoading } = useSubscription();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

    // Get current plan ID from subscription
    const currentPlanId = subscription?.planId || 'free';

    useEffect(() => {
        // Only check feature flag after flags are loaded
        if (!flagsLoading && !isFeatureEnabled(FeatureFlags.ENABLE_PLANS)) {
            // Redirect authenticated users to dashboard, unauthenticated to home
            if (user) {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        }
    }, [isFeatureEnabled, router, user, flagsLoading]);

    useEffect(() => {
        const fetchPlans = async () => {
            setIsLoading(true);
            try {
                const plansRepository = RepositoryFactory.getPlansRepository();
                const allPlans = await plansRepository.getPlans(language);

                // Create hardcoded Free Plan
                const freePlan = Plan.create({
                    id: 'free',
                    name: t('settings.subscription.plan_free') || 'Free',
                    description: t('settings.subscription.free_description') || 'Basic access',
                    price: 0,
                    currency: Currency.create(language === 'pt' ? 'BRL' : 'USD'),
                    interval: 'month',
                    features: [], // Handled by PlanCard translation logic
                    isPopular: false,
                    provider: 'internal',
                    externalPlanId: 'free',
                });

                // Filter out any 'free' plan that might come from DB to avoid duplicates
                const remotePlans = allPlans.filter(p => p.id !== 'free');
                setPlans([freePlan, ...remotePlans]);
            } catch (error) {
                console.error('Failed to fetch plans', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, [language, t]);

    useEffect(() => {
        const cycleFromUrl = searchParams.get('billing') as 'month' | 'year';
        if (cycleFromUrl && (cycleFromUrl === 'month' || cycleFromUrl === 'year')) {
            setBillingCycle(cycleFromUrl);
        }
    }, [searchParams]);

    const updateBillingCycle = (cycle: 'month' | 'year') => {
        setBillingCycle(cycle);
        const params = new URLSearchParams(searchParams.toString());
        params.set('billing', cycle);
        router.push(`/plans?${params.toString()}`, { scroll: false });
    };

    const handleSelectPlan = (plan: Plan) => {
        if (plan.price === 0) {
            router.push('/login');
        } else {
            router.push(`/checkout?planId=${plan.id}`);
        }
    };

    // Filter plans based on billing cycle (except free which is usually monthly or unique)
    const displayedPlans = plans.filter(plan => {
        if (plan.id === 'free') return true;
        return plan.interval === billingCycle;
    });

    return (
        <div className="min-h-screen bg-neutral-panel text-neutral-text-primary">
            <PublicNavbar />

            <main className="container mx-auto px-4 py-20 min-h-[80vh] flex flex-col items-center justify-center">
                <div className="text-center mb-12">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">{t('plans.title') || 'Choose your plan'}</h1>
                    <p className="text-neutral-text-secondary max-w-xl mx-auto">
                        {t('plans.subtitle') || 'Select the plan that fits your fitness journey. Upgrade anytime to unlock advanced features.'}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-center p-1 bg-neutral-card/50 rounded-full mb-12 shadow-sm border border-neutral-border/10">
                    <button
                        onClick={() => updateBillingCycle('month')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'month' ? 'bg-secondary text-on-secondary shadow-ambient scale-105' : 'bg-transparent text-neutral-text-secondary hover:text-neutral-text-primary'}`}
                    >
                        {t('plans.monthly') || 'Monthly'}
                    </button>
                    <button
                        onClick={() => updateBillingCycle('year')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'year' ? 'bg-secondary text-on-secondary shadow-ambient scale-105' : 'bg-transparent text-neutral-text-secondary hover:text-neutral-text-primary'}`}
                    >
                        {t('plans.annual') || 'Annual'}
                        <span className={`${billingCycle === 'year' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>
                            -{BILLING_CONSTANTS.ANNUAL_DISCOUNT_PERCENTAGE}%
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                    {isLoading || subscriptionLoading ? (
                        <div className="col-span-2 text-center text-neutral-text-secondary">{t('plans.loading') || 'Loading plans...'}</div>
                    ) : (
                        displayedPlans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onSelect={handleSelectPlan}
                                isLoading={isLoading}
                                isCurrentPlan={plan.id === currentPlanId}
                            />
                        ))
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function PlansPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background text-neutral-text-primary flex items-center justify-center">
                <div className="text-center text-neutral-text-secondary">Loading...</div>
            </div>
        }>
            <PlansContent />
        </Suspense>
    );
}
