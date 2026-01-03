import { FoodAnalysisRepository } from '@/domain/repositories/FoodAnalysisRepository';
import { DashboardData } from '@/domain/entities/dashboard';
import { apiClient } from '@/lib/apiClient';

/**
 * FoodAnalysisRepository implementation that calls the server-side API.
 * All requests are authenticated via the Authorization header.
 */
export class ApiFoodAnalysisRepository implements FoodAnalysisRepository {
    async getDashboardDataForRange(startDate: string, endDate: string): Promise<DashboardData[]> {
        return apiClient.post<DashboardData[]>('/api/food-analysis/range', {
            startDate,
            endDate,
        });
    }
}
