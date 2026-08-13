import { TelemetryService } from '../domain/services/TelemetryService';
import { env } from '../env';
import { CompositeTelemetryService } from './services/CompositeTelemetryService';
import { ConsoleTelemetryService } from './services/ConsoleTelemetryService';
import { GoogleAnalyticsTelemetryService } from './services/GoogleAnalyticsTelemetryService';
import { MockTelemetryService } from './services/MockTelemetryService';
import { NoopTelemetryService } from './services/NoopTelemetryService';
import { SentryTelemetryService } from './services/SentryTelemetryService';

export class TelemetryFactory {
    private static telemetryService: TelemetryService | null = null;

    /**
     * True when the Sentry client SDK is enabled (provider set + DSN configured,
     * and not running in mock mode). Sentry then auto-captures render errors
     * reaching error boundaries, so manual captures from error components can be
     * skipped to avoid duplicates.
     */
    public static get usesSentry(): boolean {
        return env.NEXT_PUBLIC_BACKEND_PROVIDER !== 'mock'
            && env.NEXT_PUBLIC_ERROR_TRACKING_PROVIDER === 'sentry'
            && !!process.env.NEXT_PUBLIC_SENTRY_DSN;
    }

    public static getTelemetryService(): TelemetryService {
        if (!this.telemetryService) {
            // Mock mode (Cypress/tests) must never reach external providers - a
            // mocked telemetry keeps calls observable without sending data anywhere.
            if (env.NEXT_PUBLIC_BACKEND_PROVIDER === 'mock') {
                this.telemetryService = MockTelemetryService.getInstance();
                return this.telemetryService;
            }

            const trackers: TelemetryService[] = [];

            if (env.NEXT_PUBLIC_ERROR_TRACKING_PROVIDER !== 'none') {
                trackers.push(SentryTelemetryService.getInstance());
            }

            if (env.NEXT_PUBLIC_ANALYTICS_PROVIDER !== 'none') {
                trackers.push(GoogleAnalyticsTelemetryService.getInstance());
            }

            if (process.env.NODE_ENV !== 'production') {
                trackers.push(ConsoleTelemetryService.getInstance());
            }

            this.telemetryService = trackers.length === 0
                ? NoopTelemetryService.getInstance()
                : new CompositeTelemetryService(trackers);
        }
        return this.telemetryService;
    }
}
