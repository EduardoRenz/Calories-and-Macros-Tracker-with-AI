---
status: pending
title: "Add Manage Subscription And Financial History Surfaces"
type: frontend
complexity: high
dependencies:
  - task_06
  - task_07
---

# Task 08: Add Manage Subscription And Financial History Surfaces

## Overview
Expose the new billing state inside the authenticated app so users can understand their current plan, cancel-at-period-end status, and financial history without leaving the product. This task completes the user-facing subscription experience promised in the PRD.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- 1. MUST add user-visible surfaces for current subscription status and cancel-at-period-end state.
- 2. MUST add financial history views for paid, failed, and refunded events at minimum.
- 3. MUST expose manage or upgrade entry points in the authenticated UI where users naturally expect them.
- 4. MUST present product-facing status language rather than raw provider terminology.
- 5. SHOULD keep navigation, settings, and profile surfaces visually consistent with current app patterns.
</requirements>

## Subtasks
- [ ] 8.1 Update settings and profile subscription surfaces to show normalized billing state and manage actions.
- [ ] 8.2 Add user-visible financial history UI backed by the billing history read path.
- [ ] 8.3 Update navigation or account entry points to reflect free, premium, and cancelled-at-period-end states.
- [ ] 8.4 Add localized text for billing states, actions, and history labels across supported languages.

## Implementation Details
Reference the TechSpec "User Experience", "Impact Analysis", and "API Endpoints" sections. Keep terminology product-oriented and aligned to the PRD: users should understand whether they are active, will not renew, or have lost premium because billing became irregular. Use existing design patterns in settings, profile, and navbar rather than introducing a new billing mini-app.

### Relevant Files
- `components/SubscriptionCard.tsx` — Current manage-subscription card that only links back to plans.
- `components/Navbar.tsx` — Current subscription badge area in the avatar menu.
- `contexts/SubscriptionContext.tsx` — Existing app-wide subscription state provider.
- `app/(authenticated)/profile/page.tsx` — Likely host for richer subscription visibility.
- `app/(authenticated)/settings/page.tsx` — Likely host for management and history surfaces.
- `locales/en.ts` — Requires new billing state and history strings.
- `locales/pt.ts` — Requires new billing state and history strings.
- `locales/es.ts` — Requires new billing state and history strings.

### Dependent Files
- Billing history route or repository from task 06 — Must be available for the UI to consume.
- `components/Navbar.tsx` and related account UI — Will need consistent wording and status badges.
- Cypress or equivalent end-to-end tests — Will need coverage for status and history rendering once surfaces exist.

### Related ADRs
- [ADR-001: Supabase As Source Of Truth For Subscription Access](adrs/adr-001.md) — User-facing surfaces must reflect Supabase-owned state.
- [ADR-005: Supabase Plans Are The Canonical Product Catalog](adrs/adr-005.md) — Upgrade and plan labeling must remain tied to the canonical catalog.

## Deliverables
- Updated settings/profile/navigation subscription surfaces
- User-visible billing history UI for paid, failed, and refunded events
- Localized text for billing states and management actions
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for billing state rendering and history visibility **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Verify active, free, and cancelled-at-period-end states render the correct badges and action labels.
  - [ ] Verify financial history rows display normalized event type, amount, and date formatting for user-facing presentation.
  - [ ] Verify localized billing labels resolve correctly across supported languages.
- Integration tests:
  - [ ] Load an authenticated user with premium status and verify settings or profile surfaces show the expected manage state.
  - [ ] Load an authenticated user with billing history and verify paid, failed, and refunded events appear in the UI.
  - [ ] Load an authenticated user with irregular billing status and verify the UI reflects loss of premium access clearly.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Users can view normalized subscription status and billing history inside the app
- Manage and upgrade entry points are visible in the expected authenticated surfaces
