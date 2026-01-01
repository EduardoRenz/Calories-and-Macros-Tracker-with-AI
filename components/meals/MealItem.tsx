import React from 'react';
import { Meal, MealSummary } from '@/domain/entities/dashboard';
import { ChevronDownIcon } from '../icons';
import { useTranslation } from '@/hooks/useTranslation';
import { MealDetails } from './MealDetails';

interface MealItemProps {
    meal: Meal;
    mealType: keyof MealSummary;
    onAddIngredient: () => void;
    onRemoveIngredient: (id: string) => void;
}

export const MealItem: React.FC<MealItemProps> = ({
    meal,
    mealType,
    onAddIngredient,
    onRemoveIngredient
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div className="py-4 border-b border-healthpal-border last:border-none">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex justify-between items-center w-full"
                aria-expanded={isExpanded}
                aria-controls={`meal-details-${mealType}`}
            >
                <p className="font-bold text-lg">{t(`meals.${mealType}`)}</p>
                <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{meal.calories} kcal</p>
                    <ChevronDownIcon
                        className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {isExpanded && (
                <div id={`meal-details-${mealType}`}>
                    <MealDetails
                        meal={meal}
                        mealType={mealType}
                        onAddIngredient={onAddIngredient}
                        onRemoveIngredient={onRemoveIngredient}
                    />
                </div>
            )}
        </div>
    );
};
