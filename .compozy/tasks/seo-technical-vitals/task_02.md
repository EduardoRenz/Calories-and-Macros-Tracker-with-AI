---
status: pending
title: Infraestrutura Next.js App Router (Sitemap.xml, Robots.txt, Fontes e Layout A11y)
type: infra
complexity: medium
---

# Task 2: Infraestrutura Next.js App Router (Sitemap.xml, Robots.txt, Fontes e Layout A11y)

## Overview
Implement native dynamic Next.js App Router endpoints `app/sitemap.ts` and `app/robots.ts`, update the root layout with font fallback metrics (Nearo, Montserrat, Lexend) to eliminate CLS, and inject global metadata and accessible ARIA structures.

<critical>
- ALWAYS READ the PRD, the TechSpec, and their catalogs (`_user_stories.md`, `_tests.md`) before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — implement every test case assigned in ## Tests
</critical>

<requirements>
- MUST implement `app/sitemap.ts` dynamically listing all public indexable routes.
- MUST implement `app/robots.ts` disallowing protected routes (`/dashboard`, `/historico`, `/settings`, `/checkout`).
- MUST update [app/layout.tsx](file:///home/eduardo/Projects/Calories-and-Macros-Tracker-with-AI/app/layout.tsx) with font fallback metrics (`display: "swap"`) to ensure CLS < 0.05.
- MUST inject `JsonLd` component and dynamic metadata into root layout.
</requirements>

## Subtasks
- [ ] 2.1 Create `app/sitemap.ts` with dynamic URL entries, `<lastmod>`, and priority configurations.
- [ ] 2.2 Create `app/robots.ts` with crawler instructions disallowing protected paths.
- [ ] 2.3 Refactor [app/layout.tsx](file:///home/eduardo/Projects/Calories-and-Macros-Tracker-with-AI/app/layout.tsx) to use font fallback metrics and `buildSeoMetadata()`.
- [ ] 2.4 Inject `SoftwareApplication` JSON-LD schema into root layout.
- [ ] 2.5 Add integration tests verifying `/sitemap.xml`, `/robots.txt`, and font CLS metrics.

## Implementation Details

### Relevant Files
- `app/sitemap.ts` — Dynamic XML sitemap generator.
- `app/robots.ts` — Dynamic robots disallow rules file.
- [app/layout.tsx](file:///home/eduardo/Projects/Calories-and-Macros-Tracker-with-AI/app/layout.tsx) — Root application layout.

### Dependent Files
- `utils/seo/metadata.ts` — Consumed by root layout.
- `components/seo/JsonLd.tsx` — Consumed by root layout.

### Related ADRs
- [ADR-001: Core Web Vitals Strategy](../adrs/adr-001.md) — Font CLS and layout optimization.
- [ADR-002: Pure SEO Utilities](../adrs/adr-002.md) — Stateless metadata consumption.

## Deliverables
- `app/sitemap.ts`, `app/robots.ts`, and updated `app/layout.tsx`.
- Tests for `UT-003`, `IT-001`, `IT-002`, `IT-003`, `IT-004`, `IT-005`, `IT-007` implemented and passing.
- Every test case assigned in `## Tests` implemented and passing **(REQUIRED)**.

## Tests

- [ ] **UT-003** — `buildSitemapEntries`: generates correct sitemap items array.
- [ ] **IT-001** — Heading hierarchy: verifies single H1 per public route.
- [ ] **IT-002** — Metadata injection: verifies `<title>` and `<link rel="canonical">` in server HTML.
- [ ] **IT-003** — Sitemap & Robots endpoints: verifies `/sitemap.xml` and `/robots.txt` return HTTP 200 OK.
- [ ] **IT-004** — JSON-LD script: verifies un-escaped JSON-LD script rendered in document head.
- [ ] **IT-005** — Font CLS: verifies local font loading causes zero layout shifts (CLS = 0.00).
- [ ] **IT-007** — Accessibility audit: verifies 100% of images possess descriptive `alt` tags.

## Success Criteria
- Every assigned test case implemented and passing
- `/sitemap.xml` and `/robots.txt` respond with HTTP 200 OK
- Zero cumulative layout shifts (CLS = 0.00) on root layout
