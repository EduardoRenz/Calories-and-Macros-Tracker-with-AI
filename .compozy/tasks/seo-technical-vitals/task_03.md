---
status: pending
title: Páginas Públicas, Calculadoras de Nutrição e Relatórios de Refeições Compartilháveis
type: frontend
complexity: high
---

# Task 3: Páginas Públicas, Calculadoras de Nutrição e Relatórios de Refeições Compartilháveis

## Overview
Build the public-facing content routes that drive organic acquisition: an interactive macro/TDEE calculator (`/calculadora-macros`), a shareable AI meal report page (`/share/meal/[id]`), and accessibility-compliant localized image alt attributes across all public components. These routes are server-rendered with dynamic metadata and JSON-LD schemas from the utilities built in Task 1, wired into the infrastructure from Task 2.

<critical>
- ALWAYS READ the PRD, the TechSpec, and their catalogs (`_user_stories.md`, `_tests.md`) before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — implement every test case assigned in ## Tests
</critical>

<requirements>
- MUST create `/calculadora-macros` as a public, unauthenticated page with instant client-side macro/calorie calculation and a CTA linking to free registration.
- MUST create `/share/meal/[id]` as a public Server Component route rendering meal macro data, AI advice, and `Recipe`/`NutritionInformation` JSON-LD without requiring authentication.
- MUST generate dynamic OpenGraph preview images for shared meal pages.
- MUST add localized i18n translation keys for all image `alt` attributes and ARIA labels on public pages using `locales/*.json`.
- SHOULD use `generateMetadata()` and `buildSeoMetadata()` for per-route dynamic metadata on both new routes.
</requirements>

## Subtasks
- [ ] 3.1 Create `app/calculadora-macros/page.tsx` with age/weight/height/activity inputs and instant macro calculation.
- [ ] 3.2 Add `generateMetadata()` to `/calculadora-macros` using `buildSeoMetadata()` with localized title/description.
- [ ] 3.3 Create `app/share/meal/[id]/page.tsx` as a public Server Component fetching meal data via `MealRepository`.
- [ ] 3.4 Inject `Recipe` and `NutritionInformation` JSON-LD schema into `/share/meal/[id]` using `buildFaqJsonLd`-style builder.
- [ ] 3.5 Generate dynamic OpenGraph preview image for shared meals (using Next.js `opengraph-image.tsx` or equivalent).
- [ ] 3.6 Handle revoked/deleted meal shares with a friendly 404 page and CTA to try free meal scan.
- [ ] 3.7 Add i18n translation keys for all image `alt` texts and ARIA labels in `locales/pt.json`, `locales/en.json`, `locales/es.json`.
- [ ] 3.8 Write Cypress E2E tests for calculator flow, shared meal flow, and localized alt text verification.

## Implementation Details

### Relevant Files
- `app/calculadora-macros/page.tsx` — Public macro calculator page (new).
- `app/share/meal/[id]/page.tsx` — Public shareable meal report (new).
- `app/share/meal/[id]/opengraph-image.tsx` — Dynamic OG image generator (new).
- `locales/pt.json`, `locales/en.json`, `locales/es.json` — i18n translation files (modified).

### Dependent Files
- `utils/seo/metadata.ts` — Consumed by `generateMetadata()` in both routes.
- `utils/seo/jsonld.ts` — Consumed for `Recipe`/`NutritionInformation` schema.
- `components/seo/JsonLd.tsx` — Renders JSON-LD script tags.
- `domain/repositories/MealRepository` — Fetches meal data for shared reports.

### Related ADRs
- [ADR-002: Pure Utility Functions for SEO](../adrs/adr-002.md) — Pure function consumption in route metadata.

## Deliverables
- `app/calculadora-macros/page.tsx` with interactive macro calculator and CTA.
- `app/share/meal/[id]/page.tsx` with public meal breakdown and JSON-LD.
- Dynamic OpenGraph image generation for shared meals.
- Localized i18n keys for image `alt` attributes across all public components.
- Every test case assigned in `## Tests` implemented and passing **(REQUIRED)**.

## Tests

- [ ] **UT-006** — Macro calculator: given valid age/weight/height/activity inputs, computes correct calorie/macro values.
- [ ] **UT-007** — Shared meal page: given valid meal entity, renders macro breakdown data.
- [ ] **IT-006** — Shareable AI Meal route: fetch `/share/meal/sample-id` returns public HTML with macro values without auth cookies.
- [ ] **E2E-002** — Visitor navigates to `/landing-page` → sees localized dynamic metadata and social share cards.
- [ ] **E2E-003** — Crawler requests `/sitemap.xml` → parses all indexed URLs → confirms all return 200 OK.
- [ ] **E2E-005** — Unauthenticated visitor visits `/calculadora-macros` → fills inputs → calculates macros → clicks CTA.
- [ ] **E2E-006** — User copies public link `/share/meal/123` → opens in incognito → views meal analysis cleanly.
- [ ] **E2E-007** — Screen reader navigates public landing page → all image alt texts render translated text per active locale.

## Success Criteria
- Every assigned test case implemented and passing
- `/calculadora-macros` usable in 3 clicks without registration
- `/share/meal/[id]` renders full meal breakdown to unauthenticated visitors
- 100% of public images have non-empty localized `alt` attributes
