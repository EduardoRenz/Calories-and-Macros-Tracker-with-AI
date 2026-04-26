import type { MealSummary, Ingredient } from '../domain/entities/dashboard';
import { MealItem } from './meals/MealItem';
import { useTranslation } from '../hooks/useTranslation';

interface MealSummaryCardProps {
    meals: MealSummary;
    onAddIngredient: (mealType: keyof MealSummary) => void;
    onRemoveIngredient: (mealType: keyof MealSummary, ingredientId: string) => void;
    onUpdateIngredient: (mealType: keyof MealSummary, ingredientId: string, updates: Partial<Ingredient>) => void;
}

const MealSummaryCard: React.FC<MealSummaryCardProps> = ({ meals, onAddIngredient, onRemoveIngredient, onUpdateIngredient }) => {
    const { t } = useTranslation();

    // Define the order of meals explicitly
    const mealOrder: (keyof MealSummary)[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

    return (
        <div className="bg-healthpal-card p-6 rounded-2xl h-full">
            <h3 className="text-xl font-bold mb-2">{t('meals.summary_title')}</h3>
            <div>
                {mealOrder.map((mealType) => (
                    <MealItem
                        key={mealType}
                        meal={meals[mealType]}
                        mealType={mealType}
                        onAddIngredient={() => onAddIngredient(mealType)}
                        onRemoveIngredient={(ingredientId) => onRemoveIngredient(mealType, ingredientId)}
                        onUpdateIngredient={(ingredientId, updates) => onUpdateIngredient(mealType, ingredientId, updates)}
                        data-testid={`meal-${mealType}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default MealSummaryCard;