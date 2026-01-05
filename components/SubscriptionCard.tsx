import React from 'react';
import Link from 'next/link';
import { SparklesIcon } from './icons';
import { useTranslation } from '@/hooks/useTranslation';



const SubscriptionCard: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-healthpal-panel p-6 rounded-2xl flex items-center justify-between border border-healthpal-border">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-healthpal-card flex items-center justify-center text-healthpal-green">
                    <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{t('settings.subscription.title') || 'Subscription'}</h3>
                    <p className="text-sm text-healthpal-text-secondary">{t('settings.subscription.description') || 'Manage your plan and billing details'}</p>
                </div>
            </div>
            <Link
                href="/plans"
                className="px-4 py-2 rounded-lg bg-healthpal-green text-black font-bold text-sm hover:brightness-110 transition-all"
            >
                {t('settings.subscription.manage') || 'Manage Subscription'}
            </Link>
        </div>
    );
};

export default SubscriptionCard;
