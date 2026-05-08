export interface FeatureFlagRepository {
    isEnabled(flagName: string): Promise<boolean>;
    getValue(flagName: string): Promise<unknown>;
}

export type AIAccessMode = 'disabled' | 'premium_only' | 'free_plan_api_keys_only' | 'open';

export type FeatureMinPlan = 'free' | 'free_plan_api_keys' | 'premium';

export interface FeatureRequirement {
    min_plan: FeatureMinPlan;
}

export interface FeatureRequirements {
    chatbot?: FeatureRequirement;
    food_analysis?: FeatureRequirement;
    quick_meal_photo?: FeatureRequirement;
    ingredient_search?: FeatureRequirement;
}

export const FeatureFlags = {
    // Legacy flags (to be deprecated)
    MANDATORY_USER_API_KEYS: 'mandatory_users_api_keys',
    ENABLE_CHATBOT: 'enable_chatbot',
    ENABLE_PLANS: 'enable_plans',
    PREMIUM_USERS_AI_LIST: 'premium_users_ai_list',

    // New unified AI access control
    AI_ACCESS_MODE: 'ai_access_mode',
    FEATURE_REQUIREMENTS: 'feature_requirements',
} as const;

export const DEFAULT_FEATURE_REQUIREMENTS: FeatureRequirements = {
    chatbot: { min_plan: 'premium' },
    food_analysis: { min_plan: 'premium' },
    quick_meal_photo: { min_plan: 'free_plan_api_keys' },
    ingredient_search: { min_plan: 'free' },
};

