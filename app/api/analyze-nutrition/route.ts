import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/data/ServiceFactory';
import { checkAiAccess } from '../feature-flag-check';
import { checkRateLimit } from '../rate-limit';
import { getServerAiPriorityList } from '@/data/serverServiceConfig';
import { captureServerError } from '../_telemetry';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');

        // Unified AI access check for nutrition analysis feature
        const accessCheck = await checkAiAccess(authHeader, 'food_analysis');
        if (accessCheck) return accessCheck;

        const rateLimitCheck = await checkRateLimit(authHeader, 'nutrition_analysis');
        if (rateLimitCheck) return rateLimitCheck;

        const { ingredientName, quantity, language } = await req.json();

        // Get AI priority list from feature flag for premium users
        const priorityList = await getServerAiPriorityList();
        const service = await ServiceFactory.getNutritionAnalysisService(priorityList);

        if (!service) {
            return NextResponse.json({ error: 'No AI service configured on server' }, { status: 500 });
        }

        const info = await service.getNutritionalInfo(ingredientName, quantity, language);
        return NextResponse.json(info);
    } catch (error: unknown) {
        console.error('API Error:', error);
        void captureServerError(error, 'analyze_nutrition_api', req.headers.get('Authorization'));
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
