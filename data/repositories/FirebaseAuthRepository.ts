import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged as onFirebaseAuthStateChanged,
    Unsubscribe,
    User as FirebaseUser,
    Auth
} from 'firebase/auth';
import { getAuth } from '../auth';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/user';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';

import { DataCacheManager } from '../infrastructure/DataCacheManager';

export class FirebaseAuthRepository implements AuthRepository {
    private auth: Auth | null;
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    constructor() {
        try {
            this.auth = getAuth();
        } catch (e) {
            console.warn("FirebaseAuthRepository: Authentication not initialized.", e);
            this.auth = null;
        }
    }

    private mapFirebaseUserToDomain(firebaseUser: FirebaseUser | null): User | null {
        if (!firebaseUser) {
            return null;
        }
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
        };
    }

    onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
        if (!this.auth) {
            callback(null);
            return () => { };
        }
        return onFirebaseAuthStateChanged(this.auth, (firebaseUser) => {
            const domainUser = this.mapFirebaseUserToDomain(firebaseUser);
            callback(domainUser);
        });
    }

    async signIn(email: string, password?: string): Promise<User | null> {
        return this.signInWithGoogle();
    }

    async signInWithGoogle(): Promise<User | null> {
        const key = 'signInWithGoogle';
        return this.concurrencyManager.run(key, async () => {
            if (!this.auth) {
                console.error("FirebaseAuthRepository: Cannot sign in, auth not initialized.");
                return null;
            }
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(this.auth, provider);
                // Invalidate idToken cache on new sign in
                this.dataCacheManager.invalidate('getIdToken');
                return this.mapFirebaseUserToDomain(result.user);
            } catch (error) {
                console.error("Error during Google sign-in:", error);
                return null;
            }
        });
    }

    async signOut(): Promise<void> {
        if (!this.auth) return;
        try {
            await this.auth.signOut();
            // Clear cache on sign out
            this.dataCacheManager.clear();
        } catch (error) {
            console.error("Error during sign-out:", error);
        }
    }

    async getIdToken(): Promise<string | null> {
        const key = 'getIdToken';
        const TOKEN_TTL = 5 * 60 * 1000; // 5 minutes
        return this.dataCacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                if (!this.auth || !this.auth.currentUser) return null;
                return await this.auth.currentUser.getIdToken();
            });
        }, TOKEN_TTL);
    }
}