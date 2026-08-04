# Test Specification: SEO, Core Web Vitals & Organic Growth Engine

Canonical test contract for SEO & Performance feature. Companion to `_techspec.md`.
Derived from `_user_stories.md` (behavior) and `_techspec.md` (components).

## Strategy

- **Frameworks and harnesses**: Cypress (E2E) for all tests — pure function assertions, integration route checks, and Lighthouse performance CI.
- **Execution**: Start `pnpm dev:mock` in one terminal, then run `pnpm cy:run`.
- **Conventions**: SEO utility tests in `cypress/e2e/seo/seo-utils.cy.ts`; specialized integration/E2E tests in `cypress/e2e/seo/`.

---

## Coverage Matrix

| Source | Behavior | Unit | Integration | E2E |
|---|---|---|---|---|
| US-001 | Audit Pipeline & Lighthouse | — | IT-001 | E2E-001 |
| US-002 | Dynamic Metadata & Canonicals | UT-001, UT-002 | IT-002 | — |
| US-003 | Dynamic Sitemap & Robots.txt | UT-003 | IT-003 | E2E-003 |
| US-004 | JSON-LD Structured Data | UT-004, UT-005 | IT-004 | — |
| US-005 | Core Web Vitals 95+ Score | — | IT-005 | E2E-004 |
| US-006 | Public Macro Calculators | UT-006 | — | E2E-005 |
| US-012 | Accessibility (a11y) | UT-009 | IT-007 | E2E-007 |
| `utils/seo/metadata.ts` | Dynamic metadata builder | UT-001, UT-002 | — | — |
| `utils/seo/canonical.ts` | Canonical URL formatting | UT-008 | — | — |
| `utils/seo/jsonld.ts` | Schema.org JSON-LD builder | UT-004, UT-005 | — | — |

---

## Unit Tests

### `utils/seo/metadata.ts` (TechSpec: Core Interfaces)

- **UT-001** (happy): `buildSeoMetadata` — given valid title, description, and path, produces absolute `metadataBase`, `title`, `description`, and canonical URL object.
- **UT-002** (error): `buildSeoMetadata` — given missing title or empty string, applies localized fallback title `"LeveMente AI - Calorie & Macro Tracker"`.

### `utils/seo/canonical.ts` (TechSpec: Core Interfaces)

- **UT-008** (boundary): `buildCanonicalUrl` — given URL containing `?utm_source=google&utm_medium=cpc`, strips all tracking parameters and returns clean canonical path.

### `utils/seo/jsonld.ts` (TechSpec: Core Interfaces)

- **UT-004** (happy): `buildSoftwareAppJsonLd` — given app parameters, returns compliant Schema.org `SoftwareApplication` JSON object with `@context: "https://schema.org"`.
- **UT-005** (happy): `buildFaqJsonLd` — given list of question-answer pairs, returns compliant `FAQPage` JSON object.

### `utils/seo/sitemap-builder.ts` (TechSpec: Core Interfaces)

- **UT-003** (happy): `buildSitemapEntries` — given list of public routes, generates valid Next.js `MetadataRoute.Sitemap` array.

---

## Integration Tests

### Route Endpoints & Server Outputs

- **IT-001**: Audit pipeline — verify H1 hierarchy across all public static pages (`/`, `/plans`, `/privacy-policy`).
- **IT-002**: Metadata injection — render root layout and verify `<title>`, `<meta name="description">`, and `<link rel="canonical">` are present in server HTML response.
- **IT-003**: Dynamic `sitemap.xml` & `robots.txt` — fetch `/sitemap.xml` and `/robots.txt` endpoints and assert HTTP 200 OK headers and correct disallow directives (`/dashboard`, `/historico`, `/settings`, `/checkout`).
- **IT-004**: JSON-LD Component — verify `<script type="application/ld+json">` renders valid un-escaped JSON string in Document Head.
- **IT-005**: Core Web Vitals layout shift — verify custom local fonts load without causing element shifts (CLS = 0.00).
- **IT-007**: Accessibility audit — inspect DOM across all public routes and assert 100% of `<img>` and `<Image>` tags have non-empty `alt` attributes and interactive controls have valid `aria-label` / `aria-expanded` attributes.

## End-to-End Tests

### User & Crawler Journeys

- **E2E-001**: Search crawler visits `/` → parses page → finds valid canonical link, sitemap reference, and 0 broken links.
- **E2E-003**: Crawler requests `/sitemap.xml` → parses all indexed URLs → confirms all return 200 OK.
- **E2E-004**: Visitor loads mobile view on 4G throttle → Lighthouse audit executes and returns Performance score >= 95.
- **E2E-005**: Unauthenticated visitor visits `/calculadora-macros` → fills age, weight, height, activity, goal → calculates macros → sees chart with calorie target and macro split → clicks CTA to register.
- **E2E-007**: Screen reader user navigates public landing page → all image alt texts render translated text according to active locale (`pt-BR`, `en`, `es`).
