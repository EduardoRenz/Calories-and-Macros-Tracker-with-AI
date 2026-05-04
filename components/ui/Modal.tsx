import React, { useEffect, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '../icons';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: ModalSize;
    closeOnBackdropClick?: boolean;
    closeOnEsc?: boolean;
    showCloseButton?: boolean;
    className?: string;
    overlayClassName?: string;
    panelClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    dataTestId?: string;
}

const sizeToMaxWidthClass: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    size = 'md',
    closeOnBackdropClick = true,
    closeOnEsc = true,
    showCloseButton = true,
    className,
    overlayClassName,
    panelClassName,
    headerClassName,
    bodyClassName,
    dataTestId,
}) => {
    const titleId = useId();

    const portalTarget = useMemo(() => {
        if (typeof document === 'undefined') return null;
        return document.body;
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        if (typeof document === 'undefined') return;

        const { body, documentElement } = document;

        const previousOverflow = body.style.overflow;
        const previousPaddingRight = body.style.paddingRight;

        const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = previousOverflow;
            body.style.paddingRight = previousPaddingRight;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !closeOnEsc) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEsc, onClose]);

    if (!isOpen || !portalTarget) return null;

    return createPortal(
        <div
            className={
                overlayClassName ||
                'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4'
            }
            onClick={closeOnBackdropClick ? onClose : undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            data-testid={dataTestId}
        >
            <div
                className={
                    className ||
                    `bg-neutral-panel w-full ${sizeToMaxWidthClass[size]} rounded-2xl border border-neutral-border shadow-2xl relative`
                }
                onClick={(e) => e.stopPropagation()}
            >
                {(title || showCloseButton) && (
                    <div
                        className={
                            headerClassName ||
                            'flex justify-between items-center p-4 border-b border-neutral-border bg-neutral-card/50 rounded-t-2xl'
                        }
                    >
                        {title ? (
                            <h3 id={titleId} className="text-lg font-bold">
                                {title}
                            </h3>
                        ) : (
                            <div />
                        )}

                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-neutral-text-secondary hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                )}

                <div
                    className={
                        bodyClassName ||
                        'p-6 max-h-[85vh] overflow-y-auto overscroll-contain'
                    }
                >
                    <div className={panelClassName}>{children}</div>
                </div>
            </div>
        </div>,
        portalTarget
    );
};

export default Modal;
