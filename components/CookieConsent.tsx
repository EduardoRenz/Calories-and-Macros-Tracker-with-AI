'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'levemente-cookie-consent';

export const CookieConsent: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setIsVisible(false);
        // Refresh the page or trigger state update for components that might have been waiting for consent
        window.location.reload();
        // Trigger a custom event so other parts of the app can react
        window.dispatchEvent(new Event('cookie-consent-updated'));
    };

    const handleDecline = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
        setIsVisible(false);
        window.dispatchEvent(new Event('cookie-consent-updated'));
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-surface border-t border-neutral-border shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-bold text-on-surface mb-1">
                        {t('cookies.title')}
                    </h3>
                    <p className="text-sm text-neutral-text-secondary">
                        {t('cookies.message')}{' '}
                        <Link
                            href="/privacy-policy"
                            className="text-brand-green hover:underline font-medium"
                        >
                            {t('cookies.privacy_policy')}
                        </Link>
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleDecline}
                        className="px-6 py-2.5 text-sm font-bold text-neutral-text-secondary hover:bg-neutral-surface-hover rounded-xl border border-neutral-border transition-colors"
                    >
                        {t('cookies.decline')}
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-brand-green hover:bg-brand-green-dark rounded-xl shadow-lg shadow-brand-green/20 transition-all active:scale-95"
                    >
                        {t('cookies.accept')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
