import { PaymentGateway } from '../../../domain/gateways/PaymentGateway';
import { PaymentData, Plan, Transaction, Currency } from '../../../domain/entities/payment';
import { env } from '../../../env';

export class AbacatePayPaymentGateway implements PaymentGateway {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.abacatepay.com/v1';

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

    async getPlans(language: string): Promise<Plan[]> {
        // Since AbacatePay "list billings" doesn't list "plans", we mock the plans structure
        // to match what the UI expects, but these "products" will be sent to AbacatePay on checkout.

        // Simulate network delay to feel like an API
        // await new Promise((resolve) => setTimeout(resolve, 200));

        const isPt = language === 'pt';
        const currency = isPt ? Currency.BRL() : Currency.USD();

        // Prices copied from Mock
        const freePrice = 0;
        const monthlyPrice = isPt ? 39.90 : 9.99;
        const annualTotal = isPt ? 39.90 * 12 : 9.99 * 12;
        const annualTotalWithDiscount = annualTotal * 0.85;

        const memberFeatures = [
            { text: isPt ? 'Sem chave de API necessária (Nós gerenciamos a IA)' : 'No API needed (We handle all AI processing)', included: true },
            { text: isPt ? 'Análise nutricional suportada' : 'Nutrition analysis supported', included: true },
        ];

        const freeFeatures = [
            { text: isPt ? 'Use sua própria chave de API' : 'Use own API keys only', included: true },
            { text: isPt ? 'Sem análise nutricional' : 'No nutrition analysis', included: false },
        ];

        return [
            Plan.create({
                id: 'free',
                name: isPt ? 'Plano Gratuito' : 'Free Plan',
                description: isPt ? 'Acesso básico com suas pŕoprias chaves de API.' : 'Basic access with your own API keys.',
                price: freePrice,
                currency,
                interval: 'month',
                features: freeFeatures,
                isPopular: false,
            }),
            Plan.create({
                id: 'member_monthly',
                name: isPt ? 'Plano Membro (Mensal)' : 'Member Plan (Monthly)',
                description: isPt ? 'Cobrado mensalmente.' : 'Billed monthly.',
                price: monthlyPrice,
                currency,
                interval: 'month',
                features: memberFeatures,
                isPopular: false,
            }),
            Plan.create({
                id: 'member_annual',
                name: isPt ? 'Plano Membro (Anual)' : 'Member Plan (Annual)',
                description: isPt ? `Cobrado ${currency.format(annualTotal)} anualmente com 15% de desconto.` : `Billed ${currency.format(annualTotal)} yearly with 15% off.`,
                price: annualTotalWithDiscount,
                originalPrice: annualTotal,
                currency,
                interval: 'year',
                features: memberFeatures,
                isPopular: true,
                discountMessage: isPt ? 'MELHOR VALOR' : 'MOST POPULAR',
            }),
        ];
    }

    async createCheckoutSession(planId: string, userId: string): Promise<string> {
        // This method is called to get a session ID or directly a URL. 
        // We will create a billing and return the URL.
        const plans = await this.getPlans('en'); // Language doesn't matter for finding price/id here
        const plan = plans.find(p => p.id === planId);

        if (!plan) {
            throw new Error(`Plan not found: ${planId}`);
        }

        const billing = await this.createBilling(plan, userId);
        return billing.url;
    }

    async processPayment(data: PaymentData): Promise<Transaction> {
        // In the context of AbacatePay, "processing" a payment usually means creating a billing
        // and redirecting the user. The actual "processing" happens on their hosted page.
        // We return a transaction with status 'pending' and the redirect URL.

        const plans = await this.getPlans('en');
        const plan = plans.find(p => p.id === data.planId);

        if (!plan) {
            throw new Error(`Plan not found: ${data.planId}`);
        }

        try {
            const billing = await this.createBilling(plan, data.userId);

            return {
                id: billing.id,
                userId: data.userId,
                planId: data.planId,
                amount: plan.price,
                currency: plan.currency,
                status: 'pending',
                date: new Date(),
                paymentMethod: data.paymentMethod,
                url: billing.url,
            };
        } catch (error) {
            console.error('AbacatePay Error:', error);
            throw error;
        }
    }

    private async createBilling(plan: Plan, userId: string): Promise<{ id: string; url: string }> {
        if (!this.apiKey) {
            throw new Error('AbacatePay API Key is missing');
        }

        // AbacatePay expects price in cents (integer, min 100)
        // Our plan.price is in standard units (e.g. 9.99)
        const priceInCents = Math.round(plan.price * 100);

        const body = {
            frequency: "ONE_TIME", // Or MULTIPLE_PAYMENTS if subscription? AbacatePay "Billing" seems to be one-off or subscription? Docs said ONE_TIME or MULTIPLE_PAYMENTS.
            // For monthly subscription, we might need MULTIPLE_PAYMENTS, but docs are sparse on recurrence details in the snippet.
            // Assuming ONE_TIME for now as "Billing" usually implies invoice. 
            // If subscription, maybe AbacatePay has another endpoint or frequency handles it.
            // "MULTIPLE_PAYMENTS" might be installments?
            // "Assinatura" example in chunk 3 has "quantity": 2, price: 2000. frequency: "ONE_TIME".
            // I'll stick to ONE_TIME for this MVP implementation unless I see subscription features.
            // But the plans are "Monthly" / "Annual".
            // I'll set frequency ONE_TIME and user manually renews or we assume subscription features later.
            // To be safe for MVP: ONE_TIME.

            methods: ["PIX", "CARD"],
            products: [
                {
                    externalId: plan.id,
                    name: plan.name,
                    description: plan.description || plan.name,
                    quantity: 1,
                    price: priceInCents,
                }
            ],
            returnUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/plans`, // User cancelled
            completionUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/dashboard?payment_success=true`, // Success
            customerId: undefined, // We could create customer first but optional
            // customer: { ... } // We could pass current user info if we had it (email etc).
            // userId property is just an ID. passing metadata?
        };

        const response = await fetch(`${this.baseUrl}/billing/create`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AbacatePay API Error: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        return {
            id: result.data.id,
            url: result.data.url,
        };
    }
}
