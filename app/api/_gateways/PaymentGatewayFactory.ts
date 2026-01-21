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
            const strategy = strategies[env.PAYMENT_PROVIDER];
            if (!strategy) {
                throw new Error(`Unknown payment provider: ${env.PAYMENT_PROVIDER}`);
            }
            this.instance = strategy();
        }
        return this.instance;
    }
}
