import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { BillingEventProcessor } from './processor.ts';

type ProcessingState = 'received' | 'processing' | 'processed' | 'rejected' | 'failed';

interface AbacatePayWebhookPayload {
  id?: string;
  event?: string;
  apiVersion?: number;
  data?: unknown;
}

interface PersistInboundEventInput {
  providerEventId: string;
  eventType: string;
  signature: string | null;
  payload: unknown;
  processingState: ProcessingState;
  errorMessage?: string;
}

const PROVIDER = 'abacatepay';
const SIGNATURE_HEADERS = ['x-webhook-signature', 'x-abacate-signature'];

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getSignature(request: Request): string | null {
  for (const header of SIGNATURE_HEADERS) {
    const value = request.headers.get(header);
    if (value) return value;
  }

  return null;
}

function bytesToBase64(bytes: ArrayBuffer): string {
  const byteArray = new Uint8Array(bytes);
  let binary = '';

  for (const byte of byteArray) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

async function computeHmac(rawBody: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));

  return bytesToBase64(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  if (aBytes.length !== bBytes.length) return false;

  let result = 0;
  for (let index = 0; index < aBytes.length; index += 1) {
    result |= aBytes[index] ^ bBytes[index];
  }

  return result === 0;
}

async function verifySignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');

  if (!secret || !signature) return false;

  const expectedSignature = await computeHmac(rawBody, secret);
  return timingSafeEqual(expectedSignature, signature);
}

function parsePayload(rawBody: string): AbacatePayWebhookPayload | null {
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    return parsed as AbacatePayWebhookPayload;
  } catch {
    return null;
  }
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

    const url = new URL(request.url);
    const urlSecret = url.searchParams.get('webhookSecret');
    const expectedSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');

    const rawBody = await request.text();
    const signature = getSignature(request);
    const payload = parsePayload(rawBody);
    const providerEventId = payload?.id || `invalid:${crypto.randomUUID()}`;
    const eventType = payload?.event || 'unknown';

    console.log(`[abacatepay-webhook] Ingress: event_id=${providerEventId} type=${eventType}`);

    // 1. Validate Authorization
    let authorized = false;
    
    // A. URL Secret Validation (Priority)
    if (expectedSecret && urlSecret === expectedSecret) {
      authorized = true;
    }

    // B. HMAC Signature Validation (Fallback or Double-Check)
    const hmacSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');
    if (hmacSecret && signature) {
      const signatureIsValid = await verifySignature(rawBody, signature);
      authorized = authorized || signatureIsValid;
    }

    if (!authorized) {
      console.warn(`[abacatepay-webhook] Rejected: unauthorized event_id=${providerEventId}`);
      return jsonResponse({ error: 'Unauthorized: Invalid secret or signature' }, 401);
    }

    if (!payload?.id || !payload.event) {
      console.warn(`[abacatepay-webhook] Rejected: malformed_payload event_id=${providerEventId}`);
      await persistInboundEvent({
        providerEventId,
        eventType,
        signature,
        payload: payload ?? { rawBody },
        processingState: 'rejected',
        errorMessage: 'Malformed AbacatePay webhook payload',
      });

      return jsonResponse({ error: 'Invalid payload' }, 400);
    }

    const inboundEvent = await persistInboundEvent({
      providerEventId,
      eventType,
      signature,
      payload,
      processingState: 'received',
    });

    if (inboundEvent.duplicate) {
      console.log(`[abacatepay-webhook] Skipped: duplicate event_id=${providerEventId}`);
      return jsonResponse({ status: 'ok', duplicate: true });
    }

    if (inboundEvent.id) {
      console.log(`[abacatepay-webhook] Processing: event_id=${providerEventId} internal_id=${inboundEvent.id}`);
      await updateProcessingState(inboundEvent.id, 'processing');
      
      const supabase = getSupabaseAdminClient();
      const processor = new BillingEventProcessor(supabase);
      
      await processor.process({
        id: inboundEvent.id,
        provider: PROVIDER,
        provider_event_id: providerEventId,
        event_type: eventType,
        payload,
      });

      await updateProcessingState(inboundEvent.id, 'processed');
      console.log(`[abacatepay-webhook] Success: event_id=${providerEventId} type=${eventType}`);
    }

    return jsonResponse({ status: 'ok', duplicate: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    const stack = error instanceof Error ? error.stack : '';
    console.error(`[abacatepay-webhook] CRITICAL FAILURE: ${message}\n${stack}`);

    // SECURITY: Don't leak stack traces or internal error messages to the client
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
});
