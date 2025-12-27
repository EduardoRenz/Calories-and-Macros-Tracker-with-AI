import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { FoodAnalysisReport, CachedFoodAnalysisReport, VitaminStatus } from '../domain/entities/analysis';
import { FoodAnalysisRepository } from '../domain/repositories/FoodAnalysisRepository';
import { ProfileRepository } from '../domain/repositories/ProfileRepository';
import { FoodAnalysisService } from '../domain/services/FoodAnalysisService';
import { RepositoryFactory } from '../data/RepositoryFactory';
import { ServiceFactory } from '../data/ServiceFactory';
import { useLanguage } from '../contexts/LanguageContext';

// Cache TTL: 24 hours in milliseconds
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Date range options
type DateRangeOption = 'last7days' | 'thisMonth' | 'last3months' | 'custom';

const getDateRange = (option: DateRangeOption): { start: string; end: string } => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start: Date;

    switch (option) {
        case 'last7days':
            start = new Date(today);
            start.setDate(start.getDate() - 7);
            break;
        case 'thisMonth':
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'last3months':
            start = new Date(today);
            start.setMonth(start.getMonth() - 3);
            break;
        default:
            start = new Date(today);
            start.setDate(start.getDate() - 7);
    }

    return { start: start.toISOString().split('T')[0], end };
};

const getCacheKey = (startDate: string, endDate: string) => `food_analysis_${startDate}_${endDate}`;

// Vitamin status emoji component
const VitaminStatusBadge: React.FC<{ status: VitaminStatus }> = ({ status }) => {
    const colors = {
        good: { bg: 'bg-green-500/20', text: 'text-green-400', emoji: '🟢' },
        low: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', emoji: '🟡' },
        deficient: { bg: 'bg-red-500/20', text: 'text-red-400', emoji: '🔴' }
    };
    const style = colors[status];
    return (
        <span className="text-2xl">{style.emoji}</span>
    );
};

// Meal icon component
const MealIcon: React.FC<{ meal: string }> = ({ meal }) => {
    const icons: { [key: string]: string } = {
        breakfast: '☕',
        lunch: '🍴',
        dinner: '🍽️',
        snacks: '🥜'
    };
    return <span className="text-3xl">{icons[meal.toLowerCase()] || '🍽️'}</span>;
};

