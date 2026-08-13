import type { ErrorEvent } from '@sentry/nextjs';

/**
 * Strips PII and sensitive data from Sentry events before they are sent:
 * removes query strings from request URLs and clears user identifiers.
 *
 * Note: correlation ids passed explicitly via `extras.user_id` (server-side
 * `captureServerError`) are intentionally preserved for authenticated diagnostics.
 */
export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
    if (event.request?.url) {
        try {
            const url = new URL(event.request.url);
            url.search = '';
            url.hash = '';
            event.request = { ...event.request, url: url.toString() };
        } catch {
            // Ignore malformed URLs
        }
    }

    if (event.user) {
        delete event.user.email;
        delete event.user.id;
        delete event.user.username;
        delete event.user.ip_address;
    }

    return event;
}
