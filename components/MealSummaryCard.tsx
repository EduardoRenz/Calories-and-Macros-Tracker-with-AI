import React, { useState } from 'react';
import type { Meal, MealSummary } from '../domain/entities/dashboard';
import { useTranslation } from '../hooks/useTranslation';
import { PlusIcon, ChevronDownIcon, TrashIcon } from './icons';

interface MealSummaryCardProps {
  meals: MealSummary;
  onAddIngredient: (mealType: keyof MealSummary) => void;
  onRemoveIngredient: (mealType: keyof MealSummary, ingredientId: string) => void;
}

const MealItem: React.FC<{ 
    meal: Meal; 
    mealType: keyof MealSummary;
    onAddIngredient: () => void;
    onRemoveIngredient: (ingredientId: string) => void;
}> = ({ meal, mealType, onAddIngredient, onRemoveIngredient }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    
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
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            
            {isExpanded ? (
                 <div id={`meal-details-${mealType}`} className="mt-4 space-y-4 animate-fade-in-down">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-2 text-xs font-semibold text-healthpal-text-secondary">
                        <div className="col-span-5">{t('meals.ingredient')}</div>
                        <div className="col-span-2 text-center">{t('meals.quantity')}</div>
                        <div className="col-span-1 text-center text-healthpal-carbs">{t('meals.carbs_short')}</div>
                        <div className="col-span-1 text-center text-healthpal-protein">{t('meals.protein_short')}</div>
                        <div className="col-span-1 text-center text-healthpal-fats">{t('meals.fats_short')}</div>
                        <div className="col-span-1 text-center text-healthpal-green">{t('meals.calories_short')}</div>
                        <div className="col-span-1"></div>
                    </div>
                    
                    {/* Ingredients List */}
                    {meal.ingredients.length > 0 ? (
                        <ul className="text-sm space-y-1">
                            {meal.ingredients.map((ingredient) => (
                                <li key={ingredient.id} className="grid grid-cols-12 gap-4 items-center group bg-healthpal-panel/50 p-2 rounded-md">
                                    <div className="col-span-5 text-healthpal-text-primary font-medium">{ingredient.name}</div>
                                    <div className="col-span-2 text-center text-healthpal-text-secondary">{ingredient.quantity}</div>
                                    <div className="col-span-1 text-center text-healthpal-text-primary">{ingredient.carbs}g</div>
                                    <div className="col-span-1 text-center text-healthpal-text-primary">{ingredient.protein}g</div>
                                    <div className="col-span-1 text-center text-healthpal-text-primary">{ingredient.fats}g</div>
                                    <div className="col-span-1 text-center text-healthpal-text-primary">{Math.round(ingredient.calories)}</div>
                                    <div className="col-span-1 flex justify-end">
                                      <button onClick={() => onRemoveIngredient(ingredient.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500">
                                          <TrashIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-healthpal-text-secondary italic text-center py-4">{t('meals.no_items_logged')}</p>
                    )}

                    {/* Totals and Add Button */}
                     <div className="border-t border-healthpal-border pt-4 mt-4 space-y-4">
                        <div className="grid grid-cols-12 gap-4 items-center px-2 text-sm">
                            <div className="col-span-5 font-bold">{t('meals.total_macros')}</div>
                            <div className="col-span-2"></div>
                             <div className="col-span-1 text-center font-bold text-healthpal-carbs">{meal.carbs}g</div>
                            <div className="col-span-1 text-center font-bold text-healthpal-protein">{meal.protein}g</div>
                            <div className="col-span-1 text-center font-bold text-healthpal-fats">{meal.fats}g</div>
                            <div className="col-span-1 text-center font-bold text-healthpal-green">{meal.calories}</div>
                            <div className="col-span-1"></div>
                        </div>
                         <button onClick={onAddIngredient} className="w-full flex items-center justify-center gap-2 bg-healthpal-green/10 text-healthpal-green font-bold py-3 rounded-lg hover:bg-healthpal-green/20 transition-colors">
                            <PlusIcon className="w-5 h-5"/>
                            <span>{t('meals.add_ingredient')}</span>
                        </button>
                    </div>

                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm text-center">
                    <div>
                        <span className="text-xs text-healthpal-carbs font-medium">{t('meals.carbs')}</span>
                        <p className="font-semibold mt-1">{meal.carbs}g</p>
                    </div>
                    <div>
                        <span className="text-xs text-healthpal-protein font-medium">{t('meals.protein')}</span>
                        <p className="font-semibold mt-1">{meal.protein}g</p>
                    </div>
                    <div>
                        <span className="text-xs text-healthpal-fats font-medium">{t('meals.fats')}</span>
                        <p className="font-semibold mt-1">{meal.fats}g</p>
                    </div>
                </div>
            )}
        </div>
    )
};

const MealSummaryCard: React.FC<MealSummaryCardProps> = ({ meals, onAddIngredient, onRemoveIngredient }) => {
  const mealEntries = Object.entries(meals) as [keyof MealSummary, Meal][];
  const { t } = useTranslation();

  return (
    <div className="bg-healthpal-card p-6 rounded-2xl h-full">
      <h3 className="text-xl font-bold mb-2">{t('meals.summary_title')}</h3>
      <div>
        {mealEntries.map(([mealType, meal]) => (
          <MealItem 
            key={mealType} 
            meal={meal} 
            mealType={mealType}
            onAddIngredient={() => onAddIngredient(mealType)}
            onRemoveIngredient={(ingredientId) => onRemoveIngredient(mealType, ingredientId)}
          />
        ))}
      </div>
    </div>
  );
};

export default MealSummaryCard;