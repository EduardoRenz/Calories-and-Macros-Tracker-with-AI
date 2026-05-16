'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { RepositoryFactory } from '../data/RepositoryFactory';
import {
    FeatureFlags,
    AIAccessMode,
    FeatureRequirements,
    DEFAULT_FEATURE_REQUIREMENTS
} from '../domain/repositories/FeatureFlagRepository';

interface FeatureFlagContextType {
    // Legacy
    isFeatureEnabled: (flagName: string) => boolean;
    isUserApiKeysRequired: boolean;
    hasUserApiKeys: boolean;
    loading: boolean;

    // New AI Access Control
    aiAccessMode: AIAccessMode;
    canUseAiFeature: (featureName: keyof FeatureRequirements, isPremium: boolean) => boolean;
    isAiFeatureVisible: (featureName: keyof FeatureRequirements) => boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [flags, setFlags] = useState<Record<string, boolean>>({});
    const [aiAccessMode, setAiAccessMode] = useState<AIAccessMode>('premium_only');
    const [featureRequirements, setFeatureRequirements] = useState<FeatureRequirements>(DEFAULT_FEATURE_REQUIREMENTS);
    const [loading, setLoading] = useState(true);
    const [hasUserApiKeys, setHasUserApiKeys] = useState(false);

    const checkFlags = async () => {
        const repo = RepositoryFactory.getFeatureFlagRepository();

        // Fetch legacy flags and new AI access mode
        const [
            enableChatbot,
            mandatoryUserApiKeys,
            enablePlans,
            aiMode,
            featureReqs
        ] = await Promise.all([
            repo.isEnabled(FeatureFlags.ENABLE_CHATBOT),
            repo.isEnabled(FeatureFlags.MANDATORY_USER_API_KEYS),
            repo.isEnabled(FeatureFlags.ENABLE_PLANS),
            repo.getValue(FeatureFlags.AI_ACCESS_MODE),
            repo.getValue(FeatureFlags.FEATURE_REQUIREMENTS)
        ]);

        console.log('Flags loaded:', {
            enableChatbot,
            mandatoryUserApiKeys,
            enablePlans,
            aiMode,
            featureReqs
        }, ` From ${repo.constructor.name}`);

        setFlags({
            [FeatureFlags.ENABLE_CHATBOT]: enableChatbot,
            [FeatureFlags.MANDATORY_USER_API_KEYS]: mandatoryUserApiKeys,
            [FeatureFlags.ENABLE_PLANS]: enablePlans,
        });

        // Set AI access mode (default to premium_only)
        const mode = (aiMode as AIAccessMode) || 'premium_only';
        setAiAccessMode(mode);

        // Set feature requirements (use defaults if not set)
        const reqs = (featureReqs as FeatureRequirements) || DEFAULT_FEATURE_REQUIREMENTS;
        setFeatureRequirements(reqs);

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

    const isFeatureEnabled = useCallback((flagName: string) => {
        return flags[flagName] ?? false;
    }, [flags]);

    // Legacy: for backward compatibility
    const isUserApiKeysRequired = isFeatureEnabled(FeatureFlags.MANDATORY_USER_API_KEYS) && !hasUserApiKeys;

    /**
     * Check if user can actually use an AI feature (has permission)
     * Premium users always have access in all modes except 'disabled'
     */
    const canUseAiFeature = useCallback((
        featureName: keyof FeatureRequirements,
        isPremium: boolean
    ): boolean => {
        // Mode: disabled - no one can use AI
        if (aiAccessMode === 'disabled') {
            return false;
        }

        // Mode: open - everyone can use (check feature-specific requirements)
        if (aiAccessMode === 'open') {
            const req = featureRequirements[featureName];
            if (!req) return true;

            // Premium always OK
            if (isPremium) return true;

            // Check min_plan requirement
            const minPlan = req.min_plan;
            if (minPlan === 'free') return true;
            if (minPlan === 'free_plan_api_keys') return hasUserApiKeys;
            if (minPlan === 'premium') return false;

            return true;
        }

        // Mode: premium_only - only premium users
        if (aiAccessMode === 'premium_only') {
            return isPremium;
        }

        // Mode: free_plan_api_keys_only - premium bypasses, free needs keys
        // NOTE: Backend ALSO blocks all free users in this mode because it cannot
        // verify API keys (they are only in localStorage). This is defense in depth.
        if (aiAccessMode === 'free_plan_api_keys_only') {
            if (isPremium) return true;
            return hasUserApiKeys; // Frontend check - backend will block anyway if false
        }

        return false;
    }, [aiAccessMode, featureRequirements, hasUserApiKeys]);

    /**
     * Check if AI feature should be visible in UI
     * Some modes hide buttons completely, others show disabled state
     */
    const isAiFeatureVisible = useCallback((
        featureName: keyof FeatureRequirements
    ): boolean => {
        // Mode: disabled - hide all AI features
        if (aiAccessMode === 'disabled') {
            return false;
        }

        // Mode: premium_only - show but will be validated on use
        if (aiAccessMode === 'premium_only') {
            return true;
        }

        // Mode: free_plan_api_keys_only - show for everyone
        if (aiAccessMode === 'free_plan_api_keys_only') {
            return true;
        }

        // Mode: open - show all
        if (aiAccessMode === 'open') {
            return true;
        }

        return false;
    }, [aiAccessMode]);

    return (
        <FeatureFlagContext.Provider value={{
            // Legacy
            isFeatureEnabled,
            isUserApiKeysRequired,
            hasUserApiKeys,
            loading,
            // New
            aiAccessMode,
            canUseAiFeature,
            isAiFeatureVisible
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
