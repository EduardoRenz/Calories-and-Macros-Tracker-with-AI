import React from 'react';
import { Meal } from '@/domain/entities/dashboard';
import { TrashIcon } from '../icons';
import { useTranslation } from '@/hooks/useTranslation';

interface IngredientItemProps {
    ingredient: Meal['ingredients'][0];
    onRemove: (id: string) => void;
}

export const IngredientItem: React.FC<IngredientItemProps> = ({ ingredient, onRemove }) => {
    const { t } = useTranslation();

    return (
        <li className="group bg-healthpal-panel/50 p-2 rounded-md flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-4 md:items-center">
            <div className="flex items-start justify-between gap-2 md:col-span-4">
                <div className="text-healthpal-text-primary font-medium leading-snug break-words" title={ingredient.name}>
                    {ingredient.name}
                </div>
                <div className="md:hidden flex justify-end">
                    <button
                        onClick={() => onRemove(ingredient.id)}
                        className="text-red-400 hover:text-red-500"
                        aria-label={t('meals.remove_ingredient')}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-healthpal-text-secondary md:contents">
                <div className="whitespace-nowrap md:col-span-2 md:text-center">
                    <span className="md:hidden">Qtd: </span>
                    <span className="md:text-healthpal-text-secondary">{ingredient.quantity}</span>
                </div>

                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-carbs">C: </span>
                    {ingredient.carbs}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-protein">P: </span>
                    {ingredient.protein}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-fats">G: </span>
                    {ingredient.fats}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-fiber">
                    <span className="md:hidden">F: </span>
                    {ingredient.fiber}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-green">Kcal: </span>
                    {Math.round(ingredient.calories)}
                </div>
            </div>

            <div className="hidden md:col-span-1 md:flex md:justify-end">
                <button onClick={() => onRemove(ingredient.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </li>
    );
};
