# User Stories: SEO, Core Web Vitals & Organic Growth Engine

Canonical behavior catalog for SEO, Core Web Vitals, Technical Metadata, Schema.org, and Conversion Engine. Companion to `_prd.md`; consumed by `_techspec.md` (component mapping) and `_tests.md` (coverage matrix).

## Personas

- **Organic Visitor / Search User** — A potential user looking for quick calorie tracking, macro calculation, or diet insights via Google/Bing/AI Search without a friction-filled onboarding.
- **Search Engine Crawler / AI Bot** — Googlebot, Bingbot, Perplexity/ChatGPT crawler indexing pages, parsing JSON-LD microdata, evaluating Core Web Vitals, and discovering URLs.
- **Existing User (Sharing)** — A registered user sharing their meal analysis, macro report, or progress link publicly to social media or messaging apps.

## Story Index

| ID | Feature Area | Persona | Story |
|---|---|---|---|
| US-001 | SEO Audit | Crawler / Visitor | Full technical SEO and Core Web Vitals audit execution |
| US-002 | Technical SEO | Search Crawler | Dynamic Metadata, OpenGraph, Twitter Cards & Canonical URLs |
| US-003 | Technical SEO | Search Crawler | Dynamic Sitemap.xml, Robots.txt & Internationalized URLs |
| US-004 | Technical SEO | Search Engine | Rich Snippet Structured Data (SoftwareApplication, WebApplication, FAQ) |
| US-005 | Core Web Vitals | Organic Visitor | LCP, CLS, INP, and TTFB Optimization for 95+ Lighthouse Score |
| US-006 | Content Engine | Organic Visitor | Public Calorie/Macro Calculators & High-Intent Landing Pages |
| US-007 | Content Engine | Organic Visitor | Public Diet & Macro Glossary with Evergreen Articles |
| US-008 | AI + SEO Features | Shared Visitor | Shareable Public AI Meal Insights & Public Nutritional Reports |
| US-009 | Conversion Engine | Organic Visitor | High-Converting Landing Page with Social Proof, FAQ & Rich Rich Snippets |
| US-010 | Digital PR & Backlinks| Organic Visitor | Public Free Tools & Embeddable Macro Calculator Widget |
| US-011 | Analytics & Monitoring| Product Team | Search Console, GA4, Plausible & Webmaster Tracking Integration |
| US-012 | Accessibility (a11y) | Organic Visitor / Screen Reader | Localized Image Alt Attributes, ARIA Labels & Focus Management |

---

## Accessibility & Image Alt Localization

### US-012: Localized Image Alt Attributes & Screen Reader Accessibility

**As an** Organic Visitor / Screen Reader User, **I want** all public images and dynamic icons to feature localized descriptive `alt` texts and appropriate ARIA labels, **so that** screen readers articulate the content accurately and search engines can parse image context for Google Image SEO.

Acceptance criteria:
- AC-1: Given an image component rendered on a public route, when inspected or read by a screen reader, then a non-empty localized `alt` attribute is present (translated via `LanguageContext` / `locales/*.json`).
- AC-2: Given interactive elements (FAQ accordions, meal simulator inputs), when interacted with, then `aria-expanded`, `aria-label`, and visual focus outlines update correctly.

Edge cases:
- EC-1: Missing translation key for image alt text → Fall back to generic descriptive key (e.g., `"Nutritional Meal Analysis"`) instead of displaying key path or blank alt.

---

## Technical Audit & Crawler Support

### US-001: Technical Audit & Audit Checklist Pipeline

**As a** Search Crawler / Product Team, **I want** the entire web application audited against strict SEO and Core Web Vitals criteria, **so that** indexability blockers and performance bottlenecks are eliminated.

Acceptance criteria:
- AC-1: Given a public URL (`/`, `/plans`, `/privacy-policy`, `/terms-of-use`), when audited via Google Lighthouse, then Mobile and Desktop performance scores are 95+ and SEO score is 100.
- AC-2: Given any canonical page, when inspected by crawlers, then all H1, H2, H3 tags follow a strict single H1 hierarchy per page.
- AC-3: Given broken or missing links, when scanned, then 0 broken internal links (404s) exist and all redirects issue standard HTTP 301/308 status codes.

Edge cases:
- EC-1: Missing translation key for meta tags → Fallback gracefully to default language string without throwing runtime errors or blank titles.
- EC-2: Deep link redirect loop → Terminate redirects after 1 hop to maintain clean crawlability.

---

## Technical SEO & Structured Data

### US-002: Dynamic Metadata, OpenGraph & Canonical Engine

