import { PaymentData, Plan, Transaction } from '../entities/payment';

export interface PaymentGateway {
    /**
     * Creates a checkout session or transaction identifier.
     * Useful for preparing the checkout page or pre-validating.
     */
    createCheckoutSession(planId: string, userId: string): Promise<string>;

    /**
     * Processes the payment for the selected plan.
     */
    processPayment(data: PaymentData): Promise<Transaction>;
}
