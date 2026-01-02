import * as admin from 'firebase-admin';
import { getSupabaseAdminClient } from '@/data/supabaseServer';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
const BACKEND_PROVIDER = (process.env.BACKEND_PROVIDER ?? 'firebase').toLowerCase();

if (!USE_MOCKS && !admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

export interface AuthenticatedUser {
    uid: string;
    email?: string;
}

/**
 * Verifies the ID token from the Authorization header.
 * Returns the decoded user information or throws an error.
 */
export async function verifyAuth(authHeader: string | null): Promise<AuthenticatedUser> {
    if (USE_MOCKS) {
        // In mock mode, we accept anything and return a mock user
        console.log('[Auth] Mock mode: skipping token verification');
        return { uid: 'mock-user-id', email: 'mock@example.com' };
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[Auth] Missing or invalid Authorization header');
        throw new Error('Unauthorized: Missing or invalid token');
    }

    const token = authHeader.split('Bearer ')[1];

    if (BACKEND_PROVIDER === 'supabase') {
        try {
            const supabase = getSupabaseAdminClient();
            const { data, error } = await supabase.auth.getUser(token);
            if (error || !data.user) {
                console.error('[Auth] Supabase token verification failed:', error);
                throw new Error('Unauthorized: Invalid token');
            }
            return {
                uid: data.user.id,
                email: data.user.email ?? undefined,
            };
        } catch (error) {
            console.error('[Auth] Supabase token verification failed:', error);
            throw new Error('Unauthorized: Invalid token');
        }
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };
    } catch (error) {
        console.error('[Auth] Token verification failed:', error);
        throw new Error('Unauthorized: Invalid token');
    }
}
