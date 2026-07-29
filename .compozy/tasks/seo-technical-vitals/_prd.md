# Product Requirements Document (PRD) — SEO, Core Web Vitals & Organic Growth Engine

## Overview

**Levemente AI** is an AI-powered meal tracking and macro calculation web application built with Next.js 16 (App Router), React 19, TypeScript, and Clean Architecture. While 95% of the core meal-logging application resides behind authentication (`/dashboard`, `/food-analysis`, `/historico`), the primary organic user acquisition surface relies on public marketing pages, landing pages, dynamic public tools, shareable AI meal insights, and evergreen content.

This PRD details a comprehensive, production-ready specification structured into **10 Epics** to transform Levemente AI into a high-authority, search-optimized platform with sub-second Core Web Vitals (LCP < 1.8s, CLS < 0.05, INP < 100ms, TTFB < 400ms, Lighthouse 95+), rich JSON-LD microdata, AI Overview (GEO) optimization, and conversion-focused landing pages.

---

## Goals

1. **Complete Technical SEO & Crawler Infrastructure**: 100% crawlability, dynamic Next.js metadata, automated `sitemap.xml`, `robots.txt`, clean canonical URLs, and zero broken internal links or redirect loops.
2. **Schema.org Rich Snippet & GEO Dominance**: Complete JSON-LD microdata integration (`SoftwareApplication`, `WebApplication`, `FAQPage`, `Organization`, `Recipe`/`NutritionInformation`).
3. **Core Web Vitals & Performance (Lighthouse 95+)**: Achieve sub-second page rendering for public routes, zero cumulative layout shifts (CLS < 0.05), fast interaction response (INP < 100ms), and optimized font/asset loading.
4. **Public AI Features & Virality Flywheel**: Indexable public shareable AI meal reports (`/share/meal/[id]`) and free nutrition calculators (`/calculadora-macros`, `/calculadora-tdee`) driving organic backlinks and social shares.
5. **High-Converting Landing Pages & Content Clusters**: Transparent landing page hero sections, interactive AI meal simulators, rich FAQs, and comparative content clusters (e.g., *Levemente AI vs Manual Macro Counting*).

---

## User Stories

Index into [`_user_stories.md`](_user_stories.md), the canonical story catalog:

