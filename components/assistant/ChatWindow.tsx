import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput, { ChatInputRef } from './ChatInput';
import { useChatAssistant } from '../../contexts/ChatAssistantContext';


const ChatWindow: React.FC = () => {
    const {
        isOpen,
        closeChat,
        messages,
        sendMessage,
        isSending,
        confirmAction,
        cancelAction
    } = useChatAssistant();

    const [inputText, setInputText] = useState('');
    const chatInputRef = useRef<ChatInputRef>(null);

    // Focus no input quando a janela abre
    useEffect(() => {
        if (isOpen && chatInputRef.current) {
            // Pequeno delay para garantir que o componente esteja montado
            setTimeout(() => {
                chatInputRef.current?.focusInput();
            }, 100);
        }
    }, [isOpen]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendMessage(inputText);
        setInputText('');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay para mobile que esconde header e bottom nav */}
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[48]" onClick={closeChat} />

            {/* Container principal do chat */}
            <div className="fixed md:bottom-6 md:left-auto md:right-6 md:translate-x-0 inset-0 md:inset-auto md:w-full md:max-w-[400px] md:h-[600px] md:max-h-[80vh] bg-healthpal-panel md:rounded-2xl shadow-2xl border border-healthpal-border flex flex-col z-[49] animate-in slide-in-from-bottom-10 fade-in duration-300">
                <ChatHeader onClose={closeChat} />

                <ChatMessages
                    messages={messages}
                    onConfirmAction={confirmAction}
                    onCancelAction={cancelAction}
                    isThinking={isSending}
                />

                <ChatInput
                    ref={chatInputRef}
                    value={inputText}
                    onChange={setInputText}
                    onSend={handleSend}
                    isSending={isSending}
                />
            </div>
        </>
    );
};

export default ChatWindow;
