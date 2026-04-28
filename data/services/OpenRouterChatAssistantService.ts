import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { OpenAIChatAssistantService } from './OpenAIChatAssistantService';

export class OpenRouterChatAssistantService extends OpenAIChatAssistantService {
    constructor(apiKey: string, dashboardRepo?: DashboardRepository) {
        // OpenRouter is OpenAI compatible
        super(apiKey, dashboardRepo, 'https://openrouter.ai/api/v1', 'openrouter/auto');
    }

    protected getDefaultModel(): string {
        return 'openrouter/auto';
    }
}
