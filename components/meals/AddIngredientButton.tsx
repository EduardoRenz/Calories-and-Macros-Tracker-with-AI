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
            className="w-full flex items-center justify-center gap-2 bg-brand-green/10 text-brand-green font-bold py-3 rounded-lg hover:bg-brand-green/20 transition-colors"
            data-testid={mealType ? `add-ingredient-${mealType}` : undefined}
        >
            <PlusIcon className="w-5 h-5" />
            <span>{t('meals.add_ingredient')}</span>
        </button>
    );
};
