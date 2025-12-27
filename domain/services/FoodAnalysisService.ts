import { FoodAnalysisReport } from '../entities/analysis';
import { DashboardData } from '../entities/dashboard';
import { UserProfile } from '../entities/profile';

export interface FoodAnalysisInput {
    dashboardData: DashboardData[];
    profile: UserProfile;
    language: string;
}

export interface FoodAnalysisService {
    generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport>;
}
