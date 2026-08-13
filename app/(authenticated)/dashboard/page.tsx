
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
import FirstTimeSetup from '@/components/profile/FirstTimeSetup';
import { RepositoryFactory } from '@/data/RepositoryFactory';
import { TelemetryFactory } from '@/data/TelemetryFactory';
import { useProfile } from '@/contexts/ProfileContext';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { useToast } from '@/contexts/ToastContext';
import { CalorieCalculationService } from '@/domain/services/CalorieCalculationService';
import { isProfileComplete, UserProfile } from '@/domain/entities/profile';
import { getSupabaseClient } from '@/data/supabaseClient';

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

    const { profile, goalsManagementService, updateProfile, loading: profileLoading } = useProfile();
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
    const { showError } = useToast();

    const dashboardRepository: DashboardRepository = useMemo(() => RepositoryFactory.getDashboardRepository(), []);

    const dateParam = useMemo(() => searchParams.get('date'), [searchParams]);
    const paymentSuccessParam = useMemo(() => searchParams.get('payment_success'), [searchParams]);
    const stripeCheckoutSessionIdParam = useMemo(() => searchParams.get('stripe_checkout_session_id'), [searchParams]);
    const initializedFromSearchParamsRef = useRef(false);
    const lastRequestedDateRef = useRef<string | null>(null);
    const inFlightRequestRef = useRef<Promise<void> | null>(null);
    const checkoutFeedbackHandledRef = useRef(false);

    const clearCheckoutFeedbackParams = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('payment_success');
        params.delete('stripe_checkout_session_id');

        const query = params.toString();
        router.replace(query ? `/dashboard?${query}` : '/dashboard');
    }, [router, searchParams]);

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

    useEffect(() => {
        if (checkoutFeedbackHandledRef.current) return;
        if (paymentSuccessParam !== 'true') return;

        checkoutFeedbackHandledRef.current = true;

        const verifyCheckout = async () => {
            let shouldClearParams = true;
            try {
                if (!stripeCheckoutSessionIdParam) {
                    shouldClearParams = false;
                    router.replace('/checkout/error?reason=verification_unavailable');
                    return;
                }

                const { data: { session } } = await getSupabaseClient().auth.getSession();
                const token = session?.access_token;
                const endpoint = `/api/billing/checkout-status?stripeCheckoutSessionId=${encodeURIComponent(stripeCheckoutSessionIdParam)}`;
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                });

                if (response.status === 404) {
                    shouldClearParams = false;
                    router.replace('/checkout/error?reason=verification_unavailable');
                    return;
                }

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const result = await response.json() as { paymentState?: string; planCode?: string | null };

                if (result.paymentState === 'CONFIRMED') return;

                if (result.paymentState === 'FAILED') {
                    shouldClearParams = false;
                    const nextUrl = result.planCode
                        ? `/checkout/error?reason=failed&planId=${encodeURIComponent(result.planCode)}`
                        : '/checkout/error?reason=failed';
                    router.replace(nextUrl);
                    return;
                }

                shouldClearParams = false;
                router.replace('/checkout/error?reason=verification_unavailable');
            } catch (error) {
                console.error('Failed to verify checkout status after Stripe redirect', error);
                shouldClearParams = false;
                router.replace('/checkout/error?reason=verification_unavailable');
            } finally {
                if (shouldClearParams) {
                    clearCheckoutFeedbackParams();
                }
            }
        };

        verifyCheckout();
    }, [
        clearCheckoutFeedbackParams,
        paymentSuccessParam,
        router,
        showError,
        stripeCheckoutSessionIdParam,
    ]);

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
        try {
            const updatedData = await dashboardRepository.removeIngredient(data.date, mealType, ingredientId);
            setData(updatedData);
        } catch (error) {
            showError(t('meals.remove_error'));
            TelemetryFactory.getTelemetryService().captureError(error, {
                action: 'remove_ingredient',
                category: 'data',
            });
        }
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

    // Show first-time setup if profile is not complete or goals cannot be calculated
    const profileComplete = useMemo(() => isProfileComplete(profile), [profile]);
    const canCalculateGoals = computedGoals !== null;

    const handleFirstTimeSave = async (updatedProfile: UserProfile) => {
        await updateProfile(updatedProfile);
    };

    // Show loading state while profile is loading
    if (profileLoading) {
        return <div className="flex justify-center items-center h-96 text-neutral-text-secondary">{t('dashboard.loading')}</div>;
    }

    // Show first-time setup for incomplete profiles or when goals cannot be calculated
    if ((!profileComplete || !canCalculateGoals) && profile) {
        return (
            <div className="py-8">
                <FirstTimeSetup
                    profile={profile}
                    onSave={handleFirstTimeSave}
                />
            </div>
        );
    }

    if (isLoading || !data) {
        return <div className="flex justify-center items-center h-96 text-neutral-text-secondary">{t('dashboard.loading')}</div>;
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
            />

            {/* Main Grid */}
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shown only on mobile - progress bars instead of chart */}
                    <h3 className="text-sm font-bold text-neutral-text-secondary uppercase mb-3 block md:hidden">
                        {t('dashboard.macro_split')}
                    </h3>
                    <div className="block md:hidden">
                        {macrosWithGoals && <MobileNutrientSummary data={macrosWithGoals} />}
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.calories')}
                            unit="kcal"
                            current={data.macros.calories.current}
                            goal={macrosWithGoals?.calories.goal ?? 0}
                            color="bg-brand-green"
                        />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.protein')}
                            unit="g"
                            current={data.macros.protein.current}
                            goal={macrosWithGoals?.protein.goal ?? 0}
                            color="bg-brand-protein"
                        />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.carbs')}
                            unit="g"
                            current={data.macros.carbs.current}
                            goal={macrosWithGoals?.carbs.goal ?? 0}
                            color="bg-brand-carbs"
                        />
                    </div>
                    <div className="hidden md:block">
                        <MacroProgressCard
                            title={t('dashboard.fats')}
                            unit="g"
                            current={data.macros.fats.current}
                            goal={macrosWithGoals?.fats.goal ?? 0}
                            color="bg-brand-fats"
                        />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-text-secondary uppercase mb-3 md:col-span-2">
                        {isToday ? t('dashboard.today_meals') : displayDate}
                    </h3>
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
                    <div className="hidden lg:flex bg-neutral-card p-6 rounded-2xl h-full flex-col order-first lg:order-last">
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
