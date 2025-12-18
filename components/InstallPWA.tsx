import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const InstallPWA: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI notify the user they can install the PWA
            setShowInstallBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowInstallBanner(false);
    };

    const handleDismiss = () => {
        setShowInstallBanner(false);
    };

    if (!showInstallBanner) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 z-50 animate-bounce-in">
            <div className="bg-healthpal-panel border border-healthpal-border p-4 rounded-xl shadow-2xl max-w-sm flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 bg-healthpal-green/20 rounded-lg flex items-center justify-center text-healthpal-green">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-healthpal-text-primary text-sm">
                                Install CalorieCounter
                            </h3>
                            <p className="text-xs text-healthpal-text-secondary mt-1">
                                Add to home screen for a better experience and offline access.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-healthpal-text-secondary hover:text-healthpal-text-primary transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <button
                    onClick={handleInstallClick}
                    className="w-full bg-healthpal-green hover:bg-healthpal-green/90 text-healthpal-dark font-bold py-2 rounded-lg transition-all active:scale-95 text-sm"
                >
                    Install App
                </button>
            </div>
        </div>
    );
};

export default InstallPWA;
