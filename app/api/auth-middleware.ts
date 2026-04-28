import { getAuthVerifier, AuthenticatedUser } from '@/data/infrastructure/AuthVerifier';

/**
 * Verifies the ID token from the Authorization header.
 * Returns the decoded user information or throws an error.
 */
export async function verifyAuth(authHeader: string | null): Promise<AuthenticatedUser> {
    const verifier = getAuthVerifier();

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // In mock mode, we might allow missing headers for ease of testing
        // But the verifier expects a token. Let's provide a dummy one if it's mock.
        try {
            return await verifier.verifyToken('mock-token');
        } catch {
            console.error('[Auth] Missing or invalid Authorization header');
            throw new Error('Unauthorized: Missing or invalid token');
        }
    }

    const token = authHeader.split('Bearer ')[1];
    const verifier = getAuthVerifier();
    return await verifier.verifyToken(token);
}
