import { Ingredient } from '../../domain/entities/dashboard';
import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import { ServiceCooldownManager } from '../infrastructure/ServiceCooldownManager';

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
                console.log(`[FallbackImageService] Success with ${serviceName}`);
                return result;
            } catch (error) {
                console.warn(`[FallbackImageService] Service ${serviceName} failed:`, error);
                errors.push(error as Error);
                // Record failure to trigger cooldown
                this.cooldownManager.recordFailure(serviceName);
            }
        }

        console.error("All image recognition services failed.", errors);
        throw new Error("All image recognition services failed.");
    }
}
