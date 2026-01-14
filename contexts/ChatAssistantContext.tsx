import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProfile } from './ProfileContext';
import { useLanguage } from './LanguageContext';
import { ChatMessage, PendingAction, AddIngredientActionData, RemoveIngredientActionData } from '../domain/entities/ChatMessage';
import { ServiceFactory } from '../data/ServiceFactory';
import { RepositoryFactory } from '../data/RepositoryFactory';
import { useTranslation } from '../hooks/useTranslation';
import { Ingredient, MealSummary } from '../domain/entities/dashboard';
import FloatingChatButton from '../components/assistant/FloatingChatButton';
import ChatWindow from '../components/assistant/ChatWindow';

interface ChatAssistantContextType {
    isOpen: boolean;
    openChat: () => void;
    closeChat: () => void;
    messages: ChatMessage[];
    sendMessage: (content: string) => Promise<void>;
    confirmAction: (actionId: string) => Promise<void>;
    cancelAction: (actionId: string) => Promise<void>;
    isSending: boolean;
}

const ChatAssistantContext = createContext<ChatAssistantContextType | undefined>(undefined);

export const ChatAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isSending, setIsSending] = useState(false);
    const { t } = useTranslation();
    const { profile } = useProfile();
    const { language } = useLanguage();

    // Initial message
    useEffect(() => {
        if (messages.length === 0) {
            // Optional: Add initial greeting if needed, or let component handle empty state
        }
    }, []);

    const openChat = () => setIsOpen(true);
    const closeChat = () => setIsOpen(false);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Add user message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setIsSending(true);

        try {
            const service = ServiceFactory.getChatAssistantService();
            const dashboardRepo = RepositoryFactory.getDashboardRepository();

            // Get local date string for dashboard context
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            const dashboardData = await dashboardRepo.getDashboardForDate(today);

            const response = await service.sendMessage([...messages, userMsg], {
                userProfile: profile,
                dashboardData,
                language,
                currentDate: today,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Add error message
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: t('assistant.action_error'),
                timestamp: new Date(),
            }]);
        } finally {
            setIsSending(false);
        }
    };

    const confirmAction = async (actionId: string) => {
        const messageIndex = messages.findIndex(m => m.pendingAction?.id === actionId);
        if (messageIndex === -1) return;

        const message = messages[messageIndex];
        const action = message.pendingAction!;
        const dashboardRepo = RepositoryFactory.getDashboardRepository();

        try {
            // Remove the action UI immediately or show loading? 
            // Better to update UI to show "Confirming..." but for now let's just process.

            let successMessage = '';

            switch (action.type) {
                case 'add_ingredient': {
                    const data = action.data as AddIngredientActionData;
                    const { date, mealType } = data;
                    const ingredient = data.ingredient || (data as any).updates;

                    if (!ingredient) {
                        console.error("No ingredient data found in action.data", data);
                        throw new Error(t('assistant.error_generic'));
                    }

                    // Validate mandatory fields
                    const requiredFields = ['name', 'quantity', 'calories', 'protein', 'carbs', 'fats'] as const;
                    for (const field of requiredFields) {
                        const val = (ingredient as any)[field];
                        if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) {
                            console.error(`Missing mandatory field: ${field}`, ingredient);
                            throw new Error(t('assistant.error_generic'));
                        }
                    }

                    await dashboardRepo.addIngredient(date, mealType, ingredient);
                    successMessage = `✅ ${t('assistant.action_success')}`;
                    break;
                }
                case 'update_ingredient': {
                    const data = action.data as AddIngredientActionData;
                    const { date, mealType, ingredientId } = data;
                    const updates = data.updates || data.ingredient;

                    if (!date || !mealType || !ingredientId || !updates) {
                        throw new Error(t('assistant.action_error'));
                    }

                    await dashboardRepo.updateIngredient(date, mealType, ingredientId, updates);
                    successMessage = `✅ ${t('assistant.action_success')}`;
                    break;
                }
                case 'remove_ingredient': {
                    const { date, mealType, ingredientId } = action.data as RemoveIngredientActionData;
                    await dashboardRepo.removeIngredient(date, mealType, ingredientId);
                    successMessage = `✅ ${t('assistant.action_success')}`;
                    break;
                }
            }

            // Sync dashboard UI
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('refresh-dashboard'));
            }

            // Update the message to remove pending action and maybe append success text
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[messageIndex] = {
                    ...newMessages[messageIndex],
                    pendingAction: undefined, // Remove the action card
                };

                // Add system message for success
                newMessages.push({
                    id: Date.now().toString(),
                    role: 'system',
                    content: successMessage,
                    timestamp: new Date(),
                });

                return newMessages;
            });

        } catch (error: any) {
            console.error('Action failed:', error);
            const errorMessage = error instanceof Error ? error.message : t('assistant.action_error');
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: `❌ ${errorMessage}`,
                timestamp: new Date(),
            }]);
        }
    };

    const cancelAction = async (actionId: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.pendingAction?.id === actionId) {
                return {
                    ...msg,
                    pendingAction: undefined // Just remove the card
                };
            }
            return msg;
        }));

        // Optional: Add "Action cancelled" system message
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: t('assistant.action_cancelled'),
            timestamp: new Date(),
        }]);
    };

    return (
        <ChatAssistantContext.Provider value={{
            isOpen,
            openChat,
            closeChat,
            messages,
            sendMessage,
            confirmAction,
            cancelAction,
            isSending
        }}>
            {children}
            <FloatingChatButton onClick={openChat} isOpen={isOpen} />
            <ChatWindow />
        </ChatAssistantContext.Provider>
    );
};

export const useChatAssistant = () => {
    const context = useContext(ChatAssistantContext);
    if (!context) {
        throw new Error('useChatAssistant must be used within a ChatAssistantProvider');
    }
    return context;
};
