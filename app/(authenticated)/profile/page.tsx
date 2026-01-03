'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { useTranslation } from '@/hooks/useTranslation';
import { UserProfile, WeightEntry } from '@/domain/entities/profile';
import { ProfileRepository } from '@/domain/repositories/ProfileRepository';
import { CalorieCalculationService } from '@/domain/services/CalorieCalculationService';
import { Avatar } from '@/components/ui/Avatar';
import { RepositoryFactory } from '@/data/RepositoryFactory';
import { useAuth } from '@/contexts/AuthContext';
import { EditIcon } from '@/components/icons';

// --- Reusable Chart Components ---
const WeightProgressChart: React.FC<{ data: WeightEntry[] }> = ({ data }) => {
    const { t } = useTranslation();

    const formatDateTick = (tickItem: string) => {
        const [year, month, day] = tickItem.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTooltipLabel = (label: string) => {
        const [year, month, day] = label.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-healthpal-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">{t('profile.weight_progress')}</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis
                            dataKey="date"
                            stroke="#A0A0A0"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatDateTick}
                        />
                        <YAxis stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1A201C', border: '1px solid #34453D', borderRadius: '0.75rem' }}
                            labelFormatter={formatTooltipLabel}
                        />
                        <Line type="monotone" dataKey="weight" stroke="#AFFF34" strokeWidth={2} dot={{ r: 4, fill: '#AFFF34' }} activeDot={{ r: 6, stroke: '#1A201C', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const GOAL_COLORS = ['#FFC107', '#34453D'];

const GoalProgressChart: React.FC<{ percentage: number }> = ({ percentage }) => {
    const { t } = useTranslation();
    const goalProgressData = [{ name: 'Complete', value: percentage }, { name: 'Remaining', value: 100 - percentage }];

    return (
        <div className="bg-healthpal-card p-6 rounded-2xl flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-4">{t('profile.goal_progress')}</h3>
            <div className="w-40 h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={goalProgressData} cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" dataKey="value" startAngle={90} endAngle={450} cornerRadius={10}>
                            {goalProgressData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={GOAL_COLORS[index % GOAL_COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-healthpal-yellow">{percentage}%</span>
                    <span className="text-xs text-healthpal-text-secondary">{t('profile.complete')}</span>
                </div>
            </div>
        </div>
    );
};

export default function ProfilePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('settings');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveMessage, setShowSaveMessage] = useState(false);

    const profileRepository: ProfileRepository = useMemo(() => RepositoryFactory.getProfileRepository(), []);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            const userProfile = await profileRepository.getProfile();
            setProfile(userProfile);
            setIsLoading(false);
        };
        fetchProfile();
    }, [profileRepository]);

    const calorieGoal = useMemo(() => {
        if (!profile) return 0;
        return CalorieCalculationService.calculateGoals(profile).calories;
    }, [profile]);

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!profile) return;
        const { name, value } = e.target;
        setProfile(prev => prev ? {
            ...prev,
            personalInfo: { ...prev.personalInfo, [name]: name === 'gender' ? value : parseFloat(value) || 0 }
        } : null);
    };

    const handleFitnessGoalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!profile) return;
        const { name, value } = e.target;
        setProfile(prev => prev ? {
            ...prev,
            fitnessGoals: { ...prev.fitnessGoals, [name]: name === 'activityLevel' ? value : parseFloat(value) || 0 }
        } : null);
    };

    const handlePrimaryGoalClick = (goal: 'lose' | 'maintain' | 'gain') => {
        if (!profile) return;
        setProfile(prev => prev ? {
            ...prev,
            fitnessGoals: { ...prev.fitnessGoals, primaryGoal: goal }
        } : null);
    };

    const handleUpdateProfile = async () => {
        if (!profile) return;

        setIsSaving(true);
        await profileRepository.updateProfile(profile);
        const updatedProfile = await profileRepository.getProfile();
        setProfile(updatedProfile);
        setIsSaving(false);

        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
    };

    const goalProgressPercentage = useMemo(() => {
        if (!profile || profile.weightHistory.length === 0) return 0;
        const startWeight = profile.weightHistory[0]?.weight;

        const { targetWeight } = profile.fitnessGoals;
        const currentWeight = profile.personalInfo.weight;

        const totalWeightToChange = Math.abs(startWeight - targetWeight);
        if (totalWeightToChange === 0) return profile.fitnessGoals.primaryGoal === 'maintain' ? 100 : 0;

        const weightChanged = startWeight - currentWeight;
        const progress = (profile.fitnessGoals.primaryGoal === 'lose' ? weightChanged : -weightChanged);

        const percentage = Math.round((progress / totalWeightToChange) * 100);

        return Math.max(0, Math.min(percentage, 100));
    }, [profile]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-96 text-healthpal-text-secondary">{t('profile.loading')}</div>;
    }

    if (!profile) {
        return <div className="flex justify-center items-center h-96 text-healthpal-text-secondary">{t('profile.load_error')}</div>;
    }

    const weightToGo = Math.abs(profile.personalInfo.weight - profile.fitnessGoals.targetWeight);

    return (
        <div className="text-healthpal-text-primary">
            <h2 className="text-3xl font-bold my-8">{t('profile.title')}</h2>

            <div className="flex border-b border-healthpal-border mb-8">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-2 px-1 mr-6 text-md font-medium ${activeTab === 'settings' ? 'text-healthpal-green border-b-2 border-healthpal-green' : 'text-healthpal-text-secondary'}`}
                >
                    {t('profile.tabs.settings')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* User Info */}
                    <div className="bg-healthpal-card p-6 rounded-2xl flex items-center gap-6">
                        <div className="relative">
                            <Avatar
                                name={user?.displayName || 'User'}
                                size={96}
                                className="border border-healthpal-border"
                                photoURL={user?.photoURL}
                            />
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-healthpal-green rounded-full flex items-center justify-center text-black hover:brightness-110">
                                <EditIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{user?.displayName}</h3>
                            <p className="text-healthpal-text-secondary">{user?.email}</p>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-healthpal-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-6">{t('profile.personal_info.title')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('profile.personal_info.age')}</label>
                                <input type="number" name="age" value={profile.personalInfo.age} onChange={handlePersonalInfoChange} className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('profile.personal_info.height')}</label>
                                <input type="number" name="height" value={profile.personalInfo.height} onChange={handlePersonalInfoChange} className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('profile.personal_info.weight')}</label>
                                <input type="number" name="weight" value={profile.personalInfo.weight} onChange={handlePersonalInfoChange} className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('profile.personal_info.gender')}</label>
                                <select name="gender" value={profile.personalInfo.gender} onChange={handlePersonalInfoChange} className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3 appearance-none">
                                    <option value="female">{t('profile.personal_info.female')}</option>
                                    <option value="male">{t('profile.personal_info.male')}</option>
                                    <option value="other">{t('profile.personal_info.other')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Fitness Goals */}
                    <div className="bg-healthpal-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-6">{t('profile.fitness_goals.title')}</h3>
                        <div>
                            <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('profile.fitness_goals.primary_goal')}</label>
                            <div className="grid grid-cols-3 gap-2 border border-healthpal-border rounded-lg p-1 mb-6">
                                <button onClick={() => handlePrimaryGoalClick('lose')} className={`py-2 rounded-md font-semibold text-sm transition-colors ${profile.fitnessGoals.primaryGoal === 'lose' ? 'bg-healthpal-green text-black' : 'hover:bg-healthpal-border'}`}>{t('profile.fitness_goals.lose_weight')}</button>
                                <button onClick={() => handlePrimaryGoalClick('maintain')} className={`py-2 rounded-md font-semibold text-sm transition-colors ${profile.fitnessGoals.primaryGoal === 'maintain' ? 'bg-healthpal-green text-black' : 'hover:bg-healthpal-border'}`}>{t('profile.fitness_goals.maintain_weight')}</button>
                                <button onClick={() => handlePrimaryGoalClick('gain')} className={`py-2 rounded-md font-semibold text-sm transition-colors ${profile.fitnessGoals.primaryGoal === 'gain' ? 'bg-healthpal-green text-black' : 'hover:bg-healthpal-border'}`}>{t('profile.fitness_goals.gain_muscle')}</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('profile.fitness_goals.target_weight')}</label>
                                <input type="number" name="targetWeight" value={profile.fitnessGoals.targetWeight} onChange={handleFitnessGoalChange} className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('profile.fitness_goals.activity_level')}</label>
                                <select name="activityLevel" value={profile.fitnessGoals.activityLevel} onChange={handleFitnessGoalChange} className="w-full bg-healthpal-panel border border-healthpal-border rounded-lg p-3 appearance-none">
                                    <option value="sedentary">{t('profile.fitness_goals.sedentary')}</option>
                                    <option value="lightly">{t('profile.fitness_goals.lightly_active')}</option>
                                    <option value="moderately">{t('profile.fitness_goals.moderately_active')}</option>
                                    <option value="very">{t('profile.fitness_goals.very_active')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4">
                        {showSaveMessage && <p className="text-healthpal-green text-sm">{t('profile.update_success')}</p>}
                        <button
                            onClick={handleUpdateProfile}
                            disabled={isSaving}
                            className="bg-healthpal-green text-black font-bold py-3 px-6 rounded-lg hover:brightness-110 transition-all text-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? t('profile.saving') : t('profile.update_profile')}
                        </button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Progress Summary */}
                    <div className="bg-healthpal-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4">{t('profile.progress_summary.title')}</h3>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-healthpal-text-secondary">{t('profile.progress_summary.current_weight')}</span>
                            <span className="font-bold text-lg">{profile.personalInfo.weight} kg</span>
                        </div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-healthpal-text-secondary">{t('profile.progress_summary.weight_to_go')}</span>
                            <span className="font-bold text-lg bg-healthpal-yellow text-black px-3 py-1 rounded-md">{weightToGo.toFixed(1)} kg</span>
                        </div>
                        <div className="bg-healthpal-panel p-4 rounded-lg text-center">
                            <span className="text-healthpal-text-secondary text-sm">{t('profile.progress_summary.daily_calorie_target')}</span>
                            <p className="font-bold text-2xl text-healthpal-green">{calorieGoal} kcal</p>
                        </div>
                    </div>

                    <WeightProgressChart data={profile.weightHistory} />

                    <GoalProgressChart percentage={goalProgressPercentage} />

                </div>
            </div>
        </div>
    );
}
