import { Ingredient, MealSummary } from './dashboard';


export interface AddIngredientActionData {
    date: string;
    mealType: keyof MealSummary;
    ingredient: Omit<Ingredient, 'id'>;
}

export interface UpdateIngredientActionData {
    date: string;
    mealType: keyof MealSummary;
    ingredientId: string;
    updates: Partial<Omit<Ingredient, 'id'>>;
}

export interface RemoveIngredientActionData {
    date: string;
    name: string;
    mealType: keyof MealSummary;
    ingredientId: string;
}

export type ActionData = AddIngredientActionData | UpdateIngredientActionData | RemoveIngredientActionData;


export type ActionDataType = 'add_ingredient' | 'update_ingredient' | 'remove_ingredient';

export interface PendingAction {
    id: string;
    type: ActionDataType;
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
