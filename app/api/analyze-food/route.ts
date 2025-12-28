import { NextRequest, NextResponse } from 'next/server';
import { FoodAnalysisInput } from '@/domain/services/FoodAnalysisService';
import { GeminiFoodAnalysisService } from '@/data/services/GeminiFoodAnalysisService';
import { OpenAIFoodAnalysisService } from '@/data/services/OpenAIFoodAnalysisService';
import { DeepSeekFoodAnalysisService } from '@/data/services/DeepSeekFoodAnalysisService';

export async function POST(req: NextRequest) {
    try {
        const input: FoodAnalysisInput = await req.json();

        // On the server, we use environment variables.
        // We prioritize Gemini if available, or follow a similar logic to ServiceFactory but server-side.

        let service;

        if (process.env.GEMINI_API_KEY) {
            service = new GeminiFoodAnalysisService(process.env.GEMINI_API_KEY);
        } else if (process.env.OPENAI_API_KEY) {
            service = new OpenAIFoodAnalysisService(process.env.OPENAI_API_KEY);
        } else if (process.env.DEEPSEEK_API_KEY) {
            service = new DeepSeekFoodAnalysisService(process.env.DEEPSEEK_API_KEY);
        }

        if (!service) {
            return NextResponse.json({ error: 'No AI service configured on server' }, { status: 500 });
        }

        const report = await service.generateAnalysis(input);
        return NextResponse.json(report);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
