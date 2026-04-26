import { NextRequest, NextResponse } from 'next/server';
import { GeminiImageRecognitionService } from '@/data/services/GeminiImageRecognitionService';
import { verifyAuth } from '../auth-middleware';
import { checkAiAccess } from '../feature-flag-check';
import { env } from '@/env';

export async function POST(req: NextRequest) {
    try {
        await verifyAuth(req.headers.get('Authorization'));

        const accessCheck = await checkAiAccess();
        if (accessCheck) return accessCheck;

        const formData = await req.formData();
        const image = formData.get('image') as File;
        const language = formData.get('language') as string;
        const prompt = formData.get('prompt') as string;

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        let service;

        if (env.GEMINI_API_KEY) {
            service = new GeminiImageRecognitionService(env.GEMINI_API_KEY);
        }
        // Note: OPENAI_API_KEY and DEEPSEEK_API_KEY are not in env schema
        // These would need to be added if you want to use them server-side

        if (!service) {
            return NextResponse.json({ error: 'No AI service configured on server' }, { status: 500 });
        }

        // Convert File to Blob for the service
        const ingredients = await service.analyzeMealImage(image, language || 'en', prompt);
        return NextResponse.json(ingredients);
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
