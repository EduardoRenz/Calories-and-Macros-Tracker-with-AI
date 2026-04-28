'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleAuthCallback } = useAuth();

    useEffect(() => {
        const processAuth = async () => {
            const code = searchParams.get('code');

            try {
                if (code) {
                    await handleAuthCallback(code);
                }

                // Redirect to dashboard or the provided 'next' parameter
                const next = searchParams.get('next') || '/dashboard';
                router.push(next);
            } catch (error) {
                console.error('Error during auth callback:', error);
                router.push('/login?error=auth_failed');
            }
        };

        processAuth();
    }, [router, searchParams, handleAuthCallback]);

    return (
        <div className="bg-healthpal-dark min-h-screen flex items-center justify-center">
            <div className="text-healthpal-text-primary text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthpal-green mx-auto mb-4"></div>
                <p>Finalizando login...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="bg-healthpal-dark min-h-screen flex items-center justify-center text-healthpal-text-primary">
                Carregando...
            </div>
        }>
            <AuthCallbackHandler />
        </Suspense>
    );
}
