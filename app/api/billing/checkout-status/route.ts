import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../data/supabaseServer';
import { verifyAuth } from '../../auth-middleware';

type CheckoutSessionStatus = 'created' | 'pending' | 'completed' | 'expired' | 'cancelled' | 'failed';

interface BillingCheckoutSessionRow {
    id: string;
    user_id: string;
    provider: string;
    provider_checkout_id: string;
    status: CheckoutSessionStatus;
    metadata: Record<string, unknown> | null;
}

interface BillingSubscriptionRow {
    id: string;
    user_id: string;
    provider: string;
    status: string;
    access_status: string;
    current_period_end: string | null;
}

function getCheckoutSessionId(searchParams: URLSearchParams): string | null {
    const direct = searchParams.get('checkoutSessionId');
    if (direct && direct.trim().length > 0) return direct.trim();

    const stripe = searchParams.get('stripeCheckoutSessionId');
    if (stripe && stripe.trim().length > 0) return stripe.trim();

    return null;
}

function isSubscriptionPremiumAndValid(subscription: BillingSubscriptionRow | null): boolean {
    if (!subscription) return false;
    if (subscription.access_status !== 'premium') return false;
    if (!['active', 'trialing', 'canceled'].includes(subscription.status)) return false;

    if (!subscription.current_period_end) return true;

    const periodEnd = new Date(subscription.current_period_end);
    if (Number.isNaN(periodEnd.getTime())) return false;
    return new Date() <= periodEnd;
}

export async function GET(request: Request) {
    try {
        const user = await verifyAuth(request.headers.get('authorization'));
        const url = new URL(request.url);
        const providerCheckoutId = getCheckoutSessionId(url.searchParams);

        if (!providerCheckoutId) {
            return NextResponse.json({ error: 'checkoutSessionId is required' }, { status: 400 });
        }

        const supabase = getSupabaseAdminClient();
        const { data: checkoutSession, error: checkoutError } = await supabase
            .from('billing_checkout_sessions')
            .select('id, user_id, provider, provider_checkout_id, status, metadata')
            .eq('provider', 'stripe')
            .eq('provider_checkout_id', providerCheckoutId)
            .eq('user_id', user.uid)
            .maybeSingle();

        if (checkoutError) throw checkoutError;
        if (!checkoutSession) {
            return NextResponse.json({
                paymentState: 'NOT_FOUND',
                message: 'Checkout session not found.',
            }, { status: 404 });
        }

        const { data: subscription, error: subscriptionError } = await supabase
            .from('billing_subscriptions')
            .select('id, user_id, provider, status, access_status, current_period_end')
            .eq('provider', 'stripe')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (subscriptionError) throw subscriptionError;

        const typedCheckout = checkoutSession as BillingCheckoutSessionRow;
        const typedSubscription = (subscription as BillingSubscriptionRow | null) ?? null;
        const hasPremiumAccess = isSubscriptionPremiumAndValid(typedSubscription);

        if (typedCheckout.status === 'failed') {
            const planCode = typeof typedCheckout.metadata?.planCode === 'string' ? typedCheckout.metadata.planCode : null;
            return NextResponse.json({
                paymentState: 'FAILED',
                checkoutStatus: typedCheckout.status,
                hasPremiumAccess,
                providerFailureMessage: typedCheckout.metadata?.providerFailureMessage ?? null,
                planCode,
            });
        }

        if (hasPremiumAccess) {
            return NextResponse.json({
                paymentState: 'CONFIRMED',
                checkoutStatus: typedCheckout.status,
                hasPremiumAccess,
            });
        }

        return NextResponse.json({
            paymentState: 'PROCESSING',
            checkoutStatus: typedCheckout.status,
            hasPremiumAccess,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Checkout status verification failed';
        const status = message.toLowerCase().includes('unauthorized') ? 401 : 502;
        return NextResponse.json({ error: message }, { status });
    }
}
