import { DashboardData, Ingredient, MealSummary } from '../entities/dashboard';

export interface DashboardRepository {
    getDashboardForDate(date: string): Promise<DashboardData>;
    getDashboardRange(startDate: string, endDate: string): Promise<DashboardData[]>;
    addIngredient(date: string, mealType: keyof MealSummary, ingredient: Omit<Ingredient, 'id'>): Promise<DashboardData>;
    addIngredients(date: string, mealType: keyof MealSummary, ingredients: Omit<Ingredient, 'id'>[]): Promise<DashboardData>;
    removeIngredient(date: string, mealType: keyof MealSummary, ingredientId: string): Promise<DashboardData>;
    updateGoals(date: string, goals: { calories: number; protein: number; carbs: number; fats: number }): Promise<DashboardData>;
}
