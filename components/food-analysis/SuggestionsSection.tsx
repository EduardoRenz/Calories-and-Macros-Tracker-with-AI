import React from 'react';
import { MacroSuggestion } from '@/domain/entities/analysis';
import { useTranslation } from '@/hooks/useTranslation';

interface SuggestionsSectionProps {
    macroSuggestions: MacroSuggestion[];
}

const getMacroColor = (macro: string) => {
    const lower = macro.toLowerCase();
    if (lower.includes('protein') || lower.includes('proteína')) return 'brand-protein';
    if (lower.includes('carb') || lower.includes('carboidrato')) return 'brand-carbs';
    if (lower.includes('fat') || lower.includes('gordura')) return 'brand-fats';
    if (lower.includes('fiber') || lower.includes('fibra')) return 'brand-fiber';
    return 'brand-green';
};

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
                                <span className={`font-bold ${isExceeded ? 'text-red-400' : `text-${getMacroColor(suggestion.macro)}`}`}>
                                    {suggestion.current}g / {suggestion.goal}g
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-neutral-panel rounded-full h-2 mb-4">
                                <div
                                    className={`h-2 rounded-full ${isExceeded ? 'bg-red-500' : `bg-${getMacroColor(suggestion.macro)}`}`}
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
                                                    rec.type === 'substitute' ? '🔄' : (
                                                        rec.meal.toLowerCase().includes('breakfast') ? '☕' :
                                                            rec.meal.toLowerCase().includes('lunch') || rec.meal.toLowerCase().includes('almoço') || rec.meal.toLowerCase().includes('almuerzo') ? '🍴' :
                                                                rec.meal.toLowerCase().includes('dinner') || rec.meal.toLowerCase().includes('jantar') || rec.meal.toLowerCase().includes('cena') ? '🍽️' :
                                                                    '🥜'
                                                    )}
                                            </span>
                                            <div>
                                                <p className="font-medium">{rec.food}</p>
                                                <p className="text-xs text-neutral-text-secondary">
                                                    {rec.meal}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium ${isExceeded ? 'text-neutral-text-secondary' : `text-${getMacroColor(suggestion.macro)}`}`}>
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
