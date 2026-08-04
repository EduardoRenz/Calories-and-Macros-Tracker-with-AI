'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { COOKIE_CONSENT_KEY } from '@/utils/cookieConsent';

export const CookieConsent: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkConsent = () => {
            try {
                const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
                return !consent;
            } catch (error) {
                console.error('Failed to read cookie consent:', error);
                return true; // Show banner if we can't read consent
            }
        };

        if (checkConsent()) {
            setIsVisible(true);
        }

        const handleShowBanner = () => {
            setIsVisible(true);
        };

        const handleConsentUpdated = () => {
            const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (consent) {
                setIsVisible(false);
            }
        };

        window.addEventListener('show-cookie-consent', handleShowBanner);
        window.addEventListener('cookie-consent-updated', handleConsentUpdated);
        return () => {
            window.removeEventListener('show-cookie-consent', handleShowBanner);
            window.removeEventListener('cookie-consent-updated', handleConsentUpdated);
        };
    }, []);

    const handleAccept = () => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
            setIsVisible(false);
            setErrorMessage(null);
            // Trigger a custom event so other parts of the app can react
            window.dispatchEvent(new Event('cookie-consent-updated'));
        } catch (error) {
            console.error('Failed to save cookie consent:', error);
            // Show error to user
            setErrorMessage(t('cookies.save_error'));
        }
    };

    const handleDecline = () => {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
            setIsVisible(false);
            setErrorMessage(null);
            window.dispatchEvent(new Event('cookie-consent-updated'));
        } catch (error) {
            console.error('Failed to save cookie consent:', error);
            // Show error to user
            setErrorMessage(t('cookies.save_error'));
        }
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
                    {errorMessage && (
                        <p className="text-sm text-red-400 mt-2">
                            {errorMessage}
                        </p>
                    )}
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
                        className="px-6 py-2.5 text-sm font-bold text-on-primary bg-brand-green hover:bg-brand-green-dark rounded-xl shadow-lg shadow-brand-green/20 transition-all active:scale-95"
                    >
                        {t('cookies.accept')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
