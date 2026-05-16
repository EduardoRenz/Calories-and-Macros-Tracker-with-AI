'use client';

import React from 'react';
import { DietType } from '@/domain/entities/profile';
import { useTranslation } from '@/hooks/useTranslation';

interface DietTypeFormProps {
    dietType: DietType;
    onChange: (dietType: DietType) => void;
    className?: string;
}

export default function DietTypeForm({ dietType, onChange, className = '' }: DietTypeFormProps) {
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value as DietType);
    };

    return (
        <div className={`bg-neutral-card p-6 rounded-2xl ${className}`}>
            <h3 className="text-xl font-bold mb-6">{t('profile.personal_info.diet_type')}</h3>
            <div>
                <label className="block text-sm font-medium text-neutral-text-secondary mb-2">
                    {t('profile.personal_info.diet_type')}
                </label>
                <select
                    name="dietType"
                    value={dietType}
                    onChange={handleChange}
                    className="w-full bg-neutral-panel border border-neutral-border rounded-lg p-3 appearance-none"
                >
                    <option value="omnivore">{t('profile.personal_info.diet_types.omnivore')}</option>
                    <option value="vegetarian">{t('profile.personal_info.diet_types.vegetarian')}</option>
                    <option value="vegan">{t('profile.personal_info.diet_types.vegan')}</option>
                    <option value="pescatarian">{t('profile.personal_info.diet_types.pescatarian')}</option>
                    <option value="carnivore">{t('profile.personal_info.diet_types.carnivore')}</option>
                    <option value="flexitarian">{t('profile.personal_info.diet_types.flexitarian')}</option>
                </select>
            </div>
        </div>
    );
}
