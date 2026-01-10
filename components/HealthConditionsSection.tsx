'use client';

import React from 'react';
import type { HealthConditionKey } from '@/domain/entities/profile';

export interface HealthConditionOption {
    key: HealthConditionKey;
    label: string;
}

interface HealthConditionsSectionProps {
    title: string;
    subtitle: string;
    importanceText: string;
    options: HealthConditionOption[];
    selected: HealthConditionKey[];
    onToggle: (key: HealthConditionKey) => void;
}

export default function HealthConditionsSection({
    title,
    subtitle,
    importanceText,
    options,
    selected,
    onToggle,
}: HealthConditionsSectionProps) {
    return (
        <div className="bg-healthpal-card p-6 rounded-2xl">
            <div className="mb-4">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-healthpal-text-secondary text-sm mt-1">{subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map(option => {
                    const checked = selected.includes(option.key);

                    return (
                        <label
                            key={option.key}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked
                                ? 'bg-healthpal-panel border-healthpal-green'
                                : 'bg-healthpal-panel border-healthpal-border hover:border-healthpal-green/50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggle(option.key)}
                                className="h-4 w-4 accent-healthpal-green"
                            />
                            <span className="font-medium">{option.label}</span>
                        </label>
                    );
                })}
            </div>

            <div className="mt-4 bg-healthpal-panel/60 border border-healthpal-border rounded-lg p-4">
                <p className="text-sm text-healthpal-text-secondary">{importanceText}</p>
            </div>
        </div>
    );
}
