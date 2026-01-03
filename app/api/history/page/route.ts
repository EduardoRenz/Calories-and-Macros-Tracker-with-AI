import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/history/page
 * Returns paginated daily history
 */
export async function POST(req: NextRequest) {
    try {
        const { verifyAuth } = await import('../../auth-middleware');
        await verifyAuth(req.headers.get('Authorization'));

        const body = await req.json();
        const { startDate, endDate, pageSize, cursor } = body as {
            startDate: string;
            endDate: string;
            pageSize: number;
            cursor?: string | null;
        };

        if (!startDate || !endDate || !pageSize) {
            return NextResponse.json(
                { error: 'startDate, endDate, and pageSize are required' },
                { status: 400 }
            );
        }

        const { RepositoryFactory } = await import('@/data/RepositoryFactory');
        const historyRepository = RepositoryFactory.getHistoryRepository();

        const data = await historyRepository.getDailyHistoryPage({
            startDate,
            endDate,
            pageSize,
            cursor,
        });

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('[API] History page error:', error);

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
