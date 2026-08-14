'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { FoodAnalysisReport, CachedFoodAnalysisReport } from '@/domain/entities/analysis';
import { FoodAnalysisRepository } from '@/domain/repositories/FoodAnalysisRepository';
import { ProfileRepository } from '@/domain/repositories/ProfileRepository';
import { RepositoryFactory } from '@/data/RepositoryFactory';
import { ServiceFactory } from '@/data/ServiceFactory';
import { TelemetryFactory } from '@/data/TelemetryFactory';
import { useLanguage } from '@/contexts/LanguageContext';
import { AiAccessException, AiDisabledException, PremiumOnlyException, ApiKeysRequiredException } from '@/domain/exceptions/AiAccessException';
import MarkdownRenderer from '@/components/assistant/MarkdownRenderer';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { ReportTabs } from '@/components/ReportTabs';
import { CommonFoodsSection } from '@/components/food-analysis/CommonFoodsSection';
import { VitaminsSection } from '@/components/food-analysis/VitaminsSection';
import { AttentionPointsSection } from '@/components/food-analysis/AttentionPointsSection';
import { SuggestionsSection } from '@/components/food-analysis/SuggestionsSection';


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

export default function FoodAnalysisPage() {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const router = useRouter();

    const { isAiFeatureVisible } = useFeatureFlags();
    const isVisible = isAiFeatureVisible('food_analysis');

    const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>('last7days');
    const [report, setReport] = useState<FoodAnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [activeTab, setActiveTab] = useState<string>('common-foods');

    const foodAnalysisRepository: FoodAnalysisRepository = useMemo(
        () => RepositoryFactory.getFoodAnalysisRepository(), []
    );
    const profileRepository: ProfileRepository = useMemo(
        () => RepositoryFactory.getProfileRepository(), []
    );
    const dateRange = useMemo(() => getDateRange(dateRangeOption), [dateRangeOption]);

    const tabs = useMemo(() => [
        { id: 'common-foods', label: t('food_analysis.common_foods.title') },
        { id: 'vitamins', label: t('food_analysis.vitamins.title') },
        { id: 'attention-points', label: t('food_analysis.attention.title') },
        { id: 'suggestions', label: t('food_analysis.suggestions.title') }
    ] as const, [t]);

    // Check cache on mount and date range change
    useEffect(() => {
        const cacheKey = getCacheKey(dateRange.start, dateRange.end);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed: CachedFoodAnalysisReport = JSON.parse(cached);
                if (Date.now() - parsed.cachedAt < CACHE_TTL) {
                    setReport(parsed.report);
                    setActiveTab('common-foods');
                    setError(null);
                } else {
                    localStorage.removeItem(cacheKey);
                }
            } catch {
                localStorage.removeItem(cacheKey);
            }
        } else {
            setReport(null);
            setActiveTab('common-foods');
        }
    }, [dateRange]);

    const generateReport = useCallback(async () => {
        setIsLoading(true);
        setProgress(0);
        setError(null);
        try {
            const aiAccessService = ServiceFactory.getAiAccessService();
            await aiAccessService.checkAccess('food_analysis');

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
            const foodAnalysisService = await ServiceFactory.getFoodAnalysisService();
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
            setActiveTab('common-foods');
            setRetryCount(0);
        } catch (err) {
            console.error('Error generating food analysis:', err);
            const telemetry = TelemetryFactory.getTelemetryService();
            // Only expected subscription outcomes are access events; everything else
            // (including local failures like an invalid custom key) must reach error
            // tracking so issues that never hit the server are still observable.
            const isAccessOutcome = err instanceof AiAccessException;

            if (isAccessOutcome) {
                // Expected business outcome (premium/disabled/api keys) - measure frequency only
                telemetry.trackEvent({
                    name: 'user_error',
                    params: { error_action: 'food_analysis', error_category: 'ai_access' },
                });
            } else {
                telemetry.captureError(err, { action: 'food_analysis', category: 'ai_analysis' });
            }

            if (err instanceof AiAccessException) {
                if (err instanceof AiDisabledException) {
                    setError(t('ai_errors.disabled'));
                } else if (err instanceof PremiumOnlyException) {
                    setError(t('ai_errors.premium_required'));
                } else if (err instanceof ApiKeysRequiredException) {
                    setError(t('ai_errors.api_keys_required'));
                } else {
                    setError(t('food_analysis.error_generating'));
                }
                return;
            }

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
        <div className="text-neutral-text-primary pb-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.push('/profile')}
                    className="text-neutral-text-secondary hover:text-brand-green mb-4 flex items-center gap-2"
                >
                    ← {t('food_analysis.back_to_profile')}
                </button>
                <h1 className="text-3xl font-bold text-brand-green mb-2">
                    {t('food_analysis.title')}
                </h1>
                <p className="text-neutral-text-secondary">
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
                            ? 'bg-secondary text-on-secondary'
                            : 'bg-neutral-card text-neutral-text-secondary hover:bg-neutral-border'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Generate Report Button or Loading State */}
            {!report && !isLoading && (
                <div className="bg-neutral-card p-8 rounded-2xl text-center mb-8">
                    <p className="text-neutral-text-secondary mb-4">
                        {t('food_analysis.generate_prompt')}
                    </p>
                    {isVisible ? (
                        <button
                            onClick={generateReport}
                            className="bg-secondary text-on-secondary font-bold py-3 px-8 rounded-lg hover:brightness-110 shadow-lg shadow-brand-green/20 transition-all"
                            id="generate-report-btn"
                        >
                            {t('food_analysis.generate_button')}
                        </button>
                    ) : (
                        <div className="bg-neutral-panel p-4 rounded-xl text-neutral-text-secondary border border-neutral-border">
                            {t('ai_errors.disabled')}
                        </div>
                    )}
                    {/* API keys warning removed from here as it will be shown as an error message after click */}
                </div>
            )}

            {/* Progress Bar */}
            {isLoading && (
                <div className="bg-neutral-card p-8 rounded-2xl mb-8" id="progress-container">
                    <p className="text-neutral-text-secondary mb-4 text-center">
                        {t('food_analysis.generating')}
                    </p>
                    <div className="w-full bg-neutral-panel rounded-full h-3">
                        <div
                            className="bg-brand-green h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                            id="progress-bar"
                        />
                    </div>
                    <p className="text-center text-sm text-neutral-text-secondary mt-2">
                        {progress}%
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-8 text-red-400">
                    <MarkdownRenderer content={error} />
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
                <div className="space-y-8 animate-fadeIn">
                    {/* Report Section Header */}
                    <div className="mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-text-secondary mb-1">
                            {t('food_analysis.report_label').replace('{period}', dateRangeOptions.find(o => o.value === dateRangeOption)?.label ?? '')}
                        </p>
                        <h2 className="text-2xl font-body font-bold text-neutral-text-primary">
                            {t('food_analysis.detailed_view')}
                        </h2>
                    </div>

                    {/* Tab Navigation */}
                    <ReportTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {/* Active Section Content */}
                    <div className="transition-all duration-200">
                        {activeTab === 'common-foods' && (
                            <CommonFoodsSection commonFoods={report.commonFoods} />
                        )}

                        {activeTab === 'vitamins' && (
                            <VitaminsSection vitamins={report.vitamins} />
                        )}

                        {activeTab === 'attention-points' && (
                            <AttentionPointsSection attentionPoints={report.attentionPoints} />
                        )}

                        {activeTab === 'suggestions' && (
                            <SuggestionsSection macroSuggestions={report.macroSuggestions} />
                        )}
                    </div>

                    {/* Regenerate button */}
                    <div className="text-center pt-4 border-t border-neutral-border">
                        <button
                            onClick={() => {
                                localStorage.removeItem(getCacheKey(dateRange.start, dateRange.end));
                                setReport(null);
                                setActiveTab('common-foods');
                            }}
                            className="text-neutral-text-secondary hover:text-brand-green underline text-sm"
                        >
                            {t('food_analysis.regenerate')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
