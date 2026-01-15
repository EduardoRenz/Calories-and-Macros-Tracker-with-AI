import React, { useRef, useEffect } from 'react';
import { SendIcon, SpinnerIcon } from '../icons';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    isSending: boolean;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSend,
    isSending,
    disabled = false
}) => {
    const { t } = useTranslation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isSending && !disabled) {
                onSend();
            }
        }
    };

    return (
        <div className="p-4 border-t border-healthpal-border bg-healthpal-panel rounded-b-2xl">
            <div className="relative flex items-end gap-2 bg-healthpal-card rounded-xl p-2 border border-healthpal-border focus-within:border-healthpal-green focus-within:ring-1 focus-within:ring-healthpal-green transition-all">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('assistant.input_placeholder')}
                    disabled={isSending || disabled}
                    className="w-full bg-transparent border-0 focus:ring-0 text-healthpal-text-primary p-2 resize-none max-h-[120px] min-h-[44px] disabled:opacity-50"
                    rows={1}
                />

                <button
                    onClick={onSend}
                    disabled={!value.trim() || isSending || disabled}
                    className="p-2.5 rounded-lg bg-healthpal-primary text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all flex-shrink-0 mb-0.5"
                    aria-label={t('assistant.send')}
                >
                    {isSending ? (
                        <SpinnerIcon className="w-5 h-5 mx-auto" />
                    ) : (
                        <SendIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
            <p className="text-xs text-center text-healthpal-text-tertiary mt-2">
                HealthPal Assistant may provide inaccurate info.
            </p>
        </div>
    );
};

export default ChatInput;
