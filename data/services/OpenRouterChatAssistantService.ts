import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { OpenAIChatAssistantService } from './OpenAIChatAssistantService';
import { env } from '../../env';

export class OpenRouterChatAssistantService extends OpenAIChatAssistantService {
    constructor(apiKey: string, dashboardRepo?: DashboardRepository) {
        // OpenRouter is OpenAI compatible
        super(apiKey, dashboardRepo, 'https://openrouter.ai/api/v1', 'openrouter');
    }

    protected getDefaultModel(): string {
        return env.OPENROUTER_DEFAULT_MODEL;
    }
}
