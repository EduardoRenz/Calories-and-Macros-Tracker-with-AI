'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { UserProfile, isProfileComplete } from '@/domain/entities/profile';
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

    const canSave = useMemo(() => {
        return isProfileComplete(localProfile);
    }, [localProfile]);

    const handlePersonalInfoChange = (updates: Partial<UserProfile['personalInfo']>) => {
        setLocalProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, ...updates }
        }));
        setError(null);
    };

    const handleFitnessGoalsChange = (updates: Partial<UserProfile['fitnessGoals']>) => {
        setLocalProfile(prev => ({
            ...prev,
            fitnessGoals: { ...prev.fitnessGoals, ...updates }
        }));
        setError(null);
    };

    const handleSave = async () => {
        if (!canSave) {
            setError(t('dashboard.first_time.error_incomplete'));
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
                <p className="text-healthpal-text-secondary text-lg">
                    {t('dashboard.first_time.description')}
                </p>
            </div>

            {/* Forms */}
            <div className="space-y-6">
                <PersonalInfoForm
                    personalInfo={localProfile.personalInfo}
                    onChange={handlePersonalInfoChange}
                />

                <FitnessGoalsForm
                    fitnessGoals={localProfile.fitnessGoals}
                    onChange={handleFitnessGoalsChange}
                />

                {/* Dietary Restrictions Note */}
                <div className="bg-healthpal-card p-6 rounded-2xl border border-healthpal-border">
                    <h3 className="text-lg font-bold mb-2">{t('dashboard.first_time.dietary_restrictions_title')}</h3>
                    <p className="text-healthpal-text-secondary text-sm mb-4">
                        {t('dashboard.first_time.dietary_restrictions_desc')}
                    </p>
                    <Link
                        href="/profile"
                        className="text-healthpal-green hover:underline text-sm"
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

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={!canSave || isSaving}
                        className="bg-healthpal-green text-black font-bold py-3 px-8 rounded-lg hover:brightness-110 transition-all text-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? t('dashboard.first_time.saving') : t('dashboard.first_time.save_and_continue')}
                    </button>
                </div>
            </div>
        </div>
    );
}
