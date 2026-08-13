import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from './utils/scrubSentryEvent';
import { hasCookieConsent } from './utils/cookieConsent';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ERROR_TRACKING_PROVIDER = process.env.NEXT_PUBLIC_ERROR_TRACKING_PROVIDER;

const canEnable = (): boolean => {
    if (!SENTRY_DSN) return false;
    if (ERROR_TRACKING_PROVIDER === 'none') return false;
    return hasCookieConsent();
};

const initSentry = (): void => {
    if (Sentry.getClient()) return;

    Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        beforeSend: scrubSentryEvent,
    });
};

// The SDK is initialized lazily so that error capture respects the strict
// cookie consent (Sentry client-side only runs after the user accepts).
if (canEnable()) {
    initSentry();
}

if (typeof window !== 'undefined') {
    window.addEventListener('cookie-consent-updated', () => {
        if (canEnable()) {
            initSentry();
        }
    });
}
