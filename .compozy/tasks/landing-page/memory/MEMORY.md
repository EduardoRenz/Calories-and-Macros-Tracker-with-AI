# Workflow Memory

Keep only durable, cross-task context here. Do not duplicate facts that are obvious from the repository, PRD documents, or git history.

## Current State

- Landing Page feature fully implemented and all 9 tasks completed (tasks 01–09).
- Task 09 completed: `package.json` version bumped from 1.14.6 to 1.14.7.
- Cypress suite has pre-existing flaky failures (auth-routing.cy.ts, feature-flags.cy.ts) unrelated to the landing page version bump.

## Shared Decisions

- Material Symbols Outlined web font loaded via `<link>` in `app/layout.tsx` (line 73). Future landing sub-components must NOT add a second `<link>`. The font family `'Material Symbols Outlined'` is available globally.

## Shared Learnings
- Landing page i18n keys (`landing.*` namespace) added to all three locale files (pt, en, es) with accurate translations. Footer legal strings remain in English across all locales (matches code.html convention).
- Three utility classes available in `styles/globals.css` (lines 199-212): `.kinetic-gradient`, `.kinetic-gradient-hover` (with `:hover`), `.glass-card`. These are the faithful byte-level reproduction of `code.html` declarations.
- `pnpm build` and `pnpm lint` pass after Task 04 changes.
- `app/page.tsx` uses `'use client'` + `useAuth()` + `useEffect`/`useRouter` for auth-based routing. The `<div data-testid="landing-page">` wrapper is the e2e selector for landing page presence.

## Open Risks

- Cypress auth-routing.cy.ts (10/15 failing) and feature-flags.cy.ts (1/5 failing) exhibit flaky failures. Root cause unknown — may be race conditions with auth session state or landing page redirect timing.

## Handoffs
