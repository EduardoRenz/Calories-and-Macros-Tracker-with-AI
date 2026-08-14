import { Ingredient } from '../../domain/entities/dashboard';
import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import { ServiceCooldownManager } from '../infrastructure/ServiceCooldownManager';
import { TelemetryFactory } from '../TelemetryFactory';
import { EmptyAnalysisResultException, ImageTooLargeException, InvalidApiKeyException, RateLimitedException, InsufficientCreditsException } from '../../domain/exceptions/ImageAnalysisException';
import { AiAccessException } from '../../domain/exceptions/AiAccessException';

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
        let sawEmptyResult = false;

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
                // Empty result means "I don't recognize any foods", which another AI might know.
                console.warn(`[FallbackImageService] Service ${serviceName} returned empty (no foods recognized).`);
                // Shorter cooldown (30s) for empty result vs full failure (60s)
                sawEmptyResult = true;
                this.cooldownManager.recordFailure(serviceName, 30);
            } catch (error) {
                console.warn(`[FallbackImageService] Service ${serviceName} failed:`, error);

                // "No food found" is a soft failure: keep trying the next service.
                if (error instanceof EmptyAnalysisResultException) {
                    sawEmptyResult = true;
                    this.cooldownManager.recordFailure(serviceName, 30);
                    continue;
                }

                // Expected access outcomes (premium/disabled/keys required) surface to
                // the UI as-is; they are not provider failures.
                if (error instanceof AiAccessException) {
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

        // A model analyzed the image successfully and found no food. That
        // outcome is authoritative, so it wins over generic or per-provider
        // failures from later models - the user should see the friendly
        // "no food identified" message instead of an unrelated error.
        if (sawEmptyResult) {
            throw new EmptyAnalysisResultException();
        }

        if (errors.length > 0) {
            throw this.pickDominantError(errors);
        }

        throw new Error("All image recognition services failed.");
    }

    /**
     * Picks the most actionable domain exception to surface after every service
     * in the chain failed, preferring a known outcome (invalid key, oversized
     * image, rate limit) over a generic error message.
     */
    private pickDominantError(errors: Error[]): Error {
        const dominant = errors.find(
            (error) =>
                error instanceof InvalidApiKeyException ||
                error instanceof InsufficientCreditsException ||
                error instanceof ImageTooLargeException ||
                error instanceof RateLimitedException
        );
        if (dominant) return dominant;
        return new Error(`All image recognition services failed. Last error: ${errors[errors.length - 1].message}`);
    }
}
