import { NextRequest, NextResponse } from 'next/server';
import { FoodAnalysisInput } from '@/domain/services/FoodAnalysisService';
import { ServiceFactory } from '@/data/ServiceFactory';
import { checkAiAccess } from '../feature-flag-check';
import { checkRateLimit } from '../rate-limit';
import { getServerAiPriorityList } from '@/data/serverServiceConfig';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');

        // Unified AI access check for food analysis feature
        const accessCheck = await checkAiAccess(authHeader, 'food_analysis');
        if (accessCheck) return accessCheck;

        const rateLimitCheck = await checkRateLimit(authHeader, 'food_analysis');
        if (rateLimitCheck) return rateLimitCheck;

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
