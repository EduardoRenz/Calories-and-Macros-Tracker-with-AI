import type { ErrorContext, TelemetryEvent } from '../entities/telemetry';

/**
 * Defines the contract for a telemetry service that captures errors and
 * tracks analytics events. Implementations are provider-specific (e.g.
 * Sentry, Google Analytics) and are selected through TelemetryFactory.
 */
export abstract class TelemetryService {
  /**
   * Captures an error for diagnostics and alerting.
   */
  abstract captureError(error: unknown, context?: ErrorContext): void;

  /**
   * Tracks an analytics event (product/metrics events).
   */
  abstract trackEvent(event: TelemetryEvent): void;
}
