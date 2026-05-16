import { getSupabaseClient } from '../supabaseClient';
import { ConcurrencyRequestManager } from './ConcurrencyRequestManager';
import { DataCacheManager } from './DataCacheManager';

/**
 * SupabaseUserSession is a shared infrastructure component that caches the
 * result of supabase.auth.getUser() to prevent redundant network calls across
 * different repositories.
 */
export class SupabaseUserSession {
    private static instance: SupabaseUserSession;
    private concurrencyManager = new ConcurrencyRequestManager();
    private cacheManager = new DataCacheManager();
    private readonly TTL = 2000; // 2 seconds cache to allow dashboard to load with 1 call

    private constructor() { }

    public static getInstance(): SupabaseUserSession {
        if (!SupabaseUserSession.instance) {
            SupabaseUserSession.instance = new SupabaseUserSession();
        }
        return SupabaseUserSession.instance;
    }

    /**
     * Gets the current authenticated user's ID.
     * Caches the result to prevent redundant calls.
     */
    async getUserId(): Promise<string> {
        const key = 'authenticated_user_id';
        return this.cacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                const supabase = getSupabaseClient();
                const { data, error } = await supabase.auth.getUser();

                if (error) {
                    console.error('[SupabaseUserSession] Error fetching user:', error);
                    throw error;
                }

                if (!data.user) {
                    throw new Error('Not authenticated');
                }

                return data.user.id;
            });
        }, this.TTL);
    }

    /**
     * Gets the full Supabase user object.
     */
    async getUser() {
        const key = 'authenticated_user_full';
        return this.cacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                const supabase = getSupabaseClient();
                const { data, error } = await supabase.auth.getUser();

                if (error) {
                    console.error('[SupabaseUserSession] Error fetching user:', error);
                    throw error;
                }

                if (!data.user) {
                    throw new Error('Not authenticated');
                }

                return data.user;
            });
        }, this.TTL);
    }

    /**
     * Invalidates the user session cache.
     */
    invalidate(): void {
        this.cacheManager.clear();
    }
}
