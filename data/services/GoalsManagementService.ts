import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { DashboardData } from '../../domain/entities/dashboard';
import { CalorieCalculationService } from '../../domain/services/CalorieCalculationService';
import { RepositoryFactory } from '../RepositoryFactory';

export class GoalsManagementService {
    private dashboardRepository: DashboardRepository;
    private profileRepository: ProfileRepository;

    constructor(dashboardRepository: DashboardRepository, profileRepository: ProfileRepository) {
        this.dashboardRepository = dashboardRepository;
        this.profileRepository = profileRepository;
    }

    /**
     * Apply goals to a specific date based on the user's current profile
     */
    async applyGoalsForDate(date: string): Promise<void> {
        try {
            console.log(`[GoalsManagementService] Applying goals for date: ${date}`);

            const profile = await this.profileRepository.getProfile();
            const goals = CalorieCalculationService.calculateGoals(profile);

            await this.dashboardRepository.updateGoals(date, goals);
            console.log(`[GoalsManagementService] Goals applied for date: ${date}`);
        } catch (error) {
            console.error('Error applying goals for date:', date, error);
            throw error;
        }
    }

    /**
     * Apply goals to multiple dates (useful for bulk updates)
     */
    async applyGoalsForDateRange(startDate: string, endDate: string): Promise<void> {
        try {
            const profile = await this.profileRepository.getProfile();
            const goals = CalorieCalculationService.calculateGoals(profile);

            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dateStr = date.toISOString().split('T')[0];
                await this.dashboardRepository.updateGoals(dateStr, goals);
            }
        } catch (error) {
            console.error('Error applying goals for date range:', startDate, 'to', endDate, error);
            throw error;
        }
    }

    /**
     * Apply goals to today's date (common use case when profile is updated)
     */
    async applyGoalsForToday(): Promise<void> {
        console.log('Applying goals for today');
        const today = new Date().toISOString().split('T')[0];
        await this.applyGoalsForDate(today);
    }

    /**
     * Update goals if they are zero or undefined in the provided dashboard data
     */
    async updateGoalsIfNeeded(date: string, dashboardData: DashboardData): Promise<DashboardData> {
        // Check if goals are zero or undefined
        const hasZeroGoals =
            dashboardData.macros.calories.goal === 0 ||
            dashboardData.macros.protein.goal === 0 ||
            dashboardData.macros.carbs.goal === 0 ||
            dashboardData.macros.fats.goal === 0 ||
            dashboardData.macros.calories.goal === undefined ||
            dashboardData.macros.protein.goal === undefined ||
            dashboardData.macros.carbs.goal === undefined ||
            dashboardData.macros.fats.goal === undefined;

        if (hasZeroGoals) {
            try {
                console.log(`[GoalsManagementService] Goals are zero for ${date}, applying goals`);
                await this.applyGoalsForDate(date);
                // Refetch to get updated goals
                const updatedData = await this.dashboardRepository.getDashboardForDate(date);
                return updatedData;
            } catch (goalsError) {
                console.warn('Failed to apply goals for date:', date, goalsError);
                // Return original data if goals update failed
                return dashboardData;
            }
        } else {
            console.log(`[GoalsManagementService] Goals already set for ${date}`);
            return dashboardData;
        }
    }
}

/**
 * Factory function to create a GoalsManagementService with current repositories
 */
export function createGoalsManagementService(): GoalsManagementService {
    return new GoalsManagementService(
        RepositoryFactory.getDashboardRepository(),
        RepositoryFactory.getProfileRepository()
    );
}

/**
 * Convenience function to apply goals for today
 */
export async function applyGoalsForToday(): Promise<void> {
    const service = createGoalsManagementService();
    await service.applyGoalsForToday();
}

/**
 * Convenience function to apply goals for a specific date
 */
export async function applyGoalsForDate(date: string): Promise<void> {
    const service = createGoalsManagementService();
    await service.applyGoalsForDate(date);
}
