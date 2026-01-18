import { DashboardRepository } from '../domain/repositories/DashboardRepository';
import { ProfileRepository } from '../domain/repositories/ProfileRepository';
import { AuthRepository } from '../domain/repositories/AuthRepository';
import { FoodAnalysisRepository } from '../domain/repositories/FoodAnalysisRepository';
import { HistoryRepository } from '../domain/repositories/HistoryRepository';
import { FeatureFlagRepository } from '../domain/repositories/FeatureFlagRepository';
import { ModelConfigRepository } from '../domain/repositories/ModelConfigRepository';

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
import { LocalFeatureFlagRepository } from './repositories/LocalFeatureFlagRepository';
import { FirebaseFeatureFlagRepository } from './repositories/FirebaseFeatureFlagRepository';
import { FirebaseModelConfigRepository } from './repositories/FirebaseModelConfigRepository';
import { LocalModelConfigRepository } from './repositories/LocalModelConfigRepository';
import { env } from '../env';

type Provider = 'firebase' | 'supabase' | 'mock';

const BACKEND_PROVIDER = env.NEXT_PUBLIC_BACKEND_PROVIDER;

interface RepositoryStrategy {
    dashboard: () => DashboardRepository;
    profile: () => ProfileRepository;
    auth: () => AuthRepository;
    foodAnalysis: () => FoodAnalysisRepository;
    history: () => HistoryRepository;
    featureFlag: () => FeatureFlagRepository;
    modelConfig: () => ModelConfigRepository;
}

const strategies: Record<Provider, RepositoryStrategy> = {
    firebase: {
        dashboard: () => new FirestoreDashboardRepository(),
        profile: () => new FirestoreProfileRepository(),
        auth: () => new FirebaseAuthRepository(),
        foodAnalysis: () => new FirestoreFoodAnalysisRepository(),
        history: () => new FirestoreHistoryRepository(),
        featureFlag: () => new FirebaseFeatureFlagRepository(),
        modelConfig: () => new FirebaseModelConfigRepository(),
    },
    supabase: {
        dashboard: () => new SupabaseDashboardRepository(),
        profile: () => new SupabaseProfileRepository(),
        auth: () => new SupabaseAuthRepository(),
        foodAnalysis: () => new SupabaseFoodAnalysisRepository(),
        history: () => new SupabaseHistoryRepository(),
        featureFlag: () => new FirebaseFeatureFlagRepository(), // Remote Config can still be used with Supabase or we could use another one
        modelConfig: () => new FirebaseModelConfigRepository(),
    },
    mock: {
        dashboard: () => new LocalDashboardRepository(),
        profile: () => new LocalProfileRepository(),
        auth: () => new MockAuthRepository(),
        foodAnalysis: () => new LocalFoodAnalysisRepository(),
        history: () => new LocalHistoryRepository(),
        featureFlag: () => new LocalFeatureFlagRepository(),
        modelConfig: () => new LocalModelConfigRepository(),
    },
};

export class RepositoryFactory {
    private static dashboardRepository: DashboardRepository | null = null;
    private static profileRepository: ProfileRepository | null = null;
    private static authRepository: AuthRepository | null = null;
    private static foodAnalysisRepository: FoodAnalysisRepository | null = null;
    private static historyRepository: HistoryRepository | null = null;
    private static featureFlagRepository: FeatureFlagRepository | null = null;
    private static modelConfigRepository: ModelConfigRepository | null = null;

    private static getStrategy(): RepositoryStrategy {
        return strategies[BACKEND_PROVIDER ?? 'firebase'] || strategies.firebase;
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

    public static getFeatureFlagRepository(): FeatureFlagRepository {
        if (!this.featureFlagRepository) {
            this.featureFlagRepository = this.getStrategy().featureFlag();
        }
        return this.featureFlagRepository;
    }

    public static getModelConfigRepository(): ModelConfigRepository {
        if (!this.modelConfigRepository) {
            this.modelConfigRepository = this.getStrategy().modelConfig();
        }
        return this.modelConfigRepository;
    }
}