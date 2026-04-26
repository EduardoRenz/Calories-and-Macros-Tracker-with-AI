import { PaymentGateway } from '../domain/gateways/PaymentGateway';
import { NextApiPaymentGateway } from './gateways/NextApiPaymentGateway';
import { MockPaymentGateway } from '../app/api/_gateways/MockPaymentGateway';
import { env } from '../env';

export class ClientGatewayFactory {
    private static paymentGateway: PaymentGateway | null = null;

    public static getPaymentGateway(): PaymentGateway {
        if (!this.paymentGateway) {
            // Use MockPaymentGateway directly in mock mode to avoid server/client singleton mismatch
            if (env.NEXT_PUBLIC_BACKEND_PROVIDER === 'mock') {
                this.paymentGateway = MockPaymentGateway.getInstance();
            } else {
                this.paymentGateway = new NextApiPaymentGateway();
            }
        }
        return this.paymentGateway;
    }
}
