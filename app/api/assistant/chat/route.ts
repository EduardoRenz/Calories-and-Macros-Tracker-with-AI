import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/api/auth-middleware';
import { ServiceFactory } from '@/data/ServiceFactory';

export async function POST(req: NextRequest) {
    try {
        await verifyAuth(req.headers.get('Authorization'));
        const { messages, context } = await req.json();

        // Use Factory to get configured service (Gemini, DeepSeek, OpenAI)
        const service = ServiceFactory.getChatAssistantService();

        if (!service) {
            return NextResponse.json({ error: 'No Chat AI service configured on server' }, { status: 500 });
        }

        const response = await service.sendMessage(messages, context);
        return NextResponse.json(response);
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
