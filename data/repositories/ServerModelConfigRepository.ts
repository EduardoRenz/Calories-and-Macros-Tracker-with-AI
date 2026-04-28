import { ModelConfigRepository } from '../../../domain/repositories/ModelConfigRepository';
import { initializeApp, cert } from "firebase-admin/app";
import { getRemoteConfig, RemoteConfig } from "firebase-admin/remote-config";
import { env } from '@/env';
import { DEFAULT_MODEL_CONFIG } from '../../../data/config/DefaultModelConfig';

export class ServerModelConfigRepository implements ModelConfigRepository {
    static instance: ServerModelConfigRepository;
    private remoteConfig: RemoteConfig | null;
    private cache: Record<string, Record<string, string>> | null = null;
    private cacheTimestamp: number = 0;
    private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds

    private constructor() {
        // Firebase Admin configuration
        const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = env.FIREBASE_CLIENT_EMAIL;
        let privateKey = env.FIREBASE_PRIVATE_KEY;

        // Handle both formats: escaped \n (from JSON) and actual newlines (from .env)
        if (privateKey) {
            // Replace escaped \n with actual newlines
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        try {
            const serviceAccount = {
                projectId,
                clientEmail,
                privateKey,
            };
            const adminApp = initializeApp({
                credential: cert(serviceAccount),
            }, 'admin-model-config');
            this.remoteConfig = getRemoteConfig(adminApp);
        } catch (error) {
            console.error('Failed to initialize Firebase Admin Remote Config for Model Config:', error);
            this.remoteConfig = null;
        }
    }

    static getInstance(): ServerModelConfigRepository {
        if (!ServerModelConfigRepository.instance) {
            ServerModelConfigRepository.instance = new ServerModelConfigRepository();
        }
        return ServerModelConfigRepository.instance;
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
            const template = await this.remoteConfig.getTemplate();
            const parameter = template.parameters['ai_model_versions'];

            if (parameter?.defaultValue) {
                let configString = '';
                if ('value' in parameter.defaultValue) {
                    configString = parameter.defaultValue.value;
                } else if ('inAppDefaultValue' in parameter.defaultValue) {
                    configString = parameter.defaultValue.inAppDefaultValue as string;
                }

                if (configString) {
                    this.cache = JSON.parse(configString);
                    this.cacheTimestamp = Date.now();
                    return this.cache!;
                }
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

    clearCache(): void {
        this.cache = null;
        this.cacheTimestamp = 0;
    }
}
