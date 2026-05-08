import { FeatureFlagRepository, FeatureFlags } from '../../domain/repositories/FeatureFlagRepository';
import { getRemoteConfig, getValue, fetchAndActivate } from "firebase/remote-config";
import { getApp } from "firebase/app";
import { DEFAULT_MODEL_CONFIG } from '../config/DefaultModelConfig';

export class FirebaseFeatureFlagRepository implements FeatureFlagRepository {
    static instance: FirebaseFeatureFlagRepository;
    private remoteConfig: any;

    constructor() {
        this.remoteConfig = getRemoteConfig(getApp());
        // Default configuration
        this.remoteConfig.settings = {
            minimumFetchIntervalMillis: 10000
        };
        this.remoteConfig.defaultConfig = {
            [FeatureFlags.ENABLE_CHATBOT]: true,
            [FeatureFlags.MANDATORY_USER_API_KEYS]: false,
            [FeatureFlags.ENABLE_PLANS]: true,
            [FeatureFlags.AI_ACCESS_MODE]: 'premium_only',
            [FeatureFlags.FEATURE_REQUIREMENTS]: JSON.stringify({
                "chatbot": { "min_plan": "premium" },
                "food_analysis": { "min_plan": "premium" },
                "quick_meal_photo": { "min_plan": "free_plan_api_keys" },
                "ingredient_search": { "min_plan": "open" }
            }),
            'ai_model_versions': JSON.stringify(DEFAULT_MODEL_CONFIG)
        };

    }


    public static getInstance(): FirebaseFeatureFlagRepository {
        if (!FirebaseFeatureFlagRepository.instance) {
            FirebaseFeatureFlagRepository.instance = new FirebaseFeatureFlagRepository();
        }
        return FirebaseFeatureFlagRepository.instance;
    }

    async isEnabled(flagName: string): Promise<boolean> {
        try {
            await fetchAndActivate(this.remoteConfig);
            return getValue(this.remoteConfig, flagName).asBoolean();
        } catch (error) {
            console.error(`Error fetching feature flag ${flagName}:`, error);
            throw error;
        }
    }

    async getValue(flagName: string): Promise<unknown> {
        try {
            await fetchAndActivate(this.remoteConfig);
            const value = getValue(this.remoteConfig, flagName);
            // Try as string first, then parse as JSON if possible
            const stringValue = value.asString();
            if (stringValue) {
                try {
                    return JSON.parse(stringValue);
                } catch {
                    return stringValue;
                }
            }
            return null;
        } catch (error) {
            console.error(`Error fetching feature flag value ${flagName}:`, error);
            return null;
        }
    }
}
