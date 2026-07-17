---
status: completed
title: Improve MacroProgressCard with optional className prop
type: refactor
complexity: low
dependencies: []
---

# Task 02: Improve MacroProgressCard with optional className prop

## Overview
The `MacroProgressCard` component (`components/MacroProgressCard.tsx`) has a fixed container `className`. The Landing Page's visual demo section needs to embed this component inside a different layout context without overriding its internal styles. Adding an optional `className` prop to the root `<div>` enables this without forking the component.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- NO UNIT TESTS — this feature does not require unit/component test coverage
</critical>

<requirements>
- MUST add an optional `className?: string` field to `MacroProgressCardProps`.
- MUST merge the provided `className` with the existing root `<div>` classes using a space-join (e.g. `bg-neutral-card p-6 rounded-2xl ${className ?? ''}`).
- MUST NOT break any existing consumers that do not pass `className`.
- MUST NOT alter the internal progress bar or typography styles.
</requirements>

## Subtasks
- [x] 2.1 Add `className?: string` to the `MacroProgressCardProps` interface
- [x] 2.2 Apply `className` to the root `<div>` alongside the existing static classes
- [x] 2.3 Confirm existing dashboard usage renders identically (no visual regression)

## Implementation Details
See TechSpec "Core Interfaces" section for the updated `MacroProgressCardProps` interface.

File to modify: `components/MacroProgressCard.tsx`

The root `<div>` currently has `className="bg-neutral-card p-6 rounded-2xl"`. The new prop should be appended after the existing classes so the caller can add spacing or size overrides without removing base styles.

### Relevant Files
- `components/MacroProgressCard.tsx` — the file to modify
- `app/(authenticated)/dashboard/` — existing consumer; must continue to render correctly

### Dependent Files
- `components/landing/LandingVisualDemo.tsx` — will pass a custom `className` for demo layout (created in task_05)

### Related ADRs
- [ADR-002: Modular Component Organization for Landing Page](../adrs/adr-002.md) — Establishes reuse strategy for existing components

## Deliverables
- Updated `components/MacroProgressCard.tsx` with `className` prop
- No visual regression on the dashboard page (verify in `pnpm dev:mock`)
- All checks pass (`pnpm lint` and `pnpm build`)

## Tests
- No unit/component tests for this task.
- `MacroProgressCard` behavior is exercised through `cypress/e2e/landing.cy.ts` (created in task_08) and through the existing `cypress/e2e/dashboard.cy.ts` (which must still pass).

## Success Criteria
- `MacroProgressCard` accepts and applies `className` without side effects
- Dashboard visual remains unchanged
- `pnpm lint` and `pnpm build` pass with no errors
- Existing Cypress dashboard tests still pass
