import { NextRequest, NextResponse } from 'next/server';
import { FoodAnalysisInput } from '@/domain/services/FoodAnalysisService';
import { ServiceFactory } from '@/data/ServiceFactory';
import { checkAiAccess } from '../feature-flag-check';
import { checkRateLimit } from '../rate-limit';
import { getServerAiPriorityList } from '@/data/serverServiceConfig';
import { captureServerError } from '../_telemetry';
import { InvalidApiKeyException, RateLimitedException } from '@/domain/exceptions/ImageAnalysisException';
import { AiAccessException } from '@/domain/exceptions/AiAccessException';

export async function POST(req: NextRequest) {
    let userId: string | undefined;
    try {
        const authHeader = req.headers.get('Authorization');

        // Unified AI access check for food analysis feature
        const accessCheck = await checkAiAccess(authHeader, 'food_analysis');
        if (accessCheck.response) return accessCheck.response;
        userId = accessCheck.userId;

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
        void captureServerError(error, 'analyze_food_api', req.headers.get('Authorization'), 'ai_analysis', userId);

        // Expected access outcomes surface with their original code so the client
        // can show the right message without inspecting the message text.
        if (error instanceof AiAccessException) {
            return NextResponse.json(
                { error: error.message, code: error.code },
                { status: 403 }
            );
        }

        if (error instanceof RateLimitedException) {
            return NextResponse.json({ error: error.message, code: error.code }, { status: 429 });
        }

        // Server AI keys come from env vars only, so an invalid key here is a server
        // misconfiguration - surface a generic error instead of blaming the user's key.
        if (error instanceof InvalidApiKeyException) {
            return NextResponse.json(
                { error: 'AI service is temporarily unavailable. Please try again later.', code: 'SERVER_ERROR' },
                { status: 500 }
            );
        }

        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message, code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
