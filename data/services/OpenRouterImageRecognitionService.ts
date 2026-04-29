import { OpenAIImageRecognitionService } from './OpenAIImageRecognitionService';
import { env } from '../../env';

export class OpenRouterImageRecognitionService extends OpenAIImageRecognitionService {
    constructor(apiKey: string, model?: string) {
        // OpenRouter is OpenAI compatible
        super(apiKey, 'https://openrouter.ai/api/v1', model || env.NEXT_PUBLIC_OPENROUTER_DEFAULT_MODEL);
    }
}
