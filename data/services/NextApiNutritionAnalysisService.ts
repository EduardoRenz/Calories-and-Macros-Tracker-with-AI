import { NutritionalInfo, NutritionAnalysisService } from '../../domain/services/NutritionAnalysisService';
import { AuthRepository } from '../../domain/repositories/AuthRepository';

export class NextApiNutritionAnalysisService extends NutritionAnalysisService {
    constructor(private authRepository: AuthRepository) {
        super();
    }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        const token = await this.authRepository.getIdToken();

        // Require authentication for server-side AI features
        if (!token) {
            console.error('[NutritionAnalysis] No auth token available');
            throw new Error('Authentication required. Please sign in to use this feature.');
        }

        const response = await fetch('/api/analyze-nutrition', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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
