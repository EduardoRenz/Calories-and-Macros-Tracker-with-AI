import { PaymentGateway } from '../../../domain/gateways/PaymentGateway';
import { PaymentData, Plan, Transaction, Currency } from '../../../domain/entities/payment';
import { env } from '../../../env';
import { ConcurrencyRequestManager } from '../../../data/infrastructure/ConcurrencyRequestManager';

type AbacatePayFrequency = 'ONE_TIME' | 'MULTIPLE_PAYMENTS';

interface AbacatePayApiResponse<T> {
    data: T;
    error: unknown;
}

interface AbacatePayBillingProduct {
    id: string;
    externalId: string;
    quantity: number;
    name?: string;
    description?: string;
    price?: number;
}

interface AbacatePayBilling {
    id: string;
    url: string;
    status: 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'PAID' | 'REFUNDED';
    devMode: boolean;
    methods: Array<'PIX' | 'CARD'>;
    products: AbacatePayBillingProduct[];
    frequency: AbacatePayFrequency;
    amount: number;
    nextBilling: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export class AbacatePayPaymentGateway implements PaymentGateway {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.abacatepay.com/v1';
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
        // TODO: Obter plan pelo PlansRepository quando necessário
        throw new Error('[AbacatePayPaymentGateway] createCheckoutSession needs PlansRepository integration.');
    }

    async processPayment(data: PaymentData): Promise<Transaction> {
        // TODO: Obter plan pelo PlansRepository quando necessário
        throw new Error('[AbacatePayPaymentGateway] processPayment needs PlansRepository integration.');
    }

    private async listBillings(): Promise<AbacatePayBilling[]> {
        const urlPath = '/billing/list';
        const key = `GET:${urlPath}`;
        return this.concurrencyManager.run(key, async () => {
            const result = await this.request<AbacatePayApiResponse<AbacatePayBilling[]>>(urlPath, {
                method: 'GET',
            });

            console.log('[AbacatePayPaymentGateway] raw billing/list response:', JSON.stringify(result, null, 2));

            if (!result || !Array.isArray(result.data)) {
                console.warn('[AbacatePayPaymentGateway] billing/list returned unexpected payload.');
                return [];
            }

            return result.data;
        });
    }

    private async request<T>(
        path: string,
        options: { method: 'GET' | 'POST'; body?: unknown },
    ): Promise<T> {
        if (!this.apiKey) {
            throw new Error('AbacatePay API Key is missing');
        }

        const url = `${this.baseUrl}${path}`;
        const hasBody = options.body !== undefined;
        const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        console.log(`[AbacatePayPaymentGateway] [${requestId}] -> ${options.method} ${url}`);
        if (hasBody) {
            console.log(`[AbacatePayPaymentGateway] [${requestId}] request body keys: ${Object.keys(options.body as object).join(',')}`);
        }

        const response = await fetch(url, {
            method: options.method,
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: hasBody ? JSON.stringify(options.body) : undefined,
        });

        const responseText = await response.text();
        console.log(`[AbacatePayPaymentGateway] [${requestId}] <- ${response.status} ${response.statusText}`);

        if (!response.ok) {
            console.error(`[AbacatePayPaymentGateway] [${requestId}] error body: ${responseText.slice(0, 2000)}`);
            throw new Error(`AbacatePay API Error: ${response.status} ${responseText}`);
        }

        try {
            return JSON.parse(responseText) as T;
        } catch {
            console.error(`[AbacatePayPaymentGateway] [${requestId}] failed to parse JSON. body: ${responseText.slice(0, 2000)}`);
            throw new Error('AbacatePay API returned invalid JSON');
        }
    }

    private async createBilling(plan: Plan, userId: string): Promise<{ id: string; url: string }> {
        if (!this.apiKey) {
            throw new Error('AbacatePay API Key is missing');
        }

        // AbacatePay expects price in cents (integer, min 100)
        // Our plan.price is in standard units (e.g. 9.99)
        const priceInCents = Math.round(plan.price * 100);

        const origin = 'http://localhost:3000';

        const body = {
            frequency: 'ONE_TIME' as const,
            methods: ['PIX', 'CARD'] as const,
            products: [
                {
                    externalId: plan.id,
                    name: plan.name,
                    description: plan.description || plan.name,
                    quantity: 1,
                    price: priceInCents,
                },
            ],
            returnUrl: `${origin}/plans`,
            completionUrl: `${origin}/dashboard?payment_success=true`,
            externalId: `user:${userId}:plan:${plan.id}`,
            metadata: {
                userId,
                planId: plan.id,
            },
        };

        const result = await this.request<AbacatePayApiResponse<{ id: string; url: string }>>('/billing/create', {
            method: 'POST',
            body,
        });

        if (!result?.data?.id || !result?.data?.url) {
            console.error('[AbacatePayPaymentGateway] billing/create returned unexpected payload.');
            throw new Error('AbacatePay API returned invalid billing/create response');
        }

        return {
            id: result.data.id,
            url: result.data.url,
        };
    }
}
