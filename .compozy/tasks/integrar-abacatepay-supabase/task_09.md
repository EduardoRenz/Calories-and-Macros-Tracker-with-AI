---
status: pending
title: "Add Billing Observability, Fixtures, And Final Verification Coverage"
type: backend
complexity: medium
dependencies:
  - task_03
  - task_04
  - task_05
  - task_06
  - task_07
  - task_08
---

# Task 09: Add Billing Observability, Fixtures, And Final Verification Coverage

## Overview
Harden the billing integration with structured observability, reusable webhook fixtures, replay coverage, and final verification across the main flows. This task closes the loop on the correctness-first strategy by making billing behavior diagnosable and regression-resistant.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- 1. MUST add structured logging or equivalent observability fields for checkout creation, webhook ingestion, state transitions, and failure paths.
- 2. MUST add reusable fixtures or sample payloads for supported AbacatePay webhook events used in tests.
- 3. MUST verify duplicate and replay scenarios end-to-end across webhook processing and persisted state.
- 4. MUST include final integration verification across checkout launch, webhook mutation, subscription reads, and billing history UI.
- 5. SHOULD keep observability aligned with the TechSpec metrics and log-field guidance.
</requirements>

## Subtasks
- [ ] 9.1 Add structured logging fields across billing routes, webhook processing, and transition logic.
- [ ] 9.2 Create reusable webhook fixtures for the supported AbacatePay event set used by the MVP.
- [ ] 9.3 Add replay, duplicate-delivery, and failure-mode verification coverage across the billing stack.
- [ ] 9.4 Run and stabilize final end-to-end verification for checkout, state updates, and history presentation.

## Implementation Details
Reference the TechSpec "Monitoring and Observability", "Testing Approach", and "Known Risks" sections. This task is not a testing-only bucket: it should leave the system with durable fixtures, traceable logs, and final confidence in the full billing flow. Use the event types and fields already normalized by earlier tasks.

### Relevant Files
- `app/api/_gateways/AbacatePayPaymentGateway.ts` — Billing-route logging and provider call observability.
- `app/api/billing/checkout/route.ts` — Checkout request logging and failure visibility.
- `app/api/billing/cancel/route.ts` — Cancel request logging and failure visibility.
- `supabase/functions/abacatepay-webhook/index.ts` — Webhook ingress logging and processing-state output.
- Billing tests and fixtures directories — Will host reusable sample payloads and replay cases.
- `.compozy/tasks/integrar-abacatepay-supabase/_techspec.md` — Source of required metrics and log fields.

### Dependent Files
- Any integration test suites touching checkout, webhook, repository, or UI flows — Will consume the new fixtures and logging expectations.
- Deployment or runbook documentation — May need to mention key log identifiers and failure signals once observability is in place.

### Related ADRs
- [ADR-002: Use Supabase Edge Functions For Provider Webhooks](adrs/adr-002.md) — Requires traceable webhook processing.
- [ADR-006: Optimize The MVP For Correctness And Auditability](adrs/adr-006.md) — This task hardens the auditability commitment.

## Deliverables
- Structured billing logs or equivalent observability instrumentation
- Reusable webhook fixtures for supported AbacatePay billing events
- Replay and duplicate-delivery verification coverage
- Final end-to-end billing verification results across main app and webhook flows
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for replay, observability, and end-to-end billing flow verification **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Verify billing logs include provider, event ID, and processing-state fields in webhook success and failure cases.
  - [ ] Verify fixture payload loaders or helpers return deterministic event data for supported webhook types.
  - [ ] Verify duplicate-delivery handling emits the expected observability markers without double mutation.
- Integration tests:
  - [ ] Execute a checkout creation plus webhook completion flow and verify logs, subscription state, and history output align.
  - [ ] Replay the same webhook payload twice and verify the final state remains unchanged after the first successful mutation.
  - [ ] Execute a refund or failure scenario and verify observability output, subscription state, and history UI remain consistent.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Billing flows are observable enough to debug provider, webhook, and state-transition failures
- Final verification covers the main checkout, webhook, subscription, and financial-history paths end to end
