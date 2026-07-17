import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProfile } from './ProfileContext';
import { useLanguage } from './LanguageContext';
import { ChatMessage, AddIngredientActionData, UpdateIngredientActionData, RemoveIngredientActionData } from '../domain/entities/ChatMessage';
import { ServiceFactory } from '../data/ServiceFactory';
import { RepositoryFactory } from '../data/RepositoryFactory';
import { useFeatureFlags } from './FeatureFlagContext';
import { useTranslation } from '../hooks/useTranslation';
import FloatingChatButton from '../components/assistant/FloatingChatButton';
import ChatWindow from '../components/assistant/ChatWindow';
import { CookieManager } from '../utils/CookieManager';
import { ChatAssistantException } from '../domain/exceptions/ChatAssistantException';
import { AiAccessException, AiDisabledException, PremiumOnlyException, ApiKeysRequiredException } from '../domain/exceptions/AiAccessException';
import { Ingredient } from '../domain/entities/dashboard';


interface ChatAssistantContextType {
    isOpen: boolean;
    openChat: () => void;
    closeChat: () => void;
    messages: ChatMessage[];
    sendMessage: (content: string) => Promise<void>;
    confirmAction: (actionId: string) => Promise<void>;
    cancelAction: (actionId: string) => Promise<void>;
    isSending: boolean;
    isOnline: boolean;
}

const ChatAssistantContext = createContext<ChatAssistantContextType | undefined>(undefined);

