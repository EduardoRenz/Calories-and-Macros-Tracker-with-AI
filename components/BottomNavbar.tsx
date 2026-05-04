'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, SparklesIcon, ChatBubbleLeftRightIcon, UserIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import { useChatAssistant } from '../contexts/ChatAssistantContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { useApiKeys } from '../hooks/useApiKeys';
import { ModelImageWarningModal } from './ModelImageWarningModal';

interface BottomNavbarProps {
    onQuickMealClick: () => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onQuickMealClick }) => {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const { openChat, closeChat, isOpen } = useChatAssistant();
    const { isFeatureEnabled, isUserApiKeysRequired } = useFeatureFlags();
    const { isDeepSeekOnly, nonVisionProvider } = useApiKeys();
    const [showWarningModal, setShowWarningModal] = useState(false);

    const isChatEnabled = isFeatureEnabled('enable_chatbot');

    const handleChatClick = () => {
        if (isOpen) {
            closeChat();
        } else {
            openChat();
        }
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-panel/80 backdrop-blur-sm border-t border-neutral-border z-40">
            <nav className="flex items-center justify-around h-full max-w-md mx-auto px-2" data-testid="mobile-bottom-nav">
                <div className="w-1/3">
                    <Link
                        href="/dashboard"
                        className={`flex flex-col items-center justify-center w-full h-full pt-1 transition-colors ${pathname === '/dashboard'
                            ? 'text-brand-green'
                            : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                            }`}
                    >
                        <HomeIcon className="w-6 h-6" />
                        <span className="text-xs mt-1">{t('navbar.dashboard')}</span>
                    </Link>
                </div>

                {/* Spacer for quick meal button */}
                <div className="w-1/3" />

                <div className="w-1/3">
                    {isChatEnabled ? (
                        <button
                            onClick={handleChatClick}
                            className={`flex flex-col items-center justify-center w-full h-full pt-1 transition-colors ${isOpen
                                ? 'text-brand-green'
                                : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                                }`}
                            id="mobile-chat-button"
                        >
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                            <span className="text-xs mt-1">{t('assistant.title')}</span>
                        </button>
                    ) : (
                        <Link
                            href="/profile"
                            className={`flex flex-col items-center justify-center w-full h-full pt-1 transition-colors ${pathname === '/profile'
                                ? 'text-brand-green'
                                : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                                }`}
                        >
                            <UserIcon className="w-6 h-6" />
                            <span className="text-xs mt-1">{t('navbar.profile')}</span>
                        </Link>
                    )}
                </div>
            </nav>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                    onClick={() => {
                        if (isUserApiKeysRequired) return;
                        if (isDeepSeekOnly) {
                            setShowWarningModal(true);
                            return;
                        }
                        onQuickMealClick();
                    }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-ambient transition-all ${isUserApiKeysRequired || isDeepSeekOnly
                        ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed grayscale'
                        : 'bg-secondary text-on-secondary hover:brightness-110 active:scale-95'
                        }`}
                    aria-label={t('navbar.quick_meal')}
                    title={isUserApiKeysRequired ? t('dashboard.api_keys_required_title') : nonVisionProvider ? t('model_image_warning.title', { model: nonVisionProvider }) : undefined}
                >
                    <SparklesIcon className="w-8 h-8" />
                </button>
            </div>

            <ModelImageWarningModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onGoToSettings={() => {
                    setShowWarningModal(false);
                    router.push('/settings');
                }}
                modelName={nonVisionProvider || 'DeepSeek'}
            />
        </div>
    );
};

export default BottomNavbar;
