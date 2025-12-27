import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HealthPalLogo, GoogleIcon } from '@/components/icons';
import { DonationPanel } from '../components/DonationPanel';

const LoginPage: React.FC = () => {
    const { user, signInWithGoogle, loading } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !loading) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    const handleGoogleSignIn = async () => {
        if (!loading) {
            setError(null);
            try {
                await signInWithGoogle();
                // Navigation will be handled by the useEffect above when user state changes
            } catch (error: any) {
                console.error("Failed to sign in", error);
                if (error?.code === 'auth/unauthorized-domain') {
                    setError("This domain is not authorized for Google Sign-In. Please check your Firebase Console settings.");
                } else if (error?.message) {
                    setError(error.message);
                } else {
                    setError("Failed to sign in. Please try again.");
                }
            }
        }
    };

    return (
        <div className="bg-healthpal-dark min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-healthpal-panel p-8 rounded-2xl border border-healthpal-border text-center shadow-2xl">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <HealthPalLogo className="h-10 w-10 text-healthpal-green" />
                        <h1 className="text-3xl font-bold text-healthpal-text-primary">CalorieApp</h1>
                    </div>
                    <p className="text-healthpal-text-secondary mb-8">
                        Sign in to track your meals, analyze food with AI, and reach your fitness goals.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm">
                            {error}
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
                </div>

                <div className="mt-8">
                    <DonationPanel variant="compact" />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;