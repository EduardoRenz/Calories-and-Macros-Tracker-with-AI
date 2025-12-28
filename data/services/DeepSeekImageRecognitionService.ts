import { OpenAIImageRecognitionService } from './OpenAIImageRecognitionService';

export class DeepSeekImageRecognitionService extends OpenAIImageRecognitionService {
    constructor(apiKey: string) {
        // DeepSeek API is OpenAI-compatible.
        // We use 'deepseek-chat'. If this model doesn't support vision, it will fail 
        // and the FallbackService will automatically try the next provider.
        super(apiKey, 'https://api.deepseek.com', 'deepseek-chat');
    }
}
