import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.21.0';
import { StripeEventProcessor } from './processor.ts';

type ProcessingState = 'received' | 'processing' | 'processed' | 'rejected' | 'failed';

interface PersistInboundEventInput {
  providerEventId: string;
  eventType: string;
  signature: string | null;
  payload: unknown;
  processingState: ProcessingState;
  errorMessage?: string;
}

const PROVIDER = 'stripe';

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function persistInboundEvent(input: PersistInboundEventInput): Promise<{ id: string | null; duplicate: boolean }> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('billing_inbound_events')
    .insert({
      provider: PROVIDER,
      provider_event_id: input.providerEventId,
      event_type: input.eventType,
      signature: input.signature,
      payload: input.payload,
      processing_state: input.processingState,
      error_message: input.errorMessage,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { id: null, duplicate: true };
    }

    throw error;
  }

  return { id: data?.id ?? null, duplicate: false };
}

async function updateProcessingState(id: string, processingState: ProcessingState, errorMessage?: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('billing_inbound_events')
    .update({
      processing_state: processingState,
      error_message: errorMessage,
      processed_at: processingState === 'processed' ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) throw error;
}

Deno.serve(async (request) => {
  try {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecret || !webhookSecret) {
        return jsonResponse({ error: 'Missing Stripe config' }, 500);
    }
    
    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });

    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!signature) throw new Error('No signature found');
        const cryptoProvider = Stripe.createSubtleCryptoProvider();
        event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret, undefined, cryptoProvider);
    } catch (err: any) {
        console.warn(`[stripe-webhook] Rejected: signature verification failed: ${err.message}`);
        
        await persistInboundEvent({
            providerEventId: `invalid:${crypto.randomUUID()}`,
            eventType: 'unknown',
            signature,
            payload: { rawBody },
            processingState: 'rejected',
            errorMessage: err.message,
        });
        
        return jsonResponse({ error: 'Webhook signature verification failed.' }, 400);
    }

    const providerEventId = event.id;
    const eventType = event.type;

    console.log(`[stripe-webhook] Ingress: event_id=${providerEventId} type=${eventType}`);

    const inboundEvent = await persistInboundEvent({
      providerEventId,
      eventType,
      signature,
      payload: event,
      processingState: 'received',
    });

    if (inboundEvent.duplicate) {
      console.log(`[stripe-webhook] Skipped: duplicate event_id=${providerEventId}`);
      return jsonResponse({ status: 'ok', duplicate: true });
    }

    if (inboundEvent.id) {
      console.log(`[stripe-webhook] Processing: event_id=${providerEventId} internal_id=${inboundEvent.id}`);
      await updateProcessingState(inboundEvent.id, 'processing');
      
      const supabase = getSupabaseAdminClient();
      const processor = new StripeEventProcessor(supabase);
      
      await processor.process({
        id: inboundEvent.id,
        provider: PROVIDER,
        provider_event_id: providerEventId,
        event_type: eventType,
        payload: event,
      });

      await updateProcessingState(inboundEvent.id, 'processed');
      console.log(`[stripe-webhook] Success: event_id=${providerEventId} type=${eventType}`);
    }

    return jsonResponse({ status: 'ok', duplicate: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    const stack = error instanceof Error ? error.stack : '';
    console.error(`[stripe-webhook] CRITICAL FAILURE: ${message}\n${stack}`);

    return jsonResponse({ error: message, detail: stack }, 500);
  }
});
