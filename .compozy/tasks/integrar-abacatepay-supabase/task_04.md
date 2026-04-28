---
status: completed
title: "Implement Supabase Webhook Function And Event Processing"
type: infra
complexity: critical
dependencies:
  - task_01
---

# Task 04: Implement Supabase Webhook Function And Event Processing

## Overview
Add the public Supabase Edge Function that receives AbacatePay webhook events, verifies HMAC signatures, records inbound events, and enforces idempotent processing boundaries. This is the external-provider ingress point for the billing system and the anchor for correctness-first event handling.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- 1. MUST add a public Supabase Edge Function dedicated to AbacatePay webhooks.
- 2. MUST disable JWT verification only for this webhook function and keep the rest of the system’s auth boundaries intact.
- 3. MUST validate webhook authenticity against the raw request body using the configured signature secret.
- 4. MUST persist inbound events before or alongside processing so duplicate deliveries and failures remain auditable.
- 5. MUST detect duplicate provider events idempotently using the schema introduced in task 01.
</requirements>

## Subtasks
- [x] 4.1 Create the Supabase Edge Function and any shared helper files needed for webhook handling.
- [x] 4.2 Configure the function for public invocation with JWT verification disabled only for this endpoint.
- [x] 4.3 Implement raw-body signature validation and event persistence for all inbound webhook deliveries.
- [x] 4.4 Implement duplicate-event detection and deterministic processing-state updates for received, processed, rejected, and failed events.
- [x] 4.5 Document required secrets and deployment expectations for local and hosted environments.

## Implementation Details
Follow the TechSpec "System Architecture", "Integration Points", and "Webhook Configuration Plan" sections. Keep this task focused on ingress, authenticity, event recording, and processing-state control. Do not duplicate downstream business-state transition logic that belongs in task 05.

### Relevant Files
- `supabase/` — Current Supabase directory where the new function and configuration files will live.
- `data/supabaseServer.ts` — Reference for service-role Supabase access patterns on the server side.
- `.compozy/tasks/integrar-abacatepay-supabase/_techspec.md` — Defines the webhook processing contract and expected statuses.
- `env.ts` — Reference for billing secrets that may need corresponding documentation or app-side validation.

### Dependent Files
- `supabase/functions/abacatepay-webhook/index.ts` — New function entry point created by this task.
- `supabase/config.toml` — Will need function-specific JWT settings if not already present.
- `.compozy/tasks/integrar-abacatepay-supabase/task_05.md` — Downstream state transition task depends on this ingress layer.
- Deployment and README-style setup notes — Will need the final webhook URL and secret expectations captured accurately.

### Related ADRs
- [ADR-002: Use Supabase Edge Functions For Provider Webhooks](adrs/adr-002.md) — This task directly implements the chosen ingress runtime.
- [ADR-003: Redesign Billing Schema Around State Transitions And Event Auditability](adrs/adr-003.md) — Requires inbound event persistence and idempotent storage.
- [ADR-006: Optimize The MVP For Correctness And Auditability](adrs/adr-006.md) — Requires strong event handling from the first release.

## Deliverables
- New Supabase Edge Function for AbacatePay webhooks
- Public function configuration with scoped JWT bypass
- Raw-body signature validation and inbound event persistence
- Idempotent duplicate-event detection and processing-state handling
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for signature validation, duplicate delivery handling, and Supabase event persistence **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Verify a valid HMAC signature over the raw payload is accepted.
  - [x] Verify an invalid signature is rejected before business mutation occurs.
  - [x] Verify duplicate provider event IDs are recognized without reprocessing the event body.
- Integration tests:
  - [ ] Send a signed webhook request to the function and verify an inbound event row is created with the expected processing state.
  - [ ] Re-send the same provider event and verify the function returns success without creating a duplicate mutation path.
  - [ ] Send a malformed or unsigned webhook payload and verify the function rejects it with the expected status code.
- Test coverage target: >=80%
- All tests must pass

## Validation Evidence

- `yarn test:abacatepay-webhook` passes and validates the scoped public Supabase function config, raw-body HMAC contract, supported signature headers, event persistence, rejected/received/processing/processed/failed states, duplicate `23505` handling, and deployment documentation.
- `yarn test:billing-routes`, `yarn test:plans-repository`, and `yarn test:billing-sql` all pass after adding the webhook function.
- `./node_modules/.bin/tsc --noEmit` passes with Supabase Deno functions excluded from the Next.js TypeScript project because they are deployed with the Supabase/Deno toolchain.
- `yarn build` passes after adding the webhook artifacts.
- Live Supabase Function integration tests are not executable locally because this project has no local Postgres or local Supabase environment. They remain external validation for a connected Supabase project.

## Success Criteria
- All tests passing
- Test coverage >=80%
- A public Supabase webhook endpoint exists and processes AbacatePay events idempotently
- Inbound webhook deliveries are auditable even when validation or processing fails
