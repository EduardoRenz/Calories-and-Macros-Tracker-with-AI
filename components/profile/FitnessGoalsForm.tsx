'use client';

import React from 'react';
import { FitnessGoals } from '@/domain/entities/profile';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';

interface FitnessGoalsFormProps {
    fitnessGoals?: FitnessGoals;
    onChange: (updates: Partial<FitnessGoals>) => void;
    className?: string;
    errors?: string[];
    touched?: Record<string, boolean>;
}

export default function FitnessGoalsForm({ fitnessGoals, onChange, className = '', errors = [], touched = {} }: FitnessGoalsFormProps) {
    const { t } = useTranslation();

    // Defensive default if fitnessGoals is undefined
    const safeFitnessGoals = fitnessGoals || { primaryGoal: null, targetWeight: null, activityLevel: null };

    const getFieldError = (fieldName: string, translatedField: string): boolean => {
        const hasError = errors.includes(t(translatedField));
        const isTouched = touched[fieldName];
        return hasError && isTouched;
    };

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
        <div className={`bg-neutral-card p-6 rounded-2xl ${className}`}>
            <h3 className="text-xl font-bold mb-6">{t('profile.fitness_goals.title')}</h3>
            <div>
                <label className="block text-sm font-medium text-neutral-text-secondary mb-2">
                    {t('profile.fitness_goals.primary_goal')}
                </label>
                <div className={`grid grid-cols-3 gap-2 border rounded-lg p-1 mb-6 ${getFieldError('primaryGoal', 'profile.fitness_goals.primary_goal') ? 'border-red-500' : 'border-neutral-border'}`}>
                    <Button
                        variant={safeFitnessGoals.primaryGoal === 'lose' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => handlePrimaryGoalClick('lose')}
                        className="py-2"
                    >
                        {t('profile.fitness_goals.lose_weight')}
                    </Button>
                    <Button
                        variant={safeFitnessGoals.primaryGoal === 'maintain' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => handlePrimaryGoalClick('maintain')}
                        className="py-2"
                    >
                        {t('profile.fitness_goals.maintain_weight')}
                    </Button>
                    <Button
                        variant={safeFitnessGoals.primaryGoal === 'gain' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => handlePrimaryGoalClick('gain')}
                        className="py-2"
                    >
                        {t('profile.fitness_goals.gain_muscle')}
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-neutral-text-secondary mb-2">
                        {t('profile.fitness_goals.target_weight')}
                    </label>
                    <input
                        type="number"
                        name="targetWeight"
                        value={safeFitnessGoals.targetWeight ?? ''}
                        onChange={handleChange}
                        placeholder="70"
                        className={`w-full bg-neutral-panel border rounded-lg p-3 ${getFieldError('targetWeight', 'profile.fitness_goals.target_weight') ? 'border-red-500' : 'border-neutral-border'}`}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-text-secondary mb-2">
                        {t('profile.fitness_goals.activity_level')}
                    </label>
                    <select
                        name="activityLevel"
                        value={safeFitnessGoals.activityLevel ?? ''}
                        onChange={handleChange}
                        className={`w-full bg-neutral-panel border rounded-lg p-3 appearance-none ${getFieldError('activityLevel', 'profile.fitness_goals.activity_level') ? 'border-red-500' : 'border-neutral-border'}`}
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
