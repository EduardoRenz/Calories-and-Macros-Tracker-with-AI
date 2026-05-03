'use client';

import React from 'react';
import { PersonalInfo } from '@/domain/entities/profile';
import { useTranslation } from '@/hooks/useTranslation';

interface PersonalInfoFormProps {
    personalInfo: PersonalInfo;
    onChange: (updates: Partial<PersonalInfo>) => void;
    className?: string;
}

export default function PersonalInfoForm({ personalInfo, onChange, className = '' }: PersonalInfoFormProps) {
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange({
            [name]: name === 'gender' ? value : value === '' ? null : parseFloat(value) || null
        });
    };

    return (
        <div className={`bg-healthpal-card p-6 rounded-2xl ${className}`}>
            <h3 className="text-xl font-bold mb-6">{t('profile.personal_info.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">
                        {t('profile.personal_info.age')}
                    </label>
                    <input
                        type="number"
                        name="age"
                        value={personalInfo.age ?? ''}
                        onChange={handleChange}
                        placeholder="30"
                        className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">
                        {t('profile.personal_info.height')}
                    </label>
                    <input
                        type="number"
                        name="height"
                        value={personalInfo.height ?? ''}
                        onChange={handleChange}
                        placeholder="170"
                        className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">
                        {t('profile.personal_info.weight')}
                    </label>
                    <input
                        type="number"
                        name="weight"
                        value={personalInfo.weight ?? ''}
                        onChange={handleChange}
                        placeholder="70"
                        className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">
                        {t('profile.personal_info.gender')}
                    </label>
                    <select
                        name="gender"
                        value={personalInfo.gender ?? ''}
                        onChange={handleChange}
                        className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3 appearance-none"
                    >
                        <option value="">{t('profile.personal_info.select_gender')}</option>
                        <option value="female">{t('profile.personal_info.female')}</option>
                        <option value="male">{t('profile.personal_info.male')}</option>
                        <option value="other">{t('profile.personal_info.other')}</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
