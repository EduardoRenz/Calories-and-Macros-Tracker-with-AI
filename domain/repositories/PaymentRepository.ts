import { PaymentData, Plan, Transaction } from '../entities/payment';

export interface PaymentRepository {
    /**
     * Retrieves the available plans.
     * @param language The current language code (e.g., 'en', 'pt', 'es') to determine currency and localized text.
     */
    getPlans(language: string): Promise<Plan[]>;

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
