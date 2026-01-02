import { NextRequest, NextResponse } from 'next/server';
import { GeminiNutritionAnalysisService } from '@/data/services/GeminiNutritionAnalysisService';
import { OpenAINutritionAnalysisService } from '@/data/services/OpenAINutritionAnalysisService';
import { DeepSeekNutritionAnalysisService } from '@/data/services/DeepSeekNutritionAnalysisService';
import { verifyAuth } from '../auth-middleware';

export async function POST(req: NextRequest) {
    try {
        await verifyAuth(req.headers.get('Authorization'));
        const { ingredientName, quantity, language } = await req.json();

        let service;

        if (process.env.GEMINI_API_KEY) {
            service = new GeminiNutritionAnalysisService(process.env.GEMINI_API_KEY);
        } else if (process.env.OPENAI_API_KEY) {
            service = new OpenAINutritionAnalysisService(process.env.OPENAI_API_KEY);
        } else if (process.env.DEEPSEEK_API_KEY) {
            service = new DeepSeekNutritionAnalysisService(process.env.DEEPSEEK_API_KEY);
        }

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