export const ChatAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const { t } = useTranslation();
    const { profile } = useProfile();
    const { language } = useLanguage();
    const { isFeatureEnabled, isAiFeatureVisible } = useFeatureFlags();
    const cookieManager = useMemo(() => CookieManager.getInstance(), []);

    const isChatEnabled = isFeatureEnabled('enable_chatbot') && isAiFeatureVisible('chatbot');

    // Check initial status from cookie
    useEffect(() => {
        const status = cookieManager.getCookie('healthpal_assistant_status');
        setIsOnline(status !== 'absent');
    }, [cookieManager]);

    // Periodic check for cookie expiration (every minute)
    useEffect(() => {
        const interval = setInterval(() => {
            const status = cookieManager.getCookie('healthpal_assistant_status');
            const shouldBeOnline = status !== 'absent';
            setIsOnline(shouldBeOnline);
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [cookieManager]);

    // Initial message
    useEffect(() => {
        if (messages.length === 0) {
            // Optional: Add initial greeting if needed, or let component handle empty state
        }
    }, [messages.length]);

    // Cleanup scroll lock on unmount
    useEffect(() => {
        return () => {
            // Restore body scroll when component unmounts
            if (typeof window !== 'undefined') {
                const scrollY = document.body.style.top;
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }
        };
    }, []);

    // Handle resize events to toggle scroll lock based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined' && isOpen) {
                const isMobile = window.innerWidth < 768;
                if (!isMobile) {
                    // Restore scroll on desktop
                    const scrollY = document.body.style.top;
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.width = '';
                    document.body.style.top = '';
                    if (scrollY) {
                        window.scrollTo(0, parseInt(scrollY || '0') * -1);
                    }
                } else {
                    // Apply scroll lock on mobile
                    document.body.style.overflow = 'hidden';
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                    document.body.style.top = `-${window.scrollY}px`;
                }
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [isOpen]);

    const closeChat = useCallback(() => {
        setIsOpen(false);
        // Restore body scroll on mobile when chat is closed
        if (typeof window !== 'undefined') {
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
    }, []);

    // Handle browser back button to close chat on mobile
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handlePopState = (event: PopStateEvent) => {
            if (isOpen) {
                event.preventDefault();
                closeChat();
                // Push a new state to prevent going back in browser history
                window.history.pushState(null, '', window.location.pathname);
            }
        };

        if (isOpen) {
            // Add a new history entry when chat opens
            window.history.pushState(null, '', window.location.pathname);
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, closeChat]);

    const openChat = () => {
        if (!isChatEnabled) return;
        setIsOpen(true);
        // Prevent body scroll on mobile when chat is open
        if (typeof window !== 'undefined') {
            // Check if it's a mobile device
            const isMobile = window.innerWidth < 768; // md breakpoint
            if (isMobile) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                document.body.style.top = `-${window.scrollY}px`;
            }
        }
    };

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Add user message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setIsSending(true);
        setMessages(prev => [...prev, userMsg]);

        try {
            const aiAccessService = ServiceFactory.getAiAccessService();
            await aiAccessService.checkAccess('chatbot');

            const service = await ServiceFactory.getChatAssistantService();
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

            // Clear status cookie on success - assistant is back online
            cookieManager.deleteCookie('healthpal_assistant_status');
            setIsOnline(true);
        } catch (error) {
            console.error('Failed to send message:', error);

            if (error instanceof AiAccessException) {
                let errorMessage = t('assistant.errors.api_error');
                if (error instanceof AiDisabledException) {
                    errorMessage = t('ai_errors.disabled');
                } else if (error instanceof PremiumOnlyException) {
                    errorMessage = t('ai_errors.chatbot_premium_required');
                } else if (error instanceof ApiKeysRequiredException) {
                    errorMessage = t('ai_errors.api_keys_required');
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: errorMessage,
                    timestamp: new Date(),
                }]);
                return;
            }

            // Set status cookie to absent with different durations based on error type
            if (error instanceof ChatAssistantException) {
                // 1 hour for auth errors, 5 minutes for API errors
                const cooldownHours = error.code === 'AUTH_ERROR' ? 1 : 5 / 60; // 5 minutes = 5/60 hours
                cookieManager.setCookie('healthpal_assistant_status', 'absent', cooldownHours);
                setIsOnline(false);

                // Get translated error message based on exception type
                let errorMessage = t('assistant.errors.api_error');
                if (error.code === 'AUTH_ERROR') {
                    errorMessage = t('assistant.errors.api_key');
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'system',
                    content: errorMessage,
                    timestamp: new Date(),
                }]);
            } else {
                const message = error instanceof Error ? error.message : String(error);
                let errorMessage = t('assistant.action_error');
                let role: 'assistant' | 'system' = 'system';

                if (message.includes('contact support') || message.includes('internal configuration error')) {
                    errorMessage = message;
                } else
                if (message.includes('Premium') || message.includes('premium') || 
                    message.includes('API key') || message.includes('api_key') || message.includes('API Key')) {
                    
                    const aiAccessService = ServiceFactory.getAiAccessService();
                    const minPlan = await aiAccessService.getMinPlan('chatbot');
                    
                    if (minPlan === 'premium') {
                        errorMessage = t('ai_errors.chatbot_premium_required');
                    } else {
                        errorMessage = t('ai_errors.api_keys_required');
                    }
                    role = 'assistant';
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role,
                    content: errorMessage,
                    timestamp: new Date(),
                }]);
            }
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
                    const { date, mealType, ingredient } = data;

                    if (!ingredient) {
                        console.error("No ingredient data found in action.data", data);
                        throw new Error(t('assistant.error_generic'));
                    }

                    // Validate mandatory fields
                    const requiredFields = ['name', 'quantity', 'calories', 'protein', 'carbs', 'fats'] as const satisfies readonly (keyof Omit<Ingredient, 'id'>)[];
                    for (const field of requiredFields) {
                        const val = ingredient[field];
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
                    const data = action.data as UpdateIngredientActionData;
                    const { date, mealType, ingredientId, updates } = data;

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

        } catch (error) {
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
            isSending,
            isOnline
        }}>
            {children}
            {isChatEnabled && (
                <>
                    <FloatingChatButton onClick={openChat} isOpen={isOpen} />
                    <ChatWindow />
                </>
            )}
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
