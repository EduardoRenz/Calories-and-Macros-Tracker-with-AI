'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TelemetryFactory } from '@/data/TelemetryFactory';
import Image from 'next/image';
import { GoogleIcon } from '@/components/icons';
import LoginPlansCard from '@/components/LoginPlansCard';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { FeatureFlags } from '@/domain/repositories/FeatureFlagRepository';
// import { DonationPanel } from '@/components/DonationPanel';

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { isFeatureEnabled, loading: flagsLoading } = useFeatureFlags();
    const plansEnabled = !flagsLoading && isFeatureEnabled(FeatureFlags.ENABLE_PLANS);
    const redirectRef = useRef<string | null>(null);

    useEffect(() => {
        if (user && !loading) {
            if (redirectRef.current) {
                router.push(redirectRef.current);
                return;
            }
            const redirect = sessionStorage.getItem('login_redirect') || '/dashboard';
            sessionStorage.removeItem('login_redirect');
            redirectRef.current = redirect;
            router.push(redirect);
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        if (!loading) {
            setError(null);
            try {
                await signInWithGoogle();
            } catch (error: unknown) {
                console.error("Failed to sign in", error);
                TelemetryFactory.getTelemetryService().captureError(error, {
                    action: 'google_sign_in',
                    category: 'auth',
                });
                if (error && typeof error === 'object' && 'code' in error) {
                    const firebaseError = error as { code?: string; message?: string };
                    if (firebaseError.code === 'auth/unauthorized-domain') {
                        setError("This domain is not authorized for Google Sign-In. Please check your Firebase Console settings.");
                    } else if (firebaseError.message) {
                        setError(firebaseError.message);
                    } else {
                        setError("Failed to sign in. Please try again.");
                    }
                } else {
                    setError("Failed to sign in. Please try again.");
                }
            }
        }
    };

    return (
        <div className="bg-neutral-dark min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-neutral-panel p-8 rounded-2xl border border-neutral-border text-center shadow-2xl">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <Image src="/LogoHorizontal.svg" alt="LeveMente" width={160} height={48} className="h-12 w-auto" priority />
                    </div>
                    <p className="text-neutral-text-secondary mb-8">
                        Sign in to track your meals, analyze food with AI, and reach your fitness goals.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm">
                            <p>{error}</p>
                            <p className="mt-2">
                                Se o problema persistir, entre em contato através do email{' '}
                                <a href="mailto:contato@levemente.ia.br" className="underline hover:opacity-90">
                                    contato@levemente.ia.br
                                </a>
                                .
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        data-testid="google-signin-button"
                        className="w-full bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <span>Loading...</span>
                        ) : (
                            <>
                                <GoogleIcon className="w-5 h-5" />
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </button>
                    {plansEnabled && <LoginPlansCard />}
                    <p className="text-xs text-neutral-text-secondary mt-4 text-center">
                        Ao usar esta ferramenta, você concorda com nossas{' '}
                        <a
                            href="/terms-of-use"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-brand-green"
                        >
                            Termos de Uso
                        </a>
                    </p>
                </div>
                {/* 
                <div className="mt-8">
                    <DonationPanel variant="compact" />
                </div> */}
            </div>
        </div>
    );
}
