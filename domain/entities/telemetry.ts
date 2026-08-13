export type ErrorCategory =
  | 'ai_analysis'
  | 'ai_access'
  | 'auth'
  | 'payment'
  | 'billing'
  | 'data'
  | 'image_compression'
  | 'render'
  | 'other';

export interface ErrorContext {
  action?: string;
  category?: ErrorCategory;
  provider?: string;
  extras?: Record<string, unknown>;
}

export interface TelemetryEvent {
  name: string;
  params?: Record<string, unknown>;
}
