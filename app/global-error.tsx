'use client';

import { useEffect, useState } from 'react';
import { TelemetryFactory } from '../data/TelemetryFactory';
import en from '../locales/en';
import es from '../locales/es';
import pt from '../locales/pt';

const translations: Record<string, Record<string, unknown>> = { en, es, pt };

const LANGUAGE_STORAGE_KEY = 'calories-tracker-language';

function t(key: string): string {
    let language = 'en';
    if (typeof window !== 'undefined') {
        language = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    }
    const value = key.split('.').reduce(
        (obj, k) => (obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[k] : undefined),
        translations[language] as unknown
    );
    return typeof value === 'string' ? value : key;
}

function getStoredLanguage(): string {
    if (typeof window === 'undefined') return 'en';
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
}

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [lang] = useState(() => getStoredLanguage());

    useEffect(() => {
        // Sentry auto-captures render errors reaching error boundaries, so manual
        // capture only when its client SDK is not active to avoid duplicates.
        if (TelemetryFactory.usesSentry) return;
        const telemetry = TelemetryFactory.getTelemetryService();
        telemetry.captureError(error, { action: 'global_error_boundary', category: 'render' });
    }, [error]);

    return (
        <html lang={lang}>
            <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '0 1.5rem',
                        background: '#f8fafa',
                        color: '#1f2a2a',
                    }}
                >
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {t('error_boundary.title')}
                    </h1>
                    <p style={{ marginBottom: '1.5rem', color: '#5a6a6a' }}>
                        {t('error_boundary.description')}
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            fontWeight: 700,
                            background: '#22c55e',
                            color: '#ffffff',
                            cursor: 'pointer',
                        }}
                    >
                        {t('error_boundary.retry')}
                    </button>
                </div>
            </body>
        </html>
    );
}
