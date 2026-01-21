import { PaymentGateway } from '../../domain/gateways/PaymentGateway';
import { PaymentData, Plan, Transaction, Currency } from '../../domain/entities/payment';

export class NextApiPaymentGateway implements PaymentGateway {
    // No auth repository needed for public plans? 
    // Usually payments need user auth, but 'plans' might be public.
    // However, processPayment definitely needs user context, closely tied to Auth?
    // The previous implementation passed `userId` in `PaymentData`.
    // The `NextApiImageRecognitionService` injected `AuthRepository` to get the token.
    // Steps:
    // 1. fetch /api/plans
    // 2. fetch /api/payment (POST)

    async getPlans(language: string): Promise<Plan[]> {
        const response = await fetch(`/api/plans?lang=${language}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch plans: ${response.statusText}`);
        }

        const data = await response.json();

        return data.map((planProps: any) => {
            // Reconstruct Currency object from serialized data
            const currency = typeof planProps.currency === 'string'
                ? Currency.create(planProps.currency)
                : planProps.currency; // Assume it's already a Currency object if not a string

            return Plan.create({
                ...planProps,
                currency
            });
        });
    }

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
