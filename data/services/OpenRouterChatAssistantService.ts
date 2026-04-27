import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { OpenAIChatAssistantService } from './OpenAIChatAssistantService';

export class OpenRouterChatAssistantService extends OpenAIChatAssistantService {
    constructor(apiKey: string, dashboardRepo?: DashboardRepository) {
        // OpenRouter is OpenAI compatible
        super(apiKey, dashboardRepo, 'https://openrouter.ai/api/v1', 'google/gemini-2.0-flash-001');
    }

    protected getDefaultModel(): string {
        return 'google/gemini-2.0-flash-001';
    }
}
