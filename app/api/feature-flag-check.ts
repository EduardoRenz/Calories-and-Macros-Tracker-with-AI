import { NextResponse } from 'next/server';
import { ServerFeatureFlagRepository } from './repositories/ServerFeatureFlagRepository';
import { FeatureFlags, AIAccessMode, DEFAULT_FEATURE_REQUIREMENTS, FeatureRequirements } from '@/domain/repositories/FeatureFlagRepository';
import { DataCacheManager } from '@/data/infrastructure/DataCacheManager';
import { verifyAuth } from './auth-middleware';
import { checkPremiumAccess } from './subscription-check';

const cacheManager = new DataCacheManager();

/**
 * Gets the current AI access mode from feature flags.
 * Defaults to 'premium_only' if not set.
 */
async function getAIAccessMode(): Promise<AIAccessMode> {
    const ffRepo = ServerFeatureFlagRepository.getInstance();
    const mode = await cacheManager.getCached('feature_flag:ai_access_mode', async () => {
        const value = await ffRepo.getValue(FeatureFlags.AI_ACCESS_MODE);
        return (value as AIAccessMode) || 'premium_only';
    });
    return mode as AIAccessMode;
}

/**
 * Gets feature requirements from feature flags.
 * Falls back to DEFAULT_FEATURE_REQUIREMENTS if not set.
 */
async function getFeatureRequirements(): Promise<FeatureRequirements> {
    const ffRepo = ServerFeatureFlagRepository.getInstance();
    const requirements = await cacheManager.getCached('feature_flag:feature_requirements', async () => {
        const value = await ffRepo.getValue(FeatureFlags.FEATURE_REQUIREMENTS);
        return (value as FeatureRequirements) || DEFAULT_FEATURE_REQUIREMENTS;
    });
    return requirements as FeatureRequirements;
}


/**
 * Checks if a specific feature can be used based on feature requirements.
 * Premium users always have access.
 */
async function checkFeatureAccess(
    featureName: keyof FeatureRequirements,
    userId: string,
    isPremium: boolean
): Promise<NextResponse | null> {
    const requirements = await getFeatureRequirements();
    const featureReq = requirements[featureName];

    // If no specific requirement, allow access
    if (!featureReq) {
        return null;
    }

    // Premium users always have access
    if (isPremium) {
        return null;
    }

    const minPlan = featureReq.min_plan;

    // Free users can access if min_plan is 'free'
    if (minPlan === 'free') {
        return null;
    }

    // Check if free user has API keys for features requiring them
    if (minPlan === 'free_plan_api_keys') {
        // NOTE: Backend cannot verify API keys (stored in frontend localStorage).
        // Free users are always blocked from server-side AI for these features.
        return NextResponse.json(
            { error: 'Please add your API keys in settings to use this feature' },
            { status: 403 }
        );
    }

    // Premium required
    if (minPlan === 'premium') {
        return NextResponse.json(
            { error: 'This feature is only available for premium users' },
            { status: 403 }
        );
    }

    return null;
}

async function resolvePremiumAccess(authHeader: string | null): Promise<{ isPremium: boolean; response: NextResponse | null }> {
    const premiumCheck = await checkPremiumAccess(authHeader);

    if (premiumCheck === null) {
        return { isPremium: true, response: null };
    }

    if (premiumCheck.status !== 403) {
        return { isPremium: false, response: premiumCheck };
    }

    return { isPremium: false, response: null };
}

/**
 * Main AI access check function.
 * Checks the AI_ACCESS_MODE and returns appropriate response.
 *
 * @param authHeader - Authorization header to identify user
 * @param featureName - Optional specific feature being accessed
 * @returns NextResponse with 403 if access denied, null if allowed
 */
export async function checkAiAccess(
    authHeader: string | null,
    featureName?: keyof FeatureRequirements
): Promise<NextResponse | null> {
    const mode = await getAIAccessMode();
    console.log(`[Backend] AI Access Mode: ${mode}, Feature: ${featureName || 'none'}`);
    console.log(`[Backend] Auth header present: ${!!authHeader}, Length: ${authHeader?.length || 0}`);

    // Mode: disabled - block all AI access
    if (mode === 'disabled') {
        console.warn('[Backend] AI access blocked: mode is disabled');
        return NextResponse.json(
            { error: 'AI features are currently disabled' },
            { status: 403 }
        );
    }

    // Mode: open - allow all access (skip checks)
    if (mode === 'open') {
        // Even in open mode, check feature-specific requirements
        if (featureName) {
            try {
                const user = await verifyAuth(authHeader);
                const { isPremium, response } = await resolvePremiumAccess(authHeader);
                if (response) return response;
                const featureCheck = await checkFeatureAccess(featureName, user.uid, isPremium);
                if (featureCheck) return featureCheck;
            } catch {
                // If auth fails, still allow in open mode
            }
        }
        return null;
    }

    // Verify user auth for remaining modes
    let isPremium: boolean;
    try {
        await verifyAuth(authHeader);
        const premiumResult = await resolvePremiumAccess(authHeader);
        if (premiumResult.response) {
            return premiumResult.response;
        }
        isPremium = premiumResult.isPremium;
    } catch {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        );
    }

    // Mode: premium_only - only premium users
    if (mode === 'premium_only') {
        if (isPremium) {
            return null;
        }
        return NextResponse.json(
            { error: 'Premium subscription required. Please upgrade to access this feature.' },
            { status: 403 }
        );
    }

    // Mode: free_plan_api_keys_only - premium bypasses, free needs keys
    if (mode === 'free_plan_api_keys_only') {
        if (isPremium) {
            return null;
        }

        // NOTE: Backend cannot verify API keys (stored in frontend localStorage).
        // Free users are always blocked from server-side AI in this mode.
        return NextResponse.json(
            { error: 'Please add your API keys in settings to use this feature' },
            { status: 403 }
        );
    }

    // Unknown mode - default to blocking
    console.error(`[Backend] Unknown AI access mode: ${mode}`);
    return NextResponse.json(
        { error: 'AI access configuration error' },
        { status: 500 }
    );
}
