import { TelemetryService } from '../../domain/services/TelemetryService';
import type { ErrorContext, TelemetryEvent } from '../../domain/entities/telemetry';

/**
 * Test-only telemetry used when the backend runs in mock mode (Cypress e2e,
 * local dev without a real database). It keeps telemetry calls observable via
 * the console but never sends data to external providers (Sentry/GA), so tests
 * cannot pollute production analytics or error tracking.
 */
export class MockTelemetryService extends TelemetryService {
    private static instance: MockTelemetryService | null = null;

    public static getInstance(): MockTelemetryService {
        if (!this.instance) {
            this.instance = new MockTelemetryService();
        }
        return this.instance;
    }

    public captureError(error: unknown, context?: ErrorContext): void {
        console.log(`[MockTelemetry] Error${context?.action ? ` (${context.action})` : ''}:`, error);
    }

    public trackEvent(event: TelemetryEvent): void {
        console.log(`[MockTelemetry] Event: ${event.name}`, event.params ?? '');
    }
}
