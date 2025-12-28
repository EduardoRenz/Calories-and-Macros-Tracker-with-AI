import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';

export class FallbackNutritionAnalysisService implements NutritionAnalysisService {
    private services: NutritionAnalysisService[];

    constructor(services: NutritionAnalysisService[]) {
        this.services = services;
        if (this.services.length === 0) {
            console.warn("FallbackNutritionAnalysisService initialized with no services.");
        }
    }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        const errors: Error[] = [];

        for (const [index, service] of this.services.entries()) {
            try {
                console.log(`[FallbackNutritionService] Attempting analysis with service ${index + 1}/${this.services.length}: ${service.constructor.name}`);
                const result = await service.getNutritionalInfo(ingredientName, quantity, language);
                if (result) {
                    console.log(`[FallbackNutritionService] Success with ${service.constructor.name}`);
                    return result;
                }
                // If result is null (but no error), maybe we should try next? 
                // Typically null means "I don't know this food", which another AI might know.
                console.warn(`[FallbackNutritionService] Service ${service.constructor.name} returned null (unknown food).`);
            } catch (error) {
                console.warn(`[FallbackNutritionService] Service ${service.constructor.name} failed:`, error);
                errors.push(error as Error);
            }
        }

        console.error("All nutrition analysis services failed or returned null.", errors);
        return null;
    }
}
