import { NutritionalInfo, NutritionAnalysisService } from '../../domain/services/NutritionAnalysisService';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { AiDisabledException, PremiumOnlyException, ApiKeysRequiredException } from '../../domain/exceptions/AiAccessException';
import { RateLimitedException } from '../../domain/exceptions/ImageAnalysisException';

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
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || 'Failed to fetch nutritional info';

            // Expected access outcomes are returned with a machine-readable code.
            if (response.status === 403) {
                if (errorData.code === 'API_KEYS_REQUIRED' ||
                    (errorData.code === undefined && errorMessage.includes('keys'))) {
                    throw new ApiKeysRequiredException(errorMessage);
                }
                if (errorData.code === 'AI_DISABLED') {
                    throw new AiDisabledException(errorMessage);
                }
                throw new PremiumOnlyException(errorMessage);
            }

            if (response.status === 429 || errorData.code === 'RATE_LIMITED') {
                throw new RateLimitedException(errorMessage);
            }

            throw new Error(errorMessage);
        }

        return await response.json();
    }
}
