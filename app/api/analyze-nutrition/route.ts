import { NextRequest, NextResponse } from 'next/server';
import { GeminiNutritionAnalysisService } from '@/data/services/GeminiNutritionAnalysisService';
import { verifyAuth } from '../auth-middleware';
import { checkAiAccess } from '../feature-flag-check';
import { env } from '@/env';

export async function POST(req: NextRequest) {
    try {
        await verifyAuth(req.headers.get('Authorization'));

        const accessCheck = await checkAiAccess();
        if (accessCheck) return accessCheck;

        const { ingredientName, quantity, language } = await req.json();

        let service;

        if (env.GEMINI_API_KEY) {
            service = new GeminiNutritionAnalysisService(env.GEMINI_API_KEY);
        }
        // Note: OPENAI_API_KEY and DEEPSEEK_API_KEY are not in env schema
        // These would need to be added if you want to use them server-side

        if (!service) {
            return NextResponse.json({ error: 'No AI service configured on server' }, { status: 500 });
        }

        const info = await service.getNutritionalInfo(ingredientName, quantity, language);
        return NextResponse.json(info);
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
