import { FoodAnalysisReport } from '../../domain/entities/analysis';
import { FoodAnalysisInput, FoodAnalysisService } from '../../domain/services/FoodAnalysisService';
import { AuthRepository } from '../../domain/repositories/AuthRepository';

export class NextApiFoodAnalysisService implements FoodAnalysisService {
    constructor(private authRepository: AuthRepository) { }

    async generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport> {
        const token = await this.authRepository.getIdToken();

        const response = await fetch('/api/analyze-food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate analysis');
        }

        return await response.json();
    }
}
