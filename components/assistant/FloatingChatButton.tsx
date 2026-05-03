import React from 'react';
import { ChatBubbleLeftRightIcon } from '../icons';
import { useTranslation } from '../../hooks/useTranslation';

interface FloatingChatButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick, isOpen }) => {
    const { t } = useTranslation();
    if (isOpen) return null;

    return (
        <button
            onClick={onClick}
            className="hidden md:flex fixed bottom-6 right-6 p-4 bg-secondary text-on-secondary rounded-full shadow-ambient hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 group items-center justify-center"
            aria-label={t('assistant.open_assistant')}
            id="floating-chat-button"
        >
            <ChatBubbleLeftRightIcon className="w-8 h-8" />
        </button>
    );
};

export default FloatingChatButton;
