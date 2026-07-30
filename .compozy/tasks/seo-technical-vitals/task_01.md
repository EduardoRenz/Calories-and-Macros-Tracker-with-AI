---
status: completed
title: Módulo Puro de SEO, Metadata Dinâmica, Canonicais e JSON-LD
type: backend
complexity: medium
---

# Task 1: Módulo Puro de SEO, Metadata Dinâmica, Canonicais e JSON-LD

## Overview
Implement stateless, pure utility functions under `utils/seo/` to handle dynamic Next.js App Router metadata generation, canonical URL sanitization, and Schema.org JSON-LD microdata builders (`SoftwareApplication`, `WebApplication`, `FAQPage`). This establishes the core SEO utility foundation without side-effects or stateful repository overhead.

<critical>
- ALWAYS READ the PRD, the TechSpec, and their catalogs (`_user_stories.md`, `_tests.md`) before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — implement every test case assigned in ## Tests
</critical>

<requirements>
- MUST create `utils/seo/metadata.ts` implementing `buildSeoMetadata()` returning Next.js `Metadata`.
- MUST create `utils/seo/canonical.ts` implementing `buildCanonicalUrl()` stripping `utm_*` query parameters while preserving locale subpaths.
- MUST create `utils/seo/jsonld.ts` implementing `buildSoftwareAppJsonLd()` and `buildFaqJsonLd()` returning compliant Schema.org JSON objects.
- MUST ensure all utilities operate as side-effect-free pure functions without direct external API or database calls.
</requirements>

## Subtasks
- [x] 1.1 Create `utils/seo/canonical.ts` for clean canonical URL construction and query parameter stripping.
- [x] 1.2 Create `utils/seo/metadata.ts` for dynamic Next.js Metadata creation with fallback titles, descriptions, and OpenGraph configurations.
- [x] 1.3 Create `utils/seo/jsonld.ts` for `SoftwareApplication`, `WebApplication`, and `FAQPage` JSON-LD schema objects.
- [x] 1.4 Create `components/seo/JsonLd.tsx` React Server Component for rendering `<script type="application/ld+json">`.
- [x] 1.5 Write unit tests for metadata, canonical, and JSON-LD utilities under `tests/unit/seo/`.

## Implementation Details

### Relevant Files
- `utils/seo/metadata.ts` — Pure helper module constructing Next.js `Metadata` objects.
- `utils/seo/canonical.ts` — Utility for canonical URL creation.
- `utils/seo/jsonld.ts` — Schema.org JSON-LD schema builder module.
- `components/seo/JsonLd.tsx` — React Server Component rendering JSON-LD scripts.

### Dependent Files
- [app/layout.tsx](file:///home/eduardo/Projects/Calories-and-Macros-Tracker-with-AI/app/layout.tsx) — Will consume `buildSeoMetadata()` and `JsonLd` component.

### Related ADRs
- [ADR-001: Core Web Vitals & Technical SEO Strategy](../adrs/adr-001.md) — Technical SEO priority strategy.
- [ADR-002: Pure Utility Functions for SEO](../adrs/adr-002.md) — Pure function approach for SEO utilities.

## Deliverables
- `utils/seo/metadata.ts`, `utils/seo/canonical.ts`, `utils/seo/jsonld.ts`, and `components/seo/JsonLd.tsx`.
- Tests in `cypress/e2e/seo/seo-utils.cy.ts` implemented for `UT-001`, `UT-002`, `UT-004`, `UT-005`, `UT-008`, `UT-009`.
- Every test case assigned in `## Tests` implemented and passing **(REQUIRED)**.

## Tests

- [x] **UT-001** — `buildSeoMetadata`: given valid inputs, produces absolute metadata object with canonical URL.
- [x] **UT-002** — `buildSeoMetadata`: applies fallback title when given empty/missing title.
- [x] **UT-004** — `buildSoftwareAppJsonLd`: produces valid Schema.org `SoftwareApplication` JSON object.
- [x] **UT-005** — `buildFaqJsonLd`: produces valid `FAQPage` JSON object.
- [x] **UT-008** — `buildCanonicalUrl`: strips tracking query parameters from URL.
- [x] **UT-009** — `buildSeoMetadata`: validates image alt attributes and localized fallback strings.

## Success Criteria
- Every assigned test case implemented and passing
- Pure utilities return valid Next.js Metadata and JSON-LD schema objects
- Zero side-effects or network dependencies inside `utils/seo/`
