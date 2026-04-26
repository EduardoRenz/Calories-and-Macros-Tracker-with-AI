import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const url = new URL('/api/billing/checkout', request.url);

    return NextResponse.json(
        {
            error: 'The generic payment route is deprecated for subscriptions. Use /api/billing/checkout.',
            checkoutEndpoint: url.toString(),
        },
        { status: 410 },
    );
}
