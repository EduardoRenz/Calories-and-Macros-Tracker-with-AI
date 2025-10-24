import { User } from '../entities/user';
import type { Unsubscribe } from 'firebase/auth';

export interface AuthRepository {
    onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
    signIn(email: string, password?: string): Promise<User | null>;
    signInWithGoogle(): Promise<User | null>;
    signOut(): Promise<void>;
}