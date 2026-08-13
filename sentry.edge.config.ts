import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from './utils/scrubSentryEvent';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ERROR_TRACKING_PROVIDER = process.env.NEXT_PUBLIC_ERROR_TRACKING_PROVIDER;

if (SENTRY_DSN && ERROR_TRACKING_PROVIDER !== 'none') {
    Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: 0.1,
        beforeSend: scrubSentryEvent,
    });
}
