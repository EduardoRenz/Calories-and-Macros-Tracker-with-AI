import React, { useState } from 'react';
import Link from 'next/link';
import { SparklesIcon, CalendarIcon, AlertIcon } from './icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getSupabaseClient } from '@/data/supabaseClient';
import Modal from './ui/Modal';

const SubscriptionCard: React.FC = () => {
    const { t } = useTranslation();
    const { subscription, loading, refreshSubscription } = useSubscription();
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);

    const getTrialDaysRemaining = (sub: typeof subscription): number => {
        if (!sub || !sub.currentPeriodEnd) return 0;
        const now = new Date();
        const end = new Date(sub.currentPeriodEnd);
        const diffMs = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    if (loading) {
        return (
            <div className="bg-neutral-panel p-6 rounded-2xl border border-neutral-border animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-card"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-neutral-card rounded"></div>
                        <div className="h-3 w-48 bg-neutral-card rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    const isPremium = subscription && !subscription.isFree;
    const isTrial = subscription && subscription.isTrial;
    const trialDaysRemaining = getTrialDaysRemaining(subscription);
    const isFreePlan = !subscription || subscription.isFree;
    const canCancel = isPremium && !subscription.cancelAtPeriodEnd && !isTrial;

    const planName = isTrial
        ? t('settings.subscription.plan_trial')
        : isPremium
            ? (subscription.planCode === 'annual' ? t('plans.annual') : t('plans.monthly'))
            : t('settings.subscription.plan_free');

    return (
        <div className="bg-neutral-panel p-6 rounded-2xl border border-neutral-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPremium ? 'bg-brand-green/10 text-brand-green' : 'bg-neutral-card text-neutral-text-secondary'}`}>
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{t('settings.subscription.title')}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isTrial
                                ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                                : isPremium
                                    ? 'bg-brand-green/10 text-brand-green border-brand-green/30'
                                    : 'bg-gray-800 text-gray-400 border-gray-700'
                                }`}>
                                {planName}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-text-secondary">
                            {isTrial
                                ? t('settings.subscription.trial_description', { days: trialDaysRemaining }) || `You have full access to all AI features and advanced analysis for free for ${trialDaysRemaining} days.`
                                : isPremium
                                    ? t('settings.subscription.premium_description') || 'Enjoy full access to all AI features.'
                                    : t('settings.subscription.free_description') || 'Upgrade to unlock advanced AI analysis and more.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {canCancel ? (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="px-4 py-2 rounded-lg border border-red-500 text-red-500 font-bold text-sm hover:bg-red-500/10 transition-all flex items-center gap-2"
                            data-testid="cancel-subscription-button"
                        >
                            <AlertIcon className="w-4 h-4" />
                            {t('settings.subscription.cancel') || 'Cancel Subscription'}
                        </button>
                    ) : isFreePlan ? (
                        <Link
                            href="/plans"
                            className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            {t('settings.subscription.upgrade') || 'Upgrade Now'}
                        </Link>
                    ) : (
                        <Link
                            href="/plans"
                            className="px-4 py-2 rounded-lg bg-neutral-card text-neutral-text-primary border border-neutral-border font-bold text-sm hover:bg-neutral-border transition-all"
                        >
                            {t('settings.subscription.manage') || 'Manage'}
                        </Link>
                    )}
                </div>
            </div>

            {(isPremium || isTrial) && subscription?.currentPeriodEnd && (
                <div className="mt-6 pt-6 border-t border-neutral-border flex items-center gap-2 text-xs text-neutral-text-secondary">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                        {isTrial || subscription.cancelAtPeriodEnd
                            ? t('settings.subscription.ends_on', { date: subscription.currentPeriodEnd.toLocaleDateString() }) || `Ends on ${subscription.currentPeriodEnd.toLocaleDateString()}`
                            : t('settings.subscription.renews_on', { date: subscription.currentPeriodEnd.toLocaleDateString() }) || `Renews on ${subscription.currentPeriodEnd.toLocaleDateString()}`}
                    </span>
                </div>
            )}

            {/* Cancel Subscription Modal */}
            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => {
                    setIsCancelModalOpen(false);
                    setCancelError(null);
                }}
                title={t('settings.subscription.cancel_modal.title') || 'Cancel Subscription'}
                size="md"
                showCloseButton
                dataTestId="cancel-subscription-modal"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <AlertIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-neutral-text-primary">
                            {t('settings.subscription.cancel_modal.warning') || 'Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.'}
                        </p>
                    </div>

                    {cancelError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
                            {cancelError}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => {
                                setIsCancelModalOpen(false);
                                setCancelError(null);
                            }}
                            disabled={isCancelling}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-neutral-text-primary hover:bg-neutral-card transition-colors disabled:opacity-50"
                        >
                            {t('settings.subscription.cancel_modal.keep') || 'Keep Subscription'}
                        </button>
                        <button
                            onClick={handleCancelSubscription}
                            disabled={isCancelling}
                            className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                            data-testid="confirm-cancel-button"
                        >
                            {isCancelling
                                ? (t('settings.subscription.cancel_modal.cancelling') || 'Cancelling...')
                                : (t('settings.subscription.cancel_modal.confirm') || 'Yes, Cancel')
                            }
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );

    async function handleCancelSubscription() {
        if (!subscription) return;

        setIsCancelling(true);
        setCancelError(null);

        try {
            // Get auth token from Supabase session
            const { data: { session } } = await getSupabaseClient().auth.getSession();
            const token = session?.access_token;

            const response = await fetch('/api/billing/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ subscriptionId: subscription.id }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to cancel subscription');
            }

            await refreshSubscription();
            setIsCancelModalOpen(false);
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            setCancelError(
                error instanceof Error
                    ? error.message
                    : (t('settings.subscription.cancel_modal.error') || 'Failed to cancel subscription. Please try again.')
            );
        } finally {
            setIsCancelling(false);
        }
    }
};

export default SubscriptionCard;
