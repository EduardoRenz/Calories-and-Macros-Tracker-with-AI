/**
 * Interface representing a cached item
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

/**
 * DataCacheManager handles in-memory caching of data to prevent redundant
 * fetching of unchanged resources. It supports Time-To-Live (TTL) strategies.
 */
export class DataCacheManager {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private readonly DEFAULT_TTL = 60 * 1000; // 1 minute in milliseconds

    /**
     * Retrieves data from the cache or fetches it if missing/expired.
     *
     * @param key Unique key for the cache entry
     * @param fetcher Function that returns a promise for the data if cache miss
     * @param ttl Optional custom Time-To-Live in milliseconds (defaults to 1 minute)
     * @returns The cached or fetched data
     */
    async getCached<T>(key: string, fetcher: () => Promise<T>, ttl: number = this.DEFAULT_TTL): Promise<T> {
        const entry = this.cache.get(key);
        const now = Date.now();

        if (entry) {
            const isExpired = (now - entry.timestamp) > entry.ttl;
            if (!isExpired) {
                // console.log(`[DataCacheManager] Cache hit for key: ${key}`);
                return entry.data as T;
            }
            // console.log(`[DataCacheManager] Cache expired for key: ${key}`);
        } else {
            // console.log(`[DataCacheManager] Cache miss for key: ${key}`);
        }

        try {
            const data = await fetcher();
            this.cache.set(key, {
                data,
                timestamp: now,
                ttl
            });
            return data;
        } catch (error) {
            // If fetch fails and we have an expired entry, we could potentially return it
            // depending on a "stale-while-revalidate" strategy, but for now we throw.
            throw error;
        }
    }

    /**
     * Invalidates a specific cache entry by key.
     * @param key The key to remove
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidates all cache entries that match a regex pattern.
     * Useful for clearing related data (e.g., all "user_*" keys).
     * @param pattern RegExp to match against keys
     */
    invalidatePattern(pattern: RegExp): void {
        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clears the entire cache.
     */
    clear(): void {
        this.cache.clear();
    }
}
