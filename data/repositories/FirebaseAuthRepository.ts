import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged as onFirebaseAuthStateChanged,
    Unsubscribe,
    User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/user';

export class FirebaseAuthRepository implements AuthRepository {
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
        return onFirebaseAuthStateChanged(auth, (firebaseUser) => {
            const domainUser = this.mapFirebaseUserToDomain(firebaseUser);
            callback(domainUser);
        });
    }

    async signIn(email: string, password?: string): Promise<User | null> {
        // As a fallback for when mock auth is disabled, we call Google Sign-In.
        // A real email/password flow would be implemented here if needed.
        return this.signInWithGoogle();
    }

    async signInWithGoogle(): Promise<User | null> {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            return this.mapFirebaseUserToDomain(result.user);
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            return null;
        }
    }

    async signOut(): Promise<void> {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Error during sign-out:", error);
        }
    }
}