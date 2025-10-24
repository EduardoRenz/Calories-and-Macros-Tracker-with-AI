import { auth as firebaseAuth } from './firebase';
import type { Auth, User as FirebaseUser } from 'firebase/auth';

// This flag is mirrored from RepositoryFactory to avoid circular dependencies.
const USE_MOCK_AUTH = true;

let mockCurrentUser: FirebaseUser | null = null;

export const setMockUser = (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null; } | null) => {
    if (user) {
        mockCurrentUser = {
            ...user,
        } as FirebaseUser;
    } else {
        mockCurrentUser = null;
    }
};

export const getAuth = (): Auth => {
    if (USE_MOCK_AUTH) {
        return {
            currentUser: mockCurrentUser,
        } as Auth;
    }
    return firebaseAuth;
};
