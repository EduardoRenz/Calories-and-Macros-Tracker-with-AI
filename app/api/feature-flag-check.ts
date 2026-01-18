import { NextResponse } from 'next/server';
import { RepositoryFactory } from '@/data/RepositoryFactory';
import { FeatureFlags } from '@/domain/repositories/FeatureFlagRepository';

/**
 * Checks if the 'allow_user_api_keys_only' feature flag is enabled.
 * If enabled, returns a 403 response since backend AI services should not be used.
 * Returns null if the request is allowed to proceed.
 */
export async function checkAiAccess() {
    const ffRepo = RepositoryFactory.getFeatureFlagRepository();
    const isRequiredOnlyUserKeys = await ffRepo.isEnabled(FeatureFlags.ALLOW_USER_API_KEYS_ONLY);

    if (isRequiredOnlyUserKeys) {
        console.warn('[Backend] AI access blocked: allow_user_api_keys_only flag is ACTIVE');
        return NextResponse.json(
            { error: 'User API keys are required to use AI features. Please configure them in your settings.' },
            { status: 403 }
        );
    }

    return null;
}
