import React from 'react';
import { PlusIcon } from '../icons';
import { useTranslation } from '@/hooks/useTranslation';

interface AddIngredientButtonProps {
    onClick: () => void;
}

export const AddIngredientButton: React.FC<AddIngredientButtonProps> = ({ onClick }) => {
    const { t } = useTranslation();

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2 bg-healthpal-green/10 text-healthpal-green font-bold py-3 rounded-lg hover:bg-healthpal-green/20 transition-colors"
        >
            <PlusIcon className="w-5 h-5" />
            <span>{t('meals.add_ingredient')}</span>
        </button>
    );
};
