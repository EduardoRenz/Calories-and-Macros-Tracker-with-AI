---
status: completed
title: Add landing.* i18n keys to all locale files
type: frontend
complexity: low
dependencies: []
---

# Task 03: Add landing.* i18n keys to all locale files (PT, EN, ES)

## Overview
All text displayed on the Landing Page must be translated and served through the existing `useTranslation()` hook. This task adds a new `landing` root namespace to `locales/pt.ts`, `locales/en.ts`, and `locales/es.ts`, covering all 9 sections of the Landing Page as specified in the TechSpec "Data Models" section. The structure is a faithful reinforcement of `.compozy/tasks/landing-page/code.html` copy.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- NO UNIT TESTS — this feature does not require unit/component test coverage
</critical>

<requirements>
- MUST add a `landing` key at the root level of each locale object in `pt.ts`, `en.ts`, and `es.ts`.
- MUST include all sub-namespaces: `navbar`, `hero`, `benefits`, `ai_features`, `clinical`, `demo`, `pricing`, `cta`, `footer`.
- MUST provide accurate translations for all three languages (PT, EN, ES) — no placeholder or untranslated strings.
- MUST insert the new `landing` block before the closing `}` of each locale object (after `pwa_install`).
- MUST NOT modify any existing keys.
</requirements>

## Subtasks
- [ ] 3.1 Add the full `landing` namespace block to `locales/pt.ts` (Portuguese — base language from `code.html` mockup)
- [ ] 3.2 Add the full `landing` namespace block to `locales/en.ts` (English)
- [ ] 3.3 Add the full `landing` namespace block to `locales/es.ts` (Spanish)
- [ ] 3.4 Verify the TypeScript compiler accepts the new keys without errors (`pnpm build` or `tsc --noEmit`)

## Implementation Details
See TechSpec "Data Models" section for the complete key structure and Portuguese copy (sourced from `code.html`).

Files to modify:
- `locales/pt.ts`
- `locales/en.ts`
- `locales/es.ts`

The `landing` namespace must cover (see TechSpec for full key list):
- `navbar.*` — nav anchor labels, login/start CTA text
- `hero.*` — badge, headline, subtitle, CTAs, float badge
- `benefits.*` — section title and 3 stat cards
- `ai_features.*` — eyebrow, title, description, sub-features
- `clinical.*` — badge, title, description, condition cards
- `demo.*` — section title/subtitle, dashboard labels, chat mock strings
- `pricing.*` — title, subtitle, CTA labels, loading state, recommended badge
- `cta.*` — bottom CTA title, subtitle, trust badges, button
- `footer.*` — copyright, privacy, terms, support

### Relevant Files
- `locales/pt.ts` — primary locale (Portuguese, base copy from `code.html`)
- `locales/en.ts` — English locale
- `locales/es.ts` — Spanish locale
- `hooks/useTranslation.ts` — hook that resolves keys; no changes needed
- `.compozy/tasks/landing-page/code.html` — reference for PT copy accuracy

### Dependent Files
- All `components/landing/*.tsx` (created in task_05) consume `landing.*`

### Related ADRs
- [ADR-003: Localized Demo Data Strategy for Landing Page Visual Widgets](../adrs/adr-003.md) — Mandates i18n for all visual widget copy

## Deliverables
- `locales/pt.ts` with `landing` namespace appended
- `locales/en.ts` with `landing` namespace appended
- `locales/es.ts` with `landing` namespace appended
- TypeScript compilation passes with no errors
- `pnpm lint` passes

## Tests
- No unit/component tests for this task.
- Translation resolution is exercised through `cypress/e2e/landing.cy.ts` (created in task_08) which switches language and asserts on the rendered strings.

## Success Criteria
- All three locale files contain the complete `landing` namespace
- TypeScript reports zero new type errors after the change
- `pnpm build` completes without errors
- `pnpm lint` passes
- Existing Cypress tests that exercise i18n (`settings.cy.ts`) still pass
