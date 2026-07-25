import { NextResponse } from 'next/server';
import { verifyAuth } from './auth-middleware';
import { RateLimitService } from '@/data/infrastructure/RateLimitService';

export async function checkRateLimit(
    authHeader: string | null,
    category: string
): Promise<NextResponse | null> {
    const user = await verifyAuth(authHeader);
    const service = RateLimitService.getInstance();
    const result = service.check(user.uid, category);

    if (result.allowed) {
        return null;
    }

    const retrySeconds = Math.ceil(result.resetMs / 1000);

    return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${retrySeconds} seconds before trying again.` },
        {
            status: 429,
            headers: {
                'Retry-After': String(retrySeconds),
                'X-RateLimit-Limit': String(result.maxRequests),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(retrySeconds),
            },
        }
    );
}