**As a** Search Crawler / Social User, **I want** every public route to output rich, dynamic title tags, meta descriptions, OpenGraph imagery, and canonical URLs, **so that** SERP snippets and social shares present high-click-through cards.

Acceptance criteria:
- AC-1: Given a public route, when requested by a browser or crawler, then the HTML response contains accurate `<title>`, `<meta name="description">`, and `<link rel="canonical">` matching the route locale.
- AC-2: Given a link shared on WhatsApp/Twitter/LinkedIn, when scraped, then OpenGraph (`og:image`, `og:title`, `og:description`) and Twitter Card (`summary_large_image`) tags render valid preview images.

Edge cases:
- EC-1: Query parameters present in URL (e.g., `?utm_source=google`) → Canonical URL strips non-essential tracking parameters to prevent duplicate content indexing.

### US-003: Dynamic Sitemap, Robots.txt & Crawl Infrastructure

**As a** Search Engine Crawler, **I want** automatically generated `sitemap.xml` and `robots.txt` endpoints in Next.js, **so that** all public pages and content clusters are discovered and indexed seamlessly.

Acceptance criteria:
- AC-1: Given a request to `/sitemap.xml`, when fetched, then Next.js returns a valid XML sitemap including all static and dynamic public routes with `<lastmod>` and `<changefreq>`.
- AC-2: Given a request to `/robots.txt`, when fetched, then Next.js returns instructions allowing public indexing while disallowing private `/dashboard`, `/historico`, `/settings`, and `/checkout` routes.

Edge cases:
- EC-1: Authenticated protected route specified in sitemap → Exclude protected routes automatically from sitemap generation.

### US-004: Schema.org JSON-LD Structured Data

**As a** Search Engine, **I want** valid JSON-LD structured data embedded into public pages, **so that** Levemente AI qualifies for Rich Snippets, Star Ratings, and AI Overview (GEO) answers.

Acceptance criteria:
- AC-1: Given the home page or landing page, when inspected, then a valid `<script type="application/ld+json">` containing `SoftwareApplication` and `WebApplication` schema is present with price (`0 USD`), operating system, and category.
- AC-2: Given marketing or pricing pages with FAQs, when inspected, then `FAQPage` schema is embedded matching the exact visual text on screen.

Edge cases:
- EC-1: Malformed JSON string in schema builder → Validate schema output against Zod/JSON-LD rules to guarantee zero syntax crashes.

---

## Core Web Vitals & Performance

### US-005: Core Web Vitals 95+ Optimization Engine

**As an** Organic Visitor, **I want** sub-second initial page load and responsive interaction without layout shifts, **so that** my user experience is instantaneous.

Acceptance criteria:
- AC-1: Given a mobile device on 4G, when loading public pages, then LCP (Largest Contentful Paint) is < 1.8s, CLS (Cumulative Layout Shift) is < 0.05, and TTFB is < 400ms.
- AC-2: Given dynamic user interaction on public tools/calculators, when clicking inputs, then INP (Interaction to Next Paint) is < 100ms.

Edge cases:
- EC-1: Font loading delay causing visual reflow → Apply `font-display: swap` and layout size reservation for custom local fonts (Nearo).

---

## AI Features & Virality Engine

### US-008: Shareable Public AI Meal Insights & Reports

**As a** Registered User / Visitor, **I want** to create and view public shareable links of meal AI analyses and macro summaries, **so that** I can share insights with friends and search engine crawlers can index user-generated nutritional queries.

Acceptance criteria:
- AC-1: Given a user who clicks "Share Insights", when generated, then a public URL `/share/meal/[id]` is created containing structured macro data, AI breakdown, and OpenGraph share card.
- AC-2: Given a crawler requesting `/share/meal/[id]`, when rendered, then the page delivers indexable HTML with `Recipe` / `NutritionInformation` JSON-LD schema without requiring login.

Edge cases:
- EC-1: User revokes share permissions or deletes meal → Page displays friendly 404 response with CTA to try free meal scan.

---

## Conversion & Landing Page Optimization

### US-009: Conversion-Driven Public Landing Pages

**As an** Organic Visitor, **I want** transparent social proof, immediate AI meal log previews, and zero-friction CTA buttons, **so that** I can try the product instantly without upfront onboarding walls.

Acceptance criteria:
- AC-1: Given the hero section of `/landing-page`, when viewed, then a clear H1, immediate photo/text AI meal simulation, and 1-click CTA "Testar Grátis Agora" are rendered above the fold.
- AC-2: Given the FAQ section, when opened, then accordions toggle smoothly without shifting surrounding elements and mirror the `FAQPage` microdata.

Edge cases:
- EC-1: Slow network on mobile landing page → Pre-render hero image assets with Next.js image priority and fallback SVG placeholders.
