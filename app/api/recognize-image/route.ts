import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/data/ServiceFactory';
import { checkAiAccess } from '../feature-flag-check';
import { checkRateLimit } from '../rate-limit';
import { getServerAiPriorityList } from '@/data/serverServiceConfig';
import { captureServerError } from '../_telemetry';
import { EmptyAnalysisResultException, ImageTooLargeException, InvalidApiKeyException, InsufficientCreditsException } from '@/domain/exceptions/ImageAnalysisException';

export async function POST(req: NextRequest) {
    let userId: string | undefined;
    try {
        const authHeader = req.headers.get('Authorization');
        const accessCheck = await checkAiAccess(authHeader, 'quick_meal_photo');
        if (accessCheck.response) return accessCheck.response;
        userId = accessCheck.userId;

        const rateLimitCheck = await checkRateLimit(authHeader, 'image_recognition');
        if (rateLimitCheck) return rateLimitCheck;

        const formData = await req.formData();
        const image = formData.get('image') as File;
        const language = formData.get('language') as string;
        const prompt = formData.get('prompt') as string;

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Get AI priority list from feature flag for premium users
        const priorityList = await getServerAiPriorityList();
        const service = await ServiceFactory.getImageRecognitionService(priorityList);

        if (!service) {
            return NextResponse.json({ error: 'No AI service configured on server' }, { status: 500 });
        }

        // Convert File to Blob for the service
        const ingredients = await service.analyzeMealImage(image, language || 'en', prompt);
        return NextResponse.json(ingredients);
    } catch (error: unknown) {
        console.error('API Error:', error);
        void captureServerError(error, 'recognize_image_api', req.headers.get('Authorization'), 'ai_analysis', userId);

        // Server AI keys come from env vars only, so an invalid key or an account
        // without credits here is a server misconfiguration - surface a generic
        // error instead of blaming the user's key.
        if (error instanceof InvalidApiKeyException || error instanceof InsufficientCreditsException) {
            return NextResponse.json(
                { error: 'AI service is temporarily unavailable. Please try again later.', code: 'SERVER_ERROR' },
                { status: 500 }
            );
        }

        if (error instanceof ImageTooLargeException) {
            return NextResponse.json({ error: error.message, code: error.code }, { status: 413 });
        }

        // No provider recognized any food: return an empty list so the client can
        // present the "no food identified" outcome.
        if (error instanceof EmptyAnalysisResultException) {
            return NextResponse.json([]);
        }

        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message, code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
