import { DashboardRepository } from '../domain/repositories/DashboardRepository';
import { ProfileRepository } from '../domain/repositories/ProfileRepository';
import { AuthRepository } from '../domain/repositories/AuthRepository';
import { FoodAnalysisRepository } from '../domain/repositories/FoodAnalysisRepository';

import { LocalDashboardRepository } from './repositories/LocalDashboardRepository';
import { LocalProfileRepository } from './repositories/LocalProfileRepository';
import { LocalFoodAnalysisRepository } from './repositories/LocalFoodAnalysisRepository';
import { FirestoreDashboardRepository } from './repositories/FirestoreDashboardRepository';
import { FirestoreProfileRepository } from './repositories/FirestoreProfileRepository';
import { FirestoreFoodAnalysisRepository } from './repositories/FirestoreFoodAnalysisRepository';
import { FirebaseAuthRepository } from './repositories/FirebaseAuthRepository';
import { MockAuthRepository } from './repositories/MockAuthRepository';

// Switch these flags to false to use local data/auth to avoid configuration errors
const USE_MOCKS = process.env.USE_MOCKS === 'true';


export class RepositoryFactory {
    public static getDashboardRepository(): DashboardRepository {
        if (!USE_MOCKS) {
            return new FirestoreDashboardRepository();
        }
        return new LocalDashboardRepository();
    }

    public static getProfileRepository(): ProfileRepository {
        if (!USE_MOCKS) {
            return new FirestoreProfileRepository();
        }
        return new LocalProfileRepository();
    }

    public static getAuthRepository(): AuthRepository {
        if (!USE_MOCKS) {
            return new FirebaseAuthRepository();
        }
        return new MockAuthRepository();
    }

    public static getFoodAnalysisRepository(): FoodAnalysisRepository {
        if (!USE_MOCKS) {
            return new FirestoreFoodAnalysisRepository();
        }
        return new LocalFoodAnalysisRepository();
    }
}