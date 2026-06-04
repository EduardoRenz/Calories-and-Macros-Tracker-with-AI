import { OpenAIFoodAnalysisService } from './OpenAIFoodAnalysisService';
import { env } from '../../env';

export class OpenRouterFoodAnalysisService extends OpenAIFoodAnalysisService {
    constructor(apiKey: string) {
        // OpenRouter is OpenAI compatible
        super(apiKey, 'https://openrouter.ai/api/v1', env.NEXT_PUBLIC_OPENROUTER_DEFAULT_MODEL, 'openrouter');
    }
}
