import { FoodAnalysisReport } from '../../domain/entities/analysis';
import { FoodAnalysisInput, FoodAnalysisService } from '../../domain/services/FoodAnalysisService';

export class NextApiFoodAnalysisService implements FoodAnalysisService {
    async generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport> {
        const response = await fetch('/api/analyze-food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
