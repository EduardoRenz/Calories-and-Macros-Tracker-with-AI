import React from 'react';
import { Meal, Ingredient, MealSummary } from '@/domain/entities/dashboard';
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
    onUpdateIngredient: (ingredientId: string, updates: Partial<Ingredient>) => void;
}

export const MealDetails: React.FC<MealDetailsProps> = ({
    meal,
    mealType,
    onAddIngredient,
    onRemoveIngredient,
    onUpdateIngredient
}) => {
    const { t } = useTranslation();

    return (
        <div className="mt-4 space-y-4 animate-fade-in-down">
            <IngredientsHeader />

            {meal.ingredients.length > 0 ? (
                <ul className="text-sm space-y-1" data-testid={`${mealType}-ingredients`}>
                    {meal.ingredients.map((ingredient) => (
                        <IngredientItem
                            key={ingredient.id}
                            ingredient={ingredient}
                            onRemove={onRemoveIngredient}
                            onUpdate={onUpdateIngredient}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-neutral-text-secondary italic text-center py-4">
                    {t('meals.no_items_logged')}
                </p>
            )}

            <div className="border-t border-neutral-border pt-4 mt-4 space-y-4">
                <MealTotalsRow meal={meal} />
                <AddIngredientButton onClick={onAddIngredient} mealType={mealType} />
            </div>
        </div>
    );
};
