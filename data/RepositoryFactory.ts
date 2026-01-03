import { DashboardRepository } from '../domain/repositories/DashboardRepository';
import { ProfileRepository } from '../domain/repositories/ProfileRepository';
import { AuthRepository } from '../domain/repositories/AuthRepository';
import { FoodAnalysisRepository } from '../domain/repositories/FoodAnalysisRepository';
import { HistoryRepository } from '../domain/repositories/HistoryRepository';

import { LocalDashboardRepository } from './repositories/LocalDashboardRepository';
import { LocalProfileRepository } from './repositories/LocalProfileRepository';
import { LocalFoodAnalysisRepository } from './repositories/LocalFoodAnalysisRepository';
import { LocalHistoryRepository } from './repositories/LocalHistoryRepository';
import { MockAuthRepository } from './repositories/MockAuthRepository';
import { ApiProfileRepository } from './repositories/ApiProfileRepository';
import { ApiDashboardRepository } from './repositories/ApiDashboardRepository';
import { ApiHistoryRepository } from './repositories/ApiHistoryRepository';
import { ApiFoodAnalysisRepository } from './repositories/ApiFoodAnalysisRepository';
import { FirebaseAuthRepository } from './repositories/FirebaseAuthRepository';
import { SupabaseAuthRepository } from './repositories/SupabaseAuthRepository';
import { FirestoreDashboardRepository } from './repositories/FirestoreDashboardRepository';
import { FirestoreProfileRepository } from './repositories/FirestoreProfileRepository';
import { FirestoreFoodAnalysisRepository } from './repositories/FirestoreFoodAnalysisRepository';
import { FirestoreHistoryRepository } from './repositories/FirestoreHistoryRepository';
import { SupabaseDashboardRepository } from './repositories/SupabaseDashboardRepository';
import { SupabaseProfileRepository } from './repositories/SupabaseProfileRepository';
import { SupabaseFoodAnalysisRepository } from './repositories/SupabaseFoodAnalysisRepository';
import { SupabaseHistoryRepository } from './repositories/SupabaseHistoryRepository';

const BACKEND_PROVIDER = (
    process.env.BACKEND_PROVIDER ??
    process.env.NEXT_PUBLIC_BACKEND_PROVIDER ??
    'firebase'
).toLowerCase();

const IS_SERVER = typeof window === 'undefined';

const serverStrategies = {
    firebase: {
        dashboard: () => new FirestoreDashboardRepository(),
        profile: () => new FirestoreProfileRepository(),
        foodAnalysis: () => new FirestoreFoodAnalysisRepository(),
        history: () => new FirestoreHistoryRepository(),
        auth: () => new FirebaseAuthRepository(),
    },
    supabase: {
        dashboard: () => new SupabaseDashboardRepository(),
        profile: () => new SupabaseProfileRepository(),
        foodAnalysis: () => new SupabaseFoodAnalysisRepository(),
        history: () => new SupabaseHistoryRepository(),
        auth: () => new SupabaseAuthRepository(),
    },
    mock: {
        dashboard: () => new LocalDashboardRepository(),
        profile: () => new LocalProfileRepository(),
        foodAnalysis: () => new LocalFoodAnalysisRepository(),
        history: () => new LocalHistoryRepository(),
        auth: () => new MockAuthRepository(),
    }
};

const apiStrategies = {
    dashboard: () => new ApiDashboardRepository(),
    profile: () => new ApiProfileRepository(),
    foodAnalysis: () => new ApiFoodAnalysisRepository(),
    history: () => new ApiHistoryRepository(),
    auth: () => (BACKEND_PROVIDER === 'supabase' ? new SupabaseAuthRepository() : new FirebaseAuthRepository()),
};

export class RepositoryFactory {
    private static dashboardRepository: DashboardRepository | null = null;
    private static profileRepository: ProfileRepository | null = null;
    private static authRepository: AuthRepository | null = null;
    private static foodAnalysisRepository: FoodAnalysisRepository | null = null;
    private static historyRepository: HistoryRepository | null = null;

    private static getStrategy() {
        if (IS_SERVER || BACKEND_PROVIDER === 'mock') {
            return serverStrategies[BACKEND_PROVIDER as keyof typeof serverStrategies] || serverStrategies.firebase;
        }
        return apiStrategies;
    }

    public static getDashboardRepository(): DashboardRepository {
        if (!this.dashboardRepository) {
            this.dashboardRepository = this.getStrategy().dashboard();
        }
        return this.dashboardRepository;
    }

    public static getProfileRepository(): ProfileRepository {
        if (!this.profileRepository) {
            this.profileRepository = this.getStrategy().profile();
        }
        return this.profileRepository;
    }

    public static getAuthRepository(): AuthRepository {
        if (!this.authRepository) {
            const strategy = this.getStrategy();
            // Auth is a bit special because we might need direct auth even on client for login flow,
            // unless we're in mock mode.
            if (BACKEND_PROVIDER === 'mock') {
                this.authRepository = new MockAuthRepository();
            } else {
                this.authRepository = BACKEND_PROVIDER === 'supabase'
                    ? new SupabaseAuthRepository()
                    : new FirebaseAuthRepository();
            }
        }
        return this.authRepository;
    }

    public static getFoodAnalysisRepository(): FoodAnalysisRepository {
        if (!this.foodAnalysisRepository) {
            this.foodAnalysisRepository = this.getStrategy().foodAnalysis();
        }
        return this.foodAnalysisRepository;
    }

    public static getHistoryRepository(): HistoryRepository {
        if (!this.historyRepository) {
            this.historyRepository = this.getStrategy().history();
        }
        return this.historyRepository;
    }
}