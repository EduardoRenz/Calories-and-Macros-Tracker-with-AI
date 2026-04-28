import { ConcurrencyRequestManager } from '../../../data/infrastructure/ConcurrencyRequestManager';
import {
    CancelSubscriptionInput,
    HostedSubscriptionCheckoutInput,
    HostedSubscriptionCheckoutResult,
    PaymentGateway,
} from '../../../domain/gateways/PaymentGateway';
import { Currency, PaymentData, Transaction } from '../../../domain/entities/payment';
import { env } from '../../../env';

interface AbacatePayCheckoutItem {
    id: string;
    quantity: number;
}

interface AbacatePayApiResponse<T> {
    data: T | null;
    error: string | null;
    success?: boolean;
}

interface AbacatePaySubscriptionCheckout {
    id: string;
    externalId?: string | null;
    url: string;
    amount: number;
    status: 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'PAID' | 'REFUNDED';
    items: AbacatePayCheckoutItem[];
}

export class AbacatePayPaymentGateway implements PaymentGateway {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.abacatepay.com/v2';
    private readonly concurrencyManager = new ConcurrencyRequestManager();

    private static instance: AbacatePayPaymentGateway | null = null;

    private constructor() {
        if (!env.ABACATE_PAY_API_KEY) {
            console.warn('ABACATE_PAY_API_KEY is not set. AbacatePayGateway will fail requests.');
            this.apiKey = '';
        } else {
            this.apiKey = env.ABACATE_PAY_API_KEY;
        }
    }

    static getInstance(): PaymentGateway {
        if (!this.instance) {
            this.instance = new AbacatePayPaymentGateway();
        }
        return this.instance;
    }

    async createCheckoutSession(planId: string, userId: string): Promise<string> {
        return `billing:${userId}:${planId}`;
    }

    async processPayment(data: PaymentData): Promise<Transaction> {
        return {
            id: `billing:${data.userId}:${data.planId}`,
            userId: data.userId,
            planId: data.planId,
            amount: 0,
            currency: Currency.BRL(),
            status: 'pending',
            date: new Date(),
            paymentMethod: data.paymentMethod,
        };
    }

    async createHostedSubscriptionCheckout(input: HostedSubscriptionCheckoutInput): Promise<HostedSubscriptionCheckoutResult> {
        const requestKey = `abacatepay:subscription-checkout:${input.userId}:${input.planCode}`;

        return this.concurrencyManager.run(requestKey, async () => {
            const externalId = `${input.userId}:${input.planCode}:${Date.now()}`;
            const payload = {
                items: [
                    {
                        id: input.providerProductId,
                        quantity: 1,
                    },
                ],
                methods: ['CARD'],
                returnUrl: input.cancelUrl,
                completionUrl: input.successUrl,
                externalId,
                metadata: {
                    userId: input.userId,
                    planCode: input.planCode,
                    currency: input.currency,
                    expectedAmount: input.providerPriceAmount,
                    customerEmail: input.customerEmail,
                },
                ...(input.customerId ? { customerId: input.customerId } : {}),
            };

            const response = await this.request<AbacatePaySubscriptionCheckout>('/subscriptions/create', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!response.data?.url || !response.data.id) {
                throw new Error('[AbacatePayPaymentGateway] Checkout response did not include URL or ID.');
            }

            return {
                checkoutUrl: response.data.url,
                externalCheckoutId: response.data.id,
                amount: response.data.amount,
                status: response.data.status,
            };
        });
    }

    async cancelSubscriptionAtPeriodEnd(input: CancelSubscriptionInput): Promise<void> {
        const requestKey = `abacatepay:cancel-subscription:${input.providerSubscriptionId}`;

        await this.concurrencyManager.run(requestKey, async () => {
            await this.request<unknown>('/subscriptions/cancel', {
                method: 'POST',
                body: JSON.stringify({
                    id: input.providerSubscriptionId,
                    cancelPolicy: 'END_OF_PERIOD',
                    metadata: {
                        userId: input.userId,
                        subscriptionId: input.subscriptionId,
                    },
                }),
            });
        });
    }

    private async request<T>(path: string, init: RequestInit): Promise<AbacatePayApiResponse<T>> {
        if (!this.apiKey) {
            throw new Error('[AbacatePayPaymentGateway] Missing ABACATE_PAY_API_KEY.');
        }

        const response = await fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...init.headers,
            },
        });

        const payload = await response.json().catch(() => null) as AbacatePayApiResponse<T> | null;

        if (!response.ok) {
            const providerMessage = payload?.error || response.statusText;
            throw new Error(`[AbacatePayPaymentGateway] Provider request failed (${response.status}): ${providerMessage}`);
        }

        if (!payload) {
            throw new Error('[AbacatePayPaymentGateway] Provider returned an empty response.');
        }

        if (payload.error) {
            throw new Error(`[AbacatePayPaymentGateway] Provider returned an error: ${payload.error}`);
        }

        return payload;
    }
}
