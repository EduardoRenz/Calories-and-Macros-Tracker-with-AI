export interface FeatureFlagRepository {
    isEnabled(flagName: string): Promise<boolean>;
}

export const FeatureFlags = {
    ALLOW_USER_API_KEYS_ONLY: 'allow_user_api_keys_only',
    ENABLE_CHATBOT: 'enable_chatbot'
} as const;

