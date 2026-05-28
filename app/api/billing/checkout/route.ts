import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../data/supabaseServer';
import { RepositoryFactory } from '../../../../data/RepositoryFactory';
import { PaymentGatewayFactory } from '../../_gateways/PaymentGatewayFactory';
import { verifyAuth } from '../../auth-middleware';
import { env } from '../../../../env';
import { isValidRedirect } from '@/utils/security';

interface CheckoutRequestBody {
    planId?: string;
    successUrl?: string;
    cancelUrl?: string;
}

function getStringField(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function parseCheckoutRequestBody(value: unknown): CheckoutRequestBody {
    if (!value || typeof value !== 'object') {
        return {};
    }

    const record = value as Record<string, unknown>;
    return {
        planId: getStringField(record.planId),
        successUrl: getStringField(record.successUrl),
        cancelUrl: getStringField(record.cancelUrl),
    };
}

function getDefaultUrl(request: Request, path: string): string {
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    return new URL(path, origin).toString();
}

export async function POST(request: Request) {
    try {
        const user = await verifyAuth(request.headers.get('authorization'));
        const body = parseCheckoutRequestBody(await request.json().catch(() => null));

        if (!body.planId) {
            console.warn('[BillingCheckoutRoute] Rejected: missing_plan_id');
            return NextResponse.json({ error: 'planId is required' }, { status: 400 });
        }

        const plansRepository = RepositoryFactory.getPlansRepository();
        // Use 'mock' provider in mock mode, otherwise use NEXT_PUBLIC_PAYMENT_PROVIDER
        const provider = env.NEXT_PUBLIC_BACKEND_PROVIDER === 'mock' ? 'mock' : env.NEXT_PUBLIC_PAYMENT_PROVIDER;
        const mapping = await plansRepository.getProviderMapping(body.planId, provider);

        if (!mapping) {
            console.warn(`[BillingCheckoutRoute] Rejected: plan_not_available plan_id=${body.planId} provider=${provider}`);
            return NextResponse.json({ error: 'Plan is not available for this billing provider' }, { status: 409 });
        }

        const successUrl = isValidRedirect(body.successUrl)
            ? getDefaultUrl(request, body.successUrl)
            : getDefaultUrl(request, '/checkout?status=success');

        const cancelUrl = isValidRedirect(body.cancelUrl)
            ? getDefaultUrl(request, body.cancelUrl)
            : getDefaultUrl(request, `/checkout?planId=${encodeURIComponent(body.planId)}&status=cancelled`);
        const paymentGateway = PaymentGatewayFactory.getInstance();

        console.log(`[BillingCheckoutRoute] Creating: user_id=${user.uid} plan_id=${body.planId}`);

        const checkout = await paymentGateway.createHostedSubscriptionCheckout({
            userId: user.uid,
            planCode: mapping.planCode,
            providerProductId: mapping.providerProductId,
            providerPriceAmount: mapping.providerPriceAmount,
            currency: mapping.currency,
            successUrl,
            cancelUrl,
            customerEmail: user.email,
        });

        if (env.NEXT_PUBLIC_BACKEND_PROVIDER === 'supabase') {
            const supabase = getSupabaseAdminClient();
            const { data: checkoutSession, error } = await supabase
                .from('billing_checkout_sessions')
                .upsert({
                    user_id: user.uid,
                    plan_id: mapping.planId,
                    provider: mapping.provider,
                    provider_checkout_id: checkout.externalCheckoutId,
                    checkout_url: checkout.checkoutUrl,
                    status: 'created',
                    metadata: {
                        planCode: mapping.planCode,
                        amount: checkout.amount,
                        currency: mapping.currency,
                        providerStatus: checkout.status,
                    },
                }, { onConflict: 'provider,provider_checkout_id' })
                .select('id')
                .single();

            if (error || !checkoutSession) {
                console.error('[BillingCheckoutRoute] Persistence Failure:', error);
                return NextResponse.json({ error: 'Could not persist checkout session' }, { status: 500 });
            }

            console.log(`[BillingCheckoutRoute] Success: user_id=${user.uid} checkout_id=${checkout.externalCheckoutId}`);

            return NextResponse.json({
                checkoutUrl: checkout.checkoutUrl,
                checkoutSessionId: checkoutSession.id,
            });
        }

        return NextResponse.json({
            checkoutUrl: checkout.checkoutUrl,
            checkoutSessionId: checkout.externalCheckoutId,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Checkout creation failed';
        const status = message.toLowerCase().includes('unauthorized') ? 401 : 502;
        console.error(`[BillingCheckoutRoute] Failure: error=${message}`);
        return NextResponse.json({ error: message }, { status });
    }
}
