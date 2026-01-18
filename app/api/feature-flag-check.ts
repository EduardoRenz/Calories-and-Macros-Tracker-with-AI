import { NextResponse } from 'next/server';
import { RepositoryFactory } from '@/data/RepositoryFactory';
import { FeatureFlags } from '@/domain/repositories/FeatureFlagRepository';
import { DataCacheManager } from '@/data/infrastructure/DataCacheManager';

const cacheManager = new DataCacheManager();

/**
 * Checks if the 'mandatory_users_apy_keys' feature flag is enabled.
 * If enabled, returns a 403 response since backend AI services should not be used.
 * Returns null if the request is allowed to proceed.
 */
export async function checkAiAccess() {
    const ffRepo = RepositoryFactory.getFeatureFlagRepository();
    const mandatoryUserApiKeys = await cacheManager.getCached('feature_flag:mandatory_users_apy_keys', async () => {
        return await ffRepo.isEnabled(FeatureFlags.MANDATORY_USER_API_KEYS);
    });
    console.log(`[Backend] repo: ${ffRepo.constructor.name}, mandatoryUserApiKeys: ${mandatoryUserApiKeys}`);
    if (mandatoryUserApiKeys) {
        console.warn('[Backend] AI access blocked: mandatory_users_apy_keys flag is ACTIVE');
        return NextResponse.json(
            { error: 'User API keys are required to use AI features. Please configure them in your settings.' },
            { status: 403 }
        );
    }

    return null;
}
