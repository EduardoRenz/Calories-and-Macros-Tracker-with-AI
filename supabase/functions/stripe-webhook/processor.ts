import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

export type ProcessingState = 'received' | 'processing' | 'processed' | 'rejected' | 'failed';

export interface InboundEvent {
  id: string;
  provider: string;
  provider_event_id: string;
  event_type: string;
  payload: any;
}

export class StripeEventProcessor {
  constructor(private supabase: SupabaseClient) { }

  async process(event: InboundEvent): Promise<void> {
    const { event_type, payload } = event;
    const stripeEvent = payload as Stripe.Event;
    
    console.log(`[StripeEventProcessor] Processing event: ${event_type}`, JSON.stringify(stripeEvent.data.object));

    switch (event_type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(stripeEvent.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(stripeEvent.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(stripeEvent.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(stripeEvent.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(stripeEvent.data.object as Stripe.Subscription);
        break;
      case 'charge.refunded':
      case 'charge.dispute.created':
        await this.handleChargeEvent(event_type, stripeEvent.data.object as Stripe.Charge);
        break;
      default:
        console.log(`[StripeEventProcessor] Unhandled event type: ${event_type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const metadata = session.metadata || {};
    const userId = metadata.userId || session.client_reference_id;
    const planCode = metadata.planCode;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    console.log(`[StripeEventProcessor] handleCheckoutSessionCompleted: userId=${userId}, planCode=${planCode}`);

    if (!userId || !planCode) {
      console.error('[StripeEventProcessor] Metadata missing in checkout session:', JSON.stringify(metadata));
      throw new Error('Missing userId or planCode in metadata');
    }

    // 1. Resolve plan
    const { data: plan, error: planError } = await this.supabase
      .from('billing_plans')
      .select('id')
      .eq('plan_code', planCode)
      .single();

    if (planError || !plan) {
      console.error(`[StripeEventProcessor] Plan resolution failed for: ${planCode}`, planError);
      throw new Error(`Plan not found: ${planCode}`);
    }

    // 2. Upsert customer
    if (customerId) {
      const email = session.customer_details?.email || '';
      console.log(`[StripeEventProcessor] Upserting customer: ${customerId}`);
      const { error: custError } = await this.supabase
        .from('billing_customers')
        .upsert({
          user_id: userId,
          provider: 'stripe',
          provider_customer_id: customerId,
          email: email,
        }, { onConflict: 'user_id,provider' });

      if (custError) console.error('[StripeEventProcessor] Customer upsert failed:', custError);
    }

    // Note: We don't necessarily have full subscription details here to create billing_subscriptions
    // We will rely on invoice.paid or retrieve the subscription details.
    // However, if we don't fetch it, we might be missing dates. Let's create a pending sub.
    console.log(`[StripeEventProcessor] Completing checkout session: ${session.id}`);
    await this.supabase
      .from('billing_checkout_sessions')
      .update({ status: 'completed' })
      .eq('provider_checkout_id', session.id);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;
    const subscriptionId = invoice.subscription as string;
    
    // We need to fetch the subscription metadata to know who this is for if it's the first time
    // Or we could rely on existing billing_subscriptions record.
    
    // We assume the subscription webhook handles the actual period update,
    // but invoice paid is a good place to record the transaction.
    
    const { data: sub, error: subError } = await this.supabase
      .from('billing_subscriptions')
      .select('id, user_id')
      .eq('provider_subscription_id', subscriptionId)
      .single();

    if (subError || !sub) {
        console.warn(`[StripeEventProcessor] Subscription not found for invoice: ${subscriptionId}. Will retry on next event.`);
        // Could be out of order. We rely on customer.subscription.updated to create the sub if needed
        return;
    }

    await this.recordTransaction({
      userId: sub.user_id,
      subscriptionId: sub.id,
      providerTransactionId: invoice.payment_intent as string || invoice.charge as string || invoice.id,
      providerCheckoutId: invoice.id,
      type: invoice.billing_reason === 'subscription_create' ? 'charge' : 'renewal',
      status: 'paid',
      amountCents: invoice.amount_paid,
      occurredAt: new Date(invoice.created * 1000).toISOString(),
    });
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
      if (!invoice.subscription) return;
      const subscriptionId = invoice.subscription as string;
      
      const { data: sub } = await this.supabase
        .from('billing_subscriptions')
        .select('id')
        .eq('provider_subscription_id', subscriptionId)
        .single();
        
      if (sub) {
          await this.supabase
            .from('billing_subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('id', sub.id);
      }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
      const metadata = subscription.metadata || {};
      const userId = metadata.userId;
      const planCode = metadata.planCode;
      
      if (!userId || !planCode) {
          console.warn('[StripeEventProcessor] Missing metadata on subscription. Skipping.');
          return;
      }
      
      const { data: plan } = await this.supabase
          .from('billing_plans')
          .select('id')
          .eq('plan_code', planCode)
          .single();
          
      if (!plan) return;

      const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      const isPastDue = subscription.status === 'past_due' || subscription.status === 'unpaid';
      const isCanceled = subscription.status === 'canceled';
      
      const mappedStatus = isCanceled ? 'canceled' : (isPastDue ? 'past_due' : 'active');
      const accessStatus = (mappedStatus === 'active' || subscription.cancel_at_period_end) ? 'premium' : 'free';

      await this.supabase
        .from('billing_subscriptions')
        .upsert({
          user_id: userId,
          plan_id: plan.id,
          provider: 'stripe',
          provider_subscription_id: subscription.id,
          status: mappedStatus,
          access_status: accessStatus,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'provider,provider_subscription_id' });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const { data: sub } = await this.supabase
      .from('billing_subscriptions')
      .select('id')
      .eq('provider_subscription_id', subscription.id)
      .single();

    if (!sub) return;
    
    const now = new Date().toISOString();

    await this.supabase
      .from('billing_subscriptions')
      .update({
        status: 'canceled',
        access_status: 'free',
        cancel_at_period_end: true,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : now,
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : now,
        updated_at: now,
      })
      .eq('id', sub.id);
  }

  private async handleChargeEvent(eventType: string, charge: Stripe.Charge): Promise<void> {
    const statusMap: Record<string, any> = {
      'charge.refunded': 'refunded',
      'charge.dispute.created': 'disputed',
    };

    const typeMap: Record<string, any> = {
      'charge.refunded': 'refund',
      'charge.dispute.created': 'dispute',
    };

    const status = statusMap[eventType];
    const type = typeMap[eventType];

    // Find original transaction to get user and sub
    const { data: tx } = await this.supabase
      .from('billing_transactions')
      .select('user_id, subscription_id')
      .eq('provider_transaction_id', charge.id) // Or payment intent
      .maybeSingle();

    if (!tx) return;

    await this.recordTransaction({
      userId: tx.user_id,
      subscriptionId: tx.subscription_id,
      providerTransactionId: `tx_${charge.id}_${type}_${Date.now()}`,
      providerCheckoutId: charge.id, // Or pi_xxx
      type,
      status,
      amountCents: charge.amount_refunded || charge.amount, // Approximations
      occurredAt: new Date(charge.created * 1000).toISOString(),
    });

    if (status === 'refunded') {
      await this.supabase
        .from('billing_subscriptions')
        .update({
          access_status: 'free',
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', tx.subscription_id);
    }
  }

  private async recordTransaction(input: {
    userId: string;
    subscriptionId?: string;
    providerTransactionId: string;
    providerCheckoutId: string;
    type: string;
    status: string;
    amountCents: number;
    occurredAt: string;
  }): Promise<void> {
    await this.supabase
      .from('billing_transactions')
      .upsert({
        user_id: input.userId,
        subscription_id: input.subscriptionId,
        provider: 'stripe',
        provider_transaction_id: input.providerTransactionId,
        provider_checkout_id: input.providerCheckoutId,
        transaction_type: input.type,
        status: input.status,
        amount_cents: input.amountCents,
        occurred_at: input.occurredAt,
      }, { onConflict: 'provider,provider_transaction_id' });
  }
}
