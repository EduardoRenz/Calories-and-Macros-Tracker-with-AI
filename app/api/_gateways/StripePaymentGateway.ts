import { ConcurrencyRequestManager } from '../../../data/infrastructure/ConcurrencyRequestManager';
import {
    CancelSubscriptionInput,
    HostedSubscriptionCheckoutInput,
    HostedSubscriptionCheckoutResult,
    PaymentGateway,
} from '../../../domain/gateways/PaymentGateway';
import { Currency, PaymentData, Transaction } from '../../../domain/entities/payment';
import { env } from '../../../env';
import Stripe from 'stripe';

export class StripePaymentGateway implements PaymentGateway {
    private readonly stripe: Stripe;
    private readonly concurrencyManager = new ConcurrencyRequestManager();

    private static instance: StripePaymentGateway | null = null;

    private constructor() {
        if (!env.STRIPE_SECRET_KEY) {
            console.warn('STRIPE_SECRET_KEY is not set. StripePaymentGateway will fail requests.');
            this.stripe = new Stripe('dummy_key', { apiVersion: '2026-04-22.dahlia' as any }); // use dummy to avoid crash on init
        } else {
            this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
                apiVersion: '2026-04-22.dahlia' as any,
            });
        }
    }

    static getInstance(): PaymentGateway {
        if (!this.instance) {
            this.instance = new StripePaymentGateway();
        }
        return this.instance;
    }

    async createCheckoutSession(planId: string, userId: string): Promise<string> {
        return `billing:${userId}:${planId}`;
    }

    async processPayment(data: PaymentData): Promise<Transaction> {
        return {
            id: `billing:${data.userId}:${data.planId}`,
            userId: data.userId,
            planId: data.planId,
            amount: 0,
            currency: Currency.BRL(), // Stripe supports many, but fallback to BRL for dummy processPayment
            status: 'pending',
            date: new Date(),
            paymentMethod: data.paymentMethod,
        };
    }

    async createHostedSubscriptionCheckout(input: HostedSubscriptionCheckoutInput): Promise<HostedSubscriptionCheckoutResult> {
        const requestKey = `stripe:subscription-checkout:${input.userId}:${input.planCode}`;

        return this.concurrencyManager.run(requestKey, async () => {
            if (!env.STRIPE_SECRET_KEY) {
                throw new Error('[StripePaymentGateway] Missing STRIPE_SECRET_KEY.');
            }

            const sessionParams: Stripe.Checkout.SessionCreateParams = {
                mode: 'subscription',
                line_items: [
                    {
                        price: input.providerProductId, // Should be the Stripe Price ID
                        quantity: 1,
                    },
                ],
                success_url: input.successUrl,
                cancel_url: input.cancelUrl,
                client_reference_id: input.userId,
                metadata: {
                    userId: input.userId,
                    planCode: input.planCode,
                    currency: input.currency,
                    expectedAmount: input.providerPriceAmount.toString(),
                },
                subscription_data: {
                    metadata: {
                        userId: input.userId,
                        planCode: input.planCode,
                    }
                }
            };

            if (input.customerId) {
                sessionParams.customer = input.customerId;
            } else if (input.customerEmail) {
                sessionParams.customer_email = input.customerEmail;
            }

            const session = await this.stripe.checkout.sessions.create(sessionParams);

            if (!session.url || !session.id) {
                throw new Error('[StripePaymentGateway] Checkout response did not include URL or ID.');
            }

            return {
                checkoutUrl: session.url,
                externalCheckoutId: session.id,
                amount: input.providerPriceAmount,
                status: 'PENDING',
            };
        });
    }

    async cancelSubscriptionAtPeriodEnd(input: CancelSubscriptionInput): Promise<void> {
        const requestKey = `stripe:cancel-subscription:${input.providerSubscriptionId}`;

        await this.concurrencyManager.run(requestKey, async () => {
            if (!env.STRIPE_SECRET_KEY) {
                throw new Error('[StripePaymentGateway] Missing STRIPE_SECRET_KEY.');
            }

            await this.stripe.subscriptions.update(input.providerSubscriptionId, {
                cancel_at_period_end: true,
                metadata: {
                    userId: input.userId,
                    subscriptionId: input.subscriptionId,
                }
            });
        });
    }
}
