import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';
import { ServiceCooldownManager } from '../infrastructure/ServiceCooldownManager';

export class FallbackNutritionAnalysisService implements NutritionAnalysisService {
    private services: NutritionAnalysisService[];
    private cooldownManager: ServiceCooldownManager;

    constructor(services: NutritionAnalysisService[]) {
        this.services = services;
        this.cooldownManager = ServiceCooldownManager.getInstance();
        if (this.services.length === 0) {
            console.warn("FallbackNutritionAnalysisService initialized with no services.");
        }
    }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        const errors: Error[] = [];

        for (const [index, service] of this.services.entries()) {
            const serviceName = service.constructor.name;

            // Check if service is in cooldown
            if (this.cooldownManager.isInCooldown(serviceName)) {
                console.log(`[FallbackNutritionService] Skipping ${serviceName} (in cooldown)`);
                continue;
            }

            try {
                console.log(`[FallbackNutritionService] Attempting analysis with service ${index + 1}/${this.services.length}: ${serviceName}`);
                const result = await service.getNutritionalInfo(ingredientName, quantity, language);
                if (result) {
                    console.log(`[FallbackNutritionService] Success with ${serviceName}`);
                    return result;
                }
                // If result is null (but no error), treat as soft failure with shorter cooldown
                // Typically null means "I don't know this food", which another AI might know.
                console.warn(`[FallbackNutritionService] Service ${serviceName} returned null (unknown food).`);
                // Shorter cooldown (30s) for null responses vs full failure (60s)
                this.cooldownManager.recordFailure(serviceName, 30);
            } catch (error) {
                console.warn(`[FallbackNutritionService] Service ${serviceName} failed:`, error);
                errors.push(error as Error);
                // Record failure to trigger cooldown (60s for hard failures)
                this.cooldownManager.recordFailure(serviceName, 60);
            }
        }

        console.error("All nutrition analysis services failed or returned null.", errors);
        return null;
    }
}
