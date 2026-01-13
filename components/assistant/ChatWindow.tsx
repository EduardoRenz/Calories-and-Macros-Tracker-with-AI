import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
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

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendMessage(inputText);
        setInputText('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-full max-w-[400px] h-[600px] max-h-[80vh] bg-healthpal-panel rounded-2xl shadow-2xl border border-healthpal-border flex flex-col z-[49] animate-in slide-in-from-bottom-10 fade-in duration-300">
            <ChatHeader onClose={closeChat} />

            <ChatMessages
                messages={messages}
                onConfirmAction={confirmAction}
                onCancelAction={cancelAction}
                isThinking={isSending}
            />

            <ChatInput
                value={inputText}
                onChange={setInputText}
                onSend={handleSend}
                isSending={isSending}
            />
        </div>
    );
};

export default ChatWindow;
