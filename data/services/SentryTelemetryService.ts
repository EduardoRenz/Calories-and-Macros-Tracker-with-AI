import * as Sentry from '@sentry/nextjs';
import { TelemetryService } from '../../domain/services/TelemetryService';
import type { ErrorContext, TelemetryEvent } from '../../domain/entities/telemetry';
import { hasCookieConsent } from '../../utils/cookieConsent';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

let consentGranted = typeof window === 'undefined' || hasCookieConsent();

if (typeof window !== 'undefined') {
    window.addEventListener('cookie-consent-updated', () => {
        consentGranted = hasCookieConsent();
    });
}

export class SentryTelemetryService extends TelemetryService {
    private static instance: SentryTelemetryService | null = null;

    public static getInstance(): SentryTelemetryService {
        if (!this.instance) {
            this.instance = new SentryTelemetryService();
        }
        return this.instance;
    }

    public captureError(error: unknown, context?: ErrorContext): void {
        if (!SENTRY_DSN) return;
        if (typeof window !== 'undefined' && !consentGranted) return;

        Sentry.captureException(error, {
            tags: {
                action: context?.action ?? '',
                category: context?.category ?? 'other',
                provider: context?.provider ?? '',
            },
            extra: context?.extras,
        });
    }

    public trackEvent(_event: TelemetryEvent): void {
        // Sentry is an error tracker; analytics events are handled by GoogleAnalyticsTelemetryService.
    }
}
