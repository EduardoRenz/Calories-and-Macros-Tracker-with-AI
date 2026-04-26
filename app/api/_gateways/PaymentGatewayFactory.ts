import { PaymentGateway } from '../../../domain/gateways/PaymentGateway';
import { AbacatePayPaymentGateway } from './AbacatePayPaymentGateway';
import { MockPaymentGateway } from './MockPaymentGateway';
import { env } from '../../../env';


const strategies: Record<string, () => PaymentGateway> = {
    'abacatepay': () => AbacatePayPaymentGateway.getInstance(),
    'mock': () => MockPaymentGateway.getInstance(),
};

export class PaymentGatewayFactory {
    private static instance: PaymentGateway | null = null;

    private constructor() { }

    static getInstance(): PaymentGateway {
        if (!this.instance) {
            // Use 'mock' when in mock mode, otherwise use NEXT_PUBLIC_PAYMENT_PROVIDER
            const provider = env.NEXT_PUBLIC_BACKEND_PROVIDER === 'mock' ? 'mock' : env.NEXT_PUBLIC_PAYMENT_PROVIDER;
            const strategy = strategies[provider];
            if (!strategy) {
                throw new Error(`Unknown payment provider: ${provider}`);
            }
            this.instance = strategy();
        }
        return this.instance;
    }
}
