import { FeatureFlagRepository } from '../../../domain/repositories/FeatureFlagRepository';
import { initializeApp, cert } from "firebase-admin/app";
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
            const serviceAccount = {
                projectId,
                clientEmail,
                privateKey,
            };
            const adminApp = initializeApp({
                credential: cert(serviceAccount),
            }, 'admin-feature-flags');
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
}
