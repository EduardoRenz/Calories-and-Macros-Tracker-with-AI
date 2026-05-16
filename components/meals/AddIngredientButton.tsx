import React from 'react';
import { PlusIcon } from '../icons';
import { useTranslation } from '@/hooks/useTranslation';
import type { MealSummary } from '@/domain/entities/dashboard';

interface AddIngredientButtonProps {
    onClick: () => void;
    mealType?: keyof MealSummary;
}

export const AddIngredientButton: React.FC<AddIngredientButtonProps> = ({ onClick, mealType }) => {
    const { t } = useTranslation();

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-neutral-border text-neutral-text-secondary font-bold py-3 rounded-2xl hover:bg-neutral-panel/50 transition-colors"
            data-testid={mealType ? `add-ingredient-${mealType}` : undefined}
        >
            <PlusIcon className="w-5 h-5" />
            <span>{t('meals.add_ingredient')}</span>
        </button>
    );
};
