import { NextResponse } from 'next/server';
import { PaymentGatewayFactory } from '../_gateways/PaymentGatewayFactory';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'en';

    try {
        // On the server, this should return the real AbacatePayGateway (or Mock if configured)
        const paymentGateway = PaymentGatewayFactory.getInstance();
        const plans = await paymentGateway.getPlans(language);

        // Serialize plans (Plan.toJSON() or just default serialization)
        // Plan class has toJSON() method which returns PlanProps
        return NextResponse.json(plans);
    } catch (error) {
        console.error('API Error /plans:', error);
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}
