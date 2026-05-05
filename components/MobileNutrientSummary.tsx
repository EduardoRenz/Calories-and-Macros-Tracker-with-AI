import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface MacroData {
    current: number;
    goal: number;
}

interface MobileNutrientSummaryProps {
    data: {
        calories: MacroData;
        protein: MacroData;
        carbs: MacroData;
        fats: MacroData;
    };
}

const MobileNutrientSummary: React.FC<MobileNutrientSummaryProps> = ({ data }) => {
    const { t } = useTranslation();

    const getPercentage = (current: number, goal: number) => {
        return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num);
    };

    const macros = [
        {
            label: t('dashboard.protein'),
            current: data.protein.current,
            goal: data.protein.goal,
            unit: 'g',
            colorVar: '--brand-protein',
        },
        {
            label: t('dashboard.carbs'),
            current: data.carbs.current,
            goal: data.carbs.goal,
            unit: 'g',
            colorVar: '--brand-carbs',
        },
        {
            label: t('dashboard.fats'),
            current: data.fats.current,
            goal: data.fats.goal,
            unit: 'g',
            colorVar: '--brand-fats',
        },
    ];

    return (
        <div className="flex flex-col gap-3">
            {macros.map((macro) => {
                const percentage = getPercentage(macro.current, macro.goal);
                return (
                    <div
                        key={macro.label}
                        className="bg-neutral-card p-4 rounded-2xl shadow-sm"
                    >
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-neutral-text-primary font-bold text-base">
                                {macro.label}
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-neutral-text-primary leading-none">
                                    {formatNumber(macro.current)}
                                </span>
                                <span className="text-neutral-text-secondary text-sm">
                                    / {formatNumber(macro.goal)} {macro.unit}
                                </span>
                            </div>
                        </div>
                        <div className="relative w-full h-2.5 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{ backgroundColor: `var(${macro.colorVar})`, opacity: 0.15 }}
                            />
                            <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${percentage}%`, backgroundColor: `var(${macro.colorVar})` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MobileNutrientSummary;

