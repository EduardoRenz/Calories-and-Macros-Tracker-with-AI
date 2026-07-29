---
status: pending
title: Landing Page Hero com Simulador IA, Widget Incorporável, Analytics e Auditoria CI/Lighthouse
type: frontend
complexity: high
---

# Task 4: Landing Page Hero com Simulador IA, Widget Incorporável, Analytics e Auditoria CI/Lighthouse

## Overview
Deliver the conversion and growth layer: redesign the landing page hero with an interactive AI meal simulator and social proof, build an embeddable macro calculator widget for external sites, integrate Search Console/Bing Webmaster verification tags, and establish the continuous Lighthouse CI audit pipeline that gates deployments at 95+ scores across Performance, SEO, and Accessibility.

<critical>
- ALWAYS READ the PRD, the TechSpec, and their catalogs (`_user_stories.md`, `_tests.md`) before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — implement every test case assigned in ## Tests
</critical>

<requirements>
- MUST create an interactive AI Meal Demo widget on the `/landing-page` hero section responding visually in < 300ms.
- MUST inject `FAQPage` JSON-LD schema into the landing page FAQ section matching the visible FAQ text.
- MUST create `/widget/calculadora-macros` embeddable iframe route with "Powered by Levemente AI" backlink attribution.
- MUST add Google Search Console and Bing Webmaster verification meta tags in root metadata.
- MUST configure `@lhci/cli` Lighthouse CI scripts that fail builds when Mobile Performance, SEO, or Accessibility scores drop below 95.
- MUST validate all public URLs via Google PageSpeed Insights and Lighthouse audit as a formal success gate.
</requirements>

## Subtasks
- [ ] 4.1 Redesign `/landing-page` hero section with H1, AI meal simulator demo, and prominent CTA "Testar Grátis Agora".
- [ ] 4.2 Wire `FAQPage` JSON-LD schema into the landing page FAQ accordion section.
- [ ] 4.3 Create `/widget/calculadora-macros` embeddable route with backlink badge and HTML snippet generator.
- [ ] 4.4 Add Google Search Console and Bing Webmaster verification meta tags via `utils/seo/metadata.ts`.
- [ ] 4.5 Configure `@lhci/cli` Lighthouse CI audit runner asserting Performance >= 95, SEO = 100, Accessibility = 100.
- [ ] 4.6 Run full Lighthouse audit against all public routes (`/`, `/plans`, `/calculadora-macros`, `/landing-page`) and verify passing scores.
- [ ] 4.7 Run Google PageSpeed Insights validation against `https://levemente.ia.br` and document results.
- [ ] 4.8 Write Cypress E2E tests for crawler link validation and Lighthouse performance gate.

## Implementation Details

### Relevant Files
- `app/landing-page/page.tsx` — Landing page (modified with hero simulator and FAQ JSON-LD).
- `components/landing/` — Landing page components (modified for hero redesign and ARIA).
- `app/widget/calculadora-macros/page.tsx` — Embeddable widget route (new).
- `.lighthouserc.js` or `lighthouserc.json` — Lighthouse CI configuration (new).

### Dependent Files
- `utils/seo/metadata.ts` — Consumed for verification tags and dynamic metadata.
- `utils/seo/jsonld.ts` — Consumed for `FAQPage` schema injection.
- `components/seo/JsonLd.tsx` — Renders JSON-LD script tags.
- `app/layout.tsx` — Root layout consuming verification meta tags.
- `locales/pt.json`, `locales/en.json`, `locales/es.json` — i18n keys for hero CTA and simulator labels.

### Related ADRs
- [ADR-001: Core Web Vitals & Technical SEO Strategy](../adrs/adr-001.md) — Lighthouse 95+ gate and CWV targets.

## Deliverables
- Redesigned `/landing-page` hero with interactive AI meal simulator and FAQ JSON-LD.
- `/widget/calculadora-macros` embeddable route with backlink attribution.
- `@lhci/cli` configuration enforcing Lighthouse gates (Performance >= 95, SEO = 100, Accessibility = 100).
- Google Search Console and Bing Webmaster verification tags in metadata.
- Documented PageSpeed Insights and Lighthouse audit results for all public routes.
- Every test case assigned in `## Tests` implemented and passing **(REQUIRED)**.

## Tests

- [ ] **E2E-001** — Crawler visits `/` → finds valid canonical link, sitemap reference, and 0 broken links.
- [ ] **E2E-004** — Mobile view on 4G throttle → Lighthouse audit returns Performance score >= 95, SEO = 100, Accessibility = 100.

## Success Criteria
- Every assigned test case implemented and passing
- Lighthouse Mobile Performance >= 95, SEO = 100, Accessibility = 100 on all public routes
- Google PageSpeed Insights passes for `https://levemente.ia.br` with green scores
- AI meal simulator demo responds visually in < 300ms
- Embeddable widget renders on external sites with canonical backlink
- Zero broken internal links across all public routes
