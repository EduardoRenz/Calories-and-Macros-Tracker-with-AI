import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';

export class MockNutritionAnalysisService extends NutritionAnalysisService {
    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        void quantity;
        void language;
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Basic mock logic
        const lowerName = ingredientName.toLowerCase();

        let info: NutritionalInfo = {
            calories: 100,
            protein: 5,
            carbs: 10,
            fats: 2,
            fiber: 1,
            quantityInGrams: 100,
            category: 'others'
        };

        if (lowerName.includes('arroz') || lowerName.includes('rice')) {
            info = { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, quantityInGrams: 100, category: 'cereals' };
        } else if (lowerName.includes('frango') || lowerName.includes('chicken')) {
            info = { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, quantityInGrams: 100, category: 'meats' };
        } else if (lowerName.includes('ovo') || lowerName.includes('egg')) {
            info = { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, quantityInGrams: 100, category: 'eggs' };
        } else if (lowerName.includes('maçã') || lowerName.includes('apple')) {
            info = { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, quantityInGrams: 100, category: 'fruits' };
        } else if (lowerName.includes('alface') || lowerName.includes('lettuce')) {
            info = { calories: 15, protein: 1.4, carbs: 2.9, fats: 0.2, fiber: 1.3, quantityInGrams: 100, category: 'vegetables' };
        }

        return info;
    }
}
