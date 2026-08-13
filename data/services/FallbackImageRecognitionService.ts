import { Ingredient } from '../../domain/entities/dashboard';
import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import { ServiceCooldownManager } from '../infrastructure/ServiceCooldownManager';
import { TelemetryFactory } from '../TelemetryFactory';
import { isAccessErrorMessage } from '../../utils/aiAccessError';

export class FallbackImageRecognitionService extends ImageRecognitionService {
    private services: ImageRecognitionService[];
    private cooldownManager: ServiceCooldownManager;

    constructor(services: ImageRecognitionService[]) {
        super();
        this.services = services;
        this.cooldownManager = ServiceCooldownManager.getInstance();
        if (this.services.length === 0) {
            console.warn("FallbackImageRecognitionService initialized with no services.");
        }
    }

    async analyzeMealImage(image: Blob, language: string, prompt?: string): Promise<Omit<Ingredient, 'id'>[]> {
        const errors: Error[] = [];

        for (let index = 0; index < this.services.length; index++) {
            const service = this.services[index];
            const serviceName = service.constructor.name;

            // Check if service is in cooldown
            if (this.cooldownManager.isInCooldown(serviceName)) {
                console.log(`[FallbackImageService] Skipping ${serviceName} (in cooldown)`);
                continue;
            }

            try {
                console.log(`[FallbackImageService] Attempting analysis with service ${index + 1}/${this.services.length}: ${serviceName}`);
                const result = await service.analyzeMealImage(image, language, prompt);
                if (result && result.length > 0) {
                    console.log(`[FallbackImageService] Success with ${serviceName}`);
                    return result;
                }
                // If result is empty array (but no error), treat as soft failure with shorter cooldown
                // Typically empty means "I don't recognize any foods", which another AI might know.
                console.warn(`[FallbackImageService] Service ${serviceName} returned empty array (no foods recognized).`);
                // Shorter cooldown (30s) for empty array vs full failure (60s)
                this.cooldownManager.recordFailure(serviceName, 30);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.warn(`[FallbackImageService] Service ${serviceName} failed:`, error);

                // Expected business outcomes (premium/disabled/api keys) - surface to the UI
                // without tracking them as provider errors.
                if (isAccessErrorMessage(message)) {
                    throw error;
                }

                // Per-provider failures stay in analytics as a metric; errors are captured
                // once by the API route to avoid duplicate Sentry events per request.
                TelemetryFactory.getTelemetryService().trackEvent({
                    name: 'ai_provider_error',
                    params: {
                        action: 'image_analysis',
                        category: 'ai_analysis',
                        provider: serviceName,
                        attempt: index + 1,
                        totalServices: this.services.length,
                    },
                });

                errors.push(error as Error);
                // Record failure to trigger cooldown (60s for hard failures)
                this.cooldownManager.recordFailure(serviceName, 60);
            }
        }

        if (errors.length > 0) {
            throw new Error(`All image recognition services failed. Last error: ${errors[errors.length - 1].message}`);
        }

        throw new Error("All image recognition services failed.");
    }
}
