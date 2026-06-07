---
status: completed
title: Assemble LandingPageContent and create /landing-page route
type: feature
complexity: medium
dependencies: [task_05]
---

# Task 06: Assemble LandingPageContent and create /landing-page route

## Overview
Create the main `LandingPageContent` component that assembles all landing page sub-components (created in task_05) into a cohesive page, and establish the `/landing-page` route. This component is the reusable landing page content rendered on both `/` (for unauthenticated users) and `/landing-page` (for all users). The section order and anchor IDs match `.compozy/tasks/landing-page/code.html` exactly.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- NO UNIT TESTS — this feature does not require unit/component test coverage
</critical>

<requirements>
- MUST create `components/landing/LandingPageContent.tsx` that composes all 8 landing page sections in `code.html` order.
- MUST create `app/landing-page/page.tsx` route that renders `LandingPageContent`.
- MUST use `'use client'` directive since components consume hooks.
- MUST include all sections: LandingNavbar, LandingHero, LandingKeyStats, LandingAIFeatures, LandingClinicalFocus, LandingVisualDemo, LandingPricing, LandingCTA, Footer (reused from `components/Footer.tsx`).
- MUST use the anchor IDs declared in `code.html`: `#benefits`, `#how-it-works`, `#features`, `#pricing`, `#login` (delegated to sub-components).
- MUST ensure smooth scroll behavior for anchor links (`scroll-behavior: smooth` at the `<main>` or root level).
- MUST support both light and dark themes.
- MUST be fully responsive (mobile-first).
- MUST use translation hooks for all text content.
</requirements>

## Subtasks
- [ ] 6.1 Create `components/landing/LandingPageContent.tsx` with all sections composed
- [ ] 6.2 Create `app/landing-page/page.tsx` route file
- [ ] 6.3 Verify responsive layout on mobile, tablet, and desktop viewports
- [ ] 6.4 Test anchor link scrolling behavior
- [ ] 6.5 Verify theme switching works correctly
- [ ] 6.6 Run `pnpm lint` and `pnpm build`

## Implementation Details
See TechSpec "Section-to-Component Mapping" for the complete component structure and order.

The component composition order MUST be:
1. LandingNavbar (sticky header)
2. LandingHero
3. LandingKeyStats (`id="benefits"`)
4. LandingAIFeatures (`id="how-it-works"`)
5. LandingClinicalFocus
6. LandingVisualDemo (`id="features"`)
7. LandingPricing (`id="pricing"`, feature-flag gated)
8. LandingCTA (`id="login"`)
9. Footer (reused from `components/Footer.tsx`)

### Relevant Files
- `components/landing/LandingPageContent.tsx` — new file to create
- `app/landing-page/page.tsx` — new route file to create
- All components from `components/landing/` created in task_05

### Dependent Files
- `app/page.tsx` — will consume `LandingPageContent` in task_07

### Related ADRs
- [ADR-001: Separation of Landing Page and Login Page Route Structure](../adrs/adr-001.md) — Defines route structure
- [ADR-002: Modular Component Organization for Landing Page](../adrs/adr-002.md) — Component organization

## Deliverables
- `components/landing/LandingPageContent.tsx` with all sections composed in the correct order
- `app/landing-page/page.tsx` route file
- `pnpm lint` and `pnpm build` pass with no errors

## Tests
- No unit/component tests for this task.
- Page rendering is verified by `cypress/e2e/landing.cy.ts` (created in task_08) which visits `/landing-page` and asserts the 9 sections in order.

## Success Criteria
- `/landing-page` route renders the complete landing page
- All 9 sections visible and correctly ordered
- Anchor links scroll smoothly to target sections
- Theme switching works correctly
- Responsive layout works on all viewports
- `pnpm lint` and `pnpm build` pass
