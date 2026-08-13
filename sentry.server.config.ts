import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from './utils/scrubSentryEvent';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ERROR_TRACKING_PROVIDER = process.env.NEXT_PUBLIC_ERROR_TRACKING_PROVIDER;

// Server-side error tracking is always enabled (server errors are anonymous
// and do not depend on the user's cookie consent).
if (SENTRY_DSN && ERROR_TRACKING_PROVIDER !== 'none') {
    Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: 0.1,
        beforeSend: scrubSentryEvent,
    });
}
