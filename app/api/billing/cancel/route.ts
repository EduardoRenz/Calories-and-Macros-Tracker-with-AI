import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../data/supabaseServer';
import { PaymentGatewayFactory } from '../../_gateways/PaymentGatewayFactory';
import { verifyAuth } from '../../auth-middleware';

interface CancelRequestBody {
    subscriptionId?: string;
}

interface BillingSubscriptionRow {
    id: string;
    user_id: string;
    provider: string;
    provider_subscription_id: string | null;
    status: string;
    cancel_at_period_end: boolean;
}

function getStringField(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function parseCancelRequestBody(value: unknown): CancelRequestBody {
    if (!value || typeof value !== 'object') {
        return {};
    }

    const record = value as Record<string, unknown>;
    return {
        subscriptionId: getStringField(record.subscriptionId),
    };
}

function canCancel(subscription: BillingSubscriptionRow): boolean {
    return ['active', 'trialing'].includes(subscription.status) && !subscription.cancel_at_period_end;
}

export async function POST(request: Request) {
    try {
        const user = await verifyAuth(request.headers.get('authorization'));
        const body = parseCancelRequestBody(await request.json().catch(() => null));

        if (!body.subscriptionId) {
            return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
        }

        const supabase = getSupabaseAdminClient();
        const { data, error } = await supabase
            .from('billing_subscriptions')
            .select('id, user_id, provider, provider_subscription_id, status, cancel_at_period_end')
            .eq('id', body.subscriptionId)
            .eq('user_id', user.uid)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: 'Active subscription not found' }, { status: 404 });
        }

        const subscription = data as BillingSubscriptionRow;

        if (!subscription.provider_subscription_id || !canCancel(subscription)) {
            return NextResponse.json({ error: 'Subscription cannot be cancelled from its current state' }, { status: 409 });
        }

        await PaymentGatewayFactory.getInstance().cancelSubscriptionAtPeriodEnd({
            userId: user.uid,
            subscriptionId: subscription.id,
            providerSubscriptionId: subscription.provider_subscription_id,
        });

        const { error: updateError } = await supabase
            .from('billing_subscriptions')
            .update({
                cancel_at_period_end: true,
                metadata: {
                    cancellationRequestedAt: new Date().toISOString(),
                    cancellationRequestedBy: user.uid,
                },
            })
            .eq('id', subscription.id)
            .eq('user_id', user.uid);

        if (updateError) throw updateError;

        return NextResponse.json({
            status: 'ok',
            cancelAtPeriodEnd: true,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Cancellation failed';
        const status = message.toLowerCase().includes('unauthorized') ? 401 : 502;
        console.error('[BillingCancelRoute] Error:', error);
        return NextResponse.json({ error: message }, { status });
    }
}
