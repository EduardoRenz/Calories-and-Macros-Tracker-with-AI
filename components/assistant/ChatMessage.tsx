import React, { useMemo } from 'react';
import { ChatMessage as IChatMessage } from '../../domain/entities/ChatMessage';
import { Avatar } from '../ui/Avatar';
import MarkdownRenderer from './MarkdownRenderer';
import PendingActionCard from './PendingActionCard';

interface ChatMessageProps {
    message: IChatMessage;
    onConfirmAction: (actionId: string) => void;
    onCancelAction: (actionId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    onConfirmAction,
    onCancelAction
}) => {
    const isAssistant = message.role === 'assistant';
    const isSystem = message.role === 'system';

    const formattedTime = useMemo(() => {
        return new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [message.timestamp]);

    if (isSystem) {
        return (
            <div className="flex justify-center my-4">
                <span className="text-xs text-healthpal-text-secondary bg-healthpal-card px-3 py-1 rounded-full border border-healthpal-border">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <div className={`flex w-full mb-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex max-w-[85%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'} gap-2`}>

                {/* Avatar */}
                <div className="flex-shrink-0 mt-auto">
                    {isAssistant ? (
                        <div className="w-8 h-8 rounded-full bg-healthpal-primary flex items-center justify-center">
                            <span className="text-base">🤖</span>
                        </div>
                    ) : (
                        <Avatar size={32} className="bg-blue-600" />
                    )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                    <div
                        className={`
                            p-3 rounded-2xl text-sm shadow-sm
                            ${isAssistant
                                ? 'bg-healthpal-card text-healthpal-text-primary rounded-bl-sm border border-healthpal-border'
                                : 'bg-healthpal-green text-black font-medium rounded-br-sm'
                            }
                        `}
                    >
                        {isAssistant ? (
                            <MarkdownRenderer content={message.content} />
                        ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        )}

                        {isAssistant && message.pendingAction && (
                            <PendingActionCard
                                action={message.pendingAction}
                                onConfirm={onConfirmAction}
                                onCancel={onCancelAction}
                            />
                        )}
                    </div>

                    <span className="text-[10px] text-healthpal-text-tertiary mt-1 px-1">
                        {formattedTime}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
