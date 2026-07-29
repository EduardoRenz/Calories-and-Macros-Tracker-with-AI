# Technical Specification (TechSpec) — SEO, Core Web Vitals & Organic Growth Engine

## Executive Summary

This Technical Specification outlines the technical design, architectural interfaces, and data models to implement the **SEO, Core Web Vitals & Organic Growth Engine** for **Levemente AI**. 

In alignment with **ADR-001** and **ADR-002**, all SEO metadata, canonical link generation, JSON-LD microdata schema building, and sitemap output will be implemented as **pure, side-effect-free utility functions** in `utils/seo/`. These utilities will execute seamlessly inside Next.js 16 App Router Server Components (RSC) and built-in dynamic endpoints (`app/sitemap.ts`, `app/robots.ts`). Core Web Vitals optimization will be achieved by reserving layout dimensions for local fonts (`Nearo`, `Montserrat`, `Lexend`), pre-rendering public routes as zero-client-JS HTML, and wrapping client interactions in isolated Client Components.

---

## System Architecture

### Component Overview

```
                          [Search Engines / Crawlers / Visitors]
                                            │
                                            ▼
                           Next.js 16 App Router (RSC)
     ┌───────────────────┬───────────────────┬───────────────────┐
     │                   │                   │                   │
  app/page.tsx     app/sitemap.ts     app/robots.ts   app/share/meal/[id]
     │                   │                   │                   │
     └───────────────────┴─────────┬─────────┴───────────────────┘
                                   │
                                   ▼
                   ┌──────────────────────────────┐
                   │   utils/seo/ Pure Modules    │
                   ├──────────────────────────────┤
                   │  • metadata.ts               │
                   │  • jsonld.ts                 │
                   │  • canonical.ts              │
                   │  • sitemap-builder.ts        │
                   └───────────────┬──────────────┘
                                   │
                                   ▼
                        Domain Entities / Locales
                   (domain/entities/, locales/*.json)
```

1. **`utils/seo/metadata.ts`**: Pure helper module that constructs Next.js `Metadata` objects with absolute URLs, OpenGraph images, Twitter cards, and fallback localization strings.
2. **`utils/seo/jsonld.ts`**: Pure helper module that formats `<script type="application/ld+json">` outputs for `SoftwareApplication`, `WebApplication`, `FAQPage`, `Recipe`, and `NutritionInformation` schemas.
3. **`utils/seo/canonical.ts`**: Strips query params (`utm_*`, etc.) while retaining language prefixes to enforce canonical indexing.
4. **`app/sitemap.ts` & `app/robots.ts`**: Native Next.js App Router dynamic route generators returning XML and text directives.
5. **`components/seo/JsonLd.tsx`**: Lightweight React Server Component rendering validated JSON-LD scripts into document heads.
6. **`app/share/meal/[id]/page.tsx`**: Public, unauthenticated Server Component displaying user-shared AI meal analyses and macro breakdowns with auto-generated OG images.

---

## Implementation Design

### Core Interfaces

```typescript
// utils/seo/metadata.ts
export interface SeoMetadataOptions {
    title: string;
    description: string;
    path: string;
    ogImage?: string;
    locale?: string;
    noIndex?: boolean;
}

export function buildSeoMetadata(options: SeoMetadataOptions): Metadata;

// utils/seo/jsonld.ts
export interface SoftwareAppSchemaOptions {
    name: string;
    description: string;
    url: string;
    operatingSystem: string;
    applicationCategory: string;
    price: string;
    priceCurrency: string;
}

export function buildSoftwareAppJsonLd(options: SoftwareAppSchemaOptions): object;

export interface FaqItemSchema {
    question: string;
    answer: string;
}

export function buildFaqJsonLd(faqs: FaqItemSchema[]): object;

// utils/seo/canonical.ts
export function buildCanonicalUrl(rawPath: string, locale?: string): string;
```

### Data Models

```typescript
// Domain representation for shareable public meals (domain/entities/PublicSharedMeal.ts)
export interface PublicSharedMeal {
    id: string;
    name: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    aiAdvice?: string;
    createdAt: string;
    imageUrl?: string;
}
```

