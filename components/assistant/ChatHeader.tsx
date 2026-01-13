import React from 'react';
import { XMarkIcon } from '../icons';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatHeaderProps {
    onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between p-4 bg-healthpal-panel rounded-t-2xl border-b border-healthpal-border">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-healthpal-green flex items-center justify-center text-black">
                        <span className="text-xl">🤖</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-healthpal-panel"></div>
                </div>
                <div>
                    <h3 className="font-bold text-healthpal-text-primary text-sm sm:text-base">
                        {t('assistant.title')}
                    </h3>
                    <p className="text-xs text-healthpal-text-secondary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                        {t('assistant.status_online')}
                    </p>
                </div>
            </div>

            <button
                onClick={onClose}
                className="p-2 text-healthpal-text-secondary hover:text-white transition-colors rounded-full hover:bg-healthpal-border"
                aria-label={t('assistant.close')}
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ChatHeader;
