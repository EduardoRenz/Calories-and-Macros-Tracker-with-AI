import { PlansRepository } from '../../domain/repositories/PlansRepository';
import { Plan, Currency, PlanFeature } from '../../domain/entities/payment';

export class MockPlansRepository implements PlansRepository {
    private static instance: MockPlansRepository | null = null;

    private constructor() { }

    static getInstance(): MockPlansRepository {
        if (!this.instance) {
            this.instance = new MockPlansRepository();
        }
        return this.instance;
    }

    async getPlans(language: string): Promise<Plan[]> {
        const isPt = language === 'pt';
        const currency = isPt ? Currency.BRL() : Currency.USD();

        const freePrice = 0;
        const monthlyPrice = isPt ? 29.90 : 5.99;
        const annualTotal = isPt ? 29.90 * 12 : 5.99 * 12;
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
                description: isPt ? 'Acesso básico com suas próprias chaves de API.' : 'Basic access with your own API keys.',
                price: freePrice,
                currency,
                interval: 'month',
                features: freeFeatures,
                isPopular: false,
                provider: 'mock',
                externalPlanId: 'free_mock',
            }),
            Plan.create({
                id: 'plano_mensal',
                name: isPt ? 'Plano Mensal' : 'Monthly Plan',
                description: isPt ? 'Cobrado mensalmente.' : 'Billed monthly.',
                price: monthlyPrice,
                currency,
                interval: 'month',
                features: memberFeatures,
                isPopular: true,
                provider: 'mock',
                externalPlanId: 'monthly_mock',
            }),
            Plan.create({
                id: 'plano_anual',
                name: isPt ? 'Plano Anual' : 'Annual Plan',
                description: isPt ? `Cobrado ${currency.format(annualTotal)} anualmente com 15% de desconto.` : `Billed ${currency.format(annualTotal)} yearly with 15% off.`,
                price: annualTotalWithDiscount,
                originalPrice: annualTotal,
                currency,
                interval: 'year',
                features: memberFeatures,
                isPopular: false,
                discountMessage: isPt ? 'MELHOR VALOR' : 'BEST VALUE',
                provider: 'mock',
                externalPlanId: 'annual_mock',
            }),
        ];
    }
}
