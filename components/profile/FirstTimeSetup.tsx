'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/domain/entities/profile';
import { useTranslation } from '@/hooks/useTranslation';
import PersonalInfoForm from './PersonalInfoForm';
import FitnessGoalsForm from './FitnessGoalsForm';

interface FirstTimeSetupProps {
    profile: UserProfile;
    onSave: (profile: UserProfile) => Promise<void>;
}

export default function FirstTimeSetup({ profile, onSave }: FirstTimeSetupProps) {
    const { t } = useTranslation();
    const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Validate each required field and return list of missing fields
    const validationErrors = useMemo(() => {
        const errors: string[] = [];
        const pi = localProfile.personalInfo;
        const fg = localProfile.fitnessGoals;

        if (!pi?.age || pi.age <= 0) errors.push(t('profile.personal_info.age'));
        if (!pi?.height || pi.height <= 0) errors.push(t('profile.personal_info.height'));
        if (!pi?.weight || pi.weight <= 0) errors.push(t('profile.personal_info.weight'));
        if (!pi?.gender) errors.push(t('profile.personal_info.gender'));
        if (!fg?.primaryGoal) errors.push(t('profile.fitness_goals.primary_goal'));
        if (!fg?.targetWeight || fg.targetWeight <= 0) errors.push(t('profile.fitness_goals.target_weight'));
        if (!fg?.activityLevel) errors.push(t('profile.fitness_goals.activity_level'));

        return errors;
    }, [localProfile, t]);

    const canSave = useMemo(() => {
        return validationErrors.length === 0;
    }, [validationErrors]);

    const handlePersonalInfoChange = (updates: Partial<UserProfile['personalInfo']>) => {
        setLocalProfile(prev => ({
            ...prev,
            personalInfo: { ...(prev.personalInfo || {}), ...updates }
        }));
        // Mark fields as touched
        const updatedFields = Object.keys(updates);
        setTouched(prev => ({ ...prev, ...Object.fromEntries(updatedFields.map(f => [f, true])) }));
        setError(null);
    };

    const handleFitnessGoalsChange = (updates: Partial<UserProfile['fitnessGoals']>) => {
        setLocalProfile(prev => ({
            ...prev,
            fitnessGoals: { ...(prev.fitnessGoals || {}), ...updates }
        }));
        const updatedFields = Object.keys(updates);
        setTouched(prev => ({ ...prev, ...Object.fromEntries(updatedFields.map(f => [f, true])) }));
        setError(null);
    };

    const handleSave = async () => {
        if (!canSave) {
            const missingFields = validationErrors.join(', ');
            setError(`${t('dashboard.first_time.error_incomplete')}: ${missingFields}`);
            // Mark all fields as touched to show errors
            setTouched({
                age: true, height: true, weight: true, gender: true,
                primaryGoal: true, targetWeight: true, activityLevel: true
            });
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await onSave(localProfile);
        } catch {
            setError(t('dashboard.first_time.error_saving'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">{t('dashboard.first_time.title')}</h1>
                <p className="text-neutral-text-secondary text-lg">
                    {t('dashboard.first_time.description')}
                </p>
            </div>

            {/* Forms */}
            <div className="space-y-6">
                <PersonalInfoForm
                    personalInfo={localProfile.personalInfo}
                    onChange={handlePersonalInfoChange}
                    errors={validationErrors}
                    touched={touched}
                />

                <FitnessGoalsForm
                    fitnessGoals={localProfile.fitnessGoals}
                    onChange={handleFitnessGoalsChange}
                    errors={validationErrors}
                    touched={touched}
                />

                {/* Dietary Restrictions Note */}
                <div className="bg-neutral-card p-6 rounded-2xl border border-neutral-border">
                    <h3 className="text-lg font-bold mb-2">{t('dashboard.first_time.dietary_restrictions_title')}</h3>
                    <p className="text-neutral-text-secondary text-sm mb-4">
                        {t('dashboard.first_time.dietary_restrictions_desc')}
                    </p>
                    <Link
                        href="/profile"
                        className="text-brand-green hover:underline text-sm"
                    >
                        {t('dashboard.first_time.go_to_profile')}
                    </Link>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Save Button - always enabled to show validation errors on click */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-secondary text-on-secondary font-bold py-3 px-8 rounded-lg hover:brightness-110 transition-all text-md disabled:opacity-50"
                    >
                        {isSaving ? t('dashboard.first_time.saving') : t('dashboard.first_time.save_and_continue')}
                    </button>
                </div>
            </div>
        </div>
    );
}
