export interface FeatureFlagRepository {
    isEnabled(flagName: string): Promise<boolean>;
    getValue(flagName: string): Promise<unknown>;
}

export const FeatureFlags = {
    MANDATORY_USER_API_KEYS: 'mandatory_users_api_keys',
    ENABLE_CHATBOT: 'enable_chatbot',
    ENABLE_PLANS: 'enable_plans',
    PREMIUM_USERS_AI_LIST: 'premium_users_ai_list'
} as const;

