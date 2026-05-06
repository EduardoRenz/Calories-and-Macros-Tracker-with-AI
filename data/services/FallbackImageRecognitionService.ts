import { Ingredient } from '../../domain/entities/dashboard';
import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';

export class FallbackImageRecognitionService extends ImageRecognitionService {
    private services: ImageRecognitionService[];

    constructor(services: ImageRecognitionService[]) {
        super();
        this.services = services;
        if (this.services.length === 0) {
            console.warn("FallbackImageRecognitionService initialized with no services.");
        }
    }

    async analyzeMealImage(image: Blob, language: string, prompt?: string): Promise<Omit<Ingredient, 'id'>[]> {
        const errors: Error[] = [];

        for (let index = 0; index < this.services.length; index++) {
            const service = this.services[index];
            try {
                console.log(`[FallbackImageService] Attempting analysis with service ${index + 1}/${this.services.length}: ${service.constructor.name}`);
                const result = await service.analyzeMealImage(image, language, prompt);
                console.log(`[FallbackImageService] Success with ${service.constructor.name}`);
                return result;
            } catch (error) {
                console.warn(`[FallbackImageService] Service ${service.constructor.name} failed:`, error);
                errors.push(error as Error);
            }
        }

        console.error("All image recognition services failed.", errors);
        throw new Error("All image recognition services failed.");
    }
}
