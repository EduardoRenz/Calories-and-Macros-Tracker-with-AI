import { FoodAnalysisReport } from '../../domain/entities/analysis';
import { FoodAnalysisInput, FoodAnalysisService } from '../../domain/services/FoodAnalysisService';
import { ServiceCooldownManager } from '../infrastructure/ServiceCooldownManager';
import { TelemetryFactory } from '../TelemetryFactory';

export class FallbackFoodAnalysisService implements FoodAnalysisService {
    private services: FoodAnalysisService[];
    private cooldownManager: ServiceCooldownManager;

    constructor(services: FoodAnalysisService[]) {
        this.services = services;
        this.cooldownManager = ServiceCooldownManager.getInstance();
        if (this.services.length === 0) {
            console.warn("FallbackFoodAnalysisService initialized with no services.");
        }
    }

    async generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport> {
        const errors: Error[] = [];

        for (const [index, service] of this.services.entries()) {
            const serviceName = service.constructor.name;

            // Check if service is in cooldown
            if (this.cooldownManager.isInCooldown(serviceName)) {
                console.log(`[FallbackService] Skipping ${serviceName} (in cooldown)`);
                continue;
            }

            try {
                console.log(`[FallbackService] Attempting analysis with service ${index + 1}/${this.services.length}: ${serviceName}`);
                const result = await service.generateAnalysis(input);
                console.log(`[FallbackService] Success with ${serviceName}`);
                return result;
            } catch (error) {
                console.warn(`[FallbackService] Service ${serviceName} failed:`, error);
                TelemetryFactory.getTelemetryService().captureError(error, {
                    action: 'food_analysis',
                    category: 'ai_analysis',
                    provider: serviceName,
                    extras: { attempt: index + 1, totalServices: this.services.length },
                });
                errors.push(error as Error);
                // Record failure to trigger cooldown
                this.cooldownManager.recordFailure(serviceName);
                // Continue to next service
            }
        }

        throw new Error(`All analysis services failed. Errors: ${errors.map(e => e.message).join(', ')}`);
    }
}
