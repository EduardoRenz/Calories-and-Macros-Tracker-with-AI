import { TelemetryService } from '../../domain/services/TelemetryService';
import type { ErrorContext, TelemetryEvent } from '../../domain/entities/telemetry';

export class CompositeTelemetryService extends TelemetryService {
    private trackers: TelemetryService[];

    constructor(trackers: TelemetryService[]) {
        super();
        this.trackers = trackers;
    }

    public captureError(error: unknown, context?: ErrorContext): void {
        for (const tracker of this.trackers) {
            tracker.captureError(error, context);
        }
    }

    public trackEvent(event: TelemetryEvent): void {
        for (const tracker of this.trackers) {
            tracker.trackEvent(event);
        }
    }
}
