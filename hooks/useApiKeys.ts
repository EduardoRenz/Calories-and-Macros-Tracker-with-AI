import { useSyncExternalStore, useMemo } from 'react';

export type ProviderId = 'gemini' | 'openai' | 'deepseek' | 'openrouter';

export interface ApiKey {
    provider: ProviderId;
    key: string;
    addedAt: number;
}

const STORAGE_KEY = 'ai_api_keys';

// Stable empty array reference
const EMPTY_KEYS: ApiKey[] = [];

// Module-level cache for stable snapshot reference
// NOTE: This is safe because it's only accessed in browser environments
// (guarded by typeof window === 'undefined'). SSR renders always return EMPTY_KEYS.
let cachedKeys: ApiKey[] = EMPTY_KEYS;
let cachedRawValue: string | null = null;

function getApiKeysSnapshot(): ApiKey[] {
    if (typeof window === 'undefined') return EMPTY_KEYS;
    const item = localStorage.getItem(STORAGE_KEY);
    // Return cached value if raw string hasn't changed (including corrupted values)
    if (item === cachedRawValue) {
        return cachedKeys;
    }
    // Update cache
    cachedRawValue = item;
    if (!item) {
        cachedKeys = EMPTY_KEYS;
        return EMPTY_KEYS;
    }
    try {
        const parsed = JSON.parse(item) as ApiKey[];
        cachedKeys = parsed.length === 0 ? EMPTY_KEYS : parsed;
        return cachedKeys;
    } catch {
        // Cache the corrupted value to prevent repeated parsing attempts
        cachedKeys = EMPTY_KEYS;
        return EMPTY_KEYS;
    }
}

function subscribe(callback: () => void) {
    const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) {
            callback();
        }
    };

    const handleCustomEvent = () => {
        callback();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ai-keys-updated', handleCustomEvent);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('ai-keys-updated', handleCustomEvent);
    };
}

export function useApiKeys() {
    const keys = useSyncExternalStore(
        subscribe,
        getApiKeysSnapshot,
        () => EMPTY_KEYS // Server snapshot
    );

    // Memoize computed values to maintain referential stability
    return useMemo(() => {
        const isDeepSeekOnly = keys.length === 1 && keys[0].provider === 'deepseek';
        const hasVisionProvider = keys.some(
            k => k.provider === 'gemini' || k.provider === 'openai' || k.provider === 'openrouter'
        );
        // Derive which non-vision provider is blocking the feature (if any)
        const nonVisionProvider = isDeepSeekOnly ? keys[0].provider : null;

        return {
            keys,
            isDeepSeekOnly,
            hasVisionProvider,
            nonVisionProvider,
            providers: keys.map(k => k.provider)
        };
    }, [keys]);
}
