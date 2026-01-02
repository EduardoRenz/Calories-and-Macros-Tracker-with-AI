import React from 'react';
import { Meal } from '@/domain/entities/dashboard';
import { useTranslation } from '@/hooks/useTranslation';

interface MealTotalsRowProps {
    meal: Meal;
}

export const MealTotalsRow: React.FC<MealTotalsRowProps> = ({ meal }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-healthpal-panel/50 p-2 rounded-md flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-4 md:items-center">
            <div className="md:col-span-4">
                <div className="text-healthpal-text-primary font-bold leading-snug">
                    {t('meals.total_macros')}
                </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:contents">
                <div className="whitespace-nowrap md:col-span-2 md:text-center">
                    <span className="md:hidden">T: </span>
                    <span className="md:text-healthpal-text-secondary font-bold">{meal.ingredients.length}</span>
                </div>

                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-carbs">C: </span>
                    <span className="font-bold text-healthpal-carbs">{meal.carbs}g</span>
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-protein">P: </span>
                    <span className="font-bold text-healthpal-protein">{meal.protein}g</span>
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-fats">G: </span>
                    <span className="font-bold text-healthpal-fats">{meal.fats}g</span>
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-fiber">
                    <span className="md:hidden">F: </span>
                    <span className="font-bold text-healthpal-fiber">{meal.fiber}g</span>
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-green">Kcal: </span>
                    <span className="font-bold text-healthpal-green">{meal.calories}</span>
                </div>
            </div>
        </div>
    );
};
