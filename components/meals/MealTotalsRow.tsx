import React from 'react';
import { Meal } from '@/domain/entities/dashboard';
import { useTranslation } from '@/hooks/useTranslation';

interface MealTotalsRowProps {
    meal: Meal;
}

export const MealTotalsRow: React.FC<MealTotalsRowProps> = ({ meal }) => {
    const { t } = useTranslation();

    // Calculate total grams from ingredient quantities
    const totalGrams = meal.ingredients.reduce((sum, ingredient) => {
        // Extract numeric value from quantity string (e.g., "100g" -> 100)
        const numericValue = parseFloat(ingredient.quantity.replace(/[^\d.]/g, ''));
        return sum + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);

    return (
        <div className="bg-neutral-panel/50 p-2 rounded-md flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-4 md:items-center">
            <div className="md:col-span-4">
                <div className="text-neutral-text-primary font-bold leading-snug">
                    {t('meals.total_macros')}
                </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:contents">
                <div className="whitespace-nowrap md:col-span-2 md:text-center">
                    <span className="md:hidden">T: </span>
                    <span className="md:text-neutral-text-secondary font-bold">{totalGrams}g</span>
                </div>

                <div className="whitespace-nowrap md:col-span-1 md:text-center text-neutral-text-primary">
                    <span className="md:hidden text-brand-carbs">C: </span>
                    <span className="font-bold text-brand-carbs">{meal.carbs}g</span>
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-neutral-text-primary">
                    <span className="md:hidden text-brand-protein">P: </span>
                    <span className="font-bold text-brand-protein">{meal.protein}g</span>
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-neutral-text-primary">
                    <span className="md:hidden text-brand-fats">G: </span>
                    <span className="font-bold text-brand-fats">{meal.fats}g</span>
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-brand-fiber">
                    <span className="md:hidden">F: </span>
                    <span className="font-bold text-brand-fiber">{meal.fiber}g</span>
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-neutral-text-primary">
                    <span className="md:hidden text-brand-green">Kcal: </span>
                    <span className="font-bold text-brand-green">{meal.calories}</span>
                </div>
            </div>
        </div>
    );
};
