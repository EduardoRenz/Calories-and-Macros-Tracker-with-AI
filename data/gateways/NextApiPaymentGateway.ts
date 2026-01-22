import { PaymentGateway } from '../../domain/gateways/PaymentGateway';
import { PaymentData, Transaction } from '../../domain/entities/payment';

export class NextApiPaymentGateway implements PaymentGateway {

    async createCheckoutSession(planId: string, userId: string): Promise<string> {
        throw new Error('Method not implemented in NextApiPaymentGateway. Use processPayment.');
    }

    async processPayment(data: PaymentData): Promise<Transaction> {
        const response = await fetch(`/api/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Payment processing failed');
        }

        const result = await response.json();
        // The API returns the transaction object directly
        return result;
    }
}
