---
status: completed
title: Improve PlanCard with optional ctaLabel prop
type: refactor
complexity: low
dependencies: []
---

# Task 01: Improve PlanCard with optional ctaLabel prop

## Overview
The existing `PlanCard` component (`components/payment/PlanCard.tsx`) determines its button label internally based on currency and plan type, making it page-specific. Adding an optional `ctaLabel` prop allows the Landing Page's pricing section to override the label ("Começar Grátis", "Assinar Agora") without duplicating the component or breaking the existing `/plans` page.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- NO UNIT TESTS — this feature does not require unit/component test coverage
</critical>

<requirements>
- MUST add an optional `ctaLabel?: string` field to `PlanCardProps`.
- MUST use `ctaLabel` as the button text when provided; fall back to current default label logic when omitted.
- MUST NOT change any existing behavior for usages without `ctaLabel` (backward-compatible).
- MUST NOT break the existing `/plans` page or subscription card usages.
</requirements>

## Subtasks
- [x] 1.1 Add `ctaLabel?: string` to the `PlanCardProps` interface
- [x] 1.2 Update the `<Button>` render to prefer `ctaLabel` over the computed default label
- [x] 1.3 Verify all existing callers of `PlanCard` still work without the new prop

## Implementation Details
See TechSpec "Core Interfaces" section for the updated `PlanCardProps` interface definition.

File to modify: `components/payment/PlanCard.tsx`

The current button label logic (around lines 108-113) uses a ternary chain based on `isCurrentPlan`, `shouldUseGreenStyle`, and `plan.currency.code`. The new prop should short-circuit this chain when provided.

### Relevant Files
- `components/payment/PlanCard.tsx` — the file to modify
- `app/plans/page.tsx` — existing consumer; must continue to work without `ctaLabel`
- `components/SubscriptionCard.tsx` — check if it uses `PlanCard` directly

### Dependent Files
- `components/landing/LandingPricing.tsx` — will consume the new `ctaLabel` prop (created in task_05)

### Related ADRs
- [ADR-002: Modular Component Organization for Landing Page](../adrs/adr-002.md) — Establishes reuse strategy for existing components

## Deliverables
- Updated `components/payment/PlanCard.tsx` with `ctaLabel` prop
- Confirmed no regression in `app/plans/page.tsx` (visual inspection in `pnpm dev:mock`)
- All checks pass (`pnpm lint` and `pnpm build`)

## Tests
- No unit/component tests for this task.
- `PlanCard` behavior is exercised through `cypress/e2e/landing.cy.ts` (created in task_08) and through the existing `cypress/e2e/payment.cy.ts` and `cypress/e2e/feature-flags.cy.ts` (which must still pass).

## Success Criteria
- `PlanCard` renders `ctaLabel` text when provided
- Existing `/plans` page renders identically to before this change
- `pnpm lint` and `pnpm build` pass with no errors
- Existing Cypress payment/feature-flags tests still pass
