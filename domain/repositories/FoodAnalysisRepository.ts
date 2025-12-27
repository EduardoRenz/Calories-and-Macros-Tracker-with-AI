import { DashboardData } from '../entities/dashboard';

export interface FoodAnalysisRepository {
    getDashboardDataForRange(startDate: string, endDate: string): Promise<DashboardData[]>;
}
