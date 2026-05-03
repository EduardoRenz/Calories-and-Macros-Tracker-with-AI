
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { DietType, UserProfile } from '../../domain/entities/profile';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';

const initialProfile: UserProfile = {
    name: "Jane Doe",
    email: "janedoe@email.com",
    personalInfo: {
        age: 28,
        height: 165,
        weight: 62,
        gender: 'female',
    },
    fitnessGoals: {
        primaryGoal: 'lose',
        targetWeight: 58,
        activityLevel: 'lightly',
    },
    weightHistory: [
        { date: "2023-10-01", weight: 65 },
        { date: "2023-10-08", weight: 64.5 },
        { date: "2023-10-15", weight: 63 },
        { date: "2023-10-22", weight: 62.5 },
    ],
    healthConditions: { selected: [] },
    dietType: 'omnivore' as DietType,
};

// Incomplete profile for testing first-time setup flow
const incompleteProfile: UserProfile = {
    name: "New User",
    email: "newuser@email.com",
    personalInfo: {
        age: null,
        height: null,
        weight: null,
        gender: null,
    },
    fitnessGoals: {
        primaryGoal: null,
        targetWeight: null,
        activityLevel: null,
    },
    weightHistory: [],
    healthConditions: { selected: [] },
    dietType: 'omnivore' as DietType,
};

// Helper to check if we're in mock mode
const isMockMode = (): boolean => {
    return typeof window !== 'undefined' &&
        (process.env.NEXT_PUBLIC_BACKEND_PROVIDER === 'mock' ||
            process.env.NEXT_PUBLIC_BACKEND_PROVIDER === undefined);
};

// Get sessionStorage value for testing first-time setup (only works in mock mode)
const shouldUseIncompleteProfile = (): boolean => {
    if (typeof window === 'undefined' || !isMockMode()) {
        return false;
    }
    const value = sessionStorage.getItem('mock_use_incomplete_profile');
    return value === 'true';
};

// Initialize profile data based on sessionStorage (mock mode only) or default to complete profile
const getInitialProfileData = (): UserProfile => {
    if (shouldUseIncompleteProfile()) {
        return JSON.parse(JSON.stringify(incompleteProfile));
    }
    return JSON.parse(JSON.stringify(initialProfile));
};

let userProfileData: UserProfile = getInitialProfileData();
let lastSessionStorageValue: string | null = null;

import { DataCacheManager } from '../infrastructure/DataCacheManager';

// ... (existing imports)

export class LocalProfileRepository implements ProfileRepository {
    private static instance: LocalProfileRepository;
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    private constructor() { }

    public static getInstance(): LocalProfileRepository {
        if (!LocalProfileRepository.instance) {
            LocalProfileRepository.instance = new LocalProfileRepository();
        }
        return LocalProfileRepository.instance;
    }
    async getUserId(): Promise<string> {
        return "mock-user-id";
    }
    async getProfile(): Promise<UserProfile> {
        const key = 'getProfile';

        // Check if sessionStorage value changed (for testing)
        const currentValue = typeof window !== 'undefined'
            ? sessionStorage.getItem('mock_use_incomplete_profile')
            : null;

        if (currentValue !== lastSessionStorageValue) {
            // Session storage changed, reload profile
            lastSessionStorageValue = currentValue;
            userProfileData = getInitialProfileData();
            this.dataCacheManager.invalidate(key);
        }

        return this.dataCacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                // Simulate an async API call
                await new Promise(resolve => setTimeout(resolve, 250));
                return JSON.parse(JSON.stringify(userProfileData));
            });
        });
    }

    async updateProfile(profile: UserProfile): Promise<void> {
        // Simulate an async API call
        await new Promise(resolve => setTimeout(resolve, 250));

        const newWeight = profile.personalInfo.weight;
        let updatedHistory = [...userProfileData.weightHistory];

        // Only update weight history if weight is provided
        if (newWeight !== null && newWeight > 0) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            const entryForTodayIndex = updatedHistory.findIndex(entry => entry.date === today);

            if (entryForTodayIndex !== -1) {
                // Update existing entry for today
                updatedHistory[entryForTodayIndex].weight = newWeight;
            } else {
                // Add new entry for today
                updatedHistory.push({ date: today, weight: newWeight });
            }

            // Ensure history is sorted by date before saving
            updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        userProfileData = { ...profile, weightHistory: updatedHistory };
        // Invalidate cache
        this.dataCacheManager.invalidate('getProfile');
        return;
    }

    /**
     * Reload profile from sessionStorage settings (mock mode only).
     * Use this to switch between complete and incomplete profile for testing.
     */
    public reloadFromSessionStorage(): void {
        userProfileData = getInitialProfileData();
        this.dataCacheManager.invalidate('getProfile');
    }
}