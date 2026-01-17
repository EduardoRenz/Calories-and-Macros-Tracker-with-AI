'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { RepositoryFactory } from '../data/RepositoryFactory';
import { FeatureFlags } from '../domain/repositories/FeatureFlagRepository';

interface FeatureFlagContextType {
    isFeatureEnabled: (flagName: string) => boolean;
    isUserApiKeysRequired: boolean;
    hasUserApiKeys: boolean;
    loading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [flags, setFlags] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [hasUserApiKeys, setHasUserApiKeys] = useState(false);

    const checkFlags = async () => {
        const repo = RepositoryFactory.getFeatureFlagRepository();

        // Pre-fetch known flags
        const [enableChatbot, allowUserApiKeysOnly] = await Promise.all([
            repo.isEnabled(FeatureFlags.ENABLE_CHATBOT),
            repo.isEnabled(FeatureFlags.ALLOW_USER_API_KEYS_ONLY)
        ]);

        console.log('Flags loaded:', { enableChatbot, allowUserApiKeysOnly });

        setFlags({
            [FeatureFlags.ENABLE_CHATBOT]: enableChatbot,
            [FeatureFlags.ALLOW_USER_API_KEYS_ONLY]: allowUserApiKeysOnly,
        });
        setLoading(false);
    };

    const checkUserApiKeys = () => {
        if (typeof window !== 'undefined') {
            const keysStr = localStorage.getItem('ai_api_keys');
            try {
                const keys = keysStr ? JSON.parse(keysStr) : [];
                setHasUserApiKeys(Array.isArray(keys) && keys.length > 0);
            } catch (e) {
                setHasUserApiKeys(false);
            }
        }
    };

    useEffect(() => {
        checkFlags();
        checkUserApiKeys();

        // Listen for storage changes (if keys are updated in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'ai_api_keys') {
                checkUserApiKeys();
            }
        };

        // Custom event for same-tab updates (since ServiceFactory.reset is called in settings)
        const handleKeysUpdated = () => checkUserApiKeys();

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('ai-keys-updated', handleKeysUpdated);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('ai-keys-updated', handleKeysUpdated);
        };
    }, []);

    const isFeatureEnabled = (flagName: string) => {
        return flags[flagName] ?? false;
    };

    const isUserApiKeysRequired = isFeatureEnabled(FeatureFlags.ALLOW_USER_API_KEYS_ONLY) && !hasUserApiKeys;

    return (
        <FeatureFlagContext.Provider value={{
            isFeatureEnabled,
            isUserApiKeysRequired,
            hasUserApiKeys,
            loading
        }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
    }
    return context;
};
