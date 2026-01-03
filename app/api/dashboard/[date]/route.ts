import { NextRequest, NextResponse } from 'next/server';
import { DashboardData } from '@/domain/entities/dashboard';


/**
 * GET /api/dashboard/[date]
 * Returns dashboard data for a specific date
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { date: string } }
) {
    try {
        const { verifyAuth } = await import('../../auth-middleware');
        await verifyAuth(req.headers.get('Authorization'));

        const { RepositoryFactory } = await import('@/data/RepositoryFactory');
        const dashboardRepository = RepositoryFactory.getDashboardRepository();

        const data = await dashboardRepository.getDashboardForDate(params.date);

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('[API] Dashboard GET error:', error);

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
