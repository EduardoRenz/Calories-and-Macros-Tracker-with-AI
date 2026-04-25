---
status: pending
title: "Add Canonical Plan Mapping Read Path"
type: backend
complexity: medium
dependencies:
  - task_01
---

# Task 02: Add Canonical Plan Mapping Read Path

## Overview
Update the application’s Supabase-backed plan reads so canonical plans remain product-owned while still exposing the provider mapping data needed for checkout creation. This task keeps Supabase as the catalog source of truth and prevents the provider from leaking into normal plan browsing behavior.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- 1. MUST read plans from the canonical billing plan schema introduced in task 01.
- 2. MUST expose enough provider mapping data for downstream checkout creation without making the UI depend on provider-owned plan identity.
- 3. MUST preserve current localized plan rendering behavior or provide an equivalent replacement.
- 4. SHOULD keep compatibility with the existing `RepositoryFactory` and `PlansRepository` patterns unless the TechSpec requires a narrow contract change.
</requirements>

## Subtasks
- [ ] 2.1 Update the Supabase plan repository to read the new billing plan schema and provider mapping data.
- [ ] 2.2 Reconcile domain plan fields with the new canonical schema so downstream billing code can resolve external product identifiers safely.
- [ ] 2.3 Update plan seeding assumptions or supporting helpers to match the new schema contract.
- [ ] 2.4 Verify that the public plans page can continue to load active localized plans through the repository layer.

## Implementation Details
Use the current repository abstraction rather than bypassing it. Reference the TechSpec "Data Models" and "Impact Analysis" sections for the exact mapping boundary. Keep the public plans UI reading normalized domain `Plan` objects while enabling server-side checkout routes to obtain provider-specific mapping data from the same canonical source.

### Relevant Files
- `data/repositories/SupabasePlansRepository.ts` — Current Supabase plan read path that must be updated.
- `domain/entities/payment.ts` — Holds the `Plan` shape currently consumed by the UI.
- `domain/repositories/PlansRepository.ts` — Existing repository contract for plan retrieval.
- `scripts/seed-plans.ts` — Current seed path for plans and provider IDs.

### Dependent Files
- `app/plans/page.tsx` — Depends on stable plan reads for rendering and plan selection.
- `app/(authenticated)/checkout/page.tsx` — Resolves plan by ID before launching the billing flow.
- `app/api/_gateways/AbacatePayPaymentGateway.ts` — Will need mapped provider product identifiers for checkout creation.
- `app/api/billing/checkout/route.ts` — Planned route will depend on this canonical mapping path.

### Related ADRs
- [ADR-001: Supabase As Source Of Truth For Subscription Access](adrs/adr-001.md) — Plans stay product-owned in Supabase.
- [ADR-005: Supabase Plans Are The Canonical Product Catalog](adrs/adr-005.md) — This task implements the chosen ownership model.

## Deliverables
- Updated canonical Supabase plan read path
- Provider mapping availability for billing flows without changing product-owned plan identity
- Seed or fixture updates aligned with the new schema
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for plan retrieval through the repository and UI load path **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Verify active plans are mapped from the new billing schema into domain `Plan` objects with localized fields intact.
  - [ ] Verify the repository falls back predictably when a locale is missing and uses canonical defaults.
  - [ ] Verify provider mapping data for a plan can be resolved without mutating the public `Plan` rendering contract unexpectedly.
- Integration tests:
  - [ ] Load active plans from Supabase-backed fixtures and verify the plans page can still render monthly and yearly plans.
  - [ ] Verify inactive plans are excluded from the public plan list.
  - [ ] Verify an unmapped billing plan surfaces a deterministic error path for downstream server-side checkout consumers.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- The plan repository reads the new billing schema successfully
- Canonical plans remain Supabase-owned while provider mappings are available for billing actions
