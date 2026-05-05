import type { MealSummary, Ingredient } from '../domain/entities/dashboard';
import { MealItem } from './meals/MealItem';

interface MealSummaryCardProps {
    meals: MealSummary;
    onAddIngredient: (mealType: keyof MealSummary) => void;
    onRemoveIngredient: (mealType: keyof MealSummary, ingredientId: string) => void;
    onUpdateIngredient: (mealType: keyof MealSummary, ingredientId: string, updates: Partial<Ingredient>) => void;
}

const MealSummaryCard: React.FC<MealSummaryCardProps> = ({ meals, onAddIngredient, onRemoveIngredient, onUpdateIngredient }) => {
    // Define the order of meals explicitly
    const mealOrder: (keyof MealSummary)[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

    return (
        <div className="flex flex-col gap-4">
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
    );
};

export default MealSummaryCard;
