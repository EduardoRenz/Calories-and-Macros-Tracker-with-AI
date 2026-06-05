---
status: pending
title: Build components/landing/ sub-components
type: frontend
complexity: high
dependencies:
  - task_01
  - task_02
  - task_03
---

# Task 04: Build components/landing/ sub-components

## Overview
This task creates the `components/landing/` directory and all 8 section sub-components that make up the Landing Page. Each sub-component is purely presentational and receives data exclusively through the `useTranslation()` hook and props, following the design shown in `.compozy/tasks/landing-page/screen.png`. The implementation must be faithful to the mockup layout and adapted to the project's design system (light + dark theme support via CSS variables).

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create the directory `components/landing/` and all 8 component files.
- MUST implement each section faithfully to the `.compozy/tasks/landing-page/screen.png` mockup, adapted to the project design system colors and typography.
- MUST support both light and dark themes using Tailwind semantic color classes (e.g. `bg-background`, `text-on-surface`, `text-primary`, `border-outline-variant`).
- MUST use `useTranslation()` for ALL user-visible text under the `landing.*` namespace (task_03).
- MUST be responsive: sections collapse to single-column on mobile, multi-column on `md:` and above.
- MUST add smooth scroll behavior and hover micro-animations (subtle scale/shadow transitions on cards).
- LandingNavbar MUST be sticky (`position: sticky; top: 0`) with backdrop blur on scroll.
- LandingNavbar MUST reuse `LanguageSwitcher` and `ThemeSwitcher` components as-is.
- LandingNavbar MUST include anchor links to `#features`, `#benefits`, `#pricing` sections.
- LandingHero MUST use the `Button` component for CTAs (links to `/login`).
- LandingVisualDemo MUST reuse `MacroProgressCard` (improved in task_02) for the dashboard demo.
- LandingPricing MUST reuse `PlanCard` (improved in task_01) with `ctaLabel` prop and fetch plans from `RepositoryFactory.getPlansRepository()`.
- LandingPricing MUST respect the `FeatureFlags.ENABLE_PLANS` flag — hide the section when disabled.
- LandingPricing MUST show a loading skeleton while plans are fetching.
- LandingPricing MUST handle fetch errors gracefully (log error, show a fallback message).
- All components MUST use `'use client'` directive (they consume hooks).
</requirements>

## Subtasks
- [ ] 4.1 Create `LandingNavbar.tsx` — sticky nav with logo, anchor links, LanguageSwitcher, ThemeSwitcher, Login/Start CTAs
- [ ] 4.2 Create `LandingHero.tsx` — headline, badge, subtitle, CTA buttons, phone mockup with floating badge
- [ ] 4.3 Create `LandingKeyStats.tsx` — 3-column "60s / Zero Planilhas / Insights" cards with icons and hover animations
- [ ] 4.4 Create `LandingAIFeatures.tsx` — brain graphic left, natural-input + instant-calc details right (`id="features"`)
- [ ] 4.5 Create `LandingClinicalFocus.tsx` — diabetes + intolerances cards left, branded circle right (`id="benefits"`)
- [ ] 4.6 Create `LandingVisualDemo.tsx` — progress ring + macro bars (MacroProgressCard) left, mock chat feed right
- [ ] 4.7 Create `LandingPricing.tsx` — plans grid using PlanCard with ctaLabel, feature-flag gated (`id="pricing"`)
- [ ] 4.8 Create `LandingCTA.tsx` — bottom sign-off with trust badges and a "Começar Agora" button linking to `/login`

## Implementation Details
See TechSpec "System Architecture — Component Overview" and "Implementation Design — Core Interfaces" sections.

Files to create (all new):
- `components/landing/LandingNavbar.tsx`
- `components/landing/LandingHero.tsx`
- `components/landing/LandingKeyStats.tsx`
- `components/landing/LandingAIFeatures.tsx`
- `components/landing/LandingClinicalFocus.tsx`
- `components/landing/LandingVisualDemo.tsx`
- `components/landing/LandingPricing.tsx`
- `components/landing/LandingCTA.tsx`

