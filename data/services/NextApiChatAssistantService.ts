import { ChatAssistantService, ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { AuthRepository } from '../../domain/repositories/AuthRepository';

export class NextApiChatAssistantService implements ChatAssistantService {
    constructor(private authRepository: AuthRepository) { }

    async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
        const token = await this.authRepository.getIdToken();

        // Require authentication for server-side AI features
        if (!token) {
            console.error('[ChatAssistant] No auth token available');
            throw new Error('Authentication required. Please sign in to use this feature.');
        }

        const response = await fetch('/api/assistant/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ messages, context }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to send message');
        }

        return await response.json();
    }
}
