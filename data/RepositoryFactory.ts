import { DashboardRepository } from '../domain/repositories/DashboardRepository';
import { ProfileRepository } from '../domain/repositories/ProfileRepository';
import { AuthRepository } from '../domain/repositories/AuthRepository';
import { FoodAnalysisRepository } from '../domain/repositories/FoodAnalysisRepository';
import { HistoryRepository } from '../domain/repositories/HistoryRepository';

import { LocalDashboardRepository } from './repositories/LocalDashboardRepository';
import { LocalProfileRepository } from './repositories/LocalProfileRepository';
import { LocalFoodAnalysisRepository } from './repositories/LocalFoodAnalysisRepository';
import { LocalHistoryRepository } from './repositories/LocalHistoryRepository';
import { FirestoreDashboardRepository } from './repositories/FirestoreDashboardRepository';
import { FirestoreProfileRepository } from './repositories/FirestoreProfileRepository';
import { FirestoreFoodAnalysisRepository } from './repositories/FirestoreFoodAnalysisRepository';
import { FirestoreHistoryRepository } from './repositories/FirestoreHistoryRepository';
import { FirebaseAuthRepository } from './repositories/FirebaseAuthRepository';
import { MockAuthRepository } from './repositories/MockAuthRepository';

// Switch these flags to false to use local data/auth to avoid configuration errors
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export class RepositoryFactory {
    private static dashboardRepository: DashboardRepository | null = null;
    private static profileRepository: ProfileRepository | null = null;
    private static authRepository: AuthRepository | null = null;
    private static foodAnalysisRepository: FoodAnalysisRepository | null = null;
    private static historyRepository: HistoryRepository | null = null;

    public static getDashboardRepository(): DashboardRepository {
        if (!this.dashboardRepository) {
            if (!USE_MOCKS) {
                this.dashboardRepository = new FirestoreDashboardRepository();
            } else {
                this.dashboardRepository = new LocalDashboardRepository();
            }
        }
        return this.dashboardRepository;
    }

    public static getProfileRepository(): ProfileRepository {
        if (!this.profileRepository) {
            if (!USE_MOCKS) {
                this.profileRepository = new FirestoreProfileRepository();
            } else {
                this.profileRepository = new LocalProfileRepository();
            }
        }
        return this.profileRepository;
    }

    public static getAuthRepository(): AuthRepository {
        if (!this.authRepository) {
            if (!USE_MOCKS) {
                this.authRepository = new FirebaseAuthRepository();
            } else {
                this.authRepository = new MockAuthRepository();
            }
        }
        return this.authRepository;
    }

    public static getFoodAnalysisRepository(): FoodAnalysisRepository {
        if (!this.foodAnalysisRepository) {
            if (!USE_MOCKS) {
                this.foodAnalysisRepository = new FirestoreFoodAnalysisRepository();
            } else {
                this.foodAnalysisRepository = new LocalFoodAnalysisRepository();
            }
        }
        return this.foodAnalysisRepository;
    }

    public static getHistoryRepository(): HistoryRepository {
        if (!this.historyRepository) {
            if (!USE_MOCKS) {
                this.historyRepository = new FirestoreHistoryRepository();
            } else {
                this.historyRepository = new LocalHistoryRepository();
            }
        }
        return this.historyRepository;
    }
}