import { PaymentData, Plan, Transaction, Currency } from '../../../domain/entities/payment';
import { PaymentGateway } from '../../../domain/gateways/PaymentGateway';

export class MockPaymentGateway implements PaymentGateway {
    private static instance: MockPaymentGateway | null = null;

    private constructor() { }

    static getInstance(): MockPaymentGateway {
        if (!this.instance) {
            this.instance = new MockPaymentGateway();
        }
        return this.instance;
    }

    async getPlans(language: string): Promise<Plan[]> {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const isPt = language === 'pt';
        const currency = isPt ? Currency.BRL() : Currency.USD();

        // Prices
        // Free: 0
        // Monthly: $5.99 (approx R$ 34.90)
        // Annual: $71.88 (billed yearly) -> effectively $5.99/mo? 
        // Wait, the screenshot says:
        // Member Plan $5.99/month
        // Billed $71.88 yearly with 15% off. 
        // Actually typically $5.99 * 12 = $71.88. 
        // Usually "Monthly" plan is more expensive e.g. $7.  
        // Let's assume:
        // Monthly billing: $9.99 / mo
        // Yearly billing: $5.99 / mo (billed $71.88)

        // Screenshot 1 "Choose your plan": "Monthly" vs "Annual -15%"
        // The card shown is "Member Plan $5.99 / month - Billed $71.88 yearly with 15% off". 
        // This implies the screenshot is showing the 'Annual' view.

        // Let's create specific plan objects. 
        // Ideally the UI toggles between Monthly/Annual, but the repository just returns all available variants 
        // and the UI filters or effective price logic.
        // Or we return a "Plan" that has multiple prices? 
        // The entity defined `interval` in `Plan`. So we return distinct plan objects for Monthly vs Annual.

        // Exchange rate approx 1 USD = 6 BRL for simple math mock

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
                currency, // Now a Currency Value Object
                interval: 'month',
                features: freeFeatures,
                isPopular: false,
                provider: 'mock',
                externalPlanId: 'free_mock',
            }),
            Plan.create({
                id: 'member_monthly',
                name: isPt ? 'Plano Membro (Mensal)' : 'Member Plan (Monthly)',
                description: isPt ? 'Cobrado mensalmente.' : 'Billed monthly.',
                price: monthlyPrice,
                currency, // Now a Currency Value Object
                interval: 'month',
                features: memberFeatures,
                isPopular: false,
                provider: 'mock',
                externalPlanId: 'monthly_mock',
            }),
            Plan.create({
                id: 'member_annual',
                name: isPt ? 'Plano Membro (Anual)' : 'Member Plan (Annual)',
                description: isPt ? `Cobrado ${currency.format(annualTotal)} anualmente com 15% de desconto.` : `Billed ${currency.format(annualTotal)} yearly with 15% off.`,
                price: annualTotalWithDiscount, // Total annual price
                originalPrice: annualTotal, // What it would cost monthly for 12 months
                currency, // Now a Currency Value Object
                interval: 'year',
                features: memberFeatures,
                isPopular: true,
                discountMessage: isPt ? 'MELHOR VALOR' : 'MOST POPULAR',
                provider: 'mock',
                externalPlanId: 'annual_mock',
            }),
            // Plan.create({
            //     id: 'ultra_annual',
            //     name: isPt ? 'Plano Ultra (Anual)' : 'Ultra Plan (Annual)',
            //     description: isPt ? `Cobrado ${currency.format(annualTotal)} anualmente com 15% de desconto.` : `Billed ${currency.format(annualTotal)} yearly with 15% off.`,
            //     price: ultraPricePerMonth, // We display the per-month price usually
            //     originalPrice: ultraTotal, // Useful payload for checkout
            //     currency, // Now a Currency Value Object
            //     interval: 'year',
            //     features: ultraFeatures,
            //     isPopular: true,
            //     discountMessage: isPt ? 'MELHOR VALOR' : 'MOST POPULAR',
            // }),
        ];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCheckoutSession(_planId: string, _userId: string): Promise<string> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return `sess_${Math.random().toString(36).substring(7)}`;
    }

    async processPayment(_data: PaymentData): Promise<Transaction> {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate processing

        // Mock success
        return {
            id: `tx_${Math.random().toString(36).substring(7)}`,
            userId: _data.userId,
            planId: _data.planId,
            amount: 0, // In a real app we'd look up the plan price
            currency: Currency.USD(), // Now a Currency Value Object
            status: 'completed',
            date: new Date(),
            paymentMethod: _data.paymentMethod,
        };
    }
}
