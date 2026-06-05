---
status: pending
title: Write cypress/e2e/landing.cy.ts E2E tests
type: test
complexity: medium
dependencies: [task_06]
---

# Task 07: Write cypress/e2e/landing.cy.ts E2E tests

## Overview
Create comprehensive end-to-end tests for the landing page to ensure all features work correctly across different scenarios, languages, themes, and viewports. These tests will validate the complete landing page functionality and prevent regressions.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `cypress/e2e/landing.cy.ts` with comprehensive E2E tests
- MUST test all 9 landing page sections render correctly
- MUST test responsive behavior on mobile, tablet, and desktop viewports
- MUST test anchor link scrolling behavior
- MUST test theme switching (light/dark mode)
- MUST test language switching (PT, EN, ES)
- MUST test CTA buttons redirect to `/login`
- MUST test pricing section respects `FeatureFlags.ENABLE_PLANS` flag
- MUST test authentication-based routing on `/`
- MUST use `pnpm dev:mock` for testing (as per project rules)
- MUST follow existing Cypress test patterns in the project
</requirements>

## Subtasks
- [ ] 7.1 Create `cypress/e2e/landing.cy.ts` file structure
- [ ] 7.2 Write tests for section rendering (all 9 sections)
- [ ] 7.3 Write tests for responsive layout (mobile, tablet, desktop)
- [ ] 7.4 Write tests for anchor link scrolling
- [ ] 7.5 Write tests for theme switching
- [ ] 7.6 Write tests for language switching
- [ ] 7.7 Write tests for CTA button redirects
- [ ] 7.8 Write tests for pricing section feature flag
- [ ] 7.9 Write tests for authentication-based routing
- [ ] 7.10 Run all tests and verify they pass

## Implementation Details
See TechSpec "Testing Strategy" section for complete testing requirements.

Test categories to implement:

1. **Section Rendering Tests**
   - Verify LandingNavbar is visible and sticky
   - Verify HeroSection renders with badge, headline, CTAs
   - Verify KeyStatsSection renders 3 cards
   - Verify LandingAIFeatures renders with brain graphic
   - Verify LandingClinicalFocus renders diabetes/intolerances cards
   - Verify LandingVisualDemo renders progress ring and mock chat
   - Verify LandingPricing renders when feature flag enabled
   - Verify LandingCTASection renders with trust badges
   - Verify LandingFooter renders with links

2. **Responsive Layout Tests**
   - Test on mobile (375px width)
   - Test on tablet (768px width)
   - Test on desktop (1024px width)
   - Verify hamburger menu appears on mobile

3. **Interaction Tests**
   - Anchor links scroll to correct sections
   - Theme toggle switches between light/dark
   - Language switcher changes translations
   - CTA buttons redirect to `/login`

4. **Routing Tests**
   - `/` shows landing page for unauthenticated users
   - `/` redirects to `/dashboard` for authenticated users
   - `/landing-page` shows landing page for all users

5. **Feature Flag Tests**
   - Pricing section hidden when `FeatureFlags.ENABLE_PLANS` is false
   - Pricing section visible when `FeatureFlags.ENABLE_PLANS` is true

### Relevant Files
- `cypress/e2e/landing.cy.ts` — new file to create
- Existing Cypress test files in `cypress/e2e/` — reference for patterns
- `cypress/support/` — support files and commands

### Dependent Files
- `app/page.tsx` — updated in task_06
- `app/landing-page/page.tsx` — created in task_05
- All landing page components from task_04 and task_05

### Related ADRs
- None specific to testing

## Deliverables
- `cypress/e2e/landing.cy.ts` with comprehensive E2E tests
- All tests passing when run with `pnpm cy:run`
- Test coverage for all landing page features
- Documentation of any test data or fixtures used

## Tests
- E2E tests (all in `cypress/e2e/landing.cy.ts`):
  - [ ] Section rendering tests (9 sections)
  - [ ] Responsive layout tests (3 viewports)
  - [ ] Anchor link scrolling tests
  - [ ] Theme switching tests
  - [ ] Language switching tests (PT, EN, ES)
  - [ ] CTA button redirect tests
  - [ ] Pricing section feature flag tests
  - [ ] Authentication-based routing tests
- All tests must pass
- Test execution time should be reasonable (< 5 minutes for full suite)

## Success Criteria
- All E2E tests passing
- Test coverage includes all landing page features
- Tests run successfully with `pnpm cy:run`
- No flaky tests
- Tests catch regressions in landing page functionality
