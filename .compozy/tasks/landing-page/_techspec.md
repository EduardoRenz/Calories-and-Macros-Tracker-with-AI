# Technical Specification - Levemente Landing Page

## Executive Summary

This specification outlines the technical design for implementing the new "Levemente" Landing Page. The Landing Page will display product value propositions, pricing tiers, and AI visual demos to unauthenticated visitors.

Following ADR-001, the root `/` route renders the Landing Page conditionally for unauthenticated users; logged-in users redirect to `/dashboard`. A dedicated `/landing-page` route renders unconditionally. The `/login` route remains a focused Google Sign-In portal. Sub-components will be modularized in `components/landing/` (ADR-002), visual widgets fully localized via `useTranslation` (ADR-003), and the existing component library — `PlanCard`, `Footer`, `Button`, `LanguageSwitcher`, `ThemeSwitcher`, `MacroProgressCard` — will be reused and, where needed, improved to be page-agnostic.

The primary trade-off is minimal `/login` page friction (one extra click for sign-in) in exchange for a clean separation of concerns that scales well when additional auth providers are added.

---

## System Architecture

### Component Overview

```
app/page.tsx
  ├── (if unauthenticated) → <LandingPageContent />
  └── (if authenticated)   → redirect('/dashboard')

app/landing-page/page.tsx
  └── <LandingPageContent />   ← always visible

app/login/page.tsx             ← unchanged, Google Sign-In + redirect if logged in

components/landing/
  ├── LandingPageContent.tsx   ← assembles all sections
  ├── LandingNavbar.tsx        ← reuses: LanguageSwitcher, ThemeSwitcher, Button
  ├── LandingHero.tsx          ← reuses: Button
  ├── LandingKeyStats.tsx      ← pure presentational
  ├── LandingAIFeatures.tsx    ← pure presentational
  ├── LandingClinicalFocus.tsx ← pure presentational
  ├── LandingVisualDemo.tsx    ← reuses: MacroProgressCard (improved to accept className)
  ├── LandingPricing.tsx       ← reuses: PlanCard (improved with ctaLabel prop)
  └── LandingCTA.tsx           ← reuses: Button

components/payment/
  └── PlanCard.tsx             ← IMPROVED: add optional `ctaLabel` prop

components/MacroProgressCard.tsx ← IMPROVED: add optional `className` prop

components/Footer.tsx          ← REUSED as-is by LandingPageContent
```

**Data flow:**
- `LandingPageContent` is a `'use client'` component that reads auth state via `useAuth()` to redirect if needed.
- `LandingPricing` reads plans from `RepositoryFactory.getPlansRepository()` and respects `FeatureFlags.ENABLE_PLANS`.
- All copy rendered through `useTranslation()` under the `landing.*` namespace.

---

## Implementation Design

### Core Interfaces

```typescript
// components/landing/LandingPageContent.tsx
// Top-level assembler — no props, self-contained
export const LandingPageContent: React.FC = () => { /* ... */ };

// components/payment/PlanCard.tsx — IMPROVED interface
interface PlanCardProps {
    plan: Plan;
    onSelect: (plan: Plan) => void;
    isLoading?: boolean;
    isCurrentPlan?: boolean;
    ctaLabel?: string;   // NEW: overrides default CTA text, making it page-agnostic
}

// components/MacroProgressCard.tsx — IMPROVED interface
interface MacroProgressCardProps {
    title: string;
    current: number;
    goal: number;
    unit: string;
    color: string;
    className?: string;  // NEW: allows callers to adjust container styling
}
```

### Data Models

New translation keys under the `landing` root namespace (added to `locales/pt.ts`, `locales/en.ts`, `locales/es.ts`):

```typescript
"landing": {
  "navbar": {
    "features": "Recursos",        // anchor link label
    "benefits": "Benefícios",
    "pricing": "Preços",
    "login": "Login",
    "start": "Começar"
  },
  "hero": {
    "badge": "IA NUTRICIONAL",
    "title": "Nutrição Inteligente em 1 Minuto",
    "subtitle": "...",
    "cta_start": "Começar Agora",
    "cta_how": "Ver Como Funciona",
    "check_no_forms": "Sem questionários longos",
    "check_setup": "Setup em 60s",
    "float_badge_title": "Almoço Registrado",
    "float_badge_desc": "Macros calculados em 12s"
  },
  "stats": { /* 3 card titles + descriptions */ },
  "ai_features": { /* title, desc, natural input, calc */ },
  "clinical": { /* badge, title, diabetes, intolerances */ },
  "demo": {
    "title": "Tudo que você precisa, nada que não precise",
    "subtitle": "...",
    "dashboard_title": "Dashboard Diário",
    "chat_title": "Registro Simples",
    "chat_prompt": "O que você comeu no almoço?",
    "chat_user_meal": "1 filé de frango, 2 colheres de arroz e salada.",
    "chat_success": "Registrado!",
    "chat_macros": "30g Prot | 40g Carb | 8g Gord"
  },
  "pricing": {
    "title": "Planos Simples e Transparentes",
    "subtitle": "...",
    "cta_free": "Começar Grátis",
    "cta_member": "Assinar Agora",
    "loading": "Carregando planos..."
  },
  "cta": {
    "title": "Pronto para transformar sua rotina?",
    "subtitle": "...",
    "check_instant": "Acesso Instantâneo",
    "check_secure": "Dados seguros e privados",
    "button": "Começar Agora"
  }
}
```

### API Endpoints

No new backend endpoints. The Landing Page consumes:
- `RepositoryFactory.getPlansRepository().getPlans(language)` — fetches active plans for `LandingPricing`.

---

## Integration Points

