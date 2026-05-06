import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/api/auth-middleware';
import { checkAiAccess } from '@/app/api/feature-flag-check';
import { checkPremiumAccess } from '@/app/api/subscription-check';
import { ServiceFactory } from '@/data/ServiceFactory';
import { getServerAiPriorityList } from '@/data/serverServiceConfig';

export async function POST(req: NextRequest) {
    try {
        await verifyAuth(req.headers.get('Authorization'));

        const accessCheck = await checkAiAccess();
        if (accessCheck) return accessCheck;

        const premiumCheck = await checkPremiumAccess(req.headers.get('Authorization'));
        if (premiumCheck) return premiumCheck;

        const { messages, context } = await req.json();

        // Get AI priority list from feature flag for premium users
        const priorityList = await getServerAiPriorityList();
        // Use Factory to get configured service (Gemini, DeepSeek, OpenAI)
        const service = await ServiceFactory.getChatAssistantService(priorityList);

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
