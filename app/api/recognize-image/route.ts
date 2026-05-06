import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/data/ServiceFactory';
import { verifyAuth } from '../auth-middleware';
import { checkAiAccess } from '../feature-flag-check';
import { checkPremiumAccess } from '../subscription-check';
import { getServerAiPriorityList } from '@/data/serverServiceConfig';

export async function POST(req: NextRequest) {
    try {
        await verifyAuth(req.headers.get('Authorization'));

        const accessCheck = await checkAiAccess();
        if (accessCheck) return accessCheck;

        const premiumCheck = await checkPremiumAccess(req.headers.get('Authorization'));
        if (premiumCheck) return premiumCheck;

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
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
