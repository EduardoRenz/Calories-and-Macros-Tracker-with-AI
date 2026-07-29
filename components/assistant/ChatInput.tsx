import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { SendIcon, SpinnerIcon } from '../icons';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    isSending: boolean;
    disabled?: boolean;
}

export interface ChatInputRef {
    focusInput: () => void;
}

const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({
    value,
    onChange,
    onSend,
    isSending,
    disabled = false
}, ref) => {
    const { t } = useTranslation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [value]);

    // Expor método focus para o componente pai
    useImperativeHandle(ref, () => ({
        focusInput: () => {
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    }), []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isSending && !disabled) {
                onSend();
            }
        }
    };

    return (
        <div className="p-4 border-t border-neutral-border bg-neutral-panel rounded-b-2xl">
            <div className="relative flex items-end gap-2 bg-neutral-card rounded-xl p-2 border border-neutral-border focus-within:border-brand-green focus-within:ring-1 focus-within:ring-brand-green transition-all">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('assistant.input_placeholder')}
                    disabled={isSending || disabled}
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-neutral-text-primary p-2 resize-none max-h-[120px] min-h-[44px] disabled:opacity-50"
                    rows={1}
                    id="chat-input"
                />

                <button
                    onClick={onSend}
                    disabled={!value.trim() || isSending || disabled}
                    className="p-2.5 rounded-lg bg-primary text-on-primary font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all flex-shrink-0 mb-0.5"
                    aria-label={t('assistant.send')}
                >
                    {isSending ? (
                        <SpinnerIcon className="w-5 h-5 mx-auto" />
                    ) : (
                        <SendIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
            <p className="text-xs text-center text-brand-text-tertiary mt-2">
                {t('assistant.disclaimer')}
            </p>
        </div>
    );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
