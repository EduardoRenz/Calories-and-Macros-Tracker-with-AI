import { TelemetryService } from '../../domain/services/TelemetryService';
import type { ErrorContext, TelemetryEvent } from '../../domain/entities/telemetry';

export class ConsoleTelemetryService extends TelemetryService {
    private static instance: ConsoleTelemetryService | null = null;

    public static getInstance(): ConsoleTelemetryService {
        if (!this.instance) {
            this.instance = new ConsoleTelemetryService();
        }
        return this.instance;
    }

    public captureError(error: unknown, context?: ErrorContext): void {
        console.error(`[Telemetry] Error${context?.action ? ` (${context.action})` : ''}:`, error);
    }

    public trackEvent(event: TelemetryEvent): void {
        console.log(`[Telemetry] Event: ${event.name}`, event.params ?? '');
    }
}
