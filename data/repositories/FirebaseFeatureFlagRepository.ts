import { FeatureFlagRepository, FeatureFlags } from '../../domain/repositories/FeatureFlagRepository';
import { getRemoteConfig, getValue, fetchAndActivate } from "firebase/remote-config";
import { getApps, getApp } from "firebase/app";
import { DEFAULT_MODEL_CONFIG } from '../config/DefaultModelConfig';

export class FirebaseFeatureFlagRepository implements FeatureFlagRepository {
    static instance: FirebaseFeatureFlagRepository;
    private remoteConfig: any;

    constructor() {
        if (FirebaseFeatureFlagRepository.instance) {
            return FirebaseFeatureFlagRepository.instance;
        }

        const app = getApps().length > 0 ? getApp() : undefined;
        if (app) {
            this.remoteConfig = getRemoteConfig(app);
            // Default configuration
            this.remoteConfig.settings = {
                minimumFetchIntervalMillis: 10000
            };
            this.remoteConfig.defaultConfig = {
                [FeatureFlags.ENABLE_CHATBOT]: true,
                [FeatureFlags.MANDATORY_USER_API_KEYS]: false,
                'ai_model_versions': JSON.stringify(DEFAULT_MODEL_CONFIG)
            };
        }

        FirebaseFeatureFlagRepository.instance = this;
    }

    async isEnabled(flagName: string): Promise<boolean> {
        if (!this.remoteConfig) return true; // Fallback if not initialized

        try {
            await fetchAndActivate(this.remoteConfig);
            return getValue(this.remoteConfig, flagName).asBoolean();
        } catch (error) {
            console.error(`Error fetching feature flag ${flagName}:`, error);
            return true; // Safe fallback
        }
    }
}
