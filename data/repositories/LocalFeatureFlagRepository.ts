import { FeatureFlagRepository, FeatureFlags } from '../../domain/repositories/FeatureFlagRepository';

export class LocalFeatureFlagRepository implements FeatureFlagRepository {
    static instance: LocalFeatureFlagRepository;

    private flags: Record<string, any> = {
        [FeatureFlags.ENABLE_CHATBOT]: true,
        [FeatureFlags.MANDATORY_USER_API_KEYS]: false,
        [FeatureFlags.ENABLE_PLANS]: true,
        [FeatureFlags.AI_ACCESS_MODE]: 'premium_only',
        [FeatureFlags.FEATURE_REQUIREMENTS]: {
            "chatbot": { "min_plan": "premium" },
            "food_analysis": { "min_plan": "premium" },
            "quick_meal_photo": { "min_plan": "free_plan_api_keys" },
            "ingredient_search": { "min_plan": "open" }
        }
    };

    private constructor() { }

    public static getInstance(): LocalFeatureFlagRepository {
        if (!LocalFeatureFlagRepository.instance) {
            LocalFeatureFlagRepository.instance = new LocalFeatureFlagRepository();
        }
        return LocalFeatureFlagRepository.instance;
    }

    async isEnabled(flagName: string): Promise<boolean> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Allow test overrides via localStorage
        if (typeof window !== 'undefined') {
            const override = localStorage.getItem(`feature_flag_${flagName}`);
            if (override !== null) {
                return override === 'true';
            }
        }

        return this.flags[flagName] ?? false;
    }

    async getValue(flagName: string): Promise<unknown> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Allow test overrides via localStorage
        if (typeof window !== 'undefined') {
            const override = localStorage.getItem(`feature_flag_${flagName}`);
            if (override !== null) {
                try {
                    return JSON.parse(override);
                } catch {
                    return override;
                }
            }
        }

        return this.flags[flagName] ?? null;
    }

    // Helper for testing
    setFlag(flagName: string, value: boolean) {
        this.flags[flagName] = value;
    }
}
