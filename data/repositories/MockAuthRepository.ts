import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/user';
import { Unsubscribe } from 'firebase/auth';
import { setMockUser } from '../auth';

// Simple in-memory store backed by localStorage
const STORAGE_KEY = 'mock_auth_user';

const isBrowser = typeof window !== 'undefined';

const getStoredUser = (): User | null => {
    if (!isBrowser) return null;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to restore mock user from local storage', e);
    }
    return null;
};

let currentUser: User | null = null;
const listeners: ((user: User | null) => void)[] = [];

export class MockAuthRepository implements AuthRepository {
    onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
        listeners.push(callback);

        // Load initial state on first listener if in browser
        if (isBrowser && currentUser === null) {
            currentUser = getStoredUser();
            if (currentUser) {
                setMockUser(currentUser);
            }
        }

        // Immediately call back with the current state synchronously
        callback(currentUser);

        // Return an unsubscribe function
        return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }

    private notifyListeners() {
        if (isBrowser) {
            if (currentUser) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        listeners.forEach(callback => callback(currentUser));
    }

    async signIn(email: string, password?: string): Promise<User | null> {
        const user: User = {
            uid: `mock-uid-${email.replace(/[@.]/g, '-')}`, // Create a stable UID from email
            email: email,
            displayName: email.split('@')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            photoURL: `https://ui-avatars.com/api/?name=${email}&background=random`,
        };
        currentUser = user;
        setMockUser(user);
        this.notifyListeners();
        return user;
    }

    async signInWithGoogle(): Promise<User | null> {
        const user: User = {
            uid: 'mock-google-user-123',
            email: 'user@example.com',
            displayName: 'Demo User',
            photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=AFFF34&color=101614',
        };
        currentUser = user;
        setMockUser(user);
        this.notifyListeners();
        return user;
    }

    async signOut(): Promise<void> {
        currentUser = null;
        setMockUser(null);
        this.notifyListeners();
    }

    async getIdToken(): Promise<string | null> {
        if (!currentUser) return null;
        return `mock-token-${currentUser.uid}`;
    }
}