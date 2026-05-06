import { NextRequest, NextResponse } from 'next/server';
import { FoodAnalysisInput } from '@/domain/services/FoodAnalysisService';
import { ServiceFactory } from '@/data/ServiceFactory';
import { verifyAuth } from '../auth-middleware';
import { checkAiAccess } from '../feature-flag-check';
import { checkPremiumAccess } from '../subscription-check';
import { getServerAiPriorityList } from '@/data/serverServiceConfig';

export async function POST(req: NextRequest) {
    try {
        await verifyAuth(req.headers.get('Authorization'));

        const accessCheck = await checkAiAccess();
        if (accessCheck) return accessCheck;

        const premiumCheck = await checkPremiumAccess(req.headers.get('Authorization'));
        if (premiumCheck) return premiumCheck;

        const input: FoodAnalysisInput = await req.json();

        // Get AI priority list from feature flag for premium users
        const priorityList = await getServerAiPriorityList();
        const service = await ServiceFactory.getFoodAnalysisService(priorityList);

        if (!service) {
            return NextResponse.json({ error: 'No AI service configured on server' }, { status: 500 });
        }

        const report = await service.generateAnalysis(input);
        return NextResponse.json(report);
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
