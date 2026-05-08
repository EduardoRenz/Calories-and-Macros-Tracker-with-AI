// This file should ONLY be imported in server-side code (inside typeof window === 'undefined' blocks)
// It uses firebase-admin which is not available in the browser

import { ServerFeatureFlagRepository } from '../app/api/repositories/ServerFeatureFlagRepository';
import { FeatureFlags } from '../domain/repositories/FeatureFlagRepository';
import { env } from '../env';

// Runtime guard to prevent client-side usage
if (typeof window !== 'undefined') {
    throw new Error(
        'serverServiceConfig.ts is server-only and cannot be used in the browser. ' +
        'Import this file only in server-side code blocks (typeof window === "undefined").'
    );
}

export type ServerProvider = 'openrouter' | 'gemini' | 'openai' | 'deepseek';

/**
 * Fetches the AI priority list from Remote Config feature flag.
 * Returns default priority ['openai', 'openrouter', 'gemini'] if flag is not set or fails.
 */
export async function getServerAiPriorityList(): Promise<ServerProvider[]> {
    const defaultPriority: ServerProvider[] = ['openai', 'openrouter', 'gemini'];
    try {
        const ffRepo = ServerFeatureFlagRepository.getInstance();
        const priorityList = await ffRepo.getValue(FeatureFlags.PREMIUM_USERS_AI_LIST);
        if (Array.isArray(priorityList) && priorityList.length > 0) {
            console.log('[ServerServiceConfig] Using AI priority from feature flag:', priorityList);
            // Filter to only valid providers
            const validProviders: ServerProvider[] = ['openrouter', 'gemini', 'openai', 'deepseek'];
            return priorityList
                .map(p => String(p).toLowerCase())
                .filter((p): p is ServerProvider => validProviders.includes(p as ServerProvider));
        }
    } catch (error) {
        console.error('[ServerServiceConfig] Failed to fetch AI priority list from feature flag:', error);
    }
    console.log('[ServerServiceConfig] Using default AI priority:', defaultPriority);
    return defaultPriority;
}

/**
 * Checks if a provider has the required API key configured
 */
export function hasProviderApiKey(provider: ServerProvider): boolean {
    switch (provider) {
        case 'openrouter':
            return !!env.OPENROUTER_API_KEY;
        case 'gemini':
            return !!env.GEMINI_API_KEY;
        case 'openai':
            return !!env.OPENAI_API_KEY;
        case 'deepseek':
            return !!env.DEEPSEEK_API_KEY;
        default:
            return false;
    }
}
