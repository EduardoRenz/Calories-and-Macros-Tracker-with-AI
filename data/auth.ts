import { auth as firebaseAuth } from './firebase';
import type { Auth, User as FirebaseUser } from 'firebase/auth';

// This flag is mirrored from RepositoryFactory to avoid circular dependencies.
const BACKEND_PROVIDER = (
    process.env.BACKEND_PROVIDER ??
    process.env.NEXT_PUBLIC_BACKEND_PROVIDER ??
    'firebase'
).toLowerCase();
const IS_MOCK = BACKEND_PROVIDER === 'mock';

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
    if (IS_MOCK) {
        return {
            currentUser: mockCurrentUser,
        } as Auth;
    }
    return firebaseAuth as Auth;
};