| Service | Purpose | Notes |
|---------|---------|-------|
| `PlansRepository` | Fetches pricing tiers for `LandingPricing` | Falls back to empty list on error; section hidden if `ENABLE_PLANS` flag is off |
| `FeatureFlagRepository` | Controls `LandingPricing` visibility | Read via `useFeatureFlags()` context |
| `AuthRepository` | Reads auth state in `app/page.tsx` | Redirect to `/dashboard` when user exists |

---

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|---------------------|-----------------|
| `app/page.tsx` | Modified | Must show Landing Page when unauthenticated | Replace redirect-only logic with conditional render |
| `app/login/page.tsx` | Unchanged | Remains the sole auth entry point | No changes needed |
| `app/landing-page/page.tsx` | New | Unconditional landing route | Create file, render `LandingPageContent` |
| `components/landing/` | New (8 files) | All Landing Page sections | Create folder and sub-components |
| `components/payment/PlanCard.tsx` | Modified (minor) | Add optional `ctaLabel` prop | Backward-compatible; existing usages unaffected |
| `components/MacroProgressCard.tsx` | Modified (minor) | Add optional `className` prop | Backward-compatible; existing usages unaffected |
| `components/Footer.tsx` | Reused as-is | Already page-agnostic | No action required |
| `components/LanguageSwitcher.tsx` | Reused as-is | Already page-agnostic | No action required |
| `components/ThemeSwitcher.tsx` | Reused as-is | Already page-agnostic | No action required |
| `components/ui/Button.tsx` | Reused as-is | Already page-agnostic | No action required |
| `locales/pt.ts`, `en.ts`, `es.ts` | Modified | Add `landing.*` keys | Append ~80 lines per file |
| `cypress/e2e/landing.cy.ts` | New | E2E coverage for landing flows | Create test file |

---

## Testing Approach

### Unit / Component Tests

- `LandingNavbar`: verify sticky class applied on scroll, language switch triggers context update.
- `LandingVisualDemo`: verify SVG stroke-dasharray calculation matches `(current / goal) * circumference`.
- `PlanCard` (improved): verify `ctaLabel` prop overrides default button text.

### Integration Tests — `cypress/e2e/landing.cy.ts`

| Test Case | Description |
|-----------|-------------|
| Unauthenticated home | Visit `/`, expect landing page hero section visible |
| Authenticated home | `cy.login()` then visit `/`, expect redirect to `/dashboard` |
| Unconditional landing | `cy.login()` then visit `/landing-page`, expect hero visible (no redirect) |
| Login CTA | Click "Login" in navbar, expect `/login` route |
| Get Started CTA | Click "Começar Agora" in hero, expect `/login` route |
| Existing auth tests | `pnpm cy:run` passes with no regressions |

---

## Development Sequencing

### Build Order

1. **Improve shared components** — Add `ctaLabel` to `PlanCard` and `className` to `MacroProgressCard`. No dependencies. Existing tests must still pass.
2. **Add localization keys** — Append `landing.*` namespace to `pt.ts`, `en.ts`, `es.ts`. Depends on step 1.
3. **Build `components/landing/` sub-components** — Implement all 8 section components. Depends on step 2.
4. **Assemble `LandingPageContent.tsx`** — Compose all sub-components into a single layout wrapper. Depends on step 3.
5. **Create `app/landing-page/page.tsx`** — Render `LandingPageContent` unconditionally. Depends on step 4.
6. **Update `app/page.tsx`** — Conditionally render `LandingPageContent` for unauthenticated users, redirect to `/dashboard` otherwise. Depends on step 5.
7. **Write `cypress/e2e/landing.cy.ts`** and run `pnpm cy:run`. Depends on step 6.
8. **Bump `package.json` version** from `1.14.6` → `1.14.7`. Depends on step 7 passing.

### Technical Dependencies

- `next-themes` already installed — `ThemeSwitcher` available with no new packages.
- `PlansRepository` mock must return valid data in `NEXT_PUBLIC_BACKEND_PROVIDER=mock` mode (already works per existing plans page).

---

## Monitoring and Observability

- `LandingPricing` catches plan fetch errors and logs `console.error('LandingPricing: failed to fetch plans', error)`.
- Auth redirect logic in `app/page.tsx` is synchronous with `loading` state; no redirect fires until `loading === false` to prevent flicker.

---

## Technical Considerations

### Key Decisions

- **Reuse `PlanCard` instead of a new pricing component**: Requires only a one-line `ctaLabel` prop addition. Avoids duplicating feature-list rendering logic.
- **Reuse `MacroProgressCard` in `LandingVisualDemo`**: The dashboard demo section shows the same progress bar UI the app uses. Adding `className` makes it composable in the landing layout without overriding internal styles.
- **`LandingPageContent` is a `'use client'` component**: It reads `useAuth()` to ensure auth state is available for the `/landing-page` route (where we still want to show a "Go to Dashboard" CTA if logged in, instead of hiding the page).

### Known Risks

- **Plans loading flash**: `LandingPricing` may render a loading skeleton briefly before plans resolve. Mitigation: show skeleton cards matching the layout.
- **Redirect flicker on `/`**: If `loading` from `AuthContext` takes >300ms, the Landing Page briefly flashes. Mitigation: render the landing hero immediately and only redirect after `loading === false && user !== null`.

---

## Architecture Decision Records

- [ADR-001: Separation of Landing Page and Login Page Route Structure](adrs/adr-001.md) — Establishes separate `/`, `/landing-page`, and `/login` routes with distinct responsibilities.
- [ADR-002: Modular Component Organization for Landing Page](adrs/adr-002.md) — Places all landing sub-components inside `components/landing/`.
- [ADR-003: Localized Demo Data Strategy for Landing Page Visual Widgets](adrs/adr-003.md) — Uses `locales/*.ts` under `landing.demo.*` for all visual widget copy.
