export interface FeatureFlagRepository {
    isEnabled(flagName: string): Promise<boolean>;
}

export const FeatureFlags = {
    MANDATORY_USER_API_KEYS: 'mandatory_users_apy_keys',
    ENABLE_CHATBOT: 'enable_chatbot',
    ENABLE_PLANS: 'enable_plans'
} as const;

