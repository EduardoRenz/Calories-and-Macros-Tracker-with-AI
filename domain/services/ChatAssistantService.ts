import { ChatMessage } from '../entities/ChatMessage';
import { UserProfile } from '../entities/profile';
import { DashboardData } from '../entities/dashboard';

export interface ChatAssistantContextData {
    userProfile: UserProfile | null;
    dashboardData: DashboardData | null;
    language: string;
    currentDate?: string; // yyyy-mm-dd format in user's local time
    timezone?: string;
}

export interface ChatAssistantService {
    sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage>;
}
