export type AiAccessFeature = 'chatbot' | 'food_analysis' | 'quick_meal_photo' | 'ingredient_search';

export interface AiAccessService {
    checkAccess(feature: AiAccessFeature): Promise<void>;
    isFeatureAvailable(feature: AiAccessFeature): Promise<boolean>;
    getMinPlan(feature: AiAccessFeature): Promise<'premium' | 'free_plan_api_keys' | 'open'>;
}
