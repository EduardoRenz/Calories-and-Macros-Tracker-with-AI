import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
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
            const profile = await this.profileRepository.getProfile();
            const goals = CalorieCalculationService.calculateGoals(profile);

            await this.dashboardRepository.updateGoals(date, goals);
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
        const today = new Date().toISOString().split('T')[0];
        await this.applyGoalsForDate(today);
    }

    /**
     * Check if goals need to be updated for a given date
     * Returns true if goals are zero or undefined
     */
    async needsGoalsUpdate(date: string): Promise<boolean> {
        try {
            const dashboardData = await this.dashboardRepository.getDashboardForDate(date);

            const hasZeroGoals =
                dashboardData.macros.calories.goal === 0 ||
                dashboardData.macros.protein.goal === 0 ||
                dashboardData.macros.carbs.goal === 0 ||
                dashboardData.macros.fats.goal === 0;

            const hasUndefinedGoals =
                dashboardData.macros.calories.goal === undefined ||
                dashboardData.macros.protein.goal === undefined ||
                dashboardData.macros.carbs.goal === undefined ||
                dashboardData.macros.fats.goal === undefined;

            return hasZeroGoals || hasUndefinedGoals;
        } catch (error) {
            console.error('Error checking if goals need update:', date, error);
            return true; // Assume update needed if we can't check
        }
    }

    /**
     * Apply goals only if they need to be updated
     */
    async applyGoalsIfNeeded(date: string): Promise<boolean> {
        if (await this.needsGoalsUpdate(date)) {
            await this.applyGoalsForDate(date);
            return true;
        }
        return false;
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

/**
 * Convenience function to check if goals need update for a date
 */
export async function needsGoalsUpdate(date: string): Promise<boolean> {
    const service = createGoalsManagementService();
    return await service.needsGoalsUpdate(date);
}

/**
 * Convenience function to apply goals only if needed
 */
export async function applyGoalsIfNeeded(date: string): Promise<boolean> {
    const service = createGoalsManagementService();
    return await service.applyGoalsIfNeeded(date);
}
