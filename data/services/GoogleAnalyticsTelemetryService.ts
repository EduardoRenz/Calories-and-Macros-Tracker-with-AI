import { TelemetryService } from '../../domain/services/TelemetryService';
import type { ErrorContext, TelemetryEvent } from '../../domain/entities/telemetry';
import { hasCookieConsent } from '../../utils/cookieConsent';

const USER_ERROR_EVENT_NAME = 'user_error';

const MAX_ERROR_MESSAGE_LENGTH = 500;

function sanitizeErrorMessage(value: string): string {
    // Strip control characters and trim; error messages may embed user input
    // (e.g. image prompts) so keep them short and free of unprintable data.
    return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, MAX_ERROR_MESSAGE_LENGTH);
}

export class GoogleAnalyticsTelemetryService extends TelemetryService {
    private static instance: GoogleAnalyticsTelemetryService | null = null;

    public static getInstance(): GoogleAnalyticsTelemetryService {
        if (!this.instance) {
            this.instance = new GoogleAnalyticsTelemetryService();
        }
        return this.instance;
    }

    public captureError(error: unknown, context?: ErrorContext): void {
        this.trackEvent({
            name: USER_ERROR_EVENT_NAME,
            params: {
                error_action: context?.action,
                error_category: context?.category,
                error_provider: context?.provider,
                error_message: sanitizeErrorMessage(error instanceof Error ? error.message : String(error)),
                ...context?.extras,
            },
        });
    }

    public trackEvent(event: TelemetryEvent): void {
        if (typeof window === 'undefined') return;
        if (!hasCookieConsent()) return;
        if (!window.gtag) return;

        window.gtag('event', event.name, {
            page_path: window.location.pathname,
            ...event.params,
        });
    }
}
