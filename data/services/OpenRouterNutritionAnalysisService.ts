import { OpenAINutritionAnalysisService } from './OpenAINutritionAnalysisService';
import { env } from '../../env';

export class OpenRouterNutritionAnalysisService extends OpenAINutritionAnalysisService {
    constructor(apiKey: string) {
        // OpenRouter is OpenAI compatible
        super(apiKey, 'https://openrouter.ai/api/v1', env.OPENROUTER_DEFAULT_MODEL);
    }
}
