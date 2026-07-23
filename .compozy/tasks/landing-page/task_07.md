---
status: completed
title: Update app/page.tsx root routing
type: refactor
complexity: medium
dependencies: [task_06]
---

# Task 07: Update app/page.tsx root routing

## Overview
Update the root route (`app/page.tsx`) to implement the authentication-based routing logic defined in the PRD: unauthenticated users see the Landing Page, authenticated users are redirected to `/dashboard`. After this task, the Landing Page is the default entry for new visitors.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- NO UNIT TESTS — this feature does not require unit/component test coverage
</critical>

<requirements>
- MUST update `app/page.tsx` to check authentication state via `AuthContext`.
- MUST redirect authenticated users to `/dashboard` when visiting `/`.
- MUST render `LandingPageContent` for unauthenticated users visiting `/`.
- MUST preserve the existing `data-testid="google-signin-button"` attribute on Google Sign-In button.
- MUST NOT break existing authentication flows on `/login`.
- MUST NOT break the existing `/login` route.
- MUST ensure no infinite redirect loops occur.
- MUST handle the AuthContext `loading` state to avoid flicker (do not redirect while `loading === true`).
</requirements>

## Subtasks
- [x] 7.1 Update `app/page.tsx` with authentication-based routing logic (LandingPageContent for unauth, redirect for auth)
- [x] 7.2 Test redirect behavior for authenticated users (visiting `/` → `/dashboard`)
- [x] 7.3 Test landing page rendering for unauthenticated users (visiting `/` shows LandingPageContent)
- [x] 7.4 Verify Google Sign-In button `data-testid="google-signin-button"` is preserved
- [x] 7.5 Run `pnpm lint` and `pnpm build`

## Implementation Details
See TechSpec "Routing Logic" section for the complete routing requirements.

The routing logic should be:
- `/` (Home):
  - If `loading === true` → render a lightweight loading placeholder (or render `LandingPageContent` and let the redirect happen after).
  - If `user !== null` → redirect to `/dashboard`.
  - Otherwise → render `LandingPageContent`.
- `/landing-page` → render `LandingPageContent` unconditionally (created in task_06).
- `/login` → render Login Page (unchanged).

Use `useEffect` with `useRouter` to handle client-side redirects. Check authentication state via `AuthContext`.

### Relevant Files
- `app/page.tsx` — file to modify (currently a server-side `redirect('/dashboard')`)
- `context/AuthContext.tsx` (or `contexts/AuthContext.tsx`) — authentication context to check user state

### Dependent Files
- `components/landing/LandingPageContent.tsx` — created in task_06
- `app/landing-page/page.tsx` — created in task_06

### Related ADRs
- [ADR-001: Separation of Landing Page and Login Page Route Structure](../adrs/adr-001.md) — Defines routing requirements

## Deliverables
- Updated `app/page.tsx` with authentication-based routing
- Verified no infinite redirect loops
- Verified Google Sign-In button test attribute preserved
- `pnpm lint` and `pnpm build` pass

## Tests
- No unit/component tests for this task.
- Routing behavior is verified by `cypress/e2e/landing.cy.ts` (created in task_08) and by inline adjustments to `cypress/e2e/auth-routing.cy.ts` and `cypress/e2e/basic.cy.ts` (also done in task_08).

## Success Criteria
- Unauthenticated users see Landing Page on `/`
- Authenticated users are redirected to `/dashboard` on `/`
- `/landing-page` works for both authenticated and unauthenticated users
- Google Sign-In button test attribute preserved
- No infinite redirect loops
- `pnpm lint` and `pnpm build` pass