- **US-001**: Technical SEO Audit & Checklist Pipeline — [Details](_user_stories.md#us-001-technical-audit--audit-checklist-pipeline)
- **US-002**: Dynamic Metadata, OpenGraph & Canonical Engine — [Details](_user_stories.md#us-002-dynamic-metadata-opengraph--canonical-engine)
- **US-003**: Dynamic Sitemap, Robots.txt & Crawl Infrastructure — [Details](_user_stories.md#us-003-dynamic-sitemap-robotstxt--crawl-infrastructure)
- **US-004**: Schema.org JSON-LD Structured Data — [Details](_user_stories.md#us-004-schemaorg-json-ld-structured-data)
- **US-005**: Core Web Vitals 95+ Optimization Engine — [Details](_user_stories.md#us-005-core-web-vitals-95-optimization-engine)
- **US-006**: Public Calorie/Macro Calculators & High-Intent Landing Pages — [Details](_user_stories.md#us-006-public-caloriemacro-calculators--high-intent-landing-pages)
- **US-007**: Public Diet & Macro Glossary with Evergreen Articles — [Details](_user_stories.md#us-007-public-diet--macro-glossary-with-evergreen-articles)
- **US-008**: Shareable Public AI Meal Insights & Reports — [Details](_user_stories.md#us-008-shareable-public-ai-meal-insights--reports)
- **US-009**: Conversion-Driven Public Landing Pages — [Details](_user_stories.md#us-009-conversion-driven-public-landing-pages)
- **US-010**: Digital PR & Embeddable Macro Widget — [Details](_user_stories.md#us-010-digital-pr--embeddable-macro-widget)
- **US-011**: Analytics, Search Console & Monitoring — [Details](_user_stories.md#us-011-analytics-search-console--monitoring)

---

## Core Features & Breakdown by Epic

```
Epic 1 — Auditoria Completa
 └── Feature 1.1: Automated SEO & Core Web Vitals Audit Checklist Pipeline
Epic 2 — SEO Técnico
 ├── Feature 2.1: Dynamic Metadata & Canonical URL Engine (Next.js App Router)
 ├── Feature 2.2: Automated Dynamic Sitemap.xml & Robots.txt Generator
 └── Feature 2.3: Schema.org Structured Data Engine (JSON-LD)
Epic 3 — Estratégia de Conteúdo & Hubs Publicos
 ├── Feature 3.1: Programmatic Free Nutrition & Macro Calculators
 └── Feature 3.2: High-Intent Keyword Content Cluster & Glossary System
Epic 4 — IA + SEO Virality Flywheel
 └── Feature 4.1: Public Indexable AI Meal Insights & Shared Reports
Epic 5 — Core Web Vitals & Performance (Lighthouse 95+)
 ├── Feature 5.1: Asset & Font Optimization Engine (Nearo, Montserrat, Lexend)
 └── Feature 5.2: Server Component Rendering & Cache Optimization (RSC + ISR)
Epic 6 — Conversão & UX de Landing Page
 └── Feature 6.1: High-Converting Public Hero, Social Proof & Interactive Simulator
Epic 7 — Digital PR & Backlinks Engine
 └── Feature 7.1: Embeddable Macro Calculator Widget & Free Tool Directory Distribution
Epic 8 — Analytics, Monitoring & Search Console
 └── Feature 8.1: Multi-Provider Webmaster & Conversion Tracking (Plausible / GA4)
Epic 9 — Roadmap & Priorização Impacto x Esforço
 └── Feature 9.1: Eisenhower Matrix Roadmap (High Impact / Low Effort First)
Epic 10 — Checklist Final de Implementação
 └── Feature 10.1: Production Readiness Verification Gate
```

---

## Detailed Epics & Implementation Specifications

### Epic 1 — Auditoria Completa

#### Feature 1.1: Automated SEO & Core Web Vitals Audit Checklist Pipeline
- **Description**: Establish an automated audit checklist covering technical SEO, Lighthouse, Core Web Vitals, mobile responsiveness, crawling, canonicals, meta tags, and internal link structure.
- **Justification**: Guarantees zero regressions in indexability and user experience across build releases.
- **Tasks**:
  - `Task 1.1.1`: Create continuous Cypress + Lighthouse performance audit runner.
    - *Subtasks*: Configure `@lhci/cli` scripts; assert Lighthouse score >= 95 for SEO and Performance on `/` and `/plans`.
    - *Acceptance Criteria*: Automated CI run fails if Lighthouse score drops below 95 on public pages.
  - `Task 1.1.2`: Audit HTML heading hierarchy and canonical links.
    - *Subtasks*: Ensure exactly one `<h1>` per page; verify `<link rel="canonical">` on all public routes.
    - *Acceptance Criteria*: Crawl test passes with 0 duplicate H1s and valid absolute canonical tags.
  - `Task 1.1.3`: Audit and implement Accessibility (a11y) standards across public routes.
    - *Subtasks*: Verify 100% of images have localized descriptive `alt` text using i18n (`locales/*.json`); ensure interactive elements have proper `aria-label`, `aria-expanded`, and keyboard focus rings.
    - *Acceptance Criteria*: Lighthouse Accessibility score is 100 on public routes with 0 missing `alt` attribute errors.

---

### Epic 2 — SEO Técnico (Next.js App Router Implementation)

#### Feature 2.1: Dynamic Metadata & Canonical URL Engine
- **Description**: Build a clean metadata abstraction wrapper conforming to Next.js App Router `generateMetadata` API.
- **Justification**: Eliminates static metadata bottlenecks and produces localized, page-specific OpenGraph and Twitter cards.
- **Tasks**:
  - `Task 2.1.1`: Implement `SeoMetadataRepository` and factory helper in `utils/seo/metadata.ts`.
    - *Subtasks*: Define `buildMetadata({ title, description, path, ogImage, locale })` using Clean Architecture; set `metadataBase: new URL("https://levemente.ia.br")`.
    - *Acceptance Criteria*: All public pages return dynamic `<title>`, `<meta name="description">`, `og:image`, and `twitter:card`.
  - `Task 2.1.2`: Implement canonical URL generation with locale awareness.
    - *Subtasks*: Strip UTM and query tracking parameters from canonical tag while retaining locale subpaths.
    - *Acceptance Criteria*: `<link rel="canonical" href="https://levemente.ia.br/...">` matches clean target URL.

#### Feature 2.2: Automated Dynamic Sitemap.xml & Robots.txt Generator
- **Description**: Implement native Next.js `app/sitemap.ts` and `app/robots.ts` files.
- **Justification**: Automates link discovery for search engine crawlers without manual XML maintenance.
- **Tasks**:
  - `Task 2.2.1`: Build dynamic `app/sitemap.ts`.
    - *Subtasks*: Query static public routes and public shared meals/calculators; format entries with `url`, `lastModified`, `changeFrequency`, and `priority`.
    - *Acceptance Criteria*: Navigating to `/sitemap.xml` returns valid XML list of all public indexable URLs.
  - `Task 2.2.2`: Build dynamic `app/robots.ts`.
    - *Subtasks*: Configure `allow: ['/']` and `disallow: ['/dashboard', '/food-analysis', '/historico', '/settings', '/checkout']`.
    - *Acceptance Criteria*: Navigating to `/robots.txt` returns disallow directives for protected routes and links to `sitemap.xml`.

#### Feature 2.3: Schema.org Structured Data Engine (JSON-LD)
- **Description**: Inject rich JSON-LD structured data using React Server Components.
- **Justification**: Maximizes SERP visibility with star ratings, software pricing badges, and AI Overview (GEO) eligibility.
- **Tasks**:
  - `Task 2.3.1`: Build `SoftwareApplication` & `WebApplication` JSON-LD generator component (`components/seo/JsonLd.tsx`).
    - *Subtasks*: Render `<script type="application/ld+json">` with app name, operatingSystem ("Web, iOS, Android PWA"), applicationCategory ("HealthApplication"), and offers (`price: "0", priceCurrency: "BRL"`).
    - *Acceptance Criteria*: Google Rich Results Test validates `SoftwareApplication` without errors.
  - `Task 2.3.2`: Build `FAQPage` JSON-LD generator for landing page FAQs.
    - *Subtasks*: Convert landing page FAQ state dynamically into Schema.org `FAQPage` entities (`mainEntity` with `Question` and `Answer`).
    - *Acceptance Criteria*: Google Rich Results Test confirms valid `FAQPage` schema.

---

### Epic 3 — Conteúdo & Hubs Públicos

#### Feature 3.1: Programmatic Free Nutrition & Macro Calculators
- **Description**: Build public, unauthenticated calculation tools (`/calculadora-macros`, `/calculadora-tdee`).
- **Justification**: Captures high-volume organic search queries (*"calculadora de macros grátis"*, *"como calcular TDEE"*) and converts visitors to registered users.
- **Tasks**:
  - `Task 3.1.1`: Create `/calculadora-macros` public page with instant client-side calculation.
    - *Subtasks*: Input age, weight, height, activity level, and goal (weight loss, muscle gain); compute calories/macros with visual charts; display CTA "Salvar dieta no Levemente AI".
    - *Acceptance Criteria*: Visitor can calculate macros in 3 clicks without registering; CTA links directly to free instant signup.

#### Feature 3.2: High-Intent Keyword Content Cluster & Glossary System
- **Description**: Build a lightweight markdown/JSON-driven content cluster (`/glossario/[term]`, `/blog/[slug]`).
- **Justification**: Establishes topical authority around macros, calorie deficit, and AI food logging.
- **Tasks**:
  - `Task 3.2.1`: Implement `/glossario/[term]` dynamic route using SSG (`generateStaticParams`).
    - *Subtasks*: Render glossary terms (e.g., *Deficit Calórico*, *Macronutrientes*, *Taxa Metabólica Basal*) with `DefinedTerm` JSON-LD schema.
    - *Acceptance Criteria*: Pages load in < 200ms via static HTML generation.

---

### Epic 4 — IA + SEO Virality Flywheel

#### Feature 4.1: Public Indexable AI Meal Insights & Shared Reports
- **Description**: Allow logged-in users to share an AI meal breakdown publicly via a share link (`/share/meal/[id]`).
- **Justification**: Creates a organic viral loop where users share AI meal scans on social media, while search engines index public nutritional insights.
- **Tasks**:
  - `Task 4.1.1`: Implement public `/share/meal/[id]` route with `Recipe` & `NutritionInformation` JSON-LD.
    - *Subtasks*: Fetch meal data via `MealRepository`; render image, calories, protein, carbs, fats, and AI dietary advice; generate dynamic OpenGraph preview image with meal summary.
    - *Acceptance Criteria*: Unauthenticated visitors and crawlers see full meal breakdown and OG share preview image.

---

### Epic 5 — Performance (Core Web Vitals 95+)

#### Feature 5.1: Asset & Font Optimization Engine
- **Description**: Optimize font loading (Montserrat, Lexend, Nearo) and image asset delivery using `next/font` and `next/image`.
- **Justification**: Eliminates Cumulative Layout Shift (CLS) and reduces Largest Contentful Paint (LCP) under 1.8 seconds.
- **Tasks**:
  - `Task 5.1.1`: Optimize custom local font loading (`Nearo-*.ttf`) in `app/layout.tsx`.
    - *Subtasks*: Apply `display: "swap"` and fallback metrics (`adjustFontFallback`); reserve CSS box dimensions for dynamic elements.
    - *Acceptance Criteria*: CLS score measures strictly 0.00 on initial page load.

#### Feature 5.2: Server Component Rendering & Edge Caching
- **Description**: Leverage Next.js App Router Server Components (RSC) for all public marketing pages.
- **Justification**: Achieves sub-400ms Time-To-First-Byte (TTFB) and zero JavaScript payload for initial text rendering.
- **Tasks**:
  - `Task 5.2.1`: Refactor `/landing-page` and `/plans` into zero-client JS Server Components where applicable.
    - *Subtasks*: Move interactive components (accordions, modals) into isolated client boundaries (`'use client'`).
    - *Acceptance Criteria*: Initial HTML bundle size reduced by > 40%.

---

### Epic 6 — Conversão & UX de Landing Page

#### Feature 6.1: High-Converting Public Hero, Social Proof & Interactive Simulator
- **Description**: Redesign public hero section on `/landing-page` with instant AI meal simulation, user trust badges, and zero-friction CTA.
- **Justification**: Converts organic search traffic into active users without long onboarding walls.
- **Tasks**:
  - `Task 6.1.1`: Create interactive AI Meal Demo widget on landing page hero.
    - *Subtasks*: Allow visitors to type a sample meal (e.g., *"2 ovos mexidos e 1 fatia de pão integral"*) and see instant simulated AI macro response.
    - *Acceptance Criteria*: Demo responds in < 300ms visually; includes prominent CTA "Registrar Minha Refeição Agora Grátis".

---

### Epic 7 — Estratégia de Backlinks

#### Feature 7.1: Embeddable Macro Calculator Widget & Digital PR
- **Description**: Build an embeddable `<iframe>` widget (`/widget/calculadora-macros`) for fitness blogs and personal trainers.
- **Justification**: Generates passive, high-authority do-follow backlinks pointing to `https://levemente.ia.br`.
- **Tasks**:
  - `Task 7.1.1`: Create `/widget/calculadora-macros` route with backlink attribution badge ("Powered by Levemente AI").
    - *Subtasks*: Provide HTML snippet generator on public calculator page for 1-click copy-paste embedding.
    - *Acceptance Criteria*: Embedded widget functions seamlessly on external sites with working canonical backlink.

---

### Epic 8 — Analytics, Monitoring & Search Console

#### Feature 8.1: Multi-Provider Webmaster & Conversion Tracking
- **Description**: Integrate Google Search Console, Bing Webmaster Tools, and lightweight privacy-friendly analytics (Plausible / GA4).
- **Justification**: Provides real-time visibility into keyword impressions, organic CTR, and search conversion rates.
- **Tasks**:
  - `Task 8.1.1`: Add meta verification tags for Google Search Console and Bing Webmaster Tools in root metadata.
    - *Subtasks*: Inject `verification: { google: "...", yandex: "...", bing: "..." }` via Next.js metadata config.
    - *Acceptance Criteria*: Verification meta tags present in `<head>` output.

---

## Epic 9 — Roadmap & Prioritization (Eisenhower Matrix)

| Priority Tier | Impact | Effort | Features / Tasks | Target Milestone |
|---|---|---|---|---|
| **P0 (Critical)** | High | Low | Dynamic Metadata, Canonical URLs, Sitemap.xml, Robots.txt, Font CLS Fixes (`Task 2.1.1`, `Task 2.2.1`, `Task 5.1.1`) | Sprint 1 |
| **P1 (High)** | High | Medium | JSON-LD Schemas (`SoftwareApplication`, `FAQPage`), Interactive Landing Page Hero Demo (`Task 2.3.1`, `Task 6.1.1`) | Sprint 2 |
| **P2 (Medium)** | High | Medium | Free Public Macro & TDEE Calculators, Shareable Public AI Meal Insights (`Task 3.1.1`, `Task 4.1.1`) | Sprint 3 |
| **P3 (Growth)** | Medium | Low | Embeddable Calculator Widget, Glossario Cluster (`Task 3.2.1`, `Task 7.1.1`) | Sprint 4 |

---

## Epic 10 — Final Implementation Checklist

- [ ] **SEO Técnico & Crawler Checklist**
  - [ ] Canonical tag present on all public routes without UTM parameters
  - [ ] `sitemap.xml` generates dynamically and returns 200 OK
  - [ ] `robots.txt` disallows `/dashboard`, `/historico`, `/settings`, `/checkout`
  - [ ] Single `<h1>` per public page with valid heading hierarchy (H1 -> H2 -> H3)
  - [ ] Zero 404 broken internal links

- [ ] **Structured Data (JSON-LD) Checklist**
  - [ ] `SoftwareApplication` & `WebApplication` schema present on `/` and `/landing-page`
  - [ ] `FAQPage` schema injected on `/landing-page` and `/plans`
  - [ ] `Recipe` & `NutritionInformation` schema present on public shared meal pages (`/share/meal/[id]`)

- [ ] **Core Web Vitals Checklist**
  - [ ] Mobile Lighthouse Performance Score >= 95
  - [ ] Largest Contentful Paint (LCP) < 1.8s
  - [ ] Cumulative Layout Shift (CLS) < 0.05
  - [ ] Interaction to Next Paint (INP) < 100ms
  - [ ] Time-To-First-Byte (TTFB) < 400ms

- [ ] **Conversion & Virality Checklist**
  - [ ] Hero CTA above the fold with 1-click free registration
  - [ ] Interactive AI meal simulator operational on landing page
  - [ ] OpenGraph image previews render accurately on WhatsApp, Twitter, and LinkedIn

---

## Architecture Decision Records

- [ADR-001: Core Web Vitals & Technical SEO Priority Strategy](adrs/adr-001.md) — Technical SEO and Core Web Vitals first approach using Next.js App Router Server Components.

---

## Open Questions

- *None at present. Requirements aligned with project Clean Architecture guidelines and user confirmation.*
