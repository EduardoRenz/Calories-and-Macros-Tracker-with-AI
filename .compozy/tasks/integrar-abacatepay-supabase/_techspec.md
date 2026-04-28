# TechSpec: AbacatePay Subscription Management With Supabase-Centered Billing State

## Executive Summary

This implementation keeps Supabase as the billing system of record while integrating AbacatePay as the initial recurring billing provider. The design splits billing responsibilities across two runtimes with a clear boundary: Next.js server routes handle authenticated user actions such as starting hosted checkout and requesting cancel-at-period-end, while Supabase Edge Functions receive AbacatePay webhooks and apply idempotent state transitions directly to Supabase.

The primary trade-off is upfront complexity in exchange for stronger correctness. Compared with a lighter MVP, this design adds an inbound event log, stricter lifecycle modeling, and a more explicit schema redesign. In return, it reduces the risk of access mismatches, preserves provider agnosticism, and creates a durable path for future provider replacement.

## System Architecture

### Component Overview

- `Plans UI` (`/plans`, `/checkout`, settings/profile/navigation surfaces`)
  - Reads canonical plans from Supabase-backed repositories.
  - Initiates checkout and later exposes manage/cancel/history surfaces.

- `Next.js Billing Routes`
  - Authenticated app-facing endpoints.
  - Validate user session, resolve plan mapping, call provider adapters, and persist checkout intent or cancellation requests.

- `Provider Adapter Layer`
  - Extends the existing payment gateway abstraction.
  - Encapsulates AbacatePay API calls for customer upsert, hosted subscription checkout creation, and subscription cancellation.

- `Supabase Billing Schema`
  - Stores canonical plan catalog, provider mappings, customer mappings, subscription state, financial transactions, and inbound webhook events.
  - Remains product-oriented rather than provider-oriented.

- `Supabase Edge Function: abacatepay-webhook`
  - Public HTTPS endpoint with JWT verification disabled.
  - Verifies HMAC signature against the raw body.
  - Records inbound events.
  - Applies idempotent subscription and transaction mutations.

- `Subscription Read Model`
  - Existing `SupabaseSubscriptionRepository` evolves to read the new schema and expose a stable domain subscription state to the app.
  - Additional repository or query path exposes financial history to authenticated users.

- `Observability Layer`
  - Structured logs in Next.js routes and Supabase Edge Functions.
  - Event processing status fields inside Supabase for auditability and replay support.

Data flow:
1. User selects a paid plan from the plan catalog.
2. Next.js route validates the authenticated user and resolves the canonical Supabase plan plus provider mapping.
3. Next.js creates or reuses a provider customer, creates a hosted recurring checkout, persists the local checkout attempt, and returns the provider URL.
4. User completes payment in the AbacatePay hosted flow.
5. AbacatePay sends webhook events to the Supabase Edge Function.
6. The function validates, persists the raw event, performs idempotent transitions, updates subscription and transaction state, and marks the event processed.
7. Existing app surfaces read billing state from Supabase through repositories and reflect premium access, cancel-at-period-end, and transaction history.

External system interactions:
- AbacatePay REST API `https://api.abacatepay.com/v2`
- Supabase Auth, Postgres, and Edge Functions

## Implementation Design

### Core Interfaces

TypeScript application contract:
```ts
export interface BillingProviderAdapter {
  createHostedSubscriptionCheckout(input: {
    userId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ checkoutUrl: string; externalCheckoutId: string }>;

  cancelSubscriptionAtPeriodEnd(input: {
    userId: string;
    subscriptionId: string;
  }): Promise<void>;
}
```

TypeScript webhook mutation contract:
```ts
export interface BillingEventProcessor {
  persistInboundEvent(input: {
    provider: 'abacatepay';
    eventType: string;
    eventId: string;
    payload: unknown;
    signature: string | null;
  }): Promise<{ inboundEventId: string; duplicate: boolean }>;

  processInboundEvent(inboundEventId: string): Promise<void>;
}
```

Go reference type for the primary state transition record:
```go
type BillingInboundEvent struct {
    ID              string
    Provider        string
    ProviderEventID string
    EventType       string
    ProcessingState string
    ReceivedAt      time.Time
    ProcessedAt     *time.Time
}
```

Error handling conventions:
- Route handlers return `401` for unauthenticated access, `404` for unknown plan or subscription, `409` for invalid state transition, and `502` for provider failures.
- Webhook handlers always persist rejected or failed events where possible before returning.
- Duplicate webhook events return `200` after idempotency confirmation.

### Data Models

Recommended schema redesign:

1. `billing_plans`
- `id uuid primary key`
- `plan_code text unique not null`
- `display_order integer not null default 0`
- `billing_interval text not null check (...)`
- `active boolean not null default true`
- `locales jsonb not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

2. `billing_plan_provider_mappings`
- `id uuid primary key`
- `plan_id uuid not null references billing_plans(id)`
- `provider payment_provider not null`
- `provider_product_id text not null`
- `provider_product_external_id text`
- `provider_price_amount integer not null`
- `currency text not null default 'BRL'`
- `provider_cycle text not null`
- unique `(plan_id, provider)`

3. `billing_customers`
- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `provider payment_provider not null`
- `provider_customer_id text not null`
- `email text not null`
- `tax_id text`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null`
- unique `(user_id, provider)`
- unique `(provider, provider_customer_id)`

4. `billing_subscriptions`
- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `plan_id uuid not null references billing_plans(id)`
- `provider payment_provider not null`
- `provider_subscription_id text null`
- `provider_checkout_id text null`
- `status subscription_status not null`
- `access_status text not null`
- `cancel_at_period_end boolean not null default false`
- `current_period_start timestamptz null`
- `current_period_end timestamptz null`
- `canceled_at timestamptz null`
- `ended_at timestamptz null`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- partial unique index on `(provider, provider_subscription_id)` where not null

5. `billing_transactions`
- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `subscription_id uuid null references billing_subscriptions(id)`
- `provider payment_provider not null`
- `provider_transaction_id text not null`
- `provider_checkout_id text null`
- `transaction_type text not null`
- `status text not null`
- `amount_cents integer not null`
- `currency text not null default 'BRL'`
- `occurred_at timestamptz not null`
- `receipt_url text null`
- `metadata jsonb not null default '{}'::jsonb`
- unique `(provider, provider_transaction_id)`

6. `billing_inbound_events`
- `id uuid primary key`
- `provider payment_provider not null`
- `provider_event_id text not null`
- `event_type text not null`
- `signature text null`
- `payload jsonb not null`
- `processing_state text not null`
- `error_message text null`
- `received_at timestamptz not null`
- `processed_at timestamptz null`
- unique `(provider, provider_event_id)`

7. `billing_checkout_sessions`
- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `plan_id uuid not null references billing_plans(id)`
- `provider payment_provider not null`
- `provider_checkout_id text not null`
- `checkout_url text not null`
- `status text not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- unique `(provider, provider_checkout_id)`

Status model:
- `subscription_status`: `pending`, `trialing`, `active`, `past_due`, `canceled`, `unpaid`, `inactive`
- `access_status`: `free`, `premium`, `grace_locked`
- `billing_transactions.status`: constrained values such as `paid`, `failed`, `refunded`, `disputed`, `lost`
- `billing_inbound_events.processing_state`: `received`, `processing`, `processed`, `rejected`, `failed`

Schema notes:
- Replace the current `plans`/`subscriptions` direct shape rather than incrementally patching it.
- Preserve RLS for user-facing reads.
- Do not grant client writes to billing state tables.
- Keep webhook writes service-role only.

### API Endpoints

Authenticated Next.js routes:

`POST /api/billing/checkout`
- Description: Create a hosted recurring checkout URL for the selected plan.
- Request:
  - `planId: string`
- Response `200`:
  - `checkoutUrl: string`
  - `checkoutSessionId: string`
- Errors:
  - `401` unauthenticated
  - `404` plan not found or not active
  - `409` plan lacks provider mapping
  - `502` provider error

`POST /api/billing/cancel`
- Description: Request cancel-at-period-end for the user’s active subscription.
- Request:
  - `subscriptionId: string`
- Response `200`:
  - `status: "ok"`
  - `cancelAtPeriodEnd: true`
- Errors:
  - `401` unauthenticated
  - `404` active subscription not found
  - `409` subscription cannot be cancelled from current state
  - `502` provider error

`GET /api/billing/history`
- Description: Return user-visible transaction history.
- Response `200`:
  - array of normalized billing events with amount, status, type, and occurred date

Public Supabase Edge Function:

`POST /functions/v1/abacatepay-webhook`
- Description: Receive AbacatePay webhook events.
- Headers:
  - provider signature header
- Response:
  - `200` processed or duplicate accepted
  - `400` invalid payload
  - `401` invalid signature
  - `500` transient processing failure

### API payload mapping

AbacatePay assumptions based on current docs:
- Base URL: `https://api.abacatepay.com/v2`
- Amounts are always in centavos
- Recurring checkout requires one item with provider product already configured with `cycle`
- Webhook events of primary interest:
  - `subscription.completed`
  - `subscription.renewed`
  - `subscription.cancelled`
  - `checkout.refunded`
  - `checkout.disputed`
  - `checkout.lost`

## Integration Points

- AbacatePay REST API
  - Purpose: customer upsert, hosted recurring checkout creation, cancel subscription
  - Auth: Bearer token via `ABACATE_PAY_API_KEY`
  - Retry strategy: bounded retries for network and `5xx`, no blind retries on semantic `4xx`

- AbacatePay Webhooks
  - Purpose: authoritative provider event ingestion
  - Auth: HMAC validation against raw body using webhook secret
  - Retry strategy: idempotent event handling, safe reprocessing by unique `(provider, provider_event_id)`

- Supabase Edge Functions
  - Purpose: public webhook receiver
  - Auth: `verify_jwt = false` only for this function
  - Secrets: webhook secret and service-role access via Supabase project secrets

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|---------------------|-----------------|
| `supabase/sqls.sql` | modified | Current schema is too weak for recurring billing correctness; high risk if left unchanged | Replace billing schema section with redesigned tables, enums, indexes, RLS |
| `app/api/_gateways/AbacatePayPaymentGateway.ts` | modified | Currently incomplete and still points at `v1`; high risk | Rebuild around `v2` hosted subscription checkout and cancellation |
| `domain/gateways/PaymentGateway.ts` | modified | Current contract is too generic for subscription lifecycle | Split or expand contract for checkout creation and cancel-at-period-end |
| `app/api/payment/route.ts` | deprecated | Current route is too payment-generic and oriented to mocked processing | Replace with `/api/billing/*` routes |
| `app/(authenticated)/checkout/page.tsx` | modified | Current page assumes mock method selection and inline form; medium risk | Convert to hosted-checkout launch flow |
| `contexts/SubscriptionContext.tsx` | modified | Needs to reflect richer status model | Update read model and refresh triggers |
| `data/repositories/SupabaseSubscriptionRepository.ts` | modified | Reads only a narrow active-state query; medium risk | Read normalized billing subscription state and plan mapping |
| `data/repositories/SupabasePlansRepository.ts` | modified | Needs plan/provider mapping compatibility | Update reads to the new plan schema |
| `settings/profile/navigation components` | modified | Need manage status and history surfaces | Add subscription detail and billing history UI hooks |
| `supabase/functions/abacatepay-webhook` | new | New provider ingress surface; high risk | Add public Edge Function with signature verification and idempotent processing |
| `billing history repository/query path` | new | Needed for user-visible financial history | Add server query path and typed response model |

## Testing Approach

### Unit Tests

- Provider adapter tests
  - map canonical plan to provider payload
  - convert centavos and dates correctly
  - handle provider `4xx` and `5xx` failure branches

- State transition tests
  - `subscription.completed` creates or activates a subscription
  - `subscription.renewed` advances period and keeps premium
  - `subscription.cancelled` sets cancel-at-period-end or ended state according to payload
  - failed, disputed, refunded, and lost transaction events produce the correct transaction rows and access changes

- Signature validation tests
  - valid HMAC accepted
  - invalid HMAC rejected
  - raw-body mismatch rejected

- Repository tests
  - active subscription resolves to premium
  - irregular billing resolves to no premium
  - financial history query returns ordered normalized rows

### Integration Tests

- Next.js route + provider adapter + Supabase write path
  - create checkout for mapped active plan
  - reject checkout for inactive or unmapped plan
  - cancel active subscription

- Webhook function + Supabase tables
  - process first delivery
  - process duplicate delivery idempotently
  - process out-of-order delivery with deterministic state rules

- UI integration
  - plans page launches hosted checkout
  - profile/settings surfaces show current status
  - billing history displays paid, failed, and refunded events

Test data requirements:
- seeded canonical plans with provider mapping
- authenticated test user
- fixture webhook payloads from AbacatePay event shapes
- replay payload set for duplicate and out-of-order deliveries

## Development Sequencing

### Build Order

1. Redesign Supabase billing schema and enums, including RLS and indexes - no dependencies
2. Build the canonical plan-to-provider mapping read path - depends on step 1
3. Rework the provider adapter contracts and AbacatePay `v2` implementation - depends on steps 1-2
4. Add authenticated Next.js billing routes for checkout and cancel - depends on step 3
5. Build the Supabase Edge Function webhook receiver and inbound event processor - depends on step 1
6. Implement subscription state transition logic and transaction persistence - depends on step 5
7. Update repositories and subscription context to read the new schema - depends on steps 1 and 6
8. Replace checkout UI with hosted-checkout launch behavior - depends on steps 4 and 7
9. Add billing status and history surfaces in settings/profile/navigation - depends on steps 7-8
10. Add observability, replay safety checks, and final integration tests - depends on steps 4-9

### Technical Dependencies

- Supabase project with Edge Functions enabled
- AbacatePay API key
- AbacatePay webhook secret
- Public HTTPS webhook endpoint URL
- final canonical list of plan codes and provider product mappings
- decision on exact environment variable names for billing secrets

## Monitoring and Observability

- Key metrics
  - webhook delivery count by event type
  - duplicate event count
  - failed event processing count
  - checkout creation success rate
  - cancel request success rate
  - subscription state mismatch count during reconciliation

- Structured log fields
  - `provider`
  - `provider_event_id`
  - `event_type`
  - `user_id`
  - `subscription_id`
  - `provider_subscription_id`
  - `provider_checkout_id`
  - `processing_state`
  - `error_code`

- Alerting thresholds
  - repeated webhook failures for the same event type
  - elevated duplicate processing with mutation attempts
  - checkout creation failures above baseline
  - subscriptions stuck in `pending` beyond expected completion window

## Technical Considerations

### Key Decisions

- Decision: Use Supabase Edge Functions for provider webhooks
  - Rationale: aligns provider ingress with the source of truth
  - Trade-offs: adds another runtime surface
  - Alternatives rejected: Next.js webhook routes, hybrid forwarding

- Decision: Keep user actions in Next.js server routes
  - Rationale: matches the current app architecture and auth model
  - Trade-offs: billing writes span two runtimes
  - Alternatives rejected: all writes in Supabase Functions

- Decision: Redesign the billing schema instead of lightly patching it
  - Rationale: the current schema does not model pre-activation, idempotency, or auditability well enough
  - Trade-offs: more upfront migration work
  - Alternatives rejected: minimal schema patching, provider-first mirrors

- Decision: Optimize phase one for correctness
  - Rationale: access-control mistakes are user-visible and expensive
  - Trade-offs: larger MVP
  - Alternatives rejected: speed-first MVP, lighter middle path

### Known Risks

- AbacatePay payload details may vary from the currently documented examples
  - Mitigation: store raw payloads and avoid lossy ingestion assumptions

- Provider event order may not always match product expectations
  - Mitigation: enforce explicit state transition rules and event idempotency

- Current app abstractions may be too payment-generic for recurring billing lifecycle
  - Mitigation: narrow contracts around subscription checkout and subscription management rather than one generic `processPayment`

- Schema migration could conflict with existing development data
  - Mitigation: isolate the redesigned billing section and provide explicit migration scripts

## Webhook Configuration Plan

Required Supabase artifacts:
- `supabase/functions/abacatepay-webhook/index.ts`
- `supabase/config.toml` entry:
  - `[functions.abacatepay-webhook]`
  - `verify_jwt = false`

Required secrets:
- `ABACATE_PAY_API_KEY`
- `ABACATE_PAY_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended setup commands:
```bash
supabase functions new abacatepay-webhook
supabase secrets set ABACATE_PAY_WEBHOOK_SECRET=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase functions deploy abacatepay-webhook --no-verify-jwt
```

Expected provider webhook target:
```text
https://<project-ref>.supabase.co/functions/v1/abacatepay-webhook
```

Validation behavior:
- read raw request body
- compute HMAC using the configured secret
- compare against the provider signature header
- reject invalid signature before state mutation
- insert raw event row
- process idempotently
- update processing status and error field

## Blockers And Inputs Still Needed

Implementation can progress into schema and code planning now, but end-to-end completion will still need:
- AbacatePay production or dev API key
- AbacatePay webhook secret
- final list of Supabase plan codes to AbacatePay product IDs
- confirmation of the public URL to register in the AbacatePay dashboard
- exact signature header name used in your environment if it differs from current docs/examples

## Architecture Decision Records

- [ADR-001: Supabase As Source Of Truth For Subscription Access](adrs/adr-001.md) — Supabase owns customer linkage, subscription access state, and financial history.
- [ADR-002: Use Supabase Edge Functions For Provider Webhooks](adrs/adr-002.md) — Provider webhook ingestion terminates in Supabase, not the Next.js app.
- [ADR-003: Redesign Billing Schema Around State Transitions And Event Auditability](adrs/adr-003.md) — The billing schema is redesigned before implementation instead of lightly patched.
- [ADR-004: Keep User Actions In Next.js Server Routes](adrs/adr-004.md) — Authenticated app-originated billing actions stay in the Next.js server layer.
- [ADR-005: Supabase Plans Are The Canonical Product Catalog](adrs/adr-005.md) — Supabase owns plan identity and provider mappings remain external references.
- [ADR-006: Optimize The MVP For Correctness And Auditability](adrs/adr-006.md) — The first implementation favors idempotency, auditability, and explicit transitions over shortest delivery.
