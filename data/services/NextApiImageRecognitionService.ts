import { Ingredient } from '../../domain/entities/dashboard';
import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { PremiumOnlyException, ApiKeysRequiredException } from '../../domain/exceptions/AiAccessException';
import { ImageTooLargeException, EmptyAnalysisResultException } from '../../domain/exceptions/ImageAnalysisException';

export class NextApiImageRecognitionService extends ImageRecognitionService {
    constructor(private authRepository: AuthRepository) {
        super();
    }

    async analyzeMealImage(image: Blob, language: string, prompt?: string): Promise<Omit<Ingredient, 'id'>[]> {
        const token = await this.authRepository.getIdToken();

        // Require authentication for server-side AI features
        if (!token) {
            console.error('[ImageRecognition] No auth token available');
            throw new Error('Authentication required. Please sign in to use this feature.');
        }

        const formData = new FormData();
        formData.append('image', image);
        formData.append('language', language);
        if (prompt && prompt.trim()) {
            formData.append('prompt', prompt);
        }

        const response = await fetch('/api/recognize-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            if (response.status === 413) {
                throw new ImageTooLargeException();
            }

            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || 'Failed to recognize image';

            // Throw specific exceptions for access denied (403) or auth errors (401)
            if (response.status === 403) {
                if (errorMessage.includes('API keys') || errorMessage.includes('keys')) {
                    throw new ApiKeysRequiredException(errorMessage);
                }
                throw new PremiumOnlyException(errorMessage);
            }

            if (errorMessage.includes('413') || errorMessage.toLowerCase().includes('large') || errorMessage.toLowerCase().includes('too large')) {
                throw new ImageTooLargeException(errorMessage);
            }

            throw new Error(errorMessage);
        }

        const ingredients = await response.json();
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            throw new EmptyAnalysisResultException();
        }
        return ingredients;
    }
}
