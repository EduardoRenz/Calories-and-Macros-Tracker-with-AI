import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/food-analysis/range
 * Returns dashboard data for a date range (used for food analysis)
 */
export async function POST(req: NextRequest) {
    try {
        const { verifyAuth } = await import('../../auth-middleware');
        await verifyAuth(req.headers.get('Authorization'));

        const body = await req.json();
        const { startDate, endDate } = body as {
            startDate: string;
            endDate: string;
        };

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'startDate and endDate are required' },
                { status: 400 }
            );
        }

        const { RepositoryFactory } = await import('@/data/RepositoryFactory');
        const foodAnalysisRepository = RepositoryFactory.getFoodAnalysisRepository();

        const data = await foodAnalysisRepository.getDashboardDataForRange(startDate, endDate);

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('[API] Food analysis range error:', error);

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
