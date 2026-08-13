import { TelemetryFactory } from '@/data/TelemetryFactory';
import type { ErrorCategory } from '@/domain/entities/telemetry';
import { verifyAuth } from './auth-middleware';

/**
 * Captures a server-side API error through the telemetry layer, attaching the
 * authenticated user id (if resolvable) for correlation.
 *
 * Best-effort and fire-and-forget: never blocks the HTTP response. The auth
 * header was already verified earlier in the request's success path.
 */
export async function captureServerError(
    error: unknown,
    action: string,
    authHeader: string | null,
    category: ErrorCategory = 'ai_analysis'
): Promise<void> {
    let userId: string | undefined;

    try {
        const user = await verifyAuth(authHeader);
        userId = user.uid;
    } catch {
        userId = undefined;
    }

    TelemetryFactory.getTelemetryService().captureError(error, {
        action,
        category,
        provider: 'server_api',
        extras: userId ? { user_id: userId } : undefined,
    });
}
