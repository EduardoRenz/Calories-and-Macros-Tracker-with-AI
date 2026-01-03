import { DashboardRepository } from '@/domain/repositories/DashboardRepository';
import { DashboardData, Ingredient, MealSummary } from '@/domain/entities/dashboard';
import { apiClient } from '@/lib/apiClient';

/**
 * DashboardRepository implementation that calls the server-side API.
 * All requests are authenticated via the Authorization header.
 */
export class ApiDashboardRepository implements DashboardRepository {
    async getDashboardForDate(date: string): Promise<DashboardData> {
        return apiClient.get<DashboardData>(`/api/dashboard/${date}`);
    }

    async addIngredient(
        date: string,
        mealType: keyof MealSummary,
        ingredient: Omit<Ingredient, 'id'>
    ): Promise<DashboardData> {
        return apiClient.post<DashboardData>(`/api/dashboard/${date}/ingredients`, {
            mealType,
            ingredient,
        });
    }

    async addIngredients(
        date: string,
        mealType: keyof MealSummary,
        ingredients: Omit<Ingredient, 'id'>[]
    ): Promise<DashboardData> {
        return apiClient.post<DashboardData>(`/api/dashboard/${date}/ingredients`, {
            mealType,
            ingredients,
        });
    }

    async removeIngredient(
        date: string,
        mealType: keyof MealSummary,
        ingredientId: string
    ): Promise<DashboardData> {
        return apiClient.delete<DashboardData>(`/api/dashboard/${date}/ingredients`, {
            mealType,
            ingredientId,
        });
    }
}
