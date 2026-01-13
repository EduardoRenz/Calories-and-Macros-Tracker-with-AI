import { ChatMessage } from '../entities/ChatMessage';

export interface ChatAssistantService {
    sendMessage(messages: ChatMessage[], userMessage: string): Promise<ChatMessage>;
}
