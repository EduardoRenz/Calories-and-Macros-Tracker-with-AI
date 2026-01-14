import { Ingredient, MealSummary } from './dashboard';


export interface AddIngredientActionData {
    date: string;
    mealType: keyof MealSummary;
    ingredientId: string;
    updates: Partial<Omit<Ingredient, 'id'>>;
    // Support legacy naming used in some services
    ingredient?: Partial<Omit<Ingredient, 'id'>>;
}

export interface RemoveIngredientActionData {
    date: string;
    mealType: keyof MealSummary;
    ingredientId: string;
}

export type ActionData = AddIngredientActionData | RemoveIngredientActionData;

export interface PendingAction {
    id: string;
    type: 'add_ingredient' | 'update_ingredient' | 'remove_ingredient';
    data: ActionData;
    description: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    pendingAction?: PendingAction;
}
