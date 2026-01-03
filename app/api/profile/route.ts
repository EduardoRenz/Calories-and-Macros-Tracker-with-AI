import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth-middleware';
import { RepositoryFactory } from '@/data/RepositoryFactory';
import { UserProfile } from '@/domain/entities/profile';


/**
 * GET /api/profile
 * Returns the user profile for the authenticated user
 */
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req.headers.get('Authorization'));

        // Get the appropriate repository (Firebase/Supabase based on BACKEND_PROVIDER)
        const profileRepository = RepositoryFactory.getProfileRepository();
        const profile = await profileRepository.getProfile();

        return NextResponse.json(profile);
    } catch (error: unknown) {
        console.error('[API] Profile GET error:', error);

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/profile
 * Updates the user profile for the authenticated user
 */
export async function PUT(req: NextRequest) {
    try {
        const user = await verifyAuth(req.headers.get('Authorization'));

        const profile: UserProfile = await req.json();

        const profileRepository = RepositoryFactory.getProfileRepository();
        await profileRepository.updateProfile(profile);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('[API] Profile PUT error:', error);

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
