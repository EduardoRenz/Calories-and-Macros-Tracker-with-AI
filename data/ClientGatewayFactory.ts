import { PaymentGateway } from '../domain/gateways/PaymentGateway';
import { NextApiPaymentGateway } from './gateways/NextApiPaymentGateway';

export class ClientGatewayFactory {
    private static paymentGateway: PaymentGateway | null = null;

    public static getPaymentGateway(): PaymentGateway {
        if (!this.paymentGateway) {
            this.paymentGateway = new NextApiPaymentGateway();
        }
        return this.paymentGateway;
    }
}
