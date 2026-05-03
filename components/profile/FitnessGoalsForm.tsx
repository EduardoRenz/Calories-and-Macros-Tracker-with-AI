'use client';

import React from 'react';
import { FitnessGoals } from '@/domain/entities/profile';
import { useTranslation } from '@/hooks/useTranslation';

interface FitnessGoalsFormProps {
    fitnessGoals: FitnessGoals;
    onChange: (updates: Partial<FitnessGoals>) => void;
    className?: string;
}

export default function FitnessGoalsForm({ fitnessGoals, onChange, className = '' }: FitnessGoalsFormProps) {
    const { t } = useTranslation();

    const handlePrimaryGoalClick = (goal: 'lose' | 'maintain' | 'gain') => {
        onChange({ primaryGoal: goal });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange({
            [name]: name === 'activityLevel' ? value : value === '' ? null : parseFloat(value) || null
        });
    };

    return (
        <div className={`bg-healthpal-card p-6 rounded-2xl ${className}`}>
            <h3 className="text-xl font-bold mb-6">{t('profile.fitness_goals.title')}</h3>
            <div>
                <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">
                    {t('profile.fitness_goals.primary_goal')}
                </label>
                <div className="grid grid-cols-3 gap-2 border border-healthpal-border rounded-lg p-1 mb-6">
                    <button
                        onClick={() => handlePrimaryGoalClick('lose')}
                        className={`py-2 rounded-md font-semibold text-sm transition-colors ${
                            fitnessGoals.primaryGoal === 'lose'
                                ? 'bg-healthpal-green text-black'
                                : 'hover:bg-healthpal-border'
                        }`}
                    >
                        {t('profile.fitness_goals.lose_weight')}
                    </button>
                    <button
                        onClick={() => handlePrimaryGoalClick('maintain')}
                        className={`py-2 rounded-md font-semibold text-sm transition-colors ${
                            fitnessGoals.primaryGoal === 'maintain'
                                ? 'bg-healthpal-green text-black'
                                : 'hover:bg-healthpal-border'
                        }`}
                    >
                        {t('profile.fitness_goals.maintain_weight')}
                    </button>
                    <button
                        onClick={() => handlePrimaryGoalClick('gain')}
                        className={`py-2 rounded-md font-semibold text-sm transition-colors ${
                            fitnessGoals.primaryGoal === 'gain'
                                ? 'bg-healthpal-green text-black'
                                : 'hover:bg-healthpal-border'
                        }`}
                    >
                        {t('profile.fitness_goals.gain_muscle')}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">
                        {t('profile.fitness_goals.target_weight')}
                    </label>
                    <input
                        type="number"
                        name="targetWeight"
                        value={fitnessGoals.targetWeight ?? ''}
                        onChange={handleChange}
                        placeholder="70"
                        className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">
                        {t('profile.fitness_goals.activity_level')}
                    </label>
                    <select
                        name="activityLevel"
                        value={fitnessGoals.activityLevel ?? ''}
                        onChange={handleChange}
                        className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3 appearance-none"
                    >
                        <option value="">{t('profile.fitness_goals.select_activity')}</option>
                        <option value="sedentary">{t('profile.fitness_goals.sedentary')}</option>
                        <option value="lightly">{t('profile.fitness_goals.lightly_active')}</option>
                        <option value="moderately">{t('profile.fitness_goals.moderately_active')}</option>
                        <option value="very">{t('profile.fitness_goals.very_active')}</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
