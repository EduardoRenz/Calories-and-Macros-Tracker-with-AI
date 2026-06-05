---
status: pending
title: Add landing.* i18n keys to all locale files
type: frontend
complexity: low
dependencies: []
---

# Task 03: Add landing.* i18n keys to all locale files

## Overview
All text displayed on the Landing Page must be translated and served through the existing `useTranslation()` hook. This task adds a new `landing` root namespace to `locales/pt.ts`, `locales/en.ts`, and `locales/es.ts`, covering all 9 sections of the Landing Page as specified in the TechSpec "Data Models" section.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add a `landing` key at the root level of each locale object in `pt.ts`, `en.ts`, and `es.ts`.
- MUST include all sub-namespaces: `navbar`, `hero`, `stats`, `ai_features`, `clinical`, `demo`, `pricing`, `cta`.
- MUST provide accurate translations for all three languages (PT, EN, ES) — no placeholder or untranslated strings.
- MUST insert the new `landing` block before the closing `}` of each locale object (after `pwa_install`).
- MUST NOT modify any existing keys.
</requirements>

## Subtasks
- [ ] 3.1 Add the full `landing` namespace block to `locales/pt.ts` (Portuguese — base language from screen mockup)
- [ ] 3.2 Add the full `landing` namespace block to `locales/en.ts` (English)
- [ ] 3.3 Add the full `landing` namespace block to `locales/es.ts` (Spanish)
- [ ] 3.4 Verify the TypeScript compiler accepts the new keys without errors (`pnpm build` or `tsc --noEmit`)

## Implementation Details
See TechSpec "Data Models" section for the complete key structure and Portuguese copy.

Files to modify:
- `locales/pt.ts` — insert after `pwa_install` block (before line 461)
- `locales/en.ts` — same position
- `locales/es.ts` — same position (before the closing `}` on line 456)

Each locale file ends with:
```typescript
  "pwa_install": { ... },
}                         // ← insert new landing block before this line

export default pt;        // (or en / es)
```

The `landing` namespace must cover (see TechSpec for full key list):
- `navbar.*` — nav anchor labels, login/start CTA text
- `hero.*` — badge, headline, subtitle, CTAs, float badge
- `stats.*` — 3 card titles and descriptions
- `ai_features.*` — section badge, title, description, sub-features
- `clinical.*` — section badge, title, description, condition cards
- `demo.*` — section title/subtitle, dashboard labels, chat mock strings
- `pricing.*` — title, subtitle, CTA labels, loading state
- `cta.*` — bottom CTA title, subtitle, trust badges, button

### Relevant Files
- `locales/pt.ts` — primary locale (Portuguese, base copy from mockup image)
- `locales/en.ts` — English locale
- `locales/es.ts` — Spanish locale
- `hooks/useTranslation.ts` — hook that resolves keys; no changes needed
- `.compozy/tasks/landing-page/screen.png` — reference mockup image for PT copy accuracy

### Dependent Files
- `components/landing/LandingNavbar.tsx` — consumes `landing.navbar.*`
- `components/landing/LandingHero.tsx` — consumes `landing.hero.*`
- `components/landing/LandingKeyStats.tsx` — consumes `landing.stats.*`
- `components/landing/LandingAIFeatures.tsx` — consumes `landing.ai_features.*`
- `components/landing/LandingClinicalFocus.tsx` — consumes `landing.clinical.*`
- `components/landing/LandingVisualDemo.tsx` — consumes `landing.demo.*`
- `components/landing/LandingPricing.tsx` — consumes `landing.pricing.*`
- `components/landing/LandingCTA.tsx` — consumes `landing.cta.*`

### Related ADRs
- [ADR-003: Localized Demo Data Strategy for Landing Page Visual Widgets](../adrs/adr-003.md) — Mandates i18n for all visual widget copy

## Deliverables
- `locales/pt.ts` with `landing` namespace appended
- `locales/en.ts` with `landing` namespace appended
- `locales/es.ts` with `landing` namespace appended
- TypeScript compilation passes with no errors
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for i18n key resolution **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `useTranslation` hook resolves `landing.hero.title` correctly in PT locale
  - [ ] `useTranslation` hook resolves `landing.hero.title` correctly in EN locale
  - [ ] `useTranslation` hook resolves `landing.hero.title` correctly in ES locale
  - [ ] Requesting a missing sub-key returns the key string itself as fallback (existing hook behavior)
- Integration tests:
  - [ ] Switching language via `LanguageContext` updates all `landing.*` strings on the landing page
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- All three locale files contain the complete `landing` namespace
- TypeScript reports zero new type errors after the change
- `pnpm build` completes without errors
