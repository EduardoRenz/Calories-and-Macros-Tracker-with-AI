import { NextRequest, NextResponse } from 'next/server';
import { GeminiImageRecognitionService } from '@/data/services/GeminiImageRecognitionService';
import { OpenAIImageRecognitionService } from '@/data/services/OpenAIImageRecognitionService';
import { DeepSeekImageRecognitionService } from '@/data/services/DeepSeekImageRecognitionService';
import { verifyAuth } from '../auth-middleware';

export async function POST(req: NextRequest) {
    try {
        await verifyAuth(req.headers.get('Authorization'));
        const formData = await req.formData();
        const image = formData.get('image') as File;
        const language = formData.get('language') as string;

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        let service;

        if (process.env.GEMINI_API_KEY) {
            service = new GeminiImageRecognitionService(process.env.GEMINI_API_KEY);
        } else if (process.env.OPENAI_API_KEY) {
            service = new OpenAIImageRecognitionService(process.env.OPENAI_API_KEY);
        } else if (process.env.DEEPSEEK_API_KEY) {
            service = new DeepSeekImageRecognitionService(process.env.DEEPSEEK_API_KEY);
        }

        if (!service) {
            return NextResponse.json({ error: 'No AI service configured on server' }, { status: 500 });
        }

        // Convert File to Blob for the service
        const ingredients = await service.analyzeMealImage(image, language || 'en');
        return NextResponse.json(ingredients);
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
