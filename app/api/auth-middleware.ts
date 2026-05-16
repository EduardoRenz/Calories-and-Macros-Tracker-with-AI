import { getAuthVerifier, AuthenticatedUser } from '@/data/infrastructure/AuthVerifier';

/**
 * Verifies the ID token from the Authorization header.
 * Returns the decoded user information or throws an error.
 */
export async function verifyAuth(authHeader: string | null): Promise<AuthenticatedUser> {
    const verifier = getAuthVerifier();

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[Auth] Missing or malformed Authorization header:', authHeader ? 'Present but no Bearer prefix' : 'Missing');
        throw new Error('Unauthorized: Missing or invalid token');
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
        console.error('[Auth] Empty or invalid token value:', token);
        throw new Error('Unauthorized: Invalid token');
    }

    // Basic JWT format validation (should have 3 parts separated by dots)
    const jwtParts = token.split('.');
    if (jwtParts.length !== 3) {
        console.error(`[Auth] Invalid JWT format: expected 3 parts, got ${jwtParts.length}`);
        throw new Error('Unauthorized: Malformed token');
    }

    return await verifier.verifyToken(token);
}
