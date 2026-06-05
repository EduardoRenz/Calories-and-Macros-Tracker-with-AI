---
status: pending
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
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add an optional `ctaLabel?: string` field to `PlanCardProps`.
- MUST use `ctaLabel` as the button text when provided; fall back to current default label logic when omitted.
- MUST NOT change any existing behavior for usages without `ctaLabel` (backward-compatible).
- MUST NOT break the existing `/plans` page or subscription card usages.
</requirements>

## Subtasks
- [ ] 1.1 Add `ctaLabel?: string` to the `PlanCardProps` interface
- [ ] 1.2 Update the `<Button>` render to prefer `ctaLabel` over the computed default label
- [ ] 1.3 Verify all existing callers of `PlanCard` still work without the new prop

## Implementation Details
See TechSpec "Core Interfaces" section for the updated `PlanCardProps` interface definition.

File to modify: `components/payment/PlanCard.tsx`

The current button label logic (lines 108-113) uses a ternary chain based on `isCurrentPlan`, `shouldUseGreenStyle`, and `plan.currency.code`. The new prop should short-circuit this chain when provided.

### Relevant Files
- `components/payment/PlanCard.tsx` — the file to modify
- `app/plans/page.tsx` — existing consumer; must continue to work without `ctaLabel`
- `components/SubscriptionCard.tsx` — check if it uses `PlanCard` directly

### Dependent Files
- `components/landing/LandingPricing.tsx` — will consume the new `ctaLabel` prop (created in task_04)

### Related ADRs
- [ADR-002: Modular Component Organization for Landing Page](../adrs/adr-002.md) — Establishes reuse strategy for existing components

## Deliverables
- Updated `components/payment/PlanCard.tsx` with `ctaLabel` prop
- Confirmed no regression in `app/plans/page.tsx` (visual inspection in `pnpm dev:mock`)
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for PlanCard ctaLabel behavior **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Rendering `PlanCard` with `ctaLabel="Começar Grátis"` shows that exact text on the button
  - [ ] Rendering `PlanCard` without `ctaLabel` shows the default computed label (e.g. "Começar" for free plan in BRL)
  - [ ] Rendering `PlanCard` with `isCurrentPlan=true` and `ctaLabel` still shows "Plano Atual" (isCurrentPlan takes precedence)
- Integration tests:
  - [ ] Visit `/plans` in Cypress mock mode — plan cards render without errors and show correct default labels
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `PlanCard` renders `ctaLabel` text when provided
- Existing `/plans` page renders identically to before this change