### API Endpoints

| Method | Path | Description | Access | Response Format |
|---|---|---|---|---|
| `GET` | `/sitemap.xml` | Dynamic XML sitemap generator (`app/sitemap.ts`) | Public | `application/xml` |
| `GET` | `/robots.txt` | Crawler directives generator (`app/robots.ts`) | Public | `text/plain` |
| `GET` | `/share/meal/[id]` | Public indexable shared AI meal report | Public | `text/html` |
| `GET` | `/calculadora-macros` | Public interactive macro calculator | Public | `text/html` |

---

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|---|---|---|---|
| [app/layout.tsx](file:///home/eduardo/Projects/Calories-and-Macros-Tracker-with-AI/app/layout.tsx) | Modified | Root layout updated with `metadataBase`, font fallback metrics, and global JSON-LD injection | Refactor metadata export to use `utils/seo/metadata.ts` |
| `components/landing/` | Modified | Added localized `alt` tags via `locales/*.json` and ARIA accessibility attributes (`aria-expanded`, `aria-label`) | Update public components for 100% Lighthouse A11y score |
| `app/sitemap.ts` | New | Dynamic sitemap route for Next.js App Router | Implement file under `app/sitemap.ts` |
| [app/robots.ts](file:///home/eduardo/Projects/Calories-and-Macros-Tracker-with-AI/app/robots.ts) | New | Crawler disallow directives for protected routes | Implement file under `app/robots.ts` |
| `utils/seo/` | New | Pure utility functions for metadata, canonicals, and JSON-LD schemas | Create utility modules with 100% unit test coverage |
| `components/seo/JsonLd.tsx` | New | React Server Component for rendering structured data scripts | Build reusable JSON-LD component |
| `app/share/meal/[id]/` | New | Public unauthenticated route for shareable AI meal insights | Build RSC page + OpenGraph image endpoint |

---

## Testing Approach

- **Unit Testing (Jest / Vitest)**: Test pure functions in `utils/seo/` for deterministic outputs, canonical URL query stripping, fallback titles, and JSON-LD schema compliance.
- **Integration Testing (Cypress / Next.js Test Runner)**: Test `/sitemap.xml` and `/robots.txt` endpoints for correct HTTP 200 headers, XML node structures, and disallow rules.
- **End-to-End Testing (Cypress)**:
  - Verify public landing page renders `<title>`, `<meta>`, canonical `<link>`, and JSON-LD script tags.
  - Test `/share/meal/[id]` flow: generate share link, access link in incognito mode without logging in, verify macro visualization.
- **Performance Assertions (Lighthouse CI)**: Assert Mobile Performance score >= 95 and SEO score = 100 in Cypress CI pipeline.

---

## Development Sequencing

### Build Order

1. **`utils/seo/` Pure Module Layer**: Implement `canonical.ts`, `metadata.ts`, and `jsonld.ts`.
2. **Next.js App Infrastructure**: Implement `app/sitemap.ts`, `app/robots.ts`, and update [app/layout.tsx](file:///home/eduardo/Projects/Calories-and-Macros-Tracker-with-AI/app/layout.tsx).
3. **Structured Data Components**: Implement `components/seo/JsonLd.tsx` and attach to landing pages.
4. **Core Web Vitals Font Optimization**: Apply `adjustFontFallback` and `display: "swap"` to Nearo/Montserrat/Lexend fonts.
5. **Public Shareable AI Routes**: Implement `app/share/meal/[id]/page.tsx` and public `/calculadora-macros` route.
6. **Lighthouse CI & Verification**: Add Cypress performance test assertions.

### Technical Dependencies

- Next.js 16 App Router Server Components enabled.
- `@t3-oss/env-nextjs` for dynamic domain environment variables (`NEXT_PUBLIC_APP_URL`).

---

## Architecture Decision Records

- [ADR-001: Core Web Vitals & Technical SEO Priority Strategy](adrs/adr-001.md) — Technical SEO and Core Web Vitals first approach.
- [ADR-002: Pure Utility Functions vs Repository Pattern for SEO](adrs/adr-002.md) — Implementation of SEO helpers as pure stateless functions in `utils/seo/`.
