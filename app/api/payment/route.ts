import { NextResponse } from 'next/server';
import { PaymentData } from '../../../domain/entities/payment';
import { PaymentGatewayFactory } from '../_gateways/PaymentGatewayFactory';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const paymentData: PaymentData = body;

        // Validation could be added here

        // On the server, use the real gateway
        const paymentGateway = PaymentGatewayFactory.getInstance();
        const transaction = await paymentGateway.processPayment(paymentData);

        return NextResponse.json(transaction);
    } catch (error: any) {
        console.error('API Error /payment:', error);
        return NextResponse.json({ error: error.message || 'Payment processing failed' }, { status: 500 });
    }
}
