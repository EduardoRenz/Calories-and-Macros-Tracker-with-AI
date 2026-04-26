import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type ProcessingState = 'received' | 'processing' | 'processed' | 'rejected' | 'failed';

export interface InboundEvent {
  id: string;
  provider: string;
  provider_event_id: string;
  event_type: string;
  payload: any;
}

export class BillingEventProcessor {
  constructor(private supabase: SupabaseClient) { }

  async process(event: InboundEvent): Promise<void> {
    const { event_type, payload } = event;
    const data = payload.data;

    console.log(`[BillingEventProcessor] Processing event: ${event_type}`, JSON.stringify(data));

    if (!data) {
      throw new Error('Payload data is missing');
    }

    switch (event_type) {
      case 'subscription.completed':
        await this.handleSubscriptionCompleted(data);
        break;
      case 'subscription.renewed':
        await this.handleSubscriptionRenewed(data);
        break;
      case 'subscription.cancelled':
        await this.handleSubscriptionCancelled(data);
        break;
      case 'checkout.completed':
        console.log('[BillingEventProcessor] Received checkout.completed - tracking if needed');
        break;
      case 'checkout.refunded':
      case 'checkout.disputed':
      case 'checkout.lost':
        await this.handleCheckoutTransactionEvent(event_type, data);
        break;
      default:
        console.log(`[BillingEventProcessor] Unhandled event type: ${event_type}`);
    }
  }

  private async handleSubscriptionCompleted(data: any): Promise<void> {
    // AbacatePay v2 structure: data.subscription, data.customer, data.checkout
    const subscription = data.subscription;
    const checkout = data.checkout;
    const customer = data.customer;

    const metadata = checkout?.metadata || {};
    const userId = metadata.userId;
    const planCode = metadata.planCode;

    console.log(`[BillingEventProcessor] handleSubscriptionCompleted: userId=${userId}, planCode=${planCode}`);

    if (!userId || !planCode) {
      console.error('[BillingEventProcessor] Metadata missing in checkout payload:', JSON.stringify(metadata));
      throw new Error('Missing userId or planCode in metadata');
    }

    // 1. Resolve plan
    console.log(`[BillingEventProcessor] Resolving plan: ${planCode}`);
    const { data: plan, error: planError } = await this.supabase
      .from('billing_plans')
      .select('id')
      .eq('plan_code', planCode)
      .single();

    if (planError || !plan) {
      console.error(`[BillingEventProcessor] Plan resolution failed for: ${planCode}`, planError);
      throw new Error(`Plan not found: ${planCode}`);
    }

    // 2. Upsert customer
    if (customer) {
      console.log(`[BillingEventProcessor] Upserting customer: ${customer.email}`);
      const { error: custError } = await this.supabase
        .from('billing_customers')
        .upsert({
          user_id: userId,
          provider: 'abacatepay',
          provider_customer_id: customer.id,
          email: customer.email,
          tax_id: customer.taxId,
        }, { onConflict: 'user_id,provider' });

      if (custError) console.error('[BillingEventProcessor] Customer upsert failed:', custError);
    }

    // 3. Upsert subscription
    console.log(`[BillingEventProcessor] Upserting subscription for user: ${userId}`);
    const { error: subError } = await this.supabase
      .from('billing_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: plan.id,
        provider: 'abacatepay',
        provider_subscription_id: subscription.id,
        provider_checkout_id: checkout.id,
        status: 'active',
        access_status: 'premium',
        current_period_start: subscription.createdAt || new Date().toISOString(),
        current_period_end: subscription.nextBilling || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'provider,provider_subscription_id' });

    if (subError) {
      console.error('[BillingEventProcessor] Subscription upsert failed:', subError);
      throw subError;
    }

    // 4. Record transaction
    console.log('[BillingEventProcessor] Recording transaction');
    await this.recordTransaction({
      userId,
      providerSubscriptionId: subscription.id,
      providerTransactionId: `tx_${checkout.id}_init`,
      providerCheckoutId: checkout.id,
      type: 'charge',
      status: 'paid',
      amountCents: checkout.amount,
      occurredAt: checkout.createdAt || new Date().toISOString(),
    });

