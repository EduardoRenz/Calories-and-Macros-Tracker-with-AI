'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { SparklesIcon } from './icons';

export default function DashboardWarningBar() {
    const { t } = useTranslation();

    return (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-red-500">{t('dashboard.api_keys_required_title') || 'API Keys Required'}</h3>
                    <p className="text-sm text-red-400/80">
                        {t('dashboard.api_keys_required_desc') || 'To continue using AI features, please configure your own API keys in settings.'}
                    </p>
                </div>
            </div>
            <Link
                href="/settings"
                className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-all text-sm whitespace-nowrap"
            >
                {t('dashboard.go_to_settings') || 'Go to Settings'}
            </Link>
        </div>
    );
}
