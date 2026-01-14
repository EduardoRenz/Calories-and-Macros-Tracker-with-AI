import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { OpenAIChatAssistantService } from './OpenAIChatAssistantService';

export class DeepSeekChatAssistantService extends OpenAIChatAssistantService {
    constructor(apiKey: string, dashboardRepo?: DashboardRepository) {
        // DeepSeek API is fully OpenAI Compatible
        super(apiKey, dashboardRepo, 'https://api.deepseek.com', 'deepseek-chat');
    }
}
