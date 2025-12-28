import { Ingredient } from '../../domain/entities/dashboard';
import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';

export class NextApiImageRecognitionService implements ImageRecognitionService {
    async analyzeMealImage(image: Blob, language: string): Promise<Omit<Ingredient, 'id'>[]> {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('language', language);

        const response = await fetch('/api/recognize-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to recognize image');
        }

        return await response.json();
    }
}