Key reused components (no modification needed beyond tasks 01 and 02):
- `components/LanguageSwitcher.tsx` — reused in LandingNavbar
- `components/ThemeSwitcher.tsx` — reused in LandingNavbar
- `components/ui/Button.tsx` — reused in LandingHero, LandingCTA
- `components/MacroProgressCard.tsx` — reused in LandingVisualDemo (with className from task_02)
- `components/payment/PlanCard.tsx` — reused in LandingPricing (with ctaLabel from task_01)
- `components/Footer.tsx` — NOT used in this task; used by LandingPageContent (task_05)

Available public assets:
- `/LogoHorizontal.svg` — for LandingNavbar logo
- `/Icon-solid.svg` — for AI brain section visual or decorative use

The mockup reference image is at `.compozy/tasks/landing-page/screen.png`.

### Relevant Files
- `.compozy/tasks/landing-page/screen.png` — design reference (MUST follow faithfully)
- `styles/globals.css` — CSS variable definitions for all semantic colors
- `tailwind.config.js` — available Tailwind color/spacing/font tokens
- `components/ui/Button.tsx` — reused for CTAs
- `components/LanguageSwitcher.tsx` — reused in navbar
- `components/ThemeSwitcher.tsx` — reused in navbar
- `components/MacroProgressCard.tsx` — reused in visual demo (task_02 prerequisite)
- `components/payment/PlanCard.tsx` — reused in pricing (task_01 prerequisite)
- `domain/repositories/FeatureFlagRepository.ts` — `FeatureFlags.ENABLE_PLANS` constant
- `contexts/FeatureFlagContext.tsx` — `useFeatureFlags()` hook
- `data/RepositoryFactory.ts` — `getPlansRepository()` singleton accessor
- `hooks/useTranslation.ts` — translation hook (task_03 prerequisite)

### Dependent Files
- `components/landing/LandingPageContent.tsx` — will import and assemble all 8 components (task_05)

### Related ADRs
- [ADR-001: Separation of Landing Page and Login Page Route Structure](../adrs/adr-001.md) — CTAs must route to `/login`, not embed auth forms
- [ADR-002: Modular Component Organization for Landing Page](../adrs/adr-002.md) — All components go in `components/landing/`
- [ADR-003: Localized Demo Data Strategy for Landing Page Visual Widgets](../adrs/adr-003.md) — All text via `useTranslation()` under `landing.*`

## Deliverables
- 8 new component files in `components/landing/`
- All sections render correctly in `pnpm dev:mock` in both light and dark themes
- All sections are fully responsive (mobile and desktop)
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for LandingPricing plan fetching and feature flag behavior **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `LandingNavbar` renders the logo image with correct `src="/LogoHorizontal.svg"`
  - [ ] `LandingNavbar` renders anchor links to `#features`, `#benefits`, `#pricing`
  - [ ] `LandingHero` CTA button "Começar Agora" has `href="/login"`
  - [ ] `LandingKeyStats` renders 3 stat cards
  - [ ] `LandingVisualDemo` renders `MacroProgressCard` with `current=130, goal=160, unit="g"` for protein
  - [ ] `LandingPricing` with `ENABLE_PLANS=false`: section is not rendered
  - [ ] `LandingPricing` with `ENABLE_PLANS=true` and plans loading: shows loading skeleton
  - [ ] `LandingPricing` with `ENABLE_PLANS=true` and plans loaded: renders `PlanCard` for each plan
  - [ ] `LandingPricing` fetch error: logs error and shows fallback message instead of crashing
  - [ ] `LandingCTA` "Começar Agora" button links to `/login`
- Integration tests:
  - [ ] All 8 components render without console errors in `pnpm dev:mock` (visual smoke test in Cypress)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Layout is pixel-faithful to `screen.png` mockup (adapted to project design tokens)
- Both light and dark themes display correctly with proper contrast
- All text is translated and no hardcoded strings remain
- Plans section hides when `ENABLE_PLANS` flag is off
