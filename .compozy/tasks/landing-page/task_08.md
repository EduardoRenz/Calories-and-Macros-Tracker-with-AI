---
status: completed
title: Write cypress/e2e/landing.cy.ts (single file) and adjust existing tests inline
type: test
complexity: medium
dependencies: [task_07]
---

# Task 08: Write cypress/e2e/landing.cy.ts (single file) and adjust existing tests inline

## Overview
Create the **single** Cypress E2E file for the Landing Page at `cypress/e2e/landing.cy.ts` covering all 9 sections, interactions, and routing flows defined in the PRD and TechSpec. Also adjust inline the existing Cypress tests that depended on the previous root-path behavior (`cypress/e2e/auth-routing.cy.ts` and `cypress/e2e/basic.cy.ts`) so the suite stays green.

This is the **only** test file produced by this feature. There are no unit or component tests.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- NO UNIT TESTS — this feature does not require unit/component test coverage
</critical>

<requirements>
- MUST create `cypress/e2e/landing.cy.ts` as the single E2E file for the landing page.
- MUST test all 9 landing page sections render correctly with the anchors declared in `code.html` (`#benefits`, `#how-it-works`, `#features`, `#pricing`, `#login`).
- MUST test responsive behavior on mobile (375px), tablet (768px), and desktop (1024px) viewports.
- MUST test anchor link scrolling behavior.
- MUST test theme switching (light/dark mode).
- MUST test language switching (PT, EN, ES).
- MUST test CTA buttons redirect to `/login` (Navbar Login, Navbar Começar, Hero Começar Agora, Bottom CTA Começar Agora).
- MUST test pricing section respects `FeatureFlags.ENABLE_PLANS` flag (hidden when off, shown when on).
- MUST test authentication-based routing on `/` (unauth → landing, auth → `/dashboard`).
- MUST assert the Google Sign-In button on `/login` carries `data-testid="google-signin-button"`.
- MUST assert the Bottom CTA is a single button to `/login` (no embedded form).
- MUST use `pnpm cy:run` for verification.
- MUST follow existing Cypress test patterns in the project (custom `cy.login()`, `cy.acceptCookies()`, `cy.setFeatureRequirement()` commands).

### Inline adjustments to existing tests (no file split, no removal)

- MUST adjust inline `cypress/e2e/auth-routing.cy.ts`:
  - The `Root Path Redirect` describe block — `should redirect authenticated user from / to /dashboard` is unchanged.
  - The `should show login page for unauthenticated user at /` test must be updated: `/` now renders the landing page. The test must assert landing-page markers (e.g. hero headline or `[data-testid="landing-page"]` root) and follow a CTA to reach `/login` where the Google sign-in button is asserted.
- MUST adjust inline `cypress/e2e/basic.cy.ts`:
  - The first test `should show login page when not authenticated` must be updated: visiting `/` now lands on the landing page. The test must follow a CTA to reach `/login` and assert "Sign in with Google".
  - The other tests in `basic.cy.ts` that use `cy.visit('/')` as a stepping stone may keep the visit but must follow a Landing Page CTA to `/login` before clicking the Google Sign-In button.
</requirements>

## Subtasks
- [ ] 8.1 Create `cypress/e2e/landing.cy.ts` with the full structure (all 9 sections + interactions)
- [ ] 8.2 Write tests for section rendering (all 9 sections, in order, with anchors)
- [ ] 8.3 Write tests for responsive layout (mobile, tablet, desktop)
- [ ] 8.4 Write tests for anchor link scrolling
- [ ] 8.5 Write tests for theme switching
- [ ] 8.6 Write tests for language switching
- [ ] 8.7 Write tests for CTA button redirects to `/login`
- [ ] 8.8 Write tests for pricing section feature flag
- [ ] 8.9 Write tests for authentication-based routing
- [ ] 8.10 Adjust inline `cypress/e2e/auth-routing.cy.ts` (Root Path Redirect block)
- [ ] 8.11 Adjust inline `cypress/e2e/basic.cy.ts` (tests that visit `/`)
- [ ] 8.12 Run `pnpm cy:run` and ensure the full suite is green

