---
status: pending
title: "Update Subscription Read Model And Billing History Access"
type: backend
complexity: medium
dependencies:
  - task_01
  - task_05
---

# Task 06: Update Subscription Read Model And Billing History Access

## Overview
Refactor the app’s subscription read path so it reflects the richer billing lifecycle introduced by the new schema and event processor, and add a read path for financial history. This task makes billing state consumable by the application without exposing raw provider payloads.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- 1. MUST update the subscription repository to read the redesigned billing schema and expose correct active, cancelled-at-period-end, and irregular-billing states.
- 2. MUST preserve or replace the current free-plan fallback behavior in a way that remains consistent with the new billing model.
- 3. MUST add a billing history read path suitable for authenticated user-facing surfaces.
- 4. SHOULD keep the `SubscriptionContext` contract stable where possible or evolve it in a controlled way across all consumers.
</requirements>

## Subtasks
- [ ] 6.1 Refactor the Supabase subscription repository to query the new subscription storage model.
- [ ] 6.2 Normalize repository output so app consumers receive stable product-facing subscription state.
- [ ] 6.3 Add a billing history query path for authenticated user-visible transaction history.
- [ ] 6.4 Update the subscription context or related hooks to consume the new repository behavior safely.

## Implementation Details
Reference the TechSpec "Subscription Read Model", "Data Models", and "Impact Analysis" sections. Keep this task focused on normalized reads and query surfaces rather than provider writes. Billing history access may live as a new repository or a targeted server route, as long as it follows the existing project structure cleanly.

### Relevant Files
- `data/repositories/SupabaseSubscriptionRepository.ts` — Existing subscription read path that currently only checks active/trialing rows.
- `contexts/SubscriptionContext.tsx` — Existing subscription state provider for the app.
- `domain/entities/subscription.ts` — Current subscription entity that may need richer read semantics.
- `domain/repositories/SubscriptionRepository.ts` — Existing repository contract for subscription reads.
- `data/RepositoryFactory.ts` — Central repository resolution path.

### Dependent Files
- `components/Navbar.tsx` — Uses subscription status to render plan state in the user menu.
- `components/SubscriptionCard.tsx` — Will later rely on richer manage-state behavior.
- `app/(authenticated)/checkout/page.tsx` — Depends on accurate post-checkout read behavior.
- Task 08 surfaces — Depend on both normalized subscription and transaction-history reads.

### Related ADRs
- [ADR-001: Supabase As Source Of Truth For Subscription Access](adrs/adr-001.md) — Read paths must come from product-owned state.
- [ADR-003: Redesign Billing Schema Around State Transitions And Event Auditability](adrs/adr-003.md) — Read paths must align to the redesigned schema.

## Deliverables
- Updated Supabase subscription read model
- Billing history read path for authenticated consumers
- Subscription context or hook updates needed to expose the new read model
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for repository and context behavior against billing fixtures **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Verify an active subscription row resolves to premium access in the normalized read model.
  - [ ] Verify a cancelled-at-period-end subscription remains readable as premium until the period end is reached.
  - [ ] Verify irregular billing states resolve to non-premium access consistently.
  - [ ] Verify billing history rows are normalized into user-facing records ordered by occurrence date.
- Integration tests:
  - [ ] Load an authenticated user with seeded subscription and transaction fixtures and verify the context returns the expected subscription state.
  - [ ] Verify a user with no active subscription receives the intended free-plan fallback behavior.
  - [ ] Verify billing history reads return only the authenticated user’s transactions.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- The app can read normalized subscription state from the new billing schema
- Authenticated billing history access exists for later UI surfaces
