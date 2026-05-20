import * as admin from 'firebase-admin';
import { getSupabaseClient } from '@/data/supabaseClient';
import { env } from '@/env';

const USE_MOCKS = env.NEXT_PUBLIC_BACKEND_PROVIDER === 'mock';

if (!USE_MOCKS && !admin.apps.length) {
    admin.initializeApp({
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

export interface AuthenticatedUser {
    uid: string;
    email?: string;
}

export interface AuthVerifier {
    verifyToken(token: string): Promise<AuthenticatedUser>;
}

class SupabaseAuthVerifier implements AuthVerifier {
    async verifyToken(token: string): Promise<AuthenticatedUser> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            console.error('[Auth] Supabase token verification failed:', error);
            throw new Error('Unauthorized: Invalid token');
        }

        return {
            uid: data.user.id,
            email: data.user.email ?? undefined,
        };
    }
}

class FirebaseAuthVerifier implements AuthVerifier {
    async verifyToken(token: string): Promise<AuthenticatedUser> {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return {
                uid: decodedToken.uid,
                email: decodedToken.email,
            };
        } catch (error) {
            console.error('[Auth] Firebase token verification failed:', error);
            throw new Error('Unauthorized: Invalid token');
        }
    }
}

class MockAuthVerifier implements AuthVerifier {
    async verifyToken(token: string): Promise<AuthenticatedUser> {
        void token;
        console.log('[Auth] Mock mode: skipping token verification');
        return { uid: 'mock-user-id', email: 'mock@example.com' };
    }
}

export function getAuthVerifier(): AuthVerifier {
    const provider = env.NEXT_PUBLIC_BACKEND_PROVIDER;

    if (provider === 'mock') {
        return new MockAuthVerifier();
    }

    if (provider === 'supabase') {
        return new SupabaseAuthVerifier();
    }

    return new FirebaseAuthVerifier();
}
