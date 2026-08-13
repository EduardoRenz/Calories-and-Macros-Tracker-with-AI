import { TelemetryFactory } from '@/data/TelemetryFactory';
import type { ErrorCategory } from '@/domain/entities/telemetry';
import { verifyAuth } from './auth-middleware';

/**
 * Captures a server-side API error through the telemetry layer, attaching the
 * authenticated user id (if resolvable) for correlation.
 *
 * Best-effort and fire-and-forget: never blocks the HTTP response and never
 * throws/rejects. The auth header was already verified earlier in the request's
 * success path; pass the resolved `userId` to avoid re-verifying the token.
 */
export async function captureServerError(
    error: unknown,
    action: string,
    authHeader: string | null,
    category: ErrorCategory = 'ai_analysis',
    userId?: string
): Promise<void> {
    try {
        let resolvedUserId = userId;
        if (!resolvedUserId) {
            try {
                const user = await verifyAuth(authHeader);
                resolvedUserId = user.uid;
            } catch {
                resolvedUserId = undefined;
            }
        }

        TelemetryFactory.getTelemetryService().captureError(error, {
            action,
            category,
            provider: 'server_api',
            extras: resolvedUserId ? { user_id: resolvedUserId } : undefined,
        });
    } catch {
        // Telemetry must never break the request or leave an unhandled rejection.
    }
}
