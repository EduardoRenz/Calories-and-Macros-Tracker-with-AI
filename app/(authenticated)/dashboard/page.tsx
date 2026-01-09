
'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import MacroProgressCard from '@/components/MacroProgressCard';
import MobileNutrientSummary from '@/components/MobileNutrientSummary';
import MealSummaryCard from '@/components/MealSummaryCard';
import MacroSplitChart from '@/components/MacroSplitChart';
import CalorieDisplayCard from '@/components/CalorieDisplayCard';
import { useTranslation } from '@/hooks/useTranslation';
import { DashboardData, Ingredient, MealSummary } from '@/domain/entities/dashboard';
import { DashboardRepository } from '@/domain/repositories/DashboardRepository';
import AddIngredientModal from '@/components/AddIngredientModal';
import { RepositoryFactory } from '@/data/RepositoryFactory';

const getFormattedDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            console.log('Calling fetchDashboardData for date: ', dateString);
            const dashboardData = await dashboardRepository.getDashboardForDate(dateString);
            setData(dashboardData);
            setIsLoading(false);
        })().finally(() => {
            if (inFlightRequestRef.current === request) {
                inFlightRequestRef.current = null;
            }
        });

        inFlightRequestRef.current = request;

        return request;
    }, [dashboardRepository]);

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
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };

    const handleGoToToday = () => {
        setCurrentDate(new Date());
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

    const isToday = getFormattedDate(currentDate) === getFormattedDate(new Date());
    const displayDate = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(currentDate);

    if (isLoading || !data) {
        return <div className="flex justify-center items-center h-96 text-healthpal-text-secondary">{t('dashboard.loading')}</div>;
    }

    const caloriesRemaining = data.macros.calories.goal - data.macros.calories.current;
    const isOverLimit = caloriesRemaining < 0;

    return (
        <>
            <AddIngredientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddIngredient}
                mealType={selectedMealType}
            />
            {/* Dashboard Header */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center my-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold">{t('dashboard.title')}</h2>
                    <p className="text-healthpal-text-secondary mt-1">{displayDate}</p>
                </div>
                <div className="flex items-center gap-2">
                    {!isToday && (
                        <button onClick={handleGoToToday} className="bg-healthpal-card text-healthpal-text-primary font-bold py-2 px-4 rounded-lg hover:bg-healthpal-border transition-all">
                            {t('dashboard.today')}
                        </button>
                    )}
                    <button onClick={() => handleDateChange(-1)} className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors">
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDateChange(1)} className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors">
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </section>

            {/* Main Grid */}
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shown only on mobile - progress bars instead of chart */}
                    <div className="block md:hidden">
                        <MobileNutrientSummary data={data.macros} />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.calories')}
                            unit="kcal"
                            current={data.macros.calories.current}
                            goal={data.macros.calories.goal}
                            color="bg-healthpal-green"
                        />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.protein')}
                            unit="g"
                            current={data.macros.protein.current}
                            goal={data.macros.protein.goal}
                            color="bg-healthpal-protein"
                        />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.carbs')}
                            unit="g"
                            current={data.macros.carbs.current}
                            goal={data.macros.carbs.goal}
                            color="bg-healthpal-carbs"
                        />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.fats')}
                            unit="g"
                            current={data.macros.fats.current}
                            goal={data.macros.fats.goal}
                            color="bg-healthpal-fats"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <MealSummaryCard
                            meals={data.meals}
                            onAddIngredient={handleOpenModal}
                            onRemoveIngredient={handleRemoveIngredient}
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
