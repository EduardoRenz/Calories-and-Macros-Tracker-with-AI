import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/data/ServiceFactory';
import { checkAiAccess } from '../feature-flag-check';
import { checkRateLimit } from '../rate-limit';
import { getServerAiPriorityList } from '@/data/serverServiceConfig';
import { captureServerError } from '../_telemetry';
import { InvalidApiKeyException, RateLimitedException, InsufficientCreditsException } from '@/domain/exceptions/ImageAnalysisException';
import { AiAccessException } from '@/domain/exceptions/AiAccessException';

export async function POST(req: NextRequest) {
    let userId: string | undefined;
    try {
        const authHeader = req.headers.get('Authorization');

        // Unified AI access check for nutrition analysis feature
        const accessCheck = await checkAiAccess(authHeader, 'food_analysis');
        if (accessCheck.response) return accessCheck.response;
        userId = accessCheck.userId;

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
        void captureServerError(error, 'analyze_nutrition_api', req.headers.get('Authorization'), 'ai_analysis', userId);

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

        // Server AI keys come from env vars only, so an invalid key or an account
        // without credits here is a server misconfiguration - surface a generic
        // error instead of blaming the user's key.
        if (error instanceof InvalidApiKeyException || error instanceof InsufficientCreditsException) {
            return NextResponse.json(
                { error: 'AI service is temporarily unavailable. Please try again later.', code: 'SERVER_ERROR' },
                { status: 500 }
            );
        }

        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message, code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
