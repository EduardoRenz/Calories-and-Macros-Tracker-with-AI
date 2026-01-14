import { ChatMessage } from '../entities/ChatMessage';
import { UserProfile } from '../entities/profile';
import { DashboardData } from '../entities/dashboard';

export interface ChatAssistantContextData {
    userProfile: UserProfile | null;
    dashboardData: DashboardData | null;
    language: string;
}

export interface ChatAssistantService {
    sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage>;
}
