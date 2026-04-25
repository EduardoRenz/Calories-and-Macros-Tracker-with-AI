---
status: pending
title: "Rebuild Billing Provider Adapter And App Routes"
type: backend
complexity: high
dependencies:
  - task_01
  - task_02
---

# Task 03: Rebuild Billing Provider Adapter And App Routes

## Overview
Replace the current generic and partially mocked payment flow with a billing-specific server integration that creates hosted recurring checkouts and requests cancel-at-period-end through authenticated Next.js routes. This task establishes the main app-originated write path for billing while keeping provider-specific logic behind an adapter boundary.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- 1. MUST update the AbacatePay integration to use the documented `v2` billing flow and recurring hosted checkout behavior.
- 2. MUST add authenticated Next.js server routes for checkout creation and cancel-at-period-end.
- 3. MUST keep provider-specific HTTP logic behind the provider adapter layer rather than embedding it directly in route files.
- 4. MUST persist checkout intent or related intermediate state in Supabase as described by the TechSpec.
- 5. SHOULD deprecate or replace the existing generic `/api/payment` flow once the new routes are available.
</requirements>

## Subtasks
- [ ] 3.1 Refactor the billing adapter contract to support hosted subscription checkout creation and cancellation-at-period-end.
- [ ] 3.2 Rebuild the AbacatePay server adapter around `v2` endpoints, centavo amounts, and recurring product mapping.
- [ ] 3.3 Add authenticated Next.js billing routes for checkout creation and cancellation.
- [ ] 3.4 Persist checkout session or intent state in Supabase for later webhook correlation.
- [ ] 3.5 Retire or redirect the old generic payment route to the new billing-specific path.

## Implementation Details
Reference the TechSpec "Core Interfaces", "API Endpoints", and "Integration Points" sections. Reuse existing server-side auth and Supabase service-role access patterns where possible. Keep user actions in Next.js routes per the chosen architecture, while ensuring provider calls remain encapsulated and unit-testable.

### Relevant Files
- `app/api/_gateways/AbacatePayPaymentGateway.ts` — Current incomplete provider implementation that still points to `v1`.
- `app/api/_gateways/PaymentGatewayFactory.ts` — Existing provider selection entry point.
- `domain/gateways/PaymentGateway.ts` — Current contract that may need to be narrowed or expanded.
- `app/api/payment/route.ts` — Current generic route that should be deprecated or replaced.
- `data/supabaseServer.ts` — Existing server-side Supabase admin client.
- `env.ts` — Existing env validation for billing secrets and provider configuration.

### Dependent Files
- `data/gateways/NextApiPaymentGateway.ts` — Client-side gateway wrapper that will need to call the new billing routes.
- `app/(authenticated)/checkout/page.tsx` — Will rely on the new checkout creation route.
- `supabase/functions/abacatepay-webhook/index.ts` — Will correlate provider events back to checkout or subscription state created here.
- `contexts/SubscriptionContext.tsx` — Will refresh after checkout and cancel actions land.

### Related ADRs
- [ADR-002: Use Supabase Edge Functions For Provider Webhooks](adrs/adr-002.md) — Confirms that this task covers app-originated actions, not provider webhooks.
- [ADR-004: Keep User Actions In Next.js Server Routes](adrs/adr-004.md) — This task implements that boundary.
- [ADR-005: Supabase Plans Are The Canonical Product Catalog](adrs/adr-005.md) — Checkout routes must resolve canonical plan mappings before calling the provider.

## Deliverables
- Updated provider adapter contract for subscription billing actions
- Rebuilt AbacatePay `v2` adapter for hosted checkout and cancellation
- Authenticated Next.js billing routes for checkout and cancel actions
- Supabase persistence of checkout-session or intent data needed for webhook correlation
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for route auth, provider call behavior, and Supabase write side effects **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Verify checkout creation maps canonical plan data into the correct AbacatePay recurring checkout payload.
  - [ ] Verify cancellation requests reject subscriptions that are not in a cancellable state.
  - [ ] Verify provider `4xx` and `5xx` failures are translated into deterministic route responses.
- Integration tests:
  - [ ] `POST /api/billing/checkout` returns a hosted checkout URL for an authenticated user with a mapped active plan.
  - [ ] `POST /api/billing/checkout` rejects an unknown or inactive plan with the expected status code.
  - [ ] `POST /api/billing/cancel` marks cancel-at-period-end intent for an authenticated user with an active subscription.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Authenticated app-originated billing writes flow through Next.js routes and the provider adapter
- The old generic payment path is no longer the primary route for recurring subscription billing
