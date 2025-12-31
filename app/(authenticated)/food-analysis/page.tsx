'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateDietAnalysisReport, Report } from '@/domain/usecases/generate-diet-analysis-report';
import { foodData } from '@/data/food-data';
import { Food } from '@/domain/models/food';
import { User } from '@/domain/models/user';

// Helper to generate a cache key
const getCacheKey = (start: Date, end: Date) =>
    `dietAnalysisReport_${format(start, 'yyyy-MM-dd')}_${format(end, 'yyyy-MM-dd')}`;

export default function FoodAnalysisPage() {
    const { t } = useTranslation();
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const today = useMemo(() => new Date(), []);
    const [dateRange, setDateRange] = useState<DateValueType>({
        startDate: subDays(today, 6),
        endDate: today
    });

    // Mocked User Data
    const mockUser: User = {
        name: 'Carlos',
        preferences: {
            diet: 'balanced',
            allergies: []
        },
        healthGoals: {
            weight: 'maintain',
            objectives: ['increase muscle mass']
        }
    };

    useEffect(() => {
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
            setIsLoading(false);
            return;
        }

        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        const cacheKey = getCacheKey(startDate, endDate);

        const cachedReport = localStorage.getItem(cacheKey);

        if (cachedReport) {
            setReport(JSON.parse(cachedReport));
            setIsLoading(false);
        } else {
            setIsLoading(true);
            try {
                // Assert that foodData is of type Food[]
                const typedFoodData: Food[] = foodData;
                const generatedReport = generateDietAnalysisReport(mockUser, typedFoodData, startDate, endDate);
                setReport(generatedReport);
                localStorage.setItem(cacheKey, JSON.stringify(generatedReport));
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        }
    }, [dateRange, mockUser]);

    const handleDateChange = (newValue: DateValueType) => {
        setDateRange(newValue);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-healthpal-green"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
                    <p>
                        <strong>{t('error.title')}:</strong> {error}
                    </p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-2xl font-bold">{t('food_analysis.no_report.title')}</p>
                    <p className="text-healthpal-text-secondary">{t('food_analysis.no_report.subtitle')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            {/* Header section */}
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{t('food_analysis.title')}</h1>
                    <p className="text-healthpal-text-secondary">
                        {t('food_analysis.subtitle', { name: mockUser.name })}
                    </p>
                    <p className="mt-2 text-sm text-healthpal-text-secondary italic">
                        {t('food_analysis.disclaimer')}
                    </p>
                </div>
                <div className="w-full md:w-72">
                    <Datepicker
                        value={dateRange}
                        onChange={handleDateChange}
                        locale="pt-br"
                        inputClassName="w-full p-2 rounded-lg bg-healthpal-card border-healthpal-text-secondary focus:ring-healthpal-green"
                        toggleClassName="text-healthpal-text-secondary"
                        primaryColor="emerald"
                        i18n="pt-br"
                        configs={{
                            footer: {
                                apply: t('datepicker.apply'),
                                cancel: t('datepicker.cancel')
                            },
                            shortcuts: {
                                today: t('datepicker.today'),
                                yesterday: t('datepicker.yesterday'),
                                past: (period) => `${t('datepicker.past')} ${period} ${t('datepicker.days')}`,
                                currentMonth: t('datepicker.current_month'),
                                pastMonth: t('datepicker.past_month')
                            }
                        }}
                    />
                </div>
            </header>

            {/* Main content */}
            {report && (
                <div className="space-y-8">
                    {/* General Feedback Section */}
                    <section
                        id="general-feedback-section"
                        className="bg-healthpal-card p-6 rounded-xl"
                    >
                        <h2 className="text-2xl font-bold mb-2">{t('food_analysis.feedback.title')}</h2>
                        <p className="text-healthpal-text-secondary mb-4">
                            {t('food_analysis.feedback.subtitle')}
                        </p>
                        <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: report.generalFeedback }}
                        />
                    </section>

                    {/* Diet Analysis Section */}
                    <section id="diet-analysis-section">
                        {(() => {
                            const allFoods = report.dietAnalysis.flatMap((meal) => meal.foods);

                            return (
                                <div>
                                    {allFoods.length > 0 && (
                                        <div className="bg-healthpal-card p-6 rounded-xl">
                                            <h2 className="text-2xl font-bold mb-2">
                                                {t('food_analysis.registered_foods.title')}
                                            </h2>
                                            <p className="text-healthpal-text-secondary mb-4">
                                                {t('food_analysis.registered_foods.subtitle')}
                                            </p>
                                            <div className="space-y-3">
                                                {report.dietAnalysis.flatMap((meal) => meal.foods.map((food) => (
                                                    <div
                                                        key={food.id}
                                                        className="flex flex-col md:flex-row items-start md:items-center justify-between bg-healthpal-panel p-3 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3 w-full mb-2 md:mb-0">
                                                            <span className="text-2xl">{food.emoji}</span>
                                                            <div>
                                                                <p className="font-medium">{food.name}</p>
                                                                <p className="text-xs text-healthpal-text-secondary">
                                                                    {food.meal}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="w-full text-left md:text-right">
                                                            <p className="font-medium">
                                                                {food.macros.calories} kcal
                                                            </p>
                                                            <p className="text-xs text-healthpal-text-secondary">
                                                                C:{food.macros.carbs}g P:
                                                                {food.macros.protein}g F:
                                                                {food.macros.fat}g
                                                            </p>
                                                        </div>
                                                    </div>
                                                )))}
                                            </div>
                                        </div>
                                    )}

                                    {report.missingMeals.length > 0 && (
                                        <div className="bg-healthpal-card p-6 rounded-xl mt-8">
                                            <h2 className="text-2xl font-bold mb-2">
                                                {t('food_analysis.missing_meals.title')}
                                            </h2>
                                            <p className="text-healthpal-text-secondary mb-4">
                                                {t('food_analysis.missing_meals.subtitle')}
                                            </p>

                                            <div className="space-y-4">
                                                {report.missingMeals.map((meal, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-lg"
                                                    >
                                                        <p className="font-bold">{meal.mealType}</p>
                                                        <p className="text-sm text-yellow-300/80 mb-2">
                                                            {format(new Date(meal.date), 'PPP', {
                                                                locale: ptBR
                                                            })}
                                                        </p>
                                                        {meal.recommendations.length > 0 && (
                                                            <div>
                                                                <h4 className="font-semibold text-sm">
                                                                    {t('food_analysis.missing_meals.suggestions')}
                                                                </h4>
                                                                <ul className="list-disc list-inside text-sm text-yellow-300/80">
                                                                    {meal.recommendations.map((rec, recIdx) => (
                                                                        <li key={recIdx}>
                                                                            <span>{rec}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </section>

                    {/* Two-column layout for Attention Points and Suggestions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Attention Points Section */}
                        <section id="attention-points-section">
                            <h2 className="text-2xl font-bold mb-2">{t('food_analysis.attention.title')}</h2>
                            <p className="text-healthpal-text-secondary mb-4">
                                {t('food_analysis.attention.subtitle')}
                            </p>
                            <div className="space-y-4">
                                {report.attentionPoints.map((point, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border-l-4 ${point.severity === 'alert'
                                            ? 'bg-red-500/10 border-red-500'
                                            : 'bg-yellow-500/10 border-yellow-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span>{point.severity === 'alert' ? '🔴' : '🟡'}</span>
                                            <h3 className="font-bold">{point.title}</h3>
                                        </div>
                                        <p className="text-sm text-healthpal-text-secondary">
                                            {point.description}
                                        </p>
                                    </div>
                                ))}
                                {report.attentionPoints.length === 0 && (
                                    <p className="text-healthpal-text-secondary text-center py-4">
                                        {t('food_analysis.attention.no_issues')}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Suggestions Section */}
                        <section id="suggestions-section">
                            <h2 className="text-2xl font-bold mb-2">{t('food_analysis.suggestions.title')}</h2>
                            <p className="text-healthpal-text-secondary mb-4">
                                {t('food_analysis.suggestions.subtitle')}
                            </p>
                            <div className="space-y-6">
                                {report.macroSuggestions.map((suggestion, idx) => {
                                    const isExceeded = suggestion.current > suggestion.goal;
                                    const percentage = (suggestion.current / suggestion.goal) * 100;

                                    return (
                                        <div
                                            key={idx}
                                            className={`bg-healthpal-card p-4 rounded-xl ${isExceeded ? 'border border-red-500/30' : ''}`}
                                        >
                                            {/* Macro Progress Header */}
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{suggestion.macro}</span>
                                                    {isExceeded && (
                                                        <span className="text-red-400 text-xl">🔴</span>
                                                    )}
                                                </div>
                                                <span className={`font-bold ${isExceeded ? 'text-red-400' : 'text-healthpal-green'}`}>
                                                    {suggestion.current}g / {suggestion.goal}g
                                                </span>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="w-full bg-healthpal-panel rounded-full h-2 mb-4">
                                                <div
                                                    className={`h-2 rounded-full ${isExceeded ? 'bg-red-500' : 'bg-healthpal-green'}`}
                                                    style={{
                                                        width: `${Math.min(100, percentage)}%`
                                                    }}
                                                />
                                            </div>

                                            {/* Recommendations header */}
                                            <p className="text-xs text-healthpal-text-secondary uppercase mb-2">
                                                {isExceeded
                                                    ? t('food_analysis.suggestions.adjustments_required')
                                                    : t('food_analysis.suggestions.recommended')}
                                            </p>

                                            {/* Recommendations */}
                                            <div className="space-y-2">
                                                {suggestion.recommendations.map((rec, recIdx) => (
                                                    <div
                                                        key={recIdx}
                                                        className="flex items-center justify-between bg-healthpal-panel p-3 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-lg ${rec.type === 'reduce' ? 'text-red-400' : rec.type === 'substitute' ? 'text-green-400' : ''}`}>
                                                                {rec.type === 'reduce' ? '🚫' :
                                                                    rec.type === 'substitute' ? '🔄' : (
                                                                        rec.meal.toLowerCase().includes('breakfast') ? '☕' :
                                                                            rec.meal.toLowerCase().includes('lunch') || rec.meal.toLowerCase().includes('almoço') || rec.meal.toLowerCase().includes('almuerzo') ? '🍴' :
                                                                                rec.meal.toLowerCase().includes('dinner') || rec.meal.toLowerCase().includes('jantar') || rec.meal.toLowerCase().includes('cena') ? '🍽️' :
                                                                                    '🥜'
                                                                    )}
                                                            </span>
                                                            <div>
                                                                <p className="font-medium">{rec.food}</p>
                                                                <p className="text-xs text-healthpal-text-secondary">
                                                                    {rec.meal}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-sm font-medium ${isExceeded ? 'text-healthpal-text-secondary' : 'text-healthpal-green'}`}>
                                                            {rec.benefit}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Regenerate button */}
                    <div className="text-center pt-4">
                        <button
                            onClick={() => {
                                localStorage.removeItem(getCacheKey(dateRange.start, dateRange.end));
                                setReport(null);
                            }}
                            className="text-healthpal-text-secondary hover:text-healthpal-green underline text-sm"
                        >
                            {t('food_analysis.regenerate')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
