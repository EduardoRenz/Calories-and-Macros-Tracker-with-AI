# Task Memory: task_05.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Created all 8 landing sub-components in `components/landing/`:
- LandingNavbar, LandingHero, LandingKeyStats, LandingAIFeatures, LandingClinicalFocus, LandingVisualDemo, LandingPricing, LandingCTA

## Important Decisions

- Used `<span class="material-symbols-outlined">` approach for icons (Material Symbols Outlined web font) instead of SVG components from `icons.tsx`, matching `code.html` faithfully. The font is already loaded globally via `app/layout.tsx`.
- Used `next/link` `Link` component for CTA buttons that navigate to `/login` (instead of `<a>`), satisfying the lint rule `@next/next/no-html-link-for-pages`.
- For anchor links (`#features`, `#benefits`, etc.), used native `<a>` elements since `next/link` Link only works for route navigation.
- LandingPricing uses `useFeatureFlags()` > `isFeatureEnabled('ENABLE_PLANS')` to gate visibility, fetches plans from `RepositoryFactory.getPlansRepository().getPlans(language)`, shows skeletons during loading, and handles errors with a fallback message.
- LandingPricing's `onSelect` uses `window.location.href = '/login'` since the landing page is informational — no subscription creation.
- LandingHero phone mockup and LandingAIFeatures brain graphic use placeholder divs with Material Symbols icons since actual image assets are not available.
- Removed unused `Button` import from LandingPricing (was flagged by lint).

## Learnings

- The project uses `'use client'` directive for client components.
- Icons must use the Material Symbols Outlined web font — available globally, no import needed.
- Tailwind semantic colors (`bg-surface`, `text-primary`, etc.) work for both light and dark themes.
- Lint rule enforces `Link` from `next/link` for internal route navigation, not `<a>`.

## Files / Surfaces

Created:
- `components/landing/LandingNavbar.tsx`
- `components/landing/LandingHero.tsx`
- `components/landing/LandingKeyStats.tsx`
- `components/landing/LandingAIFeatures.tsx`
- `components/landing/LandingClinicalFocus.tsx`
- `components/landing/LandingVisualDemo.tsx`
- `components/landing/LandingPricing.tsx`
- `components/landing/LandingCTA.tsx`

## Errors / Corrections

- Fixed: LandingNavbar used `<a href="/">` changed to `<Link href="/">` for lint compliance.
- Fixed: LandingPricing had unused `Button` import, removed it.

## Ready for Next Run

Task 05 complete. Ready for task_06: Assemble LandingPageContent and create /landing-page route.
