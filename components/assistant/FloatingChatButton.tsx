import React from 'react';
import { ChatBubbleLeftRightIcon } from '../icons';

interface FloatingChatButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick, isOpen }) => {
    if (isOpen) return null;

    return (
        <button
            onClick={onClick}
            className="hidden md:flex fixed bottom-6 right-6 p-4 bg-healthpal-primary text-black rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 group items-center justify-center"
            aria-label="Open Assistant"
        >
            <ChatBubbleLeftRightIcon className="w-8 h-8" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-healthpal-background"></div>
        </button>
    );
};

export default FloatingChatButton;
