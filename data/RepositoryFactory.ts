import { DashboardRepository } from '../domain/repositories/DashboardRepository';
import { ProfileRepository } from '../domain/repositories/ProfileRepository';
import { AuthRepository } from '../domain/repositories/AuthRepository';

import { LocalDashboardRepository } from './repositories/LocalDashboardRepository';
import { LocalProfileRepository } from './repositories/LocalProfileRepository';
import { FirestoreDashboardRepository } from './repositories/FirestoreDashboardRepository';
import { FirestoreProfileRepository } from './repositories/FirestoreProfileRepository';
import { FirebaseAuthRepository } from './repositories/FirebaseAuthRepository';
import { MockAuthRepository } from './repositories/MockAuthRepository';

// Switch this flag to false to use local data instead of Firestore
const USE_FIRESTORE = true;
const USE_MOCK_AUTH = true;

export class RepositoryFactory {
    public static getDashboardRepository(): DashboardRepository {
        if (USE_FIRESTORE) {
            return new FirestoreDashboardRepository();
        }
        return new LocalDashboardRepository();
    }

    public static getProfileRepository(): ProfileRepository {
        if (USE_FIRESTORE) {
            return new FirestoreProfileRepository();
        }
        return new LocalProfileRepository();
    }

    public static getAuthRepository(): AuthRepository {
        if (USE_MOCK_AUTH) {
            return new MockAuthRepository();
        }
        return new FirebaseAuthRepository();
    }
}