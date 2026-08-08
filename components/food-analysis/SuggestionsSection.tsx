import React from 'react';
import { MacroSuggestion, MacroType, MealType } from '@/domain/entities/analysis';
import { useTranslation } from '@/hooks/useTranslation';

interface SuggestionsSectionProps {
    macroSuggestions: MacroSuggestion[];
}

const MACRO_COLORS: Record<MacroType, string> = {
    protein: 'brand-protein',
    carbs: 'brand-carbs',
    fats: 'brand-fats',
    fiber: 'brand-fiber',
    other: 'brand-green',
};

const MEAL_ICONS: Record<MealType, string> = {
    breakfast: '☕',
    lunch: '🍴',
    dinner: '🍽️',
    snacks: '🥜',
};

const getMacroColor = (macroType?: MacroType): string => MACRO_COLORS[macroType ?? 'other'];

const getMealIcon = (mealType?: MealType): string => MEAL_ICONS[mealType ?? 'snacks'];

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({ macroSuggestions }) => {
    const { t } = useTranslation();

    return (
        <section id="suggestions-section" className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2">{t('food_analysis.suggestions.title')}</h2>
            <p className="text-neutral-text-secondary mb-4">
                {t('food_analysis.suggestions.subtitle')}
            </p>
            <div className="space-y-6">
                {macroSuggestions.map((suggestion, idx) => {
                    const isExceeded = suggestion.current > suggestion.goal;
                    const percentage = (suggestion.current / suggestion.goal) * 100;
                    const macroColor = getMacroColor(suggestion.macroType);

                    return (
                        <div
                            key={idx}
                            className={`bg-neutral-card p-4 rounded-xl ${isExceeded ? 'border border-red-500/30' : ''}`}
                        >
                            {/* Macro Progress Header */}
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{suggestion.macro}</span>
                                    {isExceeded && (
                                        <span className="text-red-400 text-xl">🔴</span>
                                    )}
                                </div>
                                <span className={`font-bold ${isExceeded ? 'text-red-400' : `text-${macroColor}`}`}>
                                    {suggestion.current}g / {suggestion.goal}g
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-neutral-panel rounded-full h-2 mb-4">
                                <div
                                    className={`h-2 rounded-full ${isExceeded ? 'bg-red-500' : `bg-${macroColor}`}`}
                                    style={{
                                        width: `${Math.min(100, percentage)}%`
                                    }}
                                />
                            </div>

                            {/* Recommendations header */}
                            <p className="text-xs text-neutral-text-secondary uppercase mb-2">
                                {isExceeded
                                    ? t('food_analysis.suggestions.adjustments_required')
                                    : t('food_analysis.suggestions.recommended')}
                            </p>

                            {/* Recommendations */}
                            <div className="space-y-2">
                                {suggestion.recommendations.map((rec, recIdx) => (
                                    <div
                                        key={recIdx}
                                        className="flex items-center justify-between bg-neutral-panel p-3 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`text-lg ${rec.type === 'reduce' ? 'text-red-400' : rec.type === 'substitute' ? 'text-green-400' : ''}`}>
                                                {rec.type === 'reduce' ? '🚫' :
                                                    rec.type === 'substitute' ? '🔄' :
                                                        getMealIcon(rec.mealType)}
                                            </span>
                                            <div>
                                                <p className="font-medium">{rec.food}</p>
                                                <p className="text-xs text-neutral-text-secondary">
                                                    {rec.meal}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium ${isExceeded ? 'text-neutral-text-secondary' : `text-${macroColor}`}`}>
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
    );
};
