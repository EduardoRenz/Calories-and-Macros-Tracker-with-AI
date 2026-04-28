import { OpenAIImageRecognitionService } from './OpenAIImageRecognitionService';

export class OpenRouterImageRecognitionService extends OpenAIImageRecognitionService {
    constructor(apiKey: string) {
        // OpenRouter is OpenAI compatible
        super(apiKey, 'https://openrouter.ai/api/v1', 'openrouter/auto');
    }
}
