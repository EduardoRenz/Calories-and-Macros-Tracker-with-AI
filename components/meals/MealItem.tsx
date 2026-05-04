import React from 'react';
import { Meal, Ingredient, MealSummary } from '@/domain/entities/dashboard';
import { ChevronDownIcon, PlusIcon } from '../icons';
import { useTranslation } from '@/hooks/useTranslation';
import { MealDetails } from './MealDetails';
import { BreakfastIcon, LunchIcon, DinnerIcon, SnacksIcon } from '../FoodIcons';

interface MealItemProps {
    meal: Meal;
    mealType: keyof MealSummary;
    onAddIngredient: () => void;
    onRemoveIngredient: (id: string) => void;
    onUpdateIngredient: (ingredientId: string, updates: Partial<Ingredient>) => void;
    'data-testid'?: string;
}

const MealIcon = ({ type, className }: { type: keyof MealSummary; className?: string }) => {
    switch (type) {
        case 'breakfast': return <BreakfastIcon className={className} />;
        case 'lunch': return <LunchIcon className={className} />;
        case 'dinner': return <DinnerIcon className={className} />;
        case 'snacks': return <SnacksIcon className={className} />;
        default: return null;
    }
};

export const MealItem: React.FC<MealItemProps> = ({
    meal,
    mealType,
    onAddIngredient,
    onRemoveIngredient,
    onUpdateIngredient,
    'data-testid': testId
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const hasIngredients = meal.ingredients.length > 0;

    return (
        <div className="py-4 border-b border-neutral-border last:border-none" data-testid={testId}>
            <div className="flex justify-between items-center w-full">
                <button
                    onClick={() => hasIngredients && setIsExpanded(!isExpanded)}
                    className={`flex items-center gap-4 flex-grow text-left ${!hasIngredients ? 'cursor-default' : ''}`}
                    aria-expanded={isExpanded}
                    aria-controls={`meal-details-${mealType}`}
                    disabled={!hasIngredients}
                >
                    <div className="bg-brand-green/10 p-3 rounded-2xl text-brand-green">
                        <MealIcon type={mealType} className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="font-bold text-lg leading-tight">{t(`meals.${mealType}`)}</p>
                        <p className="text-sm text-neutral-text-secondary">
                            {/* Mock time or dynamic time if available in future, for now just show kcal */}
                            {meal.calories} kcal
                        </p>
                    </div>
                </button>

                <div className="flex items-center gap-2">
                    {hasIngredients ? (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 text-neutral-text-secondary hover:bg-neutral-panel rounded-full transition-colors"
                        >
                            <ChevronDownIcon
                                className={`w-6 h-6 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                        </button>
                    ) : (
                        <button
                            onClick={onAddIngredient}
                            className="bg-brand-green/10 p-2 rounded-full text-brand-green hover:bg-brand-green/20 transition-colors"
                            aria-label={t('meals.add_ingredient')}
                        >
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && hasIngredients && (
                <div id={`meal-details-${mealType}`}>
                    <MealDetails
                        meal={meal}
                        mealType={mealType}
                        onAddIngredient={onAddIngredient}
                        onRemoveIngredient={onRemoveIngredient}
                        onUpdateIngredient={onUpdateIngredient}
                    />
                </div>
            )}
        </div>
    );
};