## Implementation Details
See TechSpec "Testing Approach — Cypress E2E" for the complete coverage matrix.

The single file `cypress/e2e/landing.cy.ts` groups tests into the following `describe` blocks:

1. **Section rendering** — All 9 sections render in order, with anchors verified.
2. **Anchor link scrolling** — Navbar anchors scroll to `#features`, `#benefits`, `#pricing`, `#how-it-works`, `#login`.
3. **CTA button redirects** — All CTAs go to `/login` (or to anchors); assert `data-testid="google-signin-button"` on `/login`.
4. **Routing** — `/` unauthenticated renders landing; `/` authenticated redirects to `/dashboard`; `/landing-page` renders for all users.
5. **Pricing feature flag** — `feature_flag_enable_plans=false` hides pricing; `=true` shows it.
6. **Theme switching** — Toggling theme updates `<html class="dark">` and persists.
7. **Language switching** — Switching to PT/EN/ES updates all `landing.*` strings.
8. **Responsive layout** — Mobile (375px), tablet (768px), desktop (1024px) — sticky navbar, single-column collapse, no horizontal overflow.

### Inline adjustments — exact changes

- `cypress/e2e/auth-routing.cy.ts` (around lines 168-184):
  - `should redirect authenticated user from / to /dashboard` → unchanged.
  - `should show login page for unauthenticated user at /` → rename to `should show landing page for unauthenticated user at /`. Visit `/`, assert landing page markers (hero headline / `[data-testid="landing-page"]`), then follow a CTA to reach `/login` and assert `[data-testid="google-signin-button"]` is visible.

- `cypress/e2e/basic.cy.ts` (first test, around lines 1-9):
  - `should show login page when not authenticated` → rename to `should show landing page when not authenticated`. Visit `/`, assert landing page markers, then click a CTA that goes to `/login` and assert "Sign in with Google".
  - Other tests that call `cy.visit('/')` and then `cy.contains('Sign in with Google').click()` must be updated to either follow a Landing Page CTA to `/login`, or visit `/login` directly.

### Relevant Files
- `cypress/e2e/landing.cy.ts` — new file to create
- `cypress/e2e/auth-routing.cy.ts` — adjust inline (Root Path Redirect)
- `cypress/e2e/basic.cy.ts` — adjust inline (first test)
- `cypress/support/commands.ts` — existing custom commands (`cy.login()`, `cy.acceptCookies()`)
- `cypress.config.ts` — already configured for `NEXT_PUBLIC_BACKEND_PROVIDER=mock`

### Dependent Files
- `app/page.tsx` — updated in task_07
- `app/landing-page/page.tsx` — created in task_06
- All landing page components from task_05 and task_06

### Related ADRs
- [ADR-001: Separation of Landing Page and Login Page Route Structure](../adrs/adr-001.md) — Defines routing requirements that the routing tests verify

## Deliverables
- `cypress/e2e/landing.cy.ts` with comprehensive E2E tests
- Inline adjustments to `cypress/e2e/auth-routing.cy.ts` and `cypress/e2e/basic.cy.ts`
- All tests pass when run with `pnpm cy:run`
- Full Cypress suite is green (landing + auth-routing + basic + all other tests)

## Tests
- This task IS the test deliverable. There are no further test requirements.

## Success Criteria
- All E2E tests passing in `pnpm cy:run`
- Test coverage includes all 9 landing page sections, all CTAs, all anchors, theme and language switching, pricing feature flag, and authentication-based routing
- No flaky tests
- Inline adjustments to `auth-routing.cy.ts` and `basic.cy.ts` keep those suites green
- The full Cypress suite (landing.cy.ts + auth-routing.cy.ts + basic.cy.ts + all other tests) passes end-to-end
