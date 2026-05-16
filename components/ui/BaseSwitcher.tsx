'use client';

import React, { ReactNode } from 'react';

export interface SwitcherOption<T> {
    id: string;
    label: ReactNode;
    value: T;
    title?: string;
}

interface BaseSwitcherProps<T> {
    label: string;
    options: SwitcherOption<T>[];
    selectedValue: T;
    onChange: (value: T) => void;
    showBorder?: boolean;
}

/**
 * A reusable switcher component with a label on the left and 
 * segmented buttons on the right.
 */
export function BaseSwitcher<T>({
    label,
    options,
    selectedValue,
    onChange,
    showBorder = true
}: BaseSwitcherProps<T>) {
    return (
        <div className={`w-full flex items-center justify-between px-4 py-2 ${showBorder ? 'border-b border-neutral-border' : ''}`}>
            <span className="text-sm text-neutral-text-secondary font-medium">{label}</span>
            <div className="flex bg-surface-container-high rounded-full p-1 gap-1">
                {options.map((option) => {
                    const isActive = selectedValue === option.value;
                    return (
                        <button
                            key={option.id}
                            onClick={() => onChange(option.value)}
                            className={`px-3 py-1.5 rounded-full transition-all flex items-center justify-center min-w-[32px] text-xs font-bold ${
                                isActive
                                    ? 'bg-secondary text-on-secondary shadow-sm scale-105'
                                    : 'text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-card active:scale-95'
                            }`}
                            title={option.title}
                            type="button"
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
