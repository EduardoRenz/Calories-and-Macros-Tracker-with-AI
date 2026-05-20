import {
    CancelSubscriptionInput,
    HostedSubscriptionCheckoutInput,
    HostedSubscriptionCheckoutResult,
    PaymentGateway,
} from '../../domain/gateways/PaymentGateway';
import { PaymentData, Transaction } from '../../domain/entities/payment';
import { getSupabaseClient } from '../supabaseClient';

export class NextApiPaymentGateway implements PaymentGateway {

    async createCheckoutSession(): Promise<string> {
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

    async createHostedSubscriptionCheckout(input: HostedSubscriptionCheckoutInput): Promise<HostedSubscriptionCheckoutResult> {
        const { data: { session } } = await getSupabaseClient().auth.getSession();
        const token = session?.access_token;

        const response = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                planId: input.planCode,
                successUrl: input.successUrl,
                cancelUrl: input.cancelUrl,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Checkout creation failed');
        }

        const result = await response.json() as {
            checkoutUrl: string;
            checkoutSessionId: string;
        };

        return {
            checkoutUrl: result.checkoutUrl,
            externalCheckoutId: result.checkoutSessionId,
            amount: input.providerPriceAmount,
            status: 'created',
        };
    }

    async cancelSubscriptionAtPeriodEnd(input: CancelSubscriptionInput): Promise<void> {
        const { data: { session } } = await getSupabaseClient().auth.getSession();
        const token = session?.access_token;

        const response = await fetch('/api/billing/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                subscriptionId: input.subscriptionId,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Cancellation failed');
        }
    }
}
