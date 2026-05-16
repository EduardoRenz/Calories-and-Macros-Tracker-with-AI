import { ChatAssistantService, ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { ServiceCooldownManager } from '../infrastructure/ServiceCooldownManager';

export class FallbackChatAssistantService implements ChatAssistantService {
    private services: ChatAssistantService[];
    private cooldownManager: ServiceCooldownManager;

    constructor(services: ChatAssistantService[]) {
        this.services = services;
        this.cooldownManager = ServiceCooldownManager.getInstance();
        if (this.services.length === 0) {
            console.warn("FallbackChatAssistantService initialized with no services.");
        }
    }

    async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
        const errors: Error[] = [];

        for (const [index, service] of this.services.entries()) {
            const serviceName = service.constructor.name;

            // Check if service is in cooldown
            if (this.cooldownManager.isInCooldown(serviceName)) {
                console.log(`[FallbackChatService] Skipping ${serviceName} (in cooldown)`);
                continue;
            }

            try {
                console.log(`[FallbackChatService] Attempting with service ${index + 1}/${this.services.length}: ${serviceName}`);
                const result = await service.sendMessage(messages, context);
                console.log(`[FallbackChatService] Success with ${serviceName}`);
                return result;
            } catch (error) {
                console.warn(`[FallbackChatService] Service ${serviceName} failed:`, error);
                errors.push(error as Error);
                // Record failure to trigger cooldown
                this.cooldownManager.recordFailure(serviceName);
            }
        }

        console.error("All chat assistant services failed.", errors);
        throw new Error(`All chat assistant services failed. Errors: ${errors.map(e => e.message).join(', ')}`);
    }
}
