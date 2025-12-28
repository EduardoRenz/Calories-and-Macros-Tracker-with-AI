import { FoodAnalysisReport } from '../../domain/entities/analysis';
import { FoodAnalysisInput, FoodAnalysisService } from '../../domain/services/FoodAnalysisService';

export class FallbackFoodAnalysisService implements FoodAnalysisService {
    private services: FoodAnalysisService[];

    constructor(services: FoodAnalysisService[]) {
        this.services = services;
        if (this.services.length === 0) {
            console.warn("FallbackFoodAnalysisService initialized with no services.");
        }
    }

    async generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport> {
        const errors: Error[] = [];

        for (const [index, service] of this.services.entries()) {
            try {
                console.log(`[FallbackService] Attempting analysis with service ${index + 1}/${this.services.length}: ${service.constructor.name}`);
                const result = await service.generateAnalysis(input);
                console.log(`[FallbackService] Success with ${service.constructor.name}`);
                return result;
            } catch (error) {
                console.warn(`[FallbackService] Service ${service.constructor.name} failed:`, error);
                errors.push(error as Error);
                // Continue to next service
            }
        }

        throw new Error(`All analysis services failed. Errors: ${errors.map(e => e.message).join(', ')}`);
    }
}
