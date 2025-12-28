import { OpenAIFoodAnalysisService } from './OpenAIFoodAnalysisService';

export class DeepSeekFoodAnalysisService extends OpenAIFoodAnalysisService {
    constructor(apiKey: string) {
        // DeepSeek is OpenAI compatible
        super(apiKey, 'https://api.deepseek.com', 'deepseek-chat');
    }
}