const FoodAnalysisPage: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>('last7days');
    const [report, setReport] = useState<FoodAnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const foodAnalysisRepository: FoodAnalysisRepository = useMemo(
        () => RepositoryFactory.getFoodAnalysisRepository(), []
    );
    const profileRepository: ProfileRepository = useMemo(
        () => RepositoryFactory.getProfileRepository(), []
    );
    const foodAnalysisService: FoodAnalysisService = useMemo(
        () => ServiceFactory.getFoodAnalysisService(), []
    );

    const dateRange = useMemo(() => getDateRange(dateRangeOption), [dateRangeOption]);

    // Check cache on mount and date range change
    useEffect(() => {
        const cacheKey = getCacheKey(dateRange.start, dateRange.end);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed: CachedFoodAnalysisReport = JSON.parse(cached);
                if (Date.now() - parsed.cachedAt < CACHE_TTL) {
                    setReport(parsed.report);
                    setError(null);
                } else {
                    localStorage.removeItem(cacheKey);
                }
            } catch {
                localStorage.removeItem(cacheKey);
            }
        } else {
            setReport(null);
        }
    }, [dateRange]);

    const generateReport = useCallback(async () => {
        setIsLoading(true);
        setProgress(0);
        setError(null);

        try {
            // Step 1: Fetch dashboard data
            setProgress(20);
            const dashboardData = await foodAnalysisRepository.getDashboardDataForRange(
                dateRange.start,
                dateRange.end
            );

            // Step 2: Fetch user profile
            setProgress(40);
            const profile = await profileRepository.getProfile();

            // Step 3: Generate analysis with AI
            setProgress(60);
            const analysisReport = await foodAnalysisService.generateAnalysis({
                dashboardData,
                profile,
                language
            });

            // Step 4: Cache the result
            setProgress(90);
            const cacheKey = getCacheKey(dateRange.start, dateRange.end);
            const cachedData: CachedFoodAnalysisReport = {
                report: analysisReport,
                cachedAt: Date.now(),
                dateRange
            };
            localStorage.setItem(cacheKey, JSON.stringify(cachedData));

            setProgress(100);
            setReport(analysisReport);
            setRetryCount(0);
        } catch (err) {
            console.error('Error generating food analysis:', err);
            setError(t('food_analysis.error_generating'));

            // Retry logic with exponential backoff
            if (retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000;
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    generateReport();
                }, delay);
            }
        } finally {
            setIsLoading(false);
        }
    }, [
        dateRange,
        foodAnalysisRepository,
        profileRepository,
        foodAnalysisService,
        language,
        retryCount,
        t
    ]);

    const dateRangeOptions: { value: DateRangeOption; label: string }[] = [
        { value: 'last7days', label: t('food_analysis.last_7_days') },
        { value: 'thisMonth', label: t('food_analysis.this_month') },
        { value: 'last3months', label: t('food_analysis.last_3_months') }
    ];

    return (
        <div className="text-healthpal-text-primary pb-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/profile')}
                    className="text-healthpal-text-secondary hover:text-healthpal-green mb-4 flex items-center gap-2"
                >
                    ← {t('food_analysis.back_to_profile')}
                </button>
                <h1 className="text-3xl font-bold text-healthpal-green mb-2">
                    {t('food_analysis.title')}
                </h1>
                <p className="text-healthpal-text-secondary">
                    {t('food_analysis.subtitle')}
                </p>
            </div>

            {/* Date Range Selector */}
            <div className="flex flex-wrap gap-2 mb-8">
                {dateRangeOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setDateRangeOption(option.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${dateRangeOption === option.value
                            ? 'bg-healthpal-green text-black'
                            : 'bg-healthpal-card text-healthpal-text-secondary hover:bg-healthpal-border'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Generate Report Button or Loading State */}
            {!report && !isLoading && (
                <div className="bg-healthpal-card p-8 rounded-2xl text-center mb-8">
                    <p className="text-healthpal-text-secondary mb-4">
                        {t('food_analysis.generate_prompt')}
                    </p>
                    <button
                        onClick={generateReport}
                        className="bg-healthpal-green text-black font-bold py-3 px-8 rounded-lg hover:brightness-110 transition-all"
                        id="generate-report-btn"
                    >
                        {t('food_analysis.generate_button')}
                    </button>
                </div>
            )}

            {/* Progress Bar */}
            {isLoading && (
                <div className="bg-healthpal-card p-8 rounded-2xl mb-8" id="progress-container">
                    <p className="text-healthpal-text-secondary mb-4 text-center">
                        {t('food_analysis.generating')}
                    </p>
                    <div className="w-full bg-healthpal-panel rounded-full h-3">
                        <div
                            className="bg-healthpal-green h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                            id="progress-bar"
                        />
                    </div>
                    <p className="text-center text-sm text-healthpal-text-secondary mt-2">
                        {progress}%
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-8 text-red-400">
                    <p>{error}</p>
                    {retryCount < 3 && (
                        <button
                            onClick={generateReport}
                            className="mt-2 text-sm underline hover:no-underline"
                        >
                            {t('food_analysis.retry')}
                        </button>
                    )}
                </div>
            )}

            {/* Report Content */}
            {report && !isLoading && (
                <div className="space-y-8">
                    {/* Common Foods Section */}
                    <section id="common-foods-section">
                        <h2 className="text-2xl font-bold mb-2">{t('food_analysis.common_foods.title')}</h2>
                        <p className="text-healthpal-text-secondary mb-4">
                            {t('food_analysis.common_foods.subtitle')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map(meal => {
                                const mealData = report.commonFoods[meal];
                                return (
                                    <div
                                        key={meal}
                                        className="bg-healthpal-card p-6 rounded-2xl"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <MealIcon meal={meal} />
                                            <h3 className="font-bold text-lg capitalize">
                                                {t(`meals.${meal}`)}
                                            </h3>
                                        </div>
                                        <p className="text-healthpal-text-secondary text-sm mb-2">
                                            {mealData.foods.join(', ')}
                                        </p>
                                        <p className="text-xs text-healthpal-text-secondary">
                                            {mealData.consistency}% {t('food_analysis.common_foods.consistency')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Vitamins Overview Section */}
                    <section id="vitamins-section">
                        <h2 className="text-2xl font-bold mb-2">{t('food_analysis.vitamins.title')}</h2>
                        <p className="text-healthpal-text-secondary mb-4">
                            {t('food_analysis.vitamins.subtitle')}
                        </p>

                        {/* Group vitamins by status */}
                        {(() => {
                            const sufficientVitamins = report.vitamins.filter(v => v.status === 'good' || v.status === 'low');
                            const deficientVitamins = report.vitamins.filter(v => v.status === 'deficient');

                            return (
                                <div className="space-y-6">
                                    {/* Sufficient & Moderate Group */}
                                    {sufficientVitamins.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-healthpal-text-secondary uppercase mb-3">
                                                {t('food_analysis.vitamins.sufficient_moderate')}
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                {sufficientVitamins.map((vitamin, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-healthpal-card p-4 rounded-2xl text-center"
                                                    >
                                                        <span className="text-3xl">{vitamin.emoji || '💊'}</span>
                                                        <p className="font-bold mt-2">{vitamin.name}</p>
                                                        <div className="flex items-center justify-center gap-1 mt-1">
                                                            <span className={`w-2 h-2 rounded-full ${vitamin.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
                                                                }`}></span>
                                                            <span className={`text-xs uppercase ${vitamin.status === 'good' ? 'text-green-400' : 'text-yellow-400'
                                                                }`}>
                                                                {t(`food_analysis.vitamins.status.${vitamin.status}`)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Deficient - Needs Action Group */}
                                    {deficientVitamins.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-red-400 uppercase mb-3">
                                                {t('food_analysis.vitamins.deficient_action')}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {deficientVitamins.map((vitamin, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-healthpal-card p-5 rounded-2xl border border-red-500/30"
                                                    >
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <span className="text-3xl">{vitamin.emoji || '💊'}</span>
                                                            <div>
                                                                <p className="font-bold">{vitamin.name}</p>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                                    <span className="text-xs text-red-400 uppercase">
                                                                        {t('food_analysis.vitamins.status.deficient')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {vitamin.recommendations && vitamin.recommendations.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-healthpal-border">
                                                                <p className="text-xs text-healthpal-text-secondary uppercase mb-2">
                                                                    {t('food_analysis.vitamins.recommendations')}:
                                                                </p>
                                                                <ul className="space-y-1">
                                                                    {vitamin.recommendations.map((rec, recIdx) => (
                                                                        <li key={recIdx} className="flex items-start gap-2 text-sm text-healthpal-text-secondary">
                                                                            <span className="text-green-400">✓</span>
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
};

export default FoodAnalysisPage;
