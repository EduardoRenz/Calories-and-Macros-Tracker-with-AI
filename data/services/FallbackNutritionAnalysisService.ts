import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';
import { ServiceCooldownManager } from '../infrastructure/ServiceCooldownManager';
import { TelemetryFactory } from '../TelemetryFactory';

export class FallbackNutritionAnalysisService extends NutritionAnalysisService {
    private services: NutritionAnalysisService[];
    private cooldownManager: ServiceCooldownManager;

    constructor(services: NutritionAnalysisService[]) {
        super();
        this.services = services;
        this.cooldownManager = ServiceCooldownManager.getInstance();
        if (this.services.length === 0) {
            console.warn("FallbackNutritionAnalysisService initialized with no services.");
        }
    }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        const errors: Error[] = [];

        for (let index = 0; index < this.services.length; index++) {
            const service = this.services[index];
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
                const message = error instanceof Error ? error.message : String(error);
                console.warn(`[FallbackNutritionService] Service ${serviceName} failed:`, error);

                TelemetryFactory.getTelemetryService().captureError(error, {
                    action: 'nutrition_analysis',
                    category: 'ai_analysis',
                    provider: serviceName,
                    extras: { attempt: index + 1, totalServices: this.services.length },
                });
                
                // If it's a permission/access error, throw immediately to inform the UI
                if (message.includes('Premium') || message.includes('premium') || 
                    message.includes('API key') || message.includes('api_key') || message.includes('API Key')) {
                    throw error;
                }

                errors.push(error as Error);
                // Record failure to trigger cooldown (60s for hard failures)
                this.cooldownManager.recordFailure(serviceName, 60);
            }
        }

        if (errors.length > 0) {
            throw new Error(errors[errors.length - 1].message);
        }

        return null;
    }
}
