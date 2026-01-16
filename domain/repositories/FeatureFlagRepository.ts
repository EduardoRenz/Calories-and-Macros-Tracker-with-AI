export interface FeatureFlagRepository {
    isEnabled(flagName: string): Promise<boolean>;
}
