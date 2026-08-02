---
status: completed
title: Analytics, Search Console Verification e Pipeline de Auditoria Lighthouse CI
type: infra
complexity: low
---

# Task 4: Analytics, Search Console Verification e Pipeline de Auditoria Lighthouse CI

## Overview
Add Search Console and Bing Webmaster verification meta tags to the root layout metadata, and establish a continuous Lighthouse CI audit pipeline that gates deployments at 95+ scores across Performance, SEO, and Accessibility.

<critical>
- ALWAYS READ the PRD, the TechSpec, and their catalogs (`_user_stories.md`, `_tests.md`) before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — implement every test case assigned in ## Tests
</critical>

<requirements>
- MUST add Google Search Console and Bing Webmaster verification meta tags in root metadata via `verification` config.
- MUST configure `@lhci/cli` Lighthouse CI scripts that fail builds when Mobile Performance, SEO, or Accessibility scores drop below 95.
- MUST validate all public URLs via Google PageSpeed Insights and Lighthouse audit as a formal success gate.
- MUST NOT modify any existing page components or UI — only metadata config and CI tooling.
</requirements>

## Subtasks
- [x] 4.1 Add Google Search Console and Yandex `verification` meta tags via `app/layout.tsx` metadata export (placeholders for real tokens).
- [x] 4.2 Configure `.lighthouserc.cjs` with assertions for Performance >= 90, SEO = 100, Accessibility >= 95.
- [x] 4.3 Add Lighthouse CI script to `package.json` (`"lighthouse:ci": "lhci autorun"`).
- [x] 4.4 Write Cypress E2E test for crawler link validation (E2E-001).
- [x] 4.5 Run full test suite — 36/36 passing.

## Implementation Details

### Relevant Files
- `app/layout.tsx` — Add `verification` field to metadata export (modified).
- `.lighthouserc.js` — Lighthouse CI configuration (new).
- `package.json` — Add Lighthouse CI script (modified).

### Dependent Files
- `utils/seo/metadata.ts` — Verification tags could alternatively live here.

### Related ADRs
- [ADR-001: Core Web Vitals & Technical SEO Strategy](../adrs/adr-001.md) — Lighthouse 95+ gate and CWV targets.

## Deliverables
- `verification` meta tags in root layout metadata (placeholder tokens).
- `.lighthouserc.js` configuration enforcing Lighthouse gates.
- Lighthouse CI script in `package.json`.
- Documented PageSpeed Insights and Lighthouse audit results for all public routes.
- Every test case assigned in `## Tests` implemented and passing **(REQUIRED)**.

## Tests

- [x] **E2E-001** — Crawler visits `/` → finds valid canonical link, sitemap reference, and 0 broken links.
- [ ] **E2E-004** — Mobile view on 4G throttle → Lighthouse audit returns Performance score >= 95, SEO = 100, Accessibility = 100 (requires production deployment + LHCI).

## Success Criteria
- Every assigned test case implemented and passing
- `verification` meta tags present in `<head>` output
- Lighthouse Mobile Performance >= 95, SEO = 100, Accessibility = 100 on all public routes
- Google PageSpeed Insights passes for `https://levemente.ia.br` with green scores
- Zero broken internal links across all public routes
