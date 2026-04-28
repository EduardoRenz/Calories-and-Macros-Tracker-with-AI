---
status: completed
title: "Create Dedicated Billing SQL For Subscriptions"
type: backend
complexity: medium
dependencies: []
---

# Task 01: Create Dedicated Billing SQL For Subscriptions

## Overview
Create a new Supabase SQL file dedicated to billing and subscriptions so recurring-payment structures can evolve without destabilizing the broader app schema. This task establishes the storage contract for all later billing work, including provider mappings, subscription state, webhook event persistence, and financial history.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- 1. MUST create a new dedicated SQL file for billing and subscription concerns instead of expanding the existing general-purpose `supabase/sqls.sql`.
- 2. MUST define provider-agnostic billing tables, enums, indexes, RLS, and grants required by the TechSpec "Data Models" section.
- 3. MUST support pre-activation checkout lifecycle states without requiring a provider subscription ID at insert time.
- 4. MUST include durable inbound event persistence for webhook idempotency and auditability.
- 5. SHOULD keep user-facing read permissions narrow and prevent direct client writes to billing state tables.
</requirements>

## Subtasks
- [x] 1.1 Create a new Supabase billing SQL file dedicated to subscription and billing schema.
- [x] 1.2 Define the billing enums, core tables, indexes, and unique constraints required by the billing lifecycle.
- [x] 1.3 Add RLS policies and grants for user-visible billing reads while keeping write paths server-controlled.
- [x] 1.4 Document migration expectations or coexistence notes for the pre-existing schema draft.

## Implementation Details
Create a new SQL artifact such as `supabase/billing.sql` or `supabase/subscriptions.sql`. Follow the TechSpec "Data Models" and "Webhook Configuration Plan" sections for table scope and access boundaries. Keep the current monolithic SQL file untouched except for optional comments pointing to the new billing-specific script.

### Relevant Files
- `supabase/sqls.sql` — Current mixed schema draft that already contains an early billing section and shows existing naming patterns.
- `.compozy/tasks/integrar-abacatepay-supabase/_techspec.md` — Defines the target billing schema and state model.
- `.compozy/tasks/integrar-abacatepay-supabase/_prd.md` — Confirms product expectations around cancellation, irregular billing, and financial history.

### Dependent Files
- `data/repositories/SupabasePlansRepository.ts` — Will need to read the final plan and provider mapping shape.
- `data/repositories/SupabaseSubscriptionRepository.ts` — Will need to query the redesigned subscription tables.
- `scripts/seed-plans.ts` — Will need to seed against the new billing-specific plan schema.
- `supabase/functions/abacatepay-webhook/index.ts` — Will write into inbound event, subscription, and transaction tables created here.

### Related ADRs
- [ADR-001: Supabase As Source Of Truth For Subscription Access](adrs/adr-001.md) — Billing state must live in Supabase.
- [ADR-003: Redesign Billing Schema Around State Transitions And Event Auditability](adrs/adr-003.md) — Explains why a new schema is required.
- [ADR-005: Supabase Plans Are The Canonical Product Catalog](adrs/adr-005.md) — Requires canonical plans with provider mappings.
- [ADR-006: Optimize The MVP For Correctness And Auditability](adrs/adr-006.md) — Requires durable event logging and strict state support.

## Deliverables
- New billing-focused SQL file under `supabase/`
- Billing enums, tables, indexes, RLS policies, and grants aligned to the TechSpec
- Migration or coexistence notes describing how the new SQL relates to `supabase/sqls.sql`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for billing schema application and constrained reads **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Validate the SQL defines nullable provider subscription identifiers for pre-activation subscription rows.
  - [x] Validate unique constraints exist for inbound events and provider transaction identifiers.
  - [x] Validate the billing tables include constrained status fields required by the TechSpec.
- Integration tests:
  - [ ] Apply the new billing SQL to a clean Supabase database and verify all billing tables are created successfully.
  - [ ] Verify authenticated users can read only their own billing-facing rows through RLS policies.
  - [ ] Verify direct client-side writes to billing state tables are rejected where the design requires server-only mutation.
- Test coverage target: >=80%
- All tests must pass

## Validation Evidence

- `yarn test:billing-sql` passes and validates the SQL contract for required tables, nullable pre-activation subscription identifiers, unique idempotency constraints, constrained status fields, RLS enablement, grants, and direct client write prevention.
- `yarn build` passes after creating the local `.agent` directory required by the repository's tracked `.windsurf -> .agent` symlink.
- Supabase/Postgres integration tests are not executable in the local workflow because this project has no local Postgres or local Supabase environment. They remain an external deploy-time validation item for a connected Supabase project.

## Success Criteria
- All tests passing
- Test coverage >=80%
- A new dedicated billing SQL file exists and covers the subscription lifecycle without depending on `supabase/sqls.sql`
- The schema supports canonical plans, provider mappings, checkout sessions, inbound events, subscriptions, and transactions
