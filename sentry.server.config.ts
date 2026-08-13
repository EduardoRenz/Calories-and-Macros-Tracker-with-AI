import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from './utils/scrubSentryEvent';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ERROR_TRACKING_PROVIDER = process.env.NEXT_PUBLIC_ERROR_TRACKING_PROVIDER;
const IS_MOCK = process.env.NEXT_PUBLIC_BACKEND_PROVIDER === 'mock';

// Server-side error tracking is always enabled (server errors are anonymous
// and do not depend on the user's cookie consent). Skipped in mock mode so
// e2e tests never report to Sentry.
if (SENTRY_DSN && ERROR_TRACKING_PROVIDER !== 'none' && !IS_MOCK) {
    Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: 0.1,
        beforeSend: scrubSentryEvent,
    });
}
