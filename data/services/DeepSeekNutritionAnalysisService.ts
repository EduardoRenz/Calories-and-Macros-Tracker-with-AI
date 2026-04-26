import { OpenAINutritionAnalysisService } from './OpenAINutritionAnalysisService';

export class DeepSeekNutritionAnalysisService extends OpenAINutritionAnalysisService {
    constructor(apiKey: string) {
        // DeepSeek is OpenAI compatible
        super(apiKey, 'https://api.deepseek.com', 'deepseek-chat');
    }
}
