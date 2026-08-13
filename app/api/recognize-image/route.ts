import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/data/ServiceFactory';
import { checkAiAccess } from '../feature-flag-check';
import { checkRateLimit } from '../rate-limit';
import { getServerAiPriorityList } from '@/data/serverServiceConfig';
import { captureServerError } from '../_telemetry';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        const accessCheck = await checkAiAccess(authHeader, 'quick_meal_photo');
        if (accessCheck) return accessCheck;

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
        void captureServerError(error, 'recognize_image_api', req.headers.get('Authorization'));
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
