---
status: pending
title: "Apply Subscription State Transitions And Transaction Persistence"
type: backend
complexity: high
dependencies:
  - task_04
---

# Task 05: Apply Subscription State Transitions And Transaction Persistence

## Overview
Turn persisted inbound provider events into consistent product-owned subscription state and normalized financial history rows. This task encodes the core billing lifecycle rules that directly affect premium access, cancellation timing, and user-visible history.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- 1. MUST implement explicit state transitions for subscription completion, renewal, cancellation, and irregular billing outcomes.
- 2. MUST update product-owned subscription access state in a way that preserves premium until period end after cancellation but removes premium promptly when billing becomes irregular.
- 3. MUST persist normalized transaction history for paid, failed, refunded, disputed, or lost events supported by the chosen MVP model.
- 4. MUST keep processing idempotent when a previously seen inbound event is retried.
- 5. SHOULD avoid loose row overwrites and instead apply deterministic transition rules based on event type and current state.
</requirements>

## Subtasks
- [ ] 5.1 Implement the billing event processor that maps provider event types to product-owned subscription transitions.
- [ ] 5.2 Persist normalized subscription updates and transaction rows for relevant provider lifecycle events.
- [ ] 5.3 Enforce access-state outcomes that match the PRD for cancellation-at-period-end and irregular billing.
- [ ] 5.4 Handle duplicate and out-of-order event safety according to the TechSpec transition rules.
- [ ] 5.5 Expose deterministic processing outcomes back to the webhook layer for logging and auditability.

## Implementation Details
Use the schema and webhook infrastructure established in tasks 01 and 04. Reference the TechSpec "Data Models", "Testing Approach", and "Known Risks" sections for state semantics. Keep provider-payload normalization separate from application-facing read-model concerns, which are handled later in task 06.

### Relevant Files
- `supabase/functions/abacatepay-webhook/index.ts` — Webhook ingress path that will call the transition logic.
- Billing SQL created in task 01 — Defines the tables and statuses this logic must mutate.
- `.compozy/tasks/integrar-abacatepay-supabase/_techspec.md` — Specifies expected event handling and subscription outcomes.
- `.compozy/tasks/integrar-abacatepay-supabase/_prd.md` — Defines the product rules for cancellation and irregular billing access.

### Dependent Files
- `data/repositories/SupabaseSubscriptionRepository.ts` — Will later read the final subscription state generated here.
- Future billing history query path — Will later expose the normalized transaction rows created here.
- UI surfaces in tasks 07 and 08 — Depend on the correctness of these persisted states.

### Related ADRs
- [ADR-001: Supabase As Source Of Truth For Subscription Access](adrs/adr-001.md) — Requires product-owned subscription state.
- [ADR-003: Redesign Billing Schema Around State Transitions And Event Auditability](adrs/adr-003.md) — Requires explicit transitions and normalized persistence.
- [ADR-006: Optimize The MVP For Correctness And Auditability](adrs/adr-006.md) — Requires strict correctness over lightweight mutation.

## Deliverables
- Billing event processor with explicit state transitions
- Subscription persistence rules for activation, renewal, cancellation, and irregular billing
- Transaction persistence for user-visible financial history
- Idempotent handling for repeated or replayed inbound events
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for webhook-to-database lifecycle transitions **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Verify `subscription.completed` creates or activates a subscription with premium access.
  - [ ] Verify `subscription.renewed` advances the billing period and preserves premium access.
  - [ ] Verify `subscription.cancelled` preserves premium until period end when the provider payload indicates cancellation-at-period-end behavior.
  - [ ] Verify irregular billing events remove premium access promptly according to the PRD.
- Integration tests:
  - [ ] Process a first-time subscription completion event and verify both subscription state and transaction history rows are persisted.
  - [ ] Process a duplicate renewal event and verify transaction or subscription rows are not duplicated.
  - [ ] Process an out-of-order cancellation or refund scenario and verify the final persisted state remains deterministic.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Billing events produce deterministic subscription state aligned with the PRD
- Transaction history is persisted in a normalized form suitable for user-facing history surfaces
