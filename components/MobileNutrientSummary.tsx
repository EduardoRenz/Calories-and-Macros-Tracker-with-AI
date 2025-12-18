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

    const NutrientItem = ({ label, current, goal, unit, color, percentage }: { label: string, current: number, goal: number, unit: string, color: string, percentage: number }) => (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline text-xs">
                <span className="text-healthpal-text-secondary">{label}</span>
                <span className="text-healthpal-text-primary font-medium">
                    {current}/{goal}<span className="text-[10px] text-healthpal-text-secondary ml-0.5">{unit}</span>
                </span>
            </div>
            <div className="w-full bg-healthpal-panel h-1.5 rounded-full">
                <div
                    className={`${color} h-1.5 rounded-full`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="bg-healthpal-card p-4 rounded-xl shadow-sm border border-healthpal-border/50">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <NutrientItem
                    label={t('dashboard.calories')}
                    current={data.calories.current}
                    goal={data.calories.goal}
                    unit="kcal"
                    color="bg-healthpal-green"
                    percentage={getPercentage(data.calories.current, data.calories.goal)}
                />
                <NutrientItem
                    label={t('dashboard.protein')}
                    current={data.protein.current}
                    goal={data.protein.goal}
                    unit="g"
                    color="bg-healthpal-protein"
                    percentage={getPercentage(data.protein.current, data.protein.goal)}
                />
                <NutrientItem
                    label={t('dashboard.carbs')}
                    current={data.carbs.current}
                    goal={data.carbs.goal}
                    unit="g"
                    color="bg-healthpal-carbs"
                    percentage={getPercentage(data.carbs.current, data.carbs.goal)}
                />
                <NutrientItem
                    label={t('dashboard.fats')}
                    current={data.fats.current}
                    goal={data.fats.goal}
                    unit="g"
                    color="bg-healthpal-fats"
                    percentage={getPercentage(data.fats.current, data.fats.goal)}
                />
            </div>
        </div>
    );
};

export default MobileNutrientSummary;
