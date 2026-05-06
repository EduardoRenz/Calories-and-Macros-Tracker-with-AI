import { FeatureFlagRepository } from '../../../domain/repositories/FeatureFlagRepository';
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getRemoteConfig, RemoteConfig } from "firebase-admin/remote-config";
import { env } from '@/env';


export class ServerFeatureFlagRepository implements FeatureFlagRepository {
    static instance: ServerFeatureFlagRepository;
    private remoteConfig: RemoteConfig | null;

    constructor() {
        // Firebase Admin configuration
        const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = env.FIREBASE_CLIENT_EMAIL;
        const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        try {
            const appName = 'admin-feature-flags';
            // Check if app already exists to avoid re-initialization error
            const existingApp = getApps().find(app => app.name === appName);
            const adminApp = existingApp || initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            }, appName);
            this.remoteConfig = getRemoteConfig(adminApp);
        } catch (error) {
            console.error('Failed to initialize Firebase Admin Remote Config:', error);
            console.error('Service account details:', {
                projectId: projectId ? 'set' : 'missing',
                clientEmail: clientEmail ? 'set' : 'missing',
                privateKey: privateKey ? 'set' : 'missing'
            });
            this.remoteConfig = null;
        }
    }


    static getInstance(): ServerFeatureFlagRepository {
        if (!ServerFeatureFlagRepository.instance) {
            ServerFeatureFlagRepository.instance = new ServerFeatureFlagRepository();
        }
        return ServerFeatureFlagRepository.instance;
    }

    async isEnabled(flagName: string): Promise<boolean> {
        if (!this.remoteConfig) {
            console.warn(`Remote Config not initialized, returning default value for ${flagName}`);
            return true; // Safe fallback
        }

        try {
            const template = await this.remoteConfig.getTemplate();
            const parameter = template.parameters[flagName];

            if (!parameter?.defaultValue) {
                return false;
            }

            // Handle different types of RemoteConfigParameterValue
            if ('value' in parameter.defaultValue) {
                return parameter.defaultValue.value === 'true';
            }

            // For InAppDefaultValue, use the inAppDefaultValue property
            if ('inAppDefaultValue' in parameter.defaultValue) {
                return parameter.defaultValue.inAppDefaultValue === 'true';
            }

            return false;
        } catch (error) {
            console.error(`Error fetching feature flag ${flagName}:`, error);
            return true; // Safe fallback
        }
    }

    async getValue(flagName: string): Promise<unknown> {
        if (!this.remoteConfig) {
            console.warn(`Remote Config not initialized, returning null for ${flagName}`);
            return null;
        }

        try {
            const template = await this.remoteConfig.getTemplate();
            const parameter = template.parameters[flagName];

            if (!parameter?.defaultValue) {
                return null;
            }

            let value: string | undefined;

            // Handle different types of RemoteConfigParameterValue
            if ('value' in parameter.defaultValue) {
                value = parameter.defaultValue.value;
            } else if ('inAppDefaultValue' in parameter.defaultValue) {
                value = parameter.defaultValue.inAppDefaultValue as string;
            }

            if (!value) {
                return null;
            }

            // Try to parse as JSON, fallback to raw string
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error(`Error fetching feature flag value ${flagName}:`, error);
            return null;
        }
    }
}
