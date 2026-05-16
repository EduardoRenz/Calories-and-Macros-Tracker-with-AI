import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { UserProfile } from '../../domain/entities/profile';
import { RepositoryFactory } from '../RepositoryFactory';
import { DataCacheManager } from '../infrastructure/DataCacheManager';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';

/**
 * UserService provides a centralized and cached access to user-related data,
 * primarily the user profile. It sits between the React Contexts and the Repositories.
 */
export class UserService {
    private static instance: UserService;
    private profileRepository: ProfileRepository;
    private cacheManager = new DataCacheManager();
    private concurrencyManager = new ConcurrencyRequestManager();
    private readonly PROFILE_CACHE_KEY = 'user_profile';
    private readonly CACHE_TTL = 1000; // 1 second as requested

    private constructor(profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * Singleton accessor for UserService
     */
    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService(RepositoryFactory.getProfileRepository());
        }
        return UserService.instance;
    }

    /**
     * Fetches the user profile with short-term caching and request deduplication.
     */
    async getUserProfile(): Promise<UserProfile> {
        return this.cacheManager.getCached(this.PROFILE_CACHE_KEY, async () => {
            return this.concurrencyManager.run(this.PROFILE_CACHE_KEY, async () => {
                return this.profileRepository.getProfile();
            });
        }, this.CACHE_TTL);
    }

    /**
     * Updates the user profile and invalidates the cache.
     */
    async updateProfile(profile: UserProfile): Promise<void> {
        await this.profileRepository.updateProfile(profile);
        this.invalidateCache();
    }

    /**
     * Gets the current user ID (proxies to repository)
     */
    async getUserId(): Promise<string> {
        return this.profileRepository.getUserId();
    }

    /**
     * Explicitly invalidates the profile cache.
     */
    invalidateCache(): void {
        this.cacheManager.invalidate(this.PROFILE_CACHE_KEY);
    }
}
