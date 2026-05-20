import { OpenAIImageRecognitionService } from './OpenAIImageRecognitionService';
import { Ingredient } from '../../domain/entities/dashboard';

export class DeepSeekImageRecognitionService extends OpenAIImageRecognitionService {
    constructor(apiKey: string, model?: string) {
        // DeepSeek API is OpenAI-compatible.
        super(apiKey, 'https://api.deepseek.com', model || 'deepseek-v4-flash');
    }

    async analyzeMealImage(image: Blob, language: string, prompt?: string): Promise<Omit<Ingredient, 'id'>[]> {
        void image;
        void language;
        void prompt;
        // DeepSeek does not support image recognition - fail immediately
        // This allows the fallback service to skip to the next model
        throw new Error('DeepSeek does not support image recognition');
    }
}
