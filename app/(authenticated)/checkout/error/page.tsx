'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function CheckoutErrorPage() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason');
    const planId = searchParams.get('planId');

    const message = reason === 'verification_unavailable'
        ? t('checkout.verification_unavailable')
        : t('checkout.verification_failed');
    const retryHref = planId ? `/checkout?planId=${encodeURIComponent(planId)}` : '/plans';

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                <h1 className="text-2xl font-bold text-white mb-3">
                    {t('common.error') || 'Error'}
                </h1>
                <p className="text-red-100 mb-6">{message}</p>
                <p className="text-red-100 mb-6">
                    Se o problema persistir, entre em contato através do email{' '}
                    <a href="mailto:contato@levemente.ia.br" className="underline hover:opacity-90">
                        contato@levemente.ia.br
                    </a>
                    .
                </p>
                <div className="flex gap-3">
                    <Link
                        href={retryHref}
                        className="px-4 py-2 rounded-lg bg-brand-green text-black font-semibold hover:brightness-110 transition-all"
                    >
                        {t('settings.subscription.upgrade') || 'Try again'}
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 rounded-lg border border-neutral-border text-neutral-text-primary hover:bg-neutral-card transition-all"
                    >
                        {t('navbar.dashboard') || 'Back to Dashboard'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
