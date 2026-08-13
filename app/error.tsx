'use client';

import { useEffect } from 'react';
import { TelemetryFactory } from '../data/TelemetryFactory';
import { useTranslation } from '../hooks/useTranslation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = useTranslation();

    useEffect(() => {
        const telemetry = TelemetryFactory.getTelemetryService();
        telemetry.captureError(error, { action: 'route_error_boundary', category: 'render' });
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl font-bold text-neutral-text-primary mb-2">
                {t('error_boundary.title')}
            </h1>
            <p className="text-neutral-text-secondary mb-6">
                {t('error_boundary.description')}
            </p>
            <button
                onClick={reset}
                className="bg-secondary text-on-secondary font-bold py-3 px-8 rounded-lg hover:brightness-110 transition-all"
                data-testid="error-retry-button"
            >
                {t('error_boundary.retry')}
            </button>
        </div>
    );
}
