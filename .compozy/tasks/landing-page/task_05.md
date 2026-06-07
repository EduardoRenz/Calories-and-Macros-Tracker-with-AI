---
status: completed
title: Build components/landing/ sub-components
type: frontend
complexity: high
dependencies:
  - task_01
  - task_02
  - task_03
  - task_04
---

# Task 05: Build components/landing/ sub-components

## Overview
This task creates the `components/landing/` directory and all 8 section sub-components that make up the Landing Page. Each sub-component is purely presentational and receives data exclusively through the `useTranslation()` hook and props. The implementation is a faithful reinforcement of `.compozy/tasks/landing-page/code.html`, adapted to the project's design tokens (light + dark theme support via CSS variables defined in `styles/globals.css`).

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- NO UNIT TESTS — this feature does not require unit/component test coverage
</critical>

<requirements>
- MUST create the directory `components/landing/` and all 8 component files.
- MUST implement each section faithfully to `.compozy/tasks/landing-page/code.html`, adapted to the project design system colors and typography.
- MUST use the anchor IDs declared in `code.html`: `#benefits` (LandingKeyStats), `#how-it-works` (LandingAIFeatures), `#features` (LandingVisualDemo), `#pricing` (LandingPricing), `#login` (LandingCTA).
- MUST support both light and dark themes using Tailwind semantic color classes (e.g. `bg-background`, `text-on-surface`, `text-primary`, `border-outline-variant`).
- MUST use `useTranslation()` for ALL user-visible text under the `landing.*` namespace (task_03).
- MUST be responsive: sections collapse to single-column on mobile, multi-column on `md:` and above.
- MUST add smooth scroll behavior and hover micro-animations (subtle scale/shadow transitions on cards).
- LandingNavbar MUST be sticky (`position: sticky; top: 0`) with backdrop blur.
- LandingNavbar MUST reuse `LanguageSwitcher` and `ThemeSwitcher` components as-is.
- LandingNavbar MUST include anchor links to `#features`, `#benefits`, `#pricing`.
- LandingHero MUST use the `Button` component for CTAs (links to `/login`) and the `play_circle` Material Symbol for the secondary CTA.
- LandingHero MUST include the floating `glass-card` notification anchored to the bottom-left of the phone mockup.
- LandingVisualDemo MUST render the SVG progress ring at 75% Calorias and the macro bars (Proteína 120g, Carbos 150g).
- LandingVisualDemo MUST reuse `MacroProgressCard` (improved in task_02) when needed for the dashboard demo.
- LandingPricing MUST reuse `PlanCard` (improved in task_01) with `ctaLabel="Começar Grátis"` (free) and `ctaLabel="Assinar Agora"` (member) and fetch plans from `RepositoryFactory.getPlansRepository()`.
- LandingPricing MUST respect the `FeatureFlags.ENABLE_PLANS` flag — hide the section when disabled.
- LandingPricing MUST show a loading skeleton while plans are fetching.
- LandingPricing MUST handle fetch errors gracefully (log error, show a fallback message).
- LandingCTA MUST render a sign-off card with a single primary button to `/login` (NO email/password form — that part of `code.html` is layout reference only).
- All components MUST use `'use client'` directive (they consume hooks).
- All icons MUST come from `components/icons.tsx` (Material Symbols Outlined).
</requirements>

## Subtasks
- [x] 5.1 Create `LandingNavbar.tsx` — sticky nav with logo, anchor links, LanguageSwitcher, ThemeSwitcher, Login/Start CTAs
- [x] 5.2 Create `LandingHero.tsx` — headline, badge, subtitle, CTA buttons, phone mockup with floating glass card
- [x] 5.3 Create `LandingKeyStats.tsx` — 3-column "60s / Zero Planilhas / Insights" cards with icons and hover animations (`id="benefits"`)
- [x] 5.4 Create `LandingAIFeatures.tsx` — brain graphic left, natural-input + instant-calc details right (`id="how-it-works"`)
- [x] 5.5 Create `LandingClinicalFocus.tsx` — diabetes + intolerances cards left, branded circle right (no anchor)
- [x] 5.6 Create `LandingVisualDemo.tsx` — progress ring + macro bars left, mock chat feed right (`id="features"`)
- [x] 5.7 Create `LandingPricing.tsx` — plans grid using PlanCard with ctaLabel, feature-flag gated (`id="pricing"`)
- [x] 5.8 Create `LandingCTA.tsx` — bottom sign-off with trust badges and a single "Começar Agora" button linking to `/login` (`id="login"`, NO form)

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
- `components/Footer.tsx` — NOT used in this task; used by LandingPageContent (task_06)

Visual building blocks consumed from task_04:
- `kinetic-gradient`, `kinetic-gradient-hover` — primary CTAs in Navbar, Hero, CTA
- `glass-card` — floating notification in Hero

The design reference is `.compozy/tasks/landing-page/code.html` (authoritative) and `.compozy/tasks/landing-page/screen.png` (visual).

### Relevant Files
- `.compozy/tasks/landing-page/code.html` — design reference (MUST follow faithfully)
- `.compozy/tasks/landing-page/screen.png` — visual reference
- `styles/globals.css` — CSS variable definitions for all semantic colors; utility classes from task_04
- `tailwind.config.js` — available Tailwind color/spacing/font tokens
- `components/ui/Button.tsx` — reused for CTAs
- `components/LanguageSwitcher.tsx` — reused in navbar
- `components/ThemeSwitcher.tsx` — reused in navbar
- `components/MacroProgressCard.tsx` — reused in visual demo (task_02 prerequisite)
- `components/payment/PlanCard.tsx` — reused in pricing (task_01 prerequisite)
- `components/Footer.tsx` — reused in LandingPageContent (task_06)
- `components/icons.tsx` — Material Symbols Outlined icon set
- `domain/repositories/FeatureFlagRepository.ts` — `FeatureFlags.ENABLE_PLANS` constant
- `contexts/FeatureFlagContext.tsx` — `useFeatureFlags()` hook
- `data/RepositoryFactory.ts` — `getPlansRepository()` singleton accessor
- `hooks/useTranslation.ts` — translation hook (task_03 prerequisite)

### Dependent Files
- `components/landing/LandingPageContent.tsx` — will import and assemble all 8 components (task_06)

### Related ADRs
- [ADR-001: Separation of Landing Page and Login Page Route Structure](../adrs/adr-001.md) — CTAs must route to `/login`, not embed auth forms
- [ADR-002: Modular Component Organization for Landing Page](../adrs/adr-002.md) — All components go in `components/landing/`
- [ADR-003: Localized Demo Data Strategy for Landing Page Visual Widgets](../adrs/adr-003.md) — All text via `useTranslation()` under `landing.*`

## Deliverables
- 8 new component files in `components/landing/`
- All sections render correctly in `pnpm dev:mock` in both light and dark themes
- All sections are fully responsive (mobile and desktop)
- `pnpm lint` and `pnpm build` pass

## Tests
- No unit/component tests for this task.
- Visual smoke tests for all 8 components are part of `cypress/e2e/landing.cy.ts` (created in task_08).

## Success Criteria
- Layout is faithful to `code.html` (section order, anchors, copy, icons, gradients, glass card)
- Both light and dark themes display correctly with proper contrast
- All text is translated and no hardcoded strings remain in the landing components
- Plans section hides when `ENABLE_PLANS` flag is off
- `pnpm lint` and `pnpm build` pass
