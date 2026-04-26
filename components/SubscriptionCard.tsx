import React from 'react';
import Link from 'next/link';
import { SparklesIcon, CalendarIcon } from './icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useSubscription } from '@/contexts/SubscriptionContext';

const SubscriptionCard: React.FC = () => {
    const { t } = useTranslation();
    const { subscription, loading } = useSubscription();

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
            <div className="bg-healthpal-panel p-6 rounded-2xl border border-healthpal-border animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-healthpal-card"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-healthpal-card rounded"></div>
                        <div className="h-3 w-48 bg-healthpal-card rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    const isPremium = subscription && !subscription.isFree;
    const isTrial = subscription && subscription.isTrial;
    const trialDaysRemaining = getTrialDaysRemaining(subscription);

    const planName = isTrial
        ? t('settings.subscription.plan_trial')
        : isPremium
            ? (subscription.planCode === 'annual' ? t('plans.annual') : t('plans.monthly'))
            : t('settings.subscription.plan_free');

    return (
        <div className="bg-healthpal-panel p-6 rounded-2xl border border-healthpal-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPremium ? 'bg-healthpal-green/10 text-healthpal-green' : 'bg-healthpal-card text-healthpal-text-secondary'}`}>
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{t('settings.subscription.title')}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isTrial
                                ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                                : isPremium
                                    ? 'bg-healthpal-green/10 text-healthpal-green border-healthpal-green/30'
                                    : 'bg-gray-800 text-gray-400 border-gray-700'
                                }`}>
                                {planName}
                            </span>
                        </div>
                        <p className="text-sm text-healthpal-text-secondary">
                            {isTrial
                                ? t('settings.subscription.trial_description', { days: trialDaysRemaining }) || `You have full access to all AI features and advanced analysis for free for ${trialDaysRemaining} days.`
                                : isPremium
                                    ? t('settings.subscription.premium_description') || 'Enjoy full access to all AI features.'
                                    : t('settings.subscription.free_description') || 'Upgrade to unlock advanced AI analysis and more.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isPremium ? (
                        <Link
                            href="/plans"
                            className="px-4 py-2 rounded-lg bg-healthpal-card text-healthpal-text-primary border border-healthpal-border font-bold text-sm hover:bg-healthpal-border transition-all"
                        >
                            {t('settings.subscription.manage') || 'Manage'}
                        </Link>
                    ) : (
                        <Link
                            href="/plans"
                            className="px-4 py-2 rounded-lg bg-healthpal-green text-black font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            {t('settings.subscription.upgrade') || 'Upgrade Now'}
                        </Link>
                    )}
                </div>
            </div>

            {(isPremium || isTrial) && subscription?.currentPeriodEnd && (
                <div className="mt-6 pt-6 border-t border-healthpal-border flex items-center gap-2 text-xs text-healthpal-text-secondary">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                        {isTrial || subscription.cancelAtPeriodEnd
                            ? t('settings.subscription.ends_on', { date: subscription.currentPeriodEnd.toLocaleDateString() }) || `Ends on ${subscription.currentPeriodEnd.toLocaleDateString()}`
                            : t('settings.subscription.renews_on', { date: subscription.currentPeriodEnd.toLocaleDateString() }) || `Renews on ${subscription.currentPeriodEnd.toLocaleDateString()}`}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SubscriptionCard;
