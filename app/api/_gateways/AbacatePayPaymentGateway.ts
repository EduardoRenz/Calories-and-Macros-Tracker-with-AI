import { PaymentGateway } from '../../../domain/gateways/PaymentGateway';
import { PaymentData, Transaction } from '../../../domain/entities/payment';
import { env } from '../../../env';
import { ConcurrencyRequestManager } from '../../../data/infrastructure/ConcurrencyRequestManager';

type AbacatePayFrequency = 'ONE_TIME' | 'MULTIPLE_PAYMENTS';

interface AbacatePayBillingProduct {
    id: string;
    externalId: string;
    quantity: number;
    name?: string;
    description?: string;
    price?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AbacatePayApiResponse<T> {
    data: T;
    error: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCheckoutSession(_planId: string, _userId: string): Promise<string> {
        // TODO: Obter plan pelo PlansRepository quando necessário
        throw new Error('[AbacatePayPaymentGateway] createCheckoutSession needs PlansRepository integration.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async processPayment(_data: PaymentData): Promise<Transaction> {
        // TODO: Obter plan pelo PlansRepository quando necessário
        throw new Error('[AbacatePayPaymentGateway] processPayment needs PlansRepository integration.');
    }
}
