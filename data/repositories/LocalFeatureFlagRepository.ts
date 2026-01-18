import { FeatureFlagRepository, FeatureFlags } from '../../domain/repositories/FeatureFlagRepository';

export class LocalFeatureFlagRepository implements FeatureFlagRepository {
    static instance: LocalFeatureFlagRepository;

    private flags: Record<string, boolean> = {
        [FeatureFlags.ENABLE_CHATBOT]: true,
        [FeatureFlags.MANDATORY_USER_API_KEYS]: false,
    };

    constructor() {
        if (LocalFeatureFlagRepository.instance) {
            return LocalFeatureFlagRepository.instance;
        }
        LocalFeatureFlagRepository.instance = this;
    }

    async isEnabled(flagName: string): Promise<boolean> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.flags[flagName] ?? false;
    }

    // Helper for testing
    setFlag(flagName: string, value: boolean) {
        this.flags[flagName] = value;
    }
}
