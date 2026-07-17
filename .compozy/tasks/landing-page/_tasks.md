# Landing Page — Task List

## Tasks

| # | Title | Status | Complexity | Dependencies |
|---|-------|--------|------------|--------------|
| 01 | Improve PlanCard with optional ctaLabel prop | completed | low | — |
| 02 | Improve MacroProgressCard with optional className prop | completed | low | — |
| 03 | Add landing.* i18n keys to all locale files (PT, EN, ES) | completed | low | — |
| 04 | Add visual building blocks (kinetic-gradient, glass-card) and Material Symbols font | completed | low | — |
| 05 | Build components/landing/ sub-components (8 files) | completed | high | task_01, task_02, task_03, task_04 |
| 06 | Assemble LandingPageContent and create /landing-page route | completed | medium | task_05 |
| 07 | Update app/page.tsx root routing (unauth → landing, auth → /dashboard) | completed | medium | task_06 |
| 08 | Write cypress/e2e/landing.cy.ts (single file) and adjust existing tests inline | pending | medium | task_07 |
| 09 | Bump package.json version from 1.14.6 to 1.14.7 | completed | low | task_08 |

## Notes

- **No unit/component tests** are produced by this feature. Quality is validated exclusively by `cypress/e2e/landing.cy.ts` (single file) plus inline adjustments to `cypress/e2e/auth-routing.cy.ts` and `cypress/e2e/basic.cy.ts`.
- The Landing Page is a faithful implementation of `.compozy/tasks/landing-page/code.html` (9 sections in order, anchors `#benefits`/`#how-it-works`/`#features`/`#pricing`/`#login`, `kinetic-gradient` CTAs, `glass-card` floating notification, Material Symbols Outlined icons).
- The Bottom CTA section (id="login") ships a single primary button to `/login`. The email/password form shown in `code.html` is layout reference only and is **not** implemented (per product decision — auth lives exclusively on `/login`).
