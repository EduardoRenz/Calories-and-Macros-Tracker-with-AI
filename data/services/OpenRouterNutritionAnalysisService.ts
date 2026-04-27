import { OpenAINutritionAnalysisService } from './OpenAINutritionAnalysisService';

export class OpenRouterNutritionAnalysisService extends OpenAINutritionAnalysisService {
    constructor(apiKey: string) {
        // OpenRouter is OpenAI compatible
        super(apiKey, 'https://openrouter.ai/api/v1', 'google/gemini-2.0-flash-001');
    }
}
