import React from 'react';
import { CommonFoods } from '@/domain/entities/analysis';
import { useTranslation } from '@/hooks/useTranslation';

interface CommonFoodsSectionProps {
    commonFoods: CommonFoods;
}

const MealIcon: React.FC<{ meal: string }> = ({ meal }) => {
    const icons: Record<string, string> = {
        breakfast: '☕',
        lunch: '🍴',
        dinner: '🍽️',
        snacks: '🥜'
    };
    return <span className="text-3xl">{icons[meal.toLowerCase()] || '🍽️'}</span>;
};

export const CommonFoodsSection: React.FC<CommonFoodsSectionProps> = ({ commonFoods }) => {
    const { t } = useTranslation();

    return (
        <section id="common-foods-section" className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2">{t('food_analysis.common_foods.title')}</h2>
            <p className="text-neutral-text-secondary mb-4">
                {t('food_analysis.common_foods.subtitle')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map(meal => {
                    const mealData = commonFoods[meal];
                    return (
                        <div
                            key={meal}
                            className="bg-neutral-card p-6 rounded-2xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <MealIcon meal={meal} />
                                <h3 className="font-bold text-lg capitalize">
                                    {t(`meals.${meal}`)}
                                </h3>
                            </div>
                            <p className="text-neutral-text-secondary text-sm mb-2">
                                {mealData.foods.join(', ')}
                            </p>
                            <p className="text-xs text-neutral-text-secondary">
                                {mealData.consistency}% {t('food_analysis.common_foods.consistency')}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
