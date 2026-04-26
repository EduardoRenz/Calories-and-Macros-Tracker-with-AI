import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';

export class MockNutritionAnalysisService implements NutritionAnalysisService {
    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        console.log(`[MockNutritionAnalysisService] Analyzing ${quantity} of ${ingredientName} in ${language}`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const nameLower = ingredientName.toLowerCase();

        // Simple mock database
        if (nameLower.includes('apple') || nameLower.includes('maçã') || nameLower.includes('manzana')) {
            return { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, quantityInGrams: 100 };
        }
        if (nameLower.includes('chicken') || nameLower.includes('frango') || nameLower.includes('pollo')) {
            return { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, quantityInGrams: 100 };
        }
        if (nameLower.includes('rice') || nameLower.includes('arroz')) {
            return { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, quantityInGrams: 100 };
        }
        if (nameLower.includes('egg') || nameLower.includes('ovo') || nameLower.includes('huevo')) {
            return { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, quantityInGrams: 100 };
        }
        if (nameLower.includes('banana')) {
            return { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, quantityInGrams: 100 };
        }

        // Default mock values for anything else
        return {
            calories: 100,
            protein: 5,
            carbs: 15,
            fats: 2,
            fiber: 0,
            quantityInGrams: 100
        };
    }
}
