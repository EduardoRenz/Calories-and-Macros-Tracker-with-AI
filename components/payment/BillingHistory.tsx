import React, { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { HistoryIcon, CheckCircleIcon, XCircleIcon, RefreshIcon } from '../icons';

const BillingHistory: React.FC = () => {
    const { t } = useTranslation();
    const { billingHistory, loadingHistory, refreshHistory } = useSubscription();

    useEffect(() => {
        refreshHistory();
    }, [refreshHistory]);

    if (loadingHistory && billingHistory.length === 0) {
        return (
            <div className="bg-neutral-panel p-6 rounded-2xl border border-neutral-border animate-pulse">
                <div className="h-6 w-48 bg-neutral-card rounded mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-neutral-card rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (billingHistory.length === 0) {
        return null; // Don't show anything if there is no history
    }

    return (
        <div className="bg-neutral-panel p-6 rounded-2xl border border-neutral-border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <HistoryIcon className="w-6 h-6 text-brand-green" />
                    {t('settings.subscription.history_title') || 'Financial History'}
                </h3>
                <button 
                    onClick={() => refreshHistory()}
                    className="p-2 text-neutral-text-secondary hover:text-brand-green transition-colors"
                    title={t('common.refresh') || 'Refresh'}
                >
                    <RefreshIcon className={`w-5 h-5 ${loadingHistory ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-3">
                {billingHistory.map((tx) => (
                    <div key={tx.id} className="bg-neutral-card/50 p-4 rounded-xl border border-neutral-border flex items-center justify-between group hover:border-neutral-text-secondary/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                tx.status === 'paid'
                                    ? 'bg-green-500/10 text-green-500'
                                    : tx.status === 'failed'
                                        ? 'bg-red-500/10 text-red-500'
                                        : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                                {tx.status === 'paid' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="font-semibold text-neutral-text-primary capitalize">
                                    {t(`settings.subscription.transaction_types.${tx.type}`) || tx.type}
                                </p>
                                <p className="text-xs text-neutral-text-secondary">
                                    {tx.occurredAt.toLocaleDateString()} • {tx.provider}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-neutral-text-primary">
                                {tx.currency.symbol}{tx.amountCents / 100}
                            </p>
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${
                                tx.status === 'paid'
                                    ? 'text-green-500'
                                    : tx.status === 'failed'
                                        ? 'text-red-500'
                                        : 'text-yellow-500'
                            }`}>
                                {t(`settings.subscription.transaction_status.${tx.status}`) || tx.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BillingHistory;
