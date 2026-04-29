import { OpenAIImageRecognitionService } from './OpenAIImageRecognitionService';

export class DeepSeekImageRecognitionService extends OpenAIImageRecognitionService {
    constructor(apiKey: string, model?: string) {
        // DeepSeek API is OpenAI-compatible.
        super(apiKey, 'https://api.deepseek.com', model || 'deepseek-v4-flash');
    }
}
