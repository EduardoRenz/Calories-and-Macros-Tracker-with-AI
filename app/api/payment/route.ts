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
    } catch (error: unknown) {
        console.error('API Error /payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
