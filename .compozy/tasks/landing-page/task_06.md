---
status: pending
title: Update app/page.tsx root routing and fix impacted Cypress tests
type: refactor
complexity: medium
dependencies: [task_05]
---

# Task 06: Update app/page.tsx root routing and fix impacted Cypress tests

## Overview
Update the root route (`app/page.tsx`) to implement the authentication-based routing logic defined in the PRD: unauthenticated users see the Landing Page, authenticated users are redirected to `/dashboard`. Also fix any Cypress tests that may be impacted by this routing change.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST update `app/page.tsx` to check authentication state via `AuthContext`
- MUST redirect authenticated users to `/dashboard` when visiting `/`
- MUST render `LandingPageContent` for unauthenticated users visiting `/`
- MUST preserve the existing `data-testid="google-signin-button"` attribute on Google Sign-In button
- MUST NOT break existing authentication flows
- MUST update any Cypress tests that expect the old root page behavior
- MUST ensure no infinite redirect loops occur
- MUST maintain backward compatibility with `/login` route
</requirements>

## Subtasks
- [ ] 6.1 Update `app/page.tsx` with authentication-based routing logic
- [ ] 6.2 Test redirect behavior for authenticated users
- [ ] 6.3 Test landing page rendering for unauthenticated users
- [ ] 6.4 Identify and update impacted Cypress tests
- [ ] 6.5 Verify Google Sign-In button test attribute is preserved
- [ ] 6.6 Run full Cypress test suite and fix any failures

## Implementation Details
See TechSpec "Routing Logic" section for the complete routing requirements.

The routing logic should be:
- `/` (Home):
  - If user is authenticated → redirect to `/dashboard`
  - If user is not authenticated → render `LandingPageContent`
- `/landing-page` → render `LandingPageContent` unconditionally (created in task_05)
- `/login` → render Login Page (unchanged)

Use `useEffect` with `useRouter` to handle client-side redirects. Check authentication state via `AuthContext`.

### Relevant Files
- `app/page.tsx` — file to modify
- `context/AuthContext.tsx` — authentication context to check user state
- Cypress test files in `cypress/e2e/` — tests to update

### Dependent Files
- `components/landing/LandingPageContent.tsx` — created in task_05
- `app/landing-page/page.tsx` — created in task_05

### Related ADRs
- [ADR-001: Separation of Landing Page and Login Page Route Structure](../adrs/adr-001.md) — Defines routing requirements

## Deliverables
- Updated `app/page.tsx` with authentication-based routing
- Updated Cypress tests to reflect new routing behavior
- Verified no infinite redirect loops
- Verified Google Sign-In button test attribute preserved
- All Cypress tests passing
- Integration tests for routing behavior **(REQUIRED)**

## Tests
- Integration tests:
  - [ ] Visit `/` as unauthenticated user → renders Landing Page
  - [ ] Visit `/` as authenticated user → redirects to `/dashboard`
  - [ ] Visit `/landing-page` as authenticated user → renders Landing Page (no redirect)
  - [ ] Visit `/landing-page` as unauthenticated user → renders Landing Page
  - [ ] Verify Google Sign-In button has `data-testid="google-signin-button"` attribute
  - [ ] Verify no infinite redirect loops occur
  - [ ] All existing Cypress tests still pass after routing changes
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Unauthenticated users see Landing Page on `/`
- Authenticated users are redirected to `/dashboard` on `/`
- `/landing-page` works for both authenticated and unauthenticated users
- Google Sign-In button test attribute preserved
- No Cypress test regressions
- No infinite redirect loops
