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
import { SupabaseDashboardRepository } from './repositories/SupabaseDashboardRepository';
import { SupabaseProfileRepository } from './repositories/SupabaseProfileRepository';
import { SupabaseFoodAnalysisRepository } from './repositories/SupabaseFoodAnalysisRepository';
import { SupabaseHistoryRepository } from './repositories/SupabaseHistoryRepository';
import { SupabaseAuthRepository } from './repositories/SupabaseAuthRepository';

type Provider = 'firebase' | 'supabase' | 'mock';

const BACKEND_PROVIDER = (process.env.BACKEND_PROVIDER ?? 'firebase').toLowerCase() as Provider;

interface RepositoryStrategy {
    dashboard: () => DashboardRepository;
    profile: () => ProfileRepository;
    auth: () => AuthRepository;
    foodAnalysis: () => FoodAnalysisRepository;
    history: () => HistoryRepository;
}

const strategies: Record<Provider, RepositoryStrategy> = {
    firebase: {
        dashboard: () => new FirestoreDashboardRepository(),
        profile: () => new FirestoreProfileRepository(),
        auth: () => new FirebaseAuthRepository(),
        foodAnalysis: () => new FirestoreFoodAnalysisRepository(),
        history: () => new FirestoreHistoryRepository(),
    },
    supabase: {
        dashboard: () => new SupabaseDashboardRepository(),
        profile: () => new SupabaseProfileRepository(),
        auth: () => new SupabaseAuthRepository(),
        foodAnalysis: () => new SupabaseFoodAnalysisRepository(),
        history: () => new SupabaseHistoryRepository(),
    },
    mock: {
        dashboard: () => new LocalDashboardRepository(),
        profile: () => new LocalProfileRepository(),
        auth: () => new MockAuthRepository(),
        foodAnalysis: () => new LocalFoodAnalysisRepository(),
        history: () => new LocalHistoryRepository(),
    },
};

export class RepositoryFactory {
    private static dashboardRepository: DashboardRepository | null = null;
    private static profileRepository: ProfileRepository | null = null;
    private static authRepository: AuthRepository | null = null;
    private static foodAnalysisRepository: FoodAnalysisRepository | null = null;
    private static historyRepository: HistoryRepository | null = null;

    private static getStrategy(): RepositoryStrategy {
        return strategies[BACKEND_PROVIDER] || strategies.firebase;
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
            this.authRepository = this.getStrategy().auth();
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