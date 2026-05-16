import React from 'react';
import { Meal, Ingredient, MealSummary } from '@/domain/entities/dashboard';
import { ChevronDownIcon, PlusIcon } from '../icons';
import { useTranslation } from '@/hooks/useTranslation';
import { MealDetails } from './MealDetails';
import { BreakfastIcon, LunchIcon, DinnerIcon, SnacksIcon } from '../FoodIcons';

const getMealTime = (ingredients: Ingredient[]): string | null => {
    if (ingredients.length === 0) return null;

    // Filter ingredients with created_at and find the earliest
    const dates = ingredients
        .map(ing => ing.created_at ? new Date(ing.created_at) : null)
        .filter((d): d is Date => d !== null);

    if (dates.length === 0) return null;

    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));

    return earliestDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

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
        <div
            className={`bg-neutral-card rounded-2xl ${isExpanded ? 'border-2 border-secondary shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'border border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.04)]'} transition-all duration-200 overflow-hidden`}
            data-testid={testId}
        >
            <div className="p-4 flex justify-between items-center w-full">
                <button
                    onClick={() => hasIngredients && setIsExpanded(!isExpanded)}
                    className={`flex items-center gap-4 flex-grow text-left ${!hasIngredients ? 'cursor-default' : ''}`}
                    aria-expanded={isExpanded}
                    aria-controls={`meal-details-${mealType}`}
                    disabled={!hasIngredients}
                >
                    <div className="bg-[#E9F7F5] dark:bg-surface-container-high p-3 rounded-xl text-brand-green dark:text-on-surface-variant">
                        <MealIcon type={mealType} className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-lg leading-tight text-neutral-text-primary">{t(`meals.${mealType}`)}</p>
                        <p className="text-sm text-neutral-text-secondary">
                            {(() => {
                                const mealTime = getMealTime(meal.ingredients);
                                return meal.calories > 0 && mealTime
                                    ? `${mealTime} • ${meal.calories} kcal`
                                    : `${meal.calories} kcal`;
                            })()}
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
                            className="bg-[#E9F7F5] dark:bg-surface-container-high p-3 rounded-2xl text-brand-green dark:text-on-surface-variant hover:bg-brand-green/20 dark:hover:bg-surface-container-highest transition-colors"
                            aria-label={t('meals.add_ingredient')}
                            data-testid={`add-ingredient-${mealType}`}
                        >
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && hasIngredients && (
                <div className="px-4 pb-4">
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
