import { FeatureFlagRepository, FeatureFlags } from '../../domain/repositories/FeatureFlagRepository';

export class LocalFeatureFlagRepository implements FeatureFlagRepository {
    static instance: LocalFeatureFlagRepository;

    private flags: Record<string, boolean> = {
        [FeatureFlags.ENABLE_CHATBOT]: true,
        [FeatureFlags.MANDATORY_USER_API_KEYS]: false,
        [FeatureFlags.ENABLE_PLANS]: true,
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

    // Helper for testing
    setFlag(flagName: string, value: boolean) {
        this.flags[flagName] = value;
    }
}
