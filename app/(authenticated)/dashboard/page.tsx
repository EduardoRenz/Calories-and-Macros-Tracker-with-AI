
'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MacroProgressCard from '@/components/MacroProgressCard';
import MobileNutrientSummary from '@/components/MobileNutrientSummary';
import MealSummaryCard from '@/components/MealSummaryCard';
import MacroSplitChart from '@/components/MacroSplitChart';
import CalorieDisplayCard from '@/components/CalorieDisplayCard';
import { useTranslation } from '@/hooks/useTranslation';
import { DashboardData, Ingredient, MealSummary } from '@/domain/entities/dashboard';
import { DashboardRepository } from '@/domain/repositories/DashboardRepository';
import AddIngredientModal from '@/components/AddIngredientModal';
import DashboardNavigation from '@/components/DashboardNavigation';
import DashboardWarningBar from '@/components/DashboardWarningBar';
import { RepositoryFactory } from '@/data/RepositoryFactory';
import { useProfile } from '@/contexts/ProfileContext';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { CalorieCalculationService } from '@/domain/services/CalorieCalculationService';

const getFormattedDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { isUserApiKeysRequired } = useFeatureFlags();

    const { profile, goalsManagementService } = useProfile();
    const computedGoals = useMemo(() => {
        if (profile) return CalorieCalculationService.calculateGoals(profile);
        return null;
    }, [profile]);

    const macrosWithGoals = useMemo(() => {
        if (!data) return null;

        const fallbackGoals = {
            calories: computedGoals?.calories ?? data.macros.calories.goal ?? 0,
            protein: computedGoals?.protein ?? data.macros.protein.goal ?? 0,
            carbs: computedGoals?.carbs ?? data.macros.carbs.goal ?? 0,
            fats: computedGoals?.fats ?? data.macros.fats.goal ?? 0,
        };

        return {
            calories: { ...data.macros.calories, goal: fallbackGoals.calories },
            protein: { ...data.macros.protein, goal: fallbackGoals.protein },
            carbs: { ...data.macros.carbs, goal: fallbackGoals.carbs },
            fats: { ...data.macros.fats, goal: fallbackGoals.fats },
        };
    }, [data, computedGoals]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<keyof MealSummary | null>(null);

    const dashboardRepository: DashboardRepository = useMemo(() => RepositoryFactory.getDashboardRepository(), []);

    const dateParam = useMemo(() => searchParams.get('date'), [searchParams]);
    const initializedFromSearchParamsRef = useRef(false);
    const lastRequestedDateRef = useRef<string | null>(null);
    const inFlightRequestRef = useRef<Promise<void> | null>(null);

    const fetchDashboardData = useCallback(async (date: Date) => {
        const dateString = getFormattedDate(date);

        if (lastRequestedDateRef.current === dateString && inFlightRequestRef.current) {
            return inFlightRequestRef.current;
        }

        lastRequestedDateRef.current = dateString;

        const request = (async () => {
            setIsLoading(true);

            // Get dashboard data first
            const dashboardData = await dashboardRepository.getDashboardForDate(dateString);

            // Update goals if needed using the new function
            const finalData = await goalsManagementService.updateGoalsIfNeeded(dateString, dashboardData);
            setData(finalData);

            setIsLoading(false);
        })().finally(() => {
            if (inFlightRequestRef.current === request) {
                inFlightRequestRef.current = null;
            }
        });

        inFlightRequestRef.current = request;

        return request;
    }, [dashboardRepository, goalsManagementService]);

    useEffect(() => {
        if (!dateParam) return;

        const match = /^\d{4}-\d{2}-\d{2}$/.test(dateParam);
        if (!match) return;

        const [y, m, d] = dateParam.split('-').map(Number);
        const parsed = new Date(y, (m ?? 1) - 1, d ?? 1);
        if (isNaN(parsed.getTime())) return;

        setCurrentDate(parsed);
        initializedFromSearchParamsRef.current = true;
    }, [dateParam]);

    useEffect(() => {
        if (dateParam && !initializedFromSearchParamsRef.current) return;
        fetchDashboardData(currentDate);
    }, [currentDate, fetchDashboardData, dateParam]);

    // Handle refresh event from layout
    useEffect(() => {
        const handleRefresh = () => {
            fetchDashboardData(currentDate);
        };
        window.addEventListener('refresh-dashboard', handleRefresh);
        return () => window.removeEventListener('refresh-dashboard', handleRefresh);
    }, [currentDate, fetchDashboardData]);

    const handleDateChange = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);

        // Update URL with new date
        const newDateString = getFormattedDate(newDate);
        router.push(`/dashboard?date=${newDateString}`);

        setCurrentDate(newDate);
    };

    const handleGoToToday = () => {
        const today = new Date();
        const todayString = getFormattedDate(today);

        // Update URL with today's date
        router.push(`/dashboard?date=${todayString}`);

        setCurrentDate(today);
    };

    const handleOpenModal = (mealType: keyof MealSummary) => {
        setSelectedMealType(mealType);
        setIsModalOpen(true);
    };

    const handleAddIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
        if (!selectedMealType || !data) return;
        const updatedData = await dashboardRepository.addIngredient(data.date, selectedMealType, ingredient);
        setData(updatedData);
        setIsModalOpen(false);
        setSelectedMealType(null);
    };

    const handleRemoveIngredient = async (mealType: keyof MealSummary, ingredientId: string) => {
        if (!data) return;
        const updatedData = await dashboardRepository.removeIngredient(data.date, mealType, ingredientId);
        setData(updatedData);
    };

    const handleUpdateIngredient = async (mealType: keyof MealSummary, ingredientId: string, updates: Partial<Ingredient>) => {
        if (!data) return;
        const updatedData = await dashboardRepository.updateIngredient(data.date, mealType, ingredientId, updates);
        setData(updatedData);
    };

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const isToday = useMemo(() => {
        if (!hasMounted) return true; // Match server default or typical state
        return getFormattedDate(currentDate) === getFormattedDate(new Date());
    }, [currentDate, hasMounted]);

    const displayDate = useMemo(() => {
        if (!hasMounted) return ''; // Or a placeholder that matches server

        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(currentDate);
    }, [currentDate, hasMounted]);

    if (isLoading || !data) {
        return <div className="flex justify-center items-center h-96 text-healthpal-text-secondary">{t('dashboard.loading')}</div>;
    }

    const caloriesRemaining = ((macrosWithGoals?.calories.goal ?? 0) - data.macros.calories.current);
    const isOverLimit = caloriesRemaining < 0;

    return (
        <>
            <AddIngredientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddIngredient}
                mealType={selectedMealType}
            />

            {isUserApiKeysRequired && <DashboardWarningBar />}

            <DashboardNavigation
                isToday={isToday}
                displayDate={displayDate}
                onDateChange={handleDateChange}
                onGoToToday={handleGoToToday}
                todayLabel={t('dashboard.today')}
                title={t('dashboard.title')}
            />

            {/* Main Grid */}
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shown only on mobile - progress bars instead of chart */}
                    <div className="block md:hidden">
                        {macrosWithGoals && <MobileNutrientSummary data={macrosWithGoals} />}
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.calories')}
                            unit="kcal"
                            current={data.macros.calories.current}
                            goal={macrosWithGoals?.calories.goal ?? 0}
                            color="bg-healthpal-green"
                        />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.protein')}
                            unit="g"
                            current={data.macros.protein.current}
                            goal={macrosWithGoals?.protein.goal ?? 0}
                            color="bg-healthpal-protein"
                        />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.carbs')}
                            unit="g"
                            current={data.macros.carbs.current}
                            goal={macrosWithGoals?.carbs.goal ?? 0}
                            color="bg-healthpal-carbs"
                        />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.fats')}
                            unit="g"
                            current={data.macros.fats.current}
                            goal={macrosWithGoals?.fats.goal ?? 0}
                            color="bg-healthpal-fats"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <MealSummaryCard
                            meals={data.meals}
                            onAddIngredient={handleOpenModal}
                            onRemoveIngredient={handleRemoveIngredient}
                            onUpdateIngredient={handleUpdateIngredient}
                        />
                    </div>
                </div>

                <div className="lg:col-span-1 grid grid-cols-1 gap-6 order-first lg:order-last">
                    <div className="hidden lg:flex bg-healthpal-card p-6 rounded-2xl h-full flex-col order-first lg:order-last">
                        <h3 className="text-xl font-bold mb-4">{t('dashboard.macro_split')}</h3>
                        <div className="flex-grow">
                            <MacroSplitChart data={data} />
                        </div>
                    </div>
                    <CalorieDisplayCard
                        caloriesRemaining={caloriesRemaining}
                        isOverLimit={isOverLimit}
                        t={t}
                    />
                </div>
            </main>
        </>
    );
}