    // 5. Update checkout session if it exists
    console.log(`[BillingEventProcessor] Completing checkout session: ${checkout.id}`);
    await this.supabase
      .from('billing_checkout_sessions')
      .update({ status: 'completed' })
      .eq('provider_checkout_id', checkout.id);
  }

  private async handleSubscriptionRenewed(data: any): Promise<void> {
    // Renewed event usually has the same subscription ID
    const { data: sub, error: subError } = await this.supabase
      .from('billing_subscriptions')
      .select('id, user_id')
      .eq('provider_subscription_id', data.id)
      .single();

    if (subError || !sub) {
      // If we don't have it, maybe it's a legacy or we missed completed.
      // But for MVP, let's assume it should exist.
      throw new Error(`Subscription not found for renewal: ${data.id}`);
    }

    await this.supabase
      .from('billing_subscriptions')
      .update({
        status: 'active',
        access_status: 'premium',
        current_period_start: new Date().toISOString(), // Use current for renewal start
        current_period_end: data.nextBilling || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.recordTransaction({
      userId: sub.user_id,
      subscriptionId: sub.id,
      providerTransactionId: `tx_${data.id}_renewal_${Date.now()}`,
      providerCheckoutId: data.id,
      type: 'renewal',
      status: 'paid',
      amountCents: data.amount,
      occurredAt: new Date().toISOString(),
    });
  }

  private async handleSubscriptionCancelled(data: any): Promise<void> {
    // AbacatePay v2 structure: data.subscription, data.customer, data.checkout
    const subscription = data.subscription;
    const subscriptionId = subscription?.id || data.id;

    console.log(`[BillingEventProcessor] handleSubscriptionCancelled: subscriptionId=${subscriptionId}`);

    if (!subscriptionId) {
      console.error('[BillingEventProcessor] Missing subscription ID in cancellation payload:', JSON.stringify(data));
      throw new Error('Missing subscription ID in cancellation payload');
    }

    const { data: sub, error: subError } = await this.supabase
      .from('billing_subscriptions')
      .select('id, current_period_end')
      .eq('provider_subscription_id', subscriptionId)
      .single();

    if (subError || !sub) {
      throw new Error(`Subscription not found for cancellation: ${subscriptionId}`);
    }

    const isAtPeriodEnd = data.metadata?.cancelPolicy === 'END_OF_PERIOD' || data.cancelPolicy === 'END_OF_PERIOD';

    // If it's cancelled but we want to keep access until end of period
    const accessStatus = isAtPeriodEnd ? 'premium' : 'free';
    const status = isAtPeriodEnd ? 'canceled' : 'inactive';

    await this.supabase
      .from('billing_subscriptions')
      .update({
        status,
        access_status: accessStatus,
        cancel_at_period_end: isAtPeriodEnd,
        canceled_at: new Date().toISOString(),
        ended_at: isAtPeriodEnd ? sub.current_period_end : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);
  }

  private async handleCheckoutTransactionEvent(eventType: string, data: any): Promise<void> {
    const statusMap: Record<string, any> = {
      'checkout.refunded': 'refunded',
      'checkout.disputed': 'disputed',
      'checkout.lost': 'lost',
    };

    const typeMap: Record<string, any> = {
      'checkout.refunded': 'refund',
      'checkout.disputed': 'dispute',
      'checkout.lost': 'loss',
    };

    const status = statusMap[eventType];
    const type = typeMap[eventType];

    // Find original transaction or subscription
    const { data: sub, error: subError } = await this.supabase
      .from('billing_subscriptions')
      .select('id, user_id')
      .eq('provider_subscription_id', data.id)
      .single();

    if (!sub) return; // Cannot handle without subscription context for now

    await this.recordTransaction({
      userId: sub.user_id,
      subscriptionId: sub.id,
      providerTransactionId: `tx_${data.id}_${type}_${Date.now()}`,
      providerCheckoutId: data.id,
      type,
      status,
      amountCents: data.amount,
      occurredAt: new Date().toISOString(),
    });

    // If it's a refund or loss, we might want to downgrade access immediately
    if (status === 'refunded' || status === 'lost') {
      await this.supabase
        .from('billing_subscriptions')
        .update({
          access_status: 'free',
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sub.id);
    }
  }

  private async recordTransaction(input: {
    userId: string;
    subscriptionId?: string;
    providerSubscriptionId?: string;
    providerTransactionId: string;
    providerCheckoutId: string;
    type: string;
    status: string;
    amountCents: number;
    occurredAt: string;
  }): Promise<void> {
    let subscriptionId = input.subscriptionId;

    if (!subscriptionId && input.providerSubscriptionId) {
      const { data } = await this.supabase
        .from('billing_subscriptions')
        .select('id')
        .eq('provider_subscription_id', input.providerSubscriptionId)
        .single();
      subscriptionId = data?.id;
    }

    await this.supabase
      .from('billing_transactions')
      .upsert({
        user_id: input.userId,
        subscription_id: subscriptionId,
        provider: 'abacatepay',
        provider_transaction_id: input.providerTransactionId,
        provider_checkout_id: input.providerCheckoutId,
        transaction_type: input.type,
        status: input.status,
        amount_cents: input.amountCents,
        occurred_at: input.occurredAt,
      }, { onConflict: 'provider,provider_transaction_id' });
  }
}
