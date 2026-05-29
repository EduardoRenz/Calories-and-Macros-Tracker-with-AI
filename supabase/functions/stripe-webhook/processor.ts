import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "npm:stripe@14.21.0"

export type ProcessingState = "received" | "processing" | "processed" | "rejected" | "failed"

export interface InboundEvent {
  id: string
  provider: string
  provider_event_id: string
  event_type: string
  payload: any
}

export class StripeEventProcessor {
  constructor(private supabase: SupabaseClient) {}

  private getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
    if (typeof invoice.subscription === "string" && invoice.subscription.length > 0) {
      return invoice.subscription
    }

    const parent = invoice.parent as { subscription_details?: { subscription?: string } } | null
    const nested = parent?.subscription_details?.subscription
    if (typeof nested === "string" && nested.length > 0) {
      return nested
    }

    return null
  }

  private getInvoiceMetadata(invoice: Stripe.Invoice): { userId: string | null; planCode: string | null } {
    const fromParent = invoice.parent as { subscription_details?: { metadata?: Record<string, string> } } | null
    const parentMetadata = fromParent?.subscription_details?.metadata || {}

    // Fallback: some integrations store metadata on line items.
    const firstLine = invoice.lines?.data?.[0]
    const lineMetadata = (firstLine?.metadata || {}) as Record<string, string>

    const userId = parentMetadata.userId || lineMetadata.userId || null
    const planCode = parentMetadata.planCode || lineMetadata.planCode || null

    return { userId, planCode }
  }

  private mapSubscriptionStatus(status: Stripe.Subscription.Status): "pending" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "inactive" {
    switch (status) {
      case "trialing":
        return "trialing"
      case "active":
        return "active"
      case "past_due":
        return "past_due"
      case "unpaid":
        return "unpaid"
      case "canceled":
        return "canceled"
      case "incomplete":
        return "pending"
      case "incomplete_expired":
      case "paused":
        return "inactive"
      default:
        return "pending"
    }
  }

  async process(event: InboundEvent): Promise<void> {
    const { event_type, payload } = event
    const stripeEvent = payload as Stripe.Event

    console.log(`[StripeEventProcessor] Processing event: ${event_type}`, JSON.stringify(stripeEvent.data.object))

    switch (event_type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(stripeEvent.data.object as Stripe.Checkout.Session)
        break
      case "invoice.paid":
      case "invoice.payment_succeeded":
        await this.handleInvoicePaid(stripeEvent.data.object as Stripe.Invoice)
        break
      case "invoice.payment_failed":
        await this.handleInvoicePaymentFailed(stripeEvent.data.object as Stripe.Invoice)
        break
      case "invoice.finalized":
        await this.handleInvoiceFinalized(stripeEvent.data.object as Stripe.Invoice)
        break
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(stripeEvent.data.object as Stripe.Subscription)
        break
      case "payment_intent.payment_failed":
        await this.handlePaymentIntentFailed(stripeEvent.data.object as Stripe.PaymentIntent)
        break
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(stripeEvent.data.object as Stripe.Subscription)
        break
      case "charge.refunded":
      case "charge.dispute.created":
        await this.handleChargeEvent(event_type, stripeEvent.data.object as Stripe.Charge)
        break
      default:
        console.log(`[StripeEventProcessor] Unhandled event type: ${event_type}`)
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const metadata = session.metadata || {}
    const userId = metadata.userId || session.client_reference_id
    const planCode = metadata.planCode
    const customerId = session.customer as string

    console.log(`[StripeEventProcessor] handleCheckoutSessionCompleted: userId=${userId}, planCode=${planCode}`)

    if (!userId || !planCode) {
      console.error("[StripeEventProcessor] Metadata missing in checkout session:", JSON.stringify(metadata))
      throw new Error("Missing userId or planCode in metadata")
    }

    // 1. Resolve plan
    const { data: plan, error: planError } = await this.supabase.from("billing_plans").select("id").eq("plan_code", planCode).single()

    if (planError || !plan) {
      console.error(`[StripeEventProcessor] Plan resolution failed for: ${planCode}`, planError)
      throw new Error(`Plan not found: ${planCode}`)
    }

    // 2. Upsert customer
    if (customerId) {
      const email = session.customer_details?.email || ""
      console.log(`[StripeEventProcessor] Upserting customer: ${customerId}`)
      const { error: custError } = await this.supabase.from("billing_customers").upsert(
        {
          user_id: userId,
          provider: "stripe",
          provider_customer_id: customerId,
          email: email,
        },
        { onConflict: "user_id,provider" },
      )

      if (custError) {
        console.error("[StripeEventProcessor] Customer upsert failed:", custError)
        throw custError
      }
    }

    // Note: We don't necessarily have full subscription details here to create billing_subscriptions
    // We will rely on invoice.paid or retrieve the subscription details.
    // However, if we don't fetch it, we might be missing dates. Let's create a pending sub.
    const checkoutStatus = session.payment_status === "paid" || session.payment_status === "no_payment_required" ? "completed" : "pending"
    console.log(`[StripeEventProcessor] Updating checkout session: ${session.id} -> ${checkoutStatus}`)
    const { error: checkoutUpdateError } = await this.supabase
      .from("billing_checkout_sessions")
      .update({ status: checkoutStatus })
      .eq("provider_checkout_id", session.id)

    if (checkoutUpdateError) {
      console.error("[StripeEventProcessor] Failed to update checkout session to completed:", checkoutUpdateError)
      throw checkoutUpdateError
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = this.getInvoiceSubscriptionId(invoice)
    if (!subscriptionId) {
      console.warn(`[StripeEventProcessor] Invoice ${invoice.id} has no subscription reference. Skipping premium activation.`)
      return
    }

    const { userId, planCode } = this.getInvoiceMetadata(invoice)
    if (!userId || !planCode) {
      console.warn(`[StripeEventProcessor] Invoice ${invoice.id} missing userId/planCode metadata. Triggering retry.`)
      throw new Error(`Missing metadata on invoice ${invoice.id}`)
    }

    const { data: plan, error: planError } = await this.supabase
      .from("billing_plans")
      .select("id")
      .eq("plan_code", planCode)
      .single()

    if (planError || !plan) {
      console.error(`[StripeEventProcessor] Plan resolution failed for invoice: ${planCode}`, planError)
      throw new Error(`Plan not found: ${planCode}`)
    }

    const currentPeriodStart = invoice.lines?.data?.[0]?.period?.start
      ? new Date(invoice.lines.data[0].period.start * 1000).toISOString()
      : new Date(invoice.created * 1000).toISOString()
    const currentPeriodEnd = invoice.lines?.data?.[0]?.period?.end
      ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
      : null

    // Create or activate the subscription only when payment is confirmed.
    const { data: upsertedSub, error: upsertError } = await this.supabase
      .from("billing_subscriptions")
      .upsert(
        {
          user_id: userId,
          plan_id: plan.id,
          provider: "stripe",
          provider_subscription_id: subscriptionId,
          status: "active",
          access_status: "premium",
          cancel_at_period_end: false,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider,provider_subscription_id" },
      )
      .select("id, user_id")
      .single()

    if (upsertError || !upsertedSub) {
      console.error("[StripeEventProcessor] Failed to upsert/activate subscription after invoice.paid:", upsertError)
      throw upsertError || new Error("Failed to upsert subscription")
    }

    await this.recordTransaction({
      userId: upsertedSub.user_id,
      subscriptionId: upsertedSub.id,
      providerTransactionId: (invoice.payment_intent as string) || (invoice.charge as string) || invoice.id,
      providerCheckoutId: invoice.id,
      type: invoice.billing_reason === "subscription_create" ? "charge" : "renewal",
      status: "paid",
      amountCents: invoice.amount_paid,
      occurredAt: new Date(invoice.created * 1000).toISOString(),
    })
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = this.getInvoiceSubscriptionId(invoice)
    if (!subscriptionId) {
      console.warn(`[StripeEventProcessor] Invoice ${invoice.id} has no subscription reference for payment_failed.`)
      return
    }

    const { data: sub } = await this.supabase
      .from("billing_subscriptions")
      .select("id, user_id")
      .eq("provider_subscription_id", subscriptionId)
      .maybeSingle()

    if (sub) {
      const { error: updateError } = await this.supabase
        .from("billing_subscriptions")
        .update({ status: "past_due", access_status: "free", updated_at: new Date().toISOString() })
        .eq("id", sub.id)
      if (updateError) {
        console.error("[StripeEventProcessor] Failed to update subscription to past_due:", updateError)
        throw updateError
      }
    }
  }

  private async handleInvoiceFinalized(invoice: Stripe.Invoice): Promise<void> {
    // Some Stripe webhook configurations may deliver finalized but not invoice.paid/payment_succeeded.
    // Only treat finalized as a paid confirmation when Stripe explicitly marks it as paid.
    if (invoice.status === "paid" && invoice.status_transitions?.paid_at) {
      await this.handleInvoicePaid(invoice)
      return
    }
    console.log(`[StripeEventProcessor] Ignoring invoice.finalized without paid confirmation: ${invoice.id} status=${invoice.status}`)
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { data: tx } = await this.supabase
      .from("billing_transactions")
      .select("subscription_id")
      .eq("provider_transaction_id", paymentIntent.id)
      .maybeSingle()

    if (!tx?.subscription_id) return

    const { error } = await this.supabase
      .from("billing_subscriptions")
      .update({
        status: "past_due",
        access_status: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("id", tx.subscription_id)

    if (error) {
      console.error("[StripeEventProcessor] Failed to update subscription after payment_intent.payment_failed:", error)
      throw error
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const currentPeriodStart = subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null
    const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null

    const { data: existingSub, error: existingSubError } = await this.supabase
      .from("billing_subscriptions")
      .select("id, access_status")
      .eq("provider", "stripe")
      .eq("provider_subscription_id", subscription.id)
      .maybeSingle()

    if (existingSubError) {
      console.error("[StripeEventProcessor] Failed to fetch existing subscription state:", existingSubError)
      throw existingSubError
    }

    if (!existingSub) {
      // Keep DB clean: ignore subscription-created/updated until a paid invoice creates the canonical row.
      console.log(`[StripeEventProcessor] Skipping upsert for ${subscription.id} because no paid subscription row exists yet.`)
      return
    }

    const mappedStatus = this.mapSubscriptionStatus(subscription.status)
    const isTrialing = mappedStatus === "trialing"
    const isActive = mappedStatus === "active"
    const existingAccessStatus = existingSub?.access_status as "free" | "premium" | undefined
    const accessStatus = isTrialing ? "premium" : isActive ? (existingAccessStatus === "premium" ? "premium" : "free") : "free"

    const { error: updateError } = await this.supabase.from("billing_subscriptions").update(
      {
        status: mappedStatus,
        access_status: accessStatus,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      },
    )
    .eq("id", existingSub.id)

    if (updateError) {
      console.error("[StripeEventProcessor] Failed to update existing subscription:", updateError)
      throw updateError
    }

    console.log(`[StripeEventProcessor] Updated subscription ${subscription.id}. Access: ${accessStatus}`)
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const { data: sub } = await this.supabase
      .from("billing_subscriptions")
      .select("id")
      .eq("provider_subscription_id", subscription.id)
      .single()

    if (!sub) return

    const now = new Date().toISOString()

    const { error: deleteUpdateError } = await this.supabase
      .from("billing_subscriptions")
      .update({
        status: "canceled",
        access_status: "free",
        cancel_at_period_end: true,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : now,
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : now,
        updated_at: now,
      })
      .eq("id", sub.id)

    if (deleteUpdateError) {
      console.error("[StripeEventProcessor] Failed to apply subscription deletion update:", deleteUpdateError)
      throw deleteUpdateError
    }
  }

  private async handleChargeEvent(eventType: string, charge: Stripe.Charge): Promise<void> {
    const statusMap: Record<string, any> = {
      "charge.refunded": "refunded",
      "charge.dispute.created": "disputed",
    }

    const typeMap: Record<string, any> = {
      "charge.refunded": "refund",
      "charge.dispute.created": "dispute",
    }

    const status = statusMap[eventType]
    const type = typeMap[eventType]

    // Find original transaction to get user and subscription context.
    // invoice.paid can be recorded using payment_intent, while charge events arrive with charge.id.
    // We try both IDs to avoid dropping refund/dispute updates.
    const candidateTransactionIds = [charge.id]
    if (typeof charge.payment_intent === "string" && charge.payment_intent.length > 0) {
      candidateTransactionIds.push(charge.payment_intent)
    }

    const { data: tx } = await this.supabase
      .from("billing_transactions")
      .select("user_id, subscription_id")
      .in("provider_transaction_id", candidateTransactionIds)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!tx) return

    await this.recordTransaction({
      userId: tx.user_id,
      subscriptionId: tx.subscription_id,
      providerTransactionId: `tx_${charge.id}_${type}_${Date.now()}`,
      providerCheckoutId: charge.id, // Or pi_xxx
      type,
      status,
      amountCents: charge.amount_refunded || charge.amount, // Approximations
      occurredAt: new Date(charge.created * 1000).toISOString(),
    })

    if (status === "refunded") {
      const { error: updateError } = await this.supabase
        .from("billing_subscriptions")
        .update({
          access_status: "free",
          status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", tx.subscription_id)

      if (updateError) {
        console.error("[StripeEventProcessor] Failed to downgrade subscription after refund:", updateError)
        throw updateError
      }
    }
  }

  private async recordTransaction(input: {
    userId: string
    subscriptionId?: string
    providerTransactionId: string
    providerCheckoutId: string
    type: string
    status: string
    amountCents: number
    occurredAt: string
  }): Promise<void> {
    const { error: txError } = await this.supabase.from("billing_transactions").upsert(
      {
        user_id: input.userId,
        subscription_id: input.subscriptionId,
        provider: "stripe",
        provider_transaction_id: input.providerTransactionId,
        provider_checkout_id: input.providerCheckoutId,
        transaction_type: input.type,
        status: input.status,
        amount_cents: input.amountCents,
        occurred_at: input.occurredAt,
      },
      { onConflict: "provider,provider_transaction_id" },
    )

    if (txError) {
      console.error("[StripeEventProcessor] Failed to record transaction:", txError)
      throw txError
    }

    console.log(`[StripeEventProcessor] Recorded transaction ${input.providerTransactionId}`)
  }
}
