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

    const NutrientItem = ({ label, current, goal, unit, color, percentage }: { label: string, current: number, goal: number, unit: string, color: string, percentage: number }) => (
        <div className="flex flex-col gap-2 py-3">
            <div className="flex justify-between items-end">
                <span className="text-neutral-text-secondary font-medium text-lg">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-neutral-text-primary leading-none">
                        {formatNumber(current)}
                    </span>
                    <span className="text-neutral-text-secondary text-sm">
                        / {formatNumber(goal)} {unit}
                    </span>
                </div>
            </div>
            <div className="w-full bg-neutral-panel h-2 rounded-full overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="bg-neutral-card p-6 rounded-2xl shadow-lg border-neutral-border/30">
            <div className="flex flex-col divide-y divide-neutral-border/10">
                <NutrientItem
                    label={t('dashboard.calories')}
                    current={data.calories.current}
                    goal={data.calories.goal}
                    unit="kcal"
                    color="bg-brand-green"
                    percentage={getPercentage(data.calories.current, data.calories.goal)}
                />
                <NutrientItem
                    label={t('dashboard.protein')}
                    current={data.protein.current}
                    goal={data.protein.goal}
                    unit="g"
                    color="bg-brand-protein"
                    percentage={getPercentage(data.protein.current, data.protein.goal)}
                />
                <NutrientItem
                    label={t('dashboard.carbs')}
                    current={data.carbs.current}
                    goal={data.carbs.goal}
                    unit="g"
                    color="bg-brand-carbs"
                    percentage={getPercentage(data.carbs.current, data.carbs.goal)}
                />
                <NutrientItem
                    label={t('dashboard.fats')}
                    current={data.fats.current}
                    goal={data.fats.goal}
                    unit="g"
                    color="bg-brand-fats"
                    percentage={getPercentage(data.fats.current, data.fats.goal)}
                />
            </div>
        </div>
    );
};

export default MobileNutrientSummary;

