import { NutritionalInfo, NutritionAnalysisService } from '../../domain/services/NutritionAnalysisService';
import { AuthRepository } from '../../domain/repositories/AuthRepository';

export class NextApiNutritionAnalysisService implements NutritionAnalysisService {
    constructor(private authRepository: AuthRepository) { }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        const token = await this.authRepository.getIdToken();

        const response = await fetch('/api/analyze-nutrition', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
