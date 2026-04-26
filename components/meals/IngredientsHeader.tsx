import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export const IngredientsHeader: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-xs font-semibold text-healthpal-text-secondary">
            <div className="col-span-4">{t('meals.ingredient')}</div>
            <div className="col-span-2 text-center">
                <span className="hidden md:inline">{t('meals.quantity')}</span>
                <span className="md:hidden">Qtd</span>
            </div>
            <div className="col-span-1 text-center text-healthpal-carbs">
                <span className="hidden md:inline">{t('meals.carbs_short')}</span>
                <span className="md:hidden">C</span>
            </div>
            <div className="col-span-1 text-center text-healthpal-protein">
                <span className="hidden md:inline">{t('meals.protein_short')}</span>
                <span className="md:hidden">P</span>
            </div>
            <div className="col-span-1 text-center text-healthpal-fats">
                <span className="hidden md:inline">{t('meals.fats_short')}</span>
                <span className="md:hidden">G</span>
            </div>
            <div className="col-span-1 text-center text-healthpal-fiber">
                <span className="hidden md:inline">{t('meals.fiber_short')}</span>
                <span className="md:hidden">F</span>
            </div>
            <div className="col-span-1 text-center text-healthpal-green">
                <span className="hidden md:inline">{t('meals.calories_short')}</span>
                <span className="md:hidden">Cal</span>
            </div>
            <div className="col-span-1"></div>
        </div>
    );
};
