import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';

export class FallbackNutritionAnalysisService extends NutritionAnalysisService {
    private services: NutritionAnalysisService[];

    constructor(services: NutritionAnalysisService[]) {
        super();
        this.services = services;
        if (this.services.length === 0) {
            console.warn("FallbackNutritionAnalysisService initialized with no services.");
        }
    }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        const errors: any[] = [];

        for (let index = 0; index < this.services.length; index++) {
            const service = this.services[index];
            try {
                console.log(`[FallbackNutritionService] Attempting analysis with service ${index + 1}/${this.services.length}: ${service.constructor.name}`);
                const result = await service.getNutritionalInfo(ingredientName, quantity, language);
                if (result) {
                    console.log(`[FallbackNutritionService] Success with ${service.constructor.name}`);
                    return result;
                }
            } catch (error) {
                console.warn(`[FallbackNutritionService] Service ${service.constructor.name} failed:`, error);
                errors.push(error);
            }
        }

        console.error("All nutrition analysis services failed.", errors);
        return null;
    }
}
