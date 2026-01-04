import { User } from '../entities/user';

export interface AuthRepository {
    onAuthStateChanged(callback: (user: User | null) => void): void;
    signIn(email: string, password?: string): Promise<User | null>;
    signInWithGoogle(): Promise<User | null>;
    signOut(): Promise<void>;
    getIdToken(): Promise<string | null>;
}