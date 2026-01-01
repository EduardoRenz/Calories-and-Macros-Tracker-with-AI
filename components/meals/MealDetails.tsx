import React from 'react';
import { Meal, MealSummary } from '@/domain/entities/dashboard';
import { useTranslation } from '@/hooks/useTranslation';
import { IngredientItem } from './IngredientItem';
import { IngredientsHeader } from './IngredientsHeader';
import { MealTotalsRow } from './MealTotalsRow';
import { AddIngredientButton } from './AddIngredientButton';

interface MealDetailsProps {
    meal: Meal;
    mealType: keyof MealSummary;
    onAddIngredient: () => void;
    onRemoveIngredient: (id: string) => void;
}

export const MealDetails: React.FC<MealDetailsProps> = ({
    meal,
    mealType,
    onAddIngredient,
    onRemoveIngredient
}) => {
    const { t } = useTranslation();

    return (
        <div className="mt-4 space-y-4 animate-fade-in-down">
            <IngredientsHeader />

            {meal.ingredients.length > 0 ? (
                <ul className="text-sm space-y-1">
                    {meal.ingredients.map((ingredient) => (
                        <IngredientItem
                            key={ingredient.id}
                            ingredient={ingredient}
                            onRemove={onRemoveIngredient}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-healthpal-text-secondary italic text-center py-4">
                    {t('meals.no_items_logged')}
                </p>
            )}

            <div className="border-t border-healthpal-border pt-4 mt-4 space-y-4">
                <MealTotalsRow meal={meal} />
                <AddIngredientButton onClick={onAddIngredient} />
            </div>
        </div>
    );
};
