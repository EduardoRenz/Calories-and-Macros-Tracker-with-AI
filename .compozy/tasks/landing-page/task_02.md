---
status: pending
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
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add an optional `className?: string` field to `MacroProgressCardProps`.
- MUST merge the provided `className` with the existing root `<div>` classes using a space-join (e.g. `bg-neutral-card p-6 rounded-2xl ${className ?? ''}`).
- MUST NOT break any existing consumers that do not pass `className`.
- MUST NOT alter the internal progress bar or typography styles.
</requirements>

## Subtasks
- [ ] 2.1 Add `className?: string` to the `MacroProgressCardProps` interface
- [ ] 2.2 Apply `className` to the root `<div>` alongside the existing static classes
- [ ] 2.3 Confirm existing dashboard usage renders identically (no visual regression)

## Implementation Details
See TechSpec "Core Interfaces" section for the updated `MacroProgressCardProps` interface.

File to modify: `components/MacroProgressCard.tsx`

The root `<div>` currently has `className="bg-neutral-card p-6 rounded-2xl"`. The new prop should be appended after the existing classes so the caller can add spacing or size overrides without removing base styles.

### Relevant Files
- `components/MacroProgressCard.tsx` — the file to modify
- `app/(authenticated)/dashboard/` — existing consumer; must continue to render correctly

### Dependent Files
- `components/landing/LandingVisualDemo.tsx` — will pass a custom `className` for demo layout (created in task_04)

### Related ADRs
- [ADR-002: Modular Component Organization for Landing Page](../adrs/adr-002.md) — Establishes reuse strategy for existing components

## Deliverables
- Updated `components/MacroProgressCard.tsx` with `className` prop
- No visual regression on the dashboard page (verify in `pnpm dev:mock`)
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for className passthrough **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Rendering with `className="mt-4"` applies the extra class to the root div without removing `bg-neutral-card`
  - [ ] Rendering without `className` produces identical output to the original component
  - [ ] Progress bar percentage calculation: `current=75, goal=100` produces a bar width of `75%`
  - [ ] Progress bar is capped at `100%` when `current > goal`
- Integration tests:
  - [ ] Dashboard page in Cypress mock mode shows MacroProgressCard with correct values
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `MacroProgressCard` accepts and applies `className` without side effects
- Dashboard visual remains unchanged
