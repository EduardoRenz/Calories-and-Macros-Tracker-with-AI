import { ModelConfigRepository } from '../../domain/repositories/ModelConfigRepository';
import { RemoteConfig, getRemoteConfig, getValue, fetchAndActivate } from "firebase/remote-config";
import { getApps, getApp } from "firebase/app";
import { DEFAULT_MODEL_CONFIG } from '../config/DefaultModelConfig';

export class FirebaseModelConfigRepository implements ModelConfigRepository {
    static instance: FirebaseModelConfigRepository;
    private remoteConfig: RemoteConfig | null = null;
    private cache: Record<string, Record<string, string>> | null = null;
    private cacheTimestamp: number = 0;
    private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds

    private constructor() {
        const app = getApps().length > 0 ? getApp() : undefined;
        if (app) {
            this.remoteConfig = getRemoteConfig(app);
            // Default configuration
            this.remoteConfig.settings = {
                minimumFetchIntervalMillis: 1000000,
                fetchTimeoutMillis: 60000,
            };
            this.remoteConfig.defaultConfig = {
                'enable_chatbot': true,
                'ai_model_versions': JSON.stringify(DEFAULT_MODEL_CONFIG)
            };
        }
    }

    public static getInstance(): FirebaseModelConfigRepository {
        if (!FirebaseModelConfigRepository.instance) {
            FirebaseModelConfigRepository.instance = new FirebaseModelConfigRepository();
        }
        return FirebaseModelConfigRepository.instance;
    }

    async getModelVersion(provider: string, service: string): Promise<string> {
        const allVersions = await this.getAllModelVersions();
        return allVersions[provider]?.[service] || this.getDefaultModelVersion(provider, service);
    }

    async getAllModelVersions(): Promise<Record<string, Record<string, string>>> {
        // Check cache validity
        if (this.cache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
            return this.cache;
        }

        if (!this.remoteConfig) {
            this.cache = DEFAULT_MODEL_CONFIG;
            this.cacheTimestamp = Date.now();
            return this.cache!;
        }

        try {
            await fetchAndActivate(this.remoteConfig);
            const configValue = getValue(this.remoteConfig, 'ai_model_versions');
            const configString = configValue.asString();

            if (configString) {
                this.cache = JSON.parse(configString);
                this.cacheTimestamp = Date.now();
                return this.cache!;
            }
        } catch (error) {
            console.error('Error fetching model config from remote config:', error);
        }

        // Fallback to default config
        this.cache = DEFAULT_MODEL_CONFIG;
        this.cacheTimestamp = Date.now();
        return this.cache!;
    }

    private getDefaultModelVersion(provider: string, service: string): string {
        const defaultConfig = DEFAULT_MODEL_CONFIG;
        return defaultConfig[provider as keyof typeof defaultConfig]?.[service as keyof typeof defaultConfig[keyof typeof defaultConfig]] || 'unknown-model';
    }

    // Method to clear cache (useful for testing or force refresh)
    clearCache(): void {
        this.cache = null;
        this.cacheTimestamp = 0;
    }
}
