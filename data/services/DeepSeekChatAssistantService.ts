import { OpenAIChatAssistantService } from './OpenAIChatAssistantService';

export class DeepSeekChatAssistantService extends OpenAIChatAssistantService {
    constructor(apiKey: string) {
        // DeepSeek API is fully OpenAI Compatible
        super(apiKey, 'https://api.deepseek.com', 'deepseek-chat');
    }
}
