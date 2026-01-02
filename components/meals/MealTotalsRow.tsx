import React from 'react';
import { Meal } from '@/domain/entities/dashboard';
import { useTranslation } from '@/hooks/useTranslation';

interface MealTotalsRowProps {
    meal: Meal;
}

export const MealTotalsRow: React.FC<MealTotalsRowProps> = ({ meal }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-12 gap-4 items-center px-2 text-sm">
            <div className="col-span-5 font-bold">{t('meals.total_macros')}</div>
            <div className="col-span-7 flex justify-around text-sm md:contents">
                <div className="font-bold ">
                    <span className="md:hidden">T: </span>{meal.ingredients.length} <span className="md:hidden">T</span>
                </div>
                <div className="font-bold text-healthpal-carbs">
                    <span className="md:hidden">C: </span>{meal.carbs}g <span className="md:hidden">C</span>
                </div>
                <div className="font-bold text-healthpal-protein">
                    <span className="md:hidden">P: </span>{meal.protein}g <span className="md:hidden">P</span>
                </div>
                <div className="font-bold text-healthpal-fats">
                    <span className="md:hidden">G: </span>{meal.fats}g <span className="md:hidden">G</span>
                </div>
                <div className="font-bold text-healthpal-fiber">
                    <span className="md:hidden">F: </span>{meal.fiber}g <span className="md:hidden">F</span>
                </div>
                <div className="font-bold text-healthpal-green">
                    <span className="md:hidden">Kcal: </span>{meal.calories} <span className="md:hidden">Kcal</span>
                </div>
            </div>
        </div>
    );
};
