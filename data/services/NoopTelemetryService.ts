import { TelemetryService } from '../../domain/services/TelemetryService';
import type { ErrorContext, TelemetryEvent } from '../../domain/entities/telemetry';

export class NoopTelemetryService extends TelemetryService {
    private static instance: NoopTelemetryService | null = null;

    public static getInstance(): NoopTelemetryService {
        if (!this.instance) {
            this.instance = new NoopTelemetryService();
        }
        return this.instance;
    }

    public captureError(_error: unknown, _context?: ErrorContext): void {
        // No-op
    }

    public trackEvent(_event: TelemetryEvent): void {
        // No-op
    }
}
