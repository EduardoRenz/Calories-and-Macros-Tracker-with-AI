import { ConcurrencyRequestManager } from "../../../data/infrastructure/ConcurrencyRequestManager"
import {
  CancelSubscriptionInput,
  HostedSubscriptionCheckoutInput,
  HostedSubscriptionCheckoutResult,
  PaymentGateway,
} from "../../../domain/gateways/PaymentGateway"
import { PaymentData, Transaction } from "../../../domain/entities/payment"
import { env } from "../../../env"
import Stripe from "stripe"

export class StripePaymentGateway implements PaymentGateway {
  private readonly stripe: Stripe
  private readonly concurrencyManager = new ConcurrencyRequestManager()

  private static instance: StripePaymentGateway | null = null

  private buildSuccessUrlWithCheckoutSessionId(baseSuccessUrl: string): string {
    const separator = baseSuccessUrl.includes("?") ? "&" : "?"
    return `${baseSuccessUrl}${separator}stripe_checkout_session_id={CHECKOUT_SESSION_ID}`
  }

  private constructor() {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error("[StripePaymentGateway] Missing STRIPE_SECRET_KEY.")
    }

    this.stripe = new Stripe(env.STRIPE_SECRET_KEY)
  }

  static getInstance(): PaymentGateway {
    if (!this.instance) {
      this.instance = new StripePaymentGateway()
    }
    return this.instance
  }

  async createCheckoutSession(planId: string, userId: string): Promise<string> {
    throw new Error(
      `[StripePaymentGateway] createCheckoutSession is not implemented for Stripe. planId=${planId}, userId=${userId}`,
    )
  }

  async processPayment(data: PaymentData): Promise<Transaction> {
    throw new Error(
      `[StripePaymentGateway] processPayment is not implemented for Stripe. userId=${data.userId}, planId=${data.planId}`,
    )
  }

  async createHostedSubscriptionCheckout(input: HostedSubscriptionCheckoutInput): Promise<HostedSubscriptionCheckoutResult> {
    const requestKey = `stripe:subscription-checkout:${input.userId}:${input.planCode}`

    return this.concurrencyManager.run(requestKey, async () => {
      if (!env.STRIPE_SECRET_KEY) {
        throw new Error("[StripePaymentGateway] Missing STRIPE_SECRET_KEY.")
      }

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "subscription",
        line_items: [
          {
            price: input.providerProductId, // Should be the Stripe Price ID
            quantity: 1,
          },
        ],
        success_url: this.buildSuccessUrlWithCheckoutSessionId(input.successUrl),
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
          },
        },
      }

      if (input.customerId) {
        sessionParams.customer = input.customerId
      } else if (input.customerEmail) {
        sessionParams.customer_email = input.customerEmail
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams)

      if (!session.url || !session.id) {
        throw new Error("[StripePaymentGateway] Checkout response did not include URL or ID.")
      }

      return {
        checkoutUrl: session.url,
        externalCheckoutId: session.id,
        amount: input.providerPriceAmount,
        status: "PENDING",
      }
    })
  }

  async cancelSubscriptionAtPeriodEnd(input: CancelSubscriptionInput): Promise<void> {
    const requestKey = `stripe:cancel-subscription:${input.providerSubscriptionId}`

    await this.concurrencyManager.run(requestKey, async () => {
      if (!env.STRIPE_SECRET_KEY) {
        throw new Error("[StripePaymentGateway] Missing STRIPE_SECRET_KEY.")
      }

      await this.stripe.subscriptions.update(input.providerSubscriptionId, {
        cancel_at_period_end: true,
        metadata: {
          userId: input.userId,
          subscriptionId: input.subscriptionId,
        },
      })
    })
  }
}
