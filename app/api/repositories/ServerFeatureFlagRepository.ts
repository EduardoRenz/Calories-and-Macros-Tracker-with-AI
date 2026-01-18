import { FeatureFlagRepository } from '../../../domain/repositories/FeatureFlagRepository';
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getRemoteConfig, RemoteConfig } from "firebase-admin/remote-config";

export class ServerFeatureFlagRepository implements FeatureFlagRepository {
    static instance: ServerFeatureFlagRepository;
    private remoteConfig: RemoteConfig | null;

    constructor() {
        // Firebase Admin configuration
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        const shouldInitAdmin = !!(projectId && clientEmail && privateKey);

        if (!shouldInitAdmin) {
            console.warn('Firebase Admin credentials not configured. Missing:', {
                projectId: !!projectId,
                clientEmail: !!clientEmail,
                privateKey: !!privateKey
            });
            this.remoteConfig = null;
        } else {
            try {
                // Check if Firebase Admin app already exists
                const existingApp = getApps().find(app => app.name === 'admin-feature-flags');

                if (existingApp) {
                    this.remoteConfig = getRemoteConfig(existingApp);
                } else {
                    const serviceAccount = {
                        projectId,
                        clientEmail,
                        privateKey,
                    };

                    const adminApp = initializeApp({
                        credential: cert(serviceAccount),
                    }, 'admin-feature-flags');

                    this.remoteConfig = getRemoteConfig(adminApp);
                }
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

        ServerFeatureFlagRepository.instance = this;
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
