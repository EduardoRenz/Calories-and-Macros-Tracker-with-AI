import React, { useEffect, useRef } from 'react';
import { ChatMessage as IChatMessage } from '../../domain/entities/ChatMessage';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
    messages: IChatMessage[];
    onConfirmAction: (actionId: string) => void;
    onCancelAction: (actionId: string) => void;
    isThinking: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages,
    onConfirmAction,
    onCancelAction,
    isThinking
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

            {/* Welcome / Empty State */}
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-healthpal-card flex items-center justify-center mb-4 border border-healthpal-border">
                        <span className="text-3xl">👋</span>
                    </div>
                    <p className="text-healthpal-text-secondary text-sm">
                        Say hello to your personal health assistant!
                    </p>
                </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
                <ChatMessage
                    key={msg.id}
                    message={msg}
                    onConfirmAction={onConfirmAction}
                    onCancelAction={onCancelAction}
                />
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
                <div className="flex w-full mb-4 justify-start">
                    <div className="flex max-w-[85%] flex-row gap-2">
                        <div className="flex-shrink-0 mt-auto">
                            <div className="w-8 h-8 rounded-full bg-healthpal-green flex items-center justify-center text-black">
                                <span className="text-base">🤖</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start pt-2">
                            <div className="bg-healthpal-card p-3 rounded-2xl rounded-bl-sm border border-healthpal-border">
                                <div className="flex space-x-2 h-4 items-center px-1">
                                    <div className="w-2 h-2 bg-healthpal-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-healthpal-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-healthpal-text-secondary rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={bottomRef} className="h-1" />
        </div>
    );
};

export default ChatMessages;
