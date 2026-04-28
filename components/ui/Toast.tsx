'use client';

import React, { useEffect } from 'react';
import { XIcon, CheckIcon, AlertIcon, InfoIcon } from '../icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const typeStyles: Record<ToastType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: <CheckIcon className="w-5 h-5" />,
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: <AlertIcon className="w-5 h-5" />,
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: <AlertIcon className="w-5 h-5" />,
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: <InfoIcon className="w-5 h-5" />,
  },
};

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 5000, onClose }) => {
  const styles = typeStyles[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${styles.bg} ${styles.border} shadow-lg animate-in slide-in-from-right duration-300`}
      role="alert"
    >
      <div className={styles.text}>{styles.icon}</div>
      <span className={`flex-1 text-sm ${styles.text}`}>{message}</span>
      <button
        onClick={() => onClose(id)}
        className={`${styles.text} hover:opacity-70 transition-opacity`}
        aria-label="Close"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
