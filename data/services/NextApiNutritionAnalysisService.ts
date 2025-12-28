import { NutritionalInfo, NutritionAnalysisService } from '../../domain/services/NutritionAnalysisService';

export class NextApiNutritionAnalysisService implements NutritionAnalysisService {
    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        const response = await fetch('/api/analyze-nutrition', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredientName, quantity, language }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch nutritional info');
        }

        return await response.json();
    }
}
