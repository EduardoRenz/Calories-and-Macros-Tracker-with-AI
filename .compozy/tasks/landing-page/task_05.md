---
status: pending
title: Assemble LandingPageContent and create /landing-page route
type: feature
complexity: medium
dependencies: [task_04]
---

# Task 05: Assemble LandingPageContent and create /landing-page route

## Overview
Create the main `LandingPageContent` component that assembles all landing page sub-components (created in task_04) into a cohesive page, and establish the `/landing-page` route. This component will serve as the reusable landing page content that can be rendered on both `/` (for unauthenticated users) and `/landing-page` (for all users).

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `components/landing/LandingPageContent.tsx` that composes all 8 landing page sections in order
- MUST create `app/landing-page/page.tsx` route that renders `LandingPageContent`
- MUST use `'use client'` directive since components consume hooks
- MUST include all sections: LandingNavbar, LandingHero, LandingKeyStats, LandingAIFeatures, LandingClinicalFocus, LandingVisualDemo, LandingPricing, LandingCTA, Footer (reused from components/Footer.tsx)
- MUST ensure smooth scroll behavior for anchor links
- MUST support both light and dark themes
- MUST be fully responsive (mobile-first)
- MUST use translation hooks for all text content
</requirements>

## Subtasks
- [ ] 5.1 Create `components/landing/LandingPageContent.tsx` with all sections composed
- [ ] 5.2 Create `app/landing-page/page.tsx` route file
- [ ] 5.3 Verify responsive layout on mobile, tablet, and desktop viewports
- [ ] 5.4 Test anchor link scrolling behavior
- [ ] 5.5 Verify theme switching works correctly

## Implementation Details
See TechSpec "Page Assembly" section for the complete component structure and layout order.

The component composition order should be:
1. LandingNavbar (sticky header)
2. LandingHero
3. LandingKeyStats
4. LandingAIFeatures (id="features")
5. LandingClinicalFocus (id="benefits")
6. LandingVisualDemo
7. LandingPricing (id="pricing", feature-flag gated)
8. LandingCTA
9. Footer (reused from components/Footer.tsx)

### Relevant Files
- `components/landing/LandingPageContent.tsx` — new file to create
- `app/landing-page/page.tsx` — new route file to create
- All components from `components/landing/` created in task_04

### Dependent Files
- `app/page.tsx` — will consume `LandingPageContent` in task_06

### Related ADRs
- [ADR-001: Separation of Landing Page and Login Page Route Structure](../adrs/adr-001.md) — Defines route structure

## Deliverables
- `components/landing/LandingPageContent.tsx` with all sections composed
- `app/landing-page/page.tsx` route file
- Verified responsive layout on multiple viewports
- Verified anchor link scrolling
- Verified theme switching
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for page rendering **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `LandingPageContent` renders all 8 sections in correct order
  - [ ] `LandingPageContent` applies correct theme classes
  - [ ] `LandingPageContent` uses translation hooks correctly
- Integration tests:
  - [ ] Visit `/landing-page` in Cypress mock mode — page renders without errors
  - [ ] Verify all sections are visible on the page
  - [ ] Verify anchor links scroll to correct sections
  - [ ] Verify theme toggle switches between light/dark modes
  - [ ] Verify language switcher changes translations
  - [ ] Verify responsive layout on mobile (375px), tablet (768px), desktop (1024px)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `/landing-page` route renders complete landing page
- All 8 sections visible and correctly ordered
- Anchor links scroll smoothly to target sections
- Theme switching works correctly
- Responsive layout works on all viewports
