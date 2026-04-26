import { PaymentData, Plan, Transaction } from '../entities/payment';

export interface HostedSubscriptionCheckoutInput {
    userId: string;
    planCode: string;
    providerProductId: string;
    providerPriceAmount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    customerEmail?: string;
}

export interface HostedSubscriptionCheckoutResult {
    checkoutUrl: string;
    externalCheckoutId: string;
    amount: number;
    status: string;
}

export interface CancelSubscriptionInput {
    userId: string;
    subscriptionId: string;
    providerSubscriptionId: string;
}

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

    createHostedSubscriptionCheckout(input: HostedSubscriptionCheckoutInput): Promise<HostedSubscriptionCheckoutResult>;

    cancelSubscriptionAtPeriodEnd(input: CancelSubscriptionInput): Promise<void>;
}
