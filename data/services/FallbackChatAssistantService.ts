import { ChatAssistantService, ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { ChatMessage } from '../../domain/entities/ChatMessage';

export class FallbackChatAssistantService implements ChatAssistantService {
    private services: ChatAssistantService[];

    constructor(services: ChatAssistantService[]) {
        this.services = services;
        if (this.services.length === 0) {
            console.warn("FallbackChatAssistantService initialized with no services.");
        }
    }

    async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
        const errors: Error[] = [];

        for (const [index, service] of this.services.entries()) {
            try {
                console.log(`[FallbackChatService] Attempting with service ${index + 1}/${this.services.length}: ${service.constructor.name}`);
                const result = await service.sendMessage(messages, context);
                console.log(`[FallbackChatService] Success with ${service.constructor.name}`);
                return result;
            } catch (error) {
                console.warn(`[FallbackChatService] Service ${service.constructor.name} failed:`, error);
                errors.push(error as Error);
            }
        }

        console.error("All chat assistant services failed.", errors);
        throw new Error(`All chat assistant services failed. Errors: ${errors.map(e => e.message).join(', ')}`);
    }
}
