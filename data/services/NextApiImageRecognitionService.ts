import { Ingredient } from '../../domain/entities/dashboard';
import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import { AuthRepository } from '../../domain/repositories/AuthRepository';

export class NextApiImageRecognitionService implements ImageRecognitionService {
    constructor(private authRepository: AuthRepository) { }

    async analyzeMealImage(image: Blob, language: string): Promise<Omit<Ingredient, 'id'>[]> {
        const token = await this.authRepository.getIdToken();

        const formData = new FormData();
        formData.append('image', image);
        formData.append('language', language);

        const response = await fetch('/api/recognize-image', {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to recognize image');
        }

        return await response.json();
    }
}
