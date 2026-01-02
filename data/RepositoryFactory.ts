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

// Switch these flags to false to use local data/auth to avoid configuration errors
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
const BACKEND_PROVIDER = (process.env.BACKEND_PROVIDER ?? 'firebase').toLowerCase();
const USE_SUPABASE = BACKEND_PROVIDER === 'supabase';

export class RepositoryFactory {
    private static dashboardRepository: DashboardRepository | null = null;
    private static profileRepository: ProfileRepository | null = null;
    private static authRepository: AuthRepository | null = null;
    private static foodAnalysisRepository: FoodAnalysisRepository | null = null;
    private static historyRepository: HistoryRepository | null = null;

    public static getDashboardRepository(): DashboardRepository {
        if (!this.dashboardRepository) {
            if (!USE_MOCKS) {
                this.dashboardRepository = USE_SUPABASE ? new SupabaseDashboardRepository() : new FirestoreDashboardRepository();
            } else {
                this.dashboardRepository = new LocalDashboardRepository();
            }
        }
        return this.dashboardRepository;
    }

    public static getProfileRepository(): ProfileRepository {
        if (!this.profileRepository) {
            if (!USE_MOCKS) {
                this.profileRepository = USE_SUPABASE ? new SupabaseProfileRepository() : new FirestoreProfileRepository();
            } else {
                this.profileRepository = new LocalProfileRepository();
            }
        }
        return this.profileRepository;
    }

    public static getAuthRepository(): AuthRepository {
        if (!this.authRepository) {
            if (!USE_MOCKS) {
                this.authRepository = USE_SUPABASE ? new SupabaseAuthRepository() : new FirebaseAuthRepository();
            } else {
                this.authRepository = new MockAuthRepository();
            }
        }
        return this.authRepository;
    }

    public static getFoodAnalysisRepository(): FoodAnalysisRepository {
        if (!this.foodAnalysisRepository) {
            if (!USE_MOCKS) {
                this.foodAnalysisRepository = USE_SUPABASE ? new SupabaseFoodAnalysisRepository() : new FirestoreFoodAnalysisRepository();
            } else {
                this.foodAnalysisRepository = new LocalFoodAnalysisRepository();
            }
        }
        return this.foodAnalysisRepository;
    }

    public static getHistoryRepository(): HistoryRepository {
        if (!this.historyRepository) {
            if (!USE_MOCKS) {
                this.historyRepository = USE_SUPABASE ? new SupabaseHistoryRepository() : new FirestoreHistoryRepository();
            } else {
                this.historyRepository = new LocalHistoryRepository();
            }
        }
        return this.historyRepository;
    }
}