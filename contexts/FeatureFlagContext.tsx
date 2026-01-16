'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { RepositoryFactory } from '../data/RepositoryFactory';

interface FeatureFlagContextType {
    isFeatureEnabled: (flagName: string) => boolean;
    loading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [flags, setFlags] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    const checkFlags = async () => {
        const repo = RepositoryFactory.getFeatureFlagRepository();

        // We can pre-fetch known flags here or fetch them on demand.
        // For performance, pre-fetching important flags is better.
        const enableChatbot = await repo.isEnabled('enable_chatbot');
        console.log('enable_chatbot', enableChatbot);

        setFlags({
            'enable_chatbot': enableChatbot,
        });
        setLoading(false);
    };

    useEffect(() => {
        checkFlags();
    }, []);

    const isFeatureEnabled = (flagName: string) => {
        return flags[flagName] ?? false;
    };

    return (
        <FeatureFlagContext.Provider value={{ isFeatureEnabled, loading }}>
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
