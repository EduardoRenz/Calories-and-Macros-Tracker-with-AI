'use client';

import { useEffect } from 'react';
import { getCookieConsentStatus } from '@/utils/cookieConsent';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-wrapper-object-types */
declare global {
    interface Window {
        dataLayer?: Object[];
        gtag?: (...args: any[]) => void;
    }
}

export default function GoogleAnalyticsConsent() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Helper to safely access window.gtag
        const gtag = (...args: unknown[]) => {
            window.dataLayer = window.dataLayer || [];
            if (window.gtag) {
                window.gtag(...args);
            } else {
                window.dataLayer.push(args as unknown as object);
            }
        };

        const updateConsent = () => {
            const consentStatus = getCookieConsentStatus();
            const granted = consentStatus === 'accepted';
            const consentValue = granted ? 'granted' : 'denied';

            // Google Consent Mode v2 updates
            gtag('consent', 'update', {
                'ad_storage': consentValue,
                'ad_user_data': consentValue,
                'ad_personalization': consentValue,
                'analytics_storage': consentValue,
            });
        };

        // Run on mount
        updateConsent();

        window.addEventListener('cookie-consent-updated', updateConsent);
        return () => {
            window.removeEventListener('cookie-consent-updated', updateConsent);
        };
    }, []);

    return null;
}
