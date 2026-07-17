# Technical Specification - Levemente Landing Page

## Executive Summary

This specification outlines the technical design for implementing the new "Levemente" Landing Page. The Landing Page displays the product value proposition, features, and pricing tiers to unauthenticated visitors and matches `.compozy/tasks/landing-page/code.html` section-by-section.

Following ADR-001, the root `/` route renders the Landing Page conditionally for unauthenticated users; logged-in users redirect to `/dashboard`. A dedicated `/landing-page` route renders unconditionally. The `/login` route remains a focused Google Sign-In portal. Sub-components are modularized in `components/landing/` (ADR-002), visual widgets are fully localized via `useTranslation` (ADR-003), and the existing component library — `PlanCard`, `Footer`, `Button`, `LanguageSwitcher`, `ThemeSwitcher`, `MacroProgressCard` — is reused and, where needed, improved to be page-agnostic.

The MVP does **not** include unit or component tests. Coverage is provided by a single Cypress E2E file (`cypress/e2e/landing.cy.ts`) plus inline adjustments to existing Cypress tests that depended on the previous root-path behavior. The bottom CTA section uses **only a single button** to `/login`; the email/password form shown in `code.html` is a layout reference only and is **not** implemented.

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
  ├── LandingPageContent.tsx   ← assembles all 9 sections in code.html order
  ├── LandingNavbar.tsx        ← sticky nav, uses: LanguageSwitcher, ThemeSwitcher, Button
  ├── LandingHero.tsx          ← badge, headline, CTAs, phone mockup, floating glass card
  ├── LandingKeyStats.tsx      ← 3-column "Bento Box" (id="benefits")
  ├── LandingAIFeatures.tsx    ← brain graphic + Natural Input + Instant Calc (id="how-it-works")
  ├── LandingClinicalFocus.tsx ← Diabetes + Intolerâncias cards + branded circle
  ├── LandingVisualDemo.tsx    ← Progress ring + macro bars (MacroProgressCard) + chat mock (id="features")
  ├── LandingPricing.tsx       ← uses PlanCard with ctaLabel, feature-flag gated (id="pricing")
  ├── LandingCTA.tsx           ← sign-off card with single button to /login (id="login")
  └── (Footer is reused directly from components/Footer.tsx)

components/payment/
  └── PlanCard.tsx             ← IMPROVED: add optional `ctaLabel` prop

components/MacroProgressCard.tsx ← IMPROVED: add optional `className` prop

components/Footer.tsx          ← REUSED as-is by LandingPageContent
```

**Data flow:**
- `LandingPageContent` is a `'use client'` component that reads auth state via `useAuth()` to redirect if needed.
- `LandingPricing` reads plans from `RepositoryFactory.getPlansRepository()` and respects `FeatureFlags.ENABLE_PLANS`.
- All copy rendered through `useTranslation()` under the `landing.*` namespace.
- Icons are rendered through the project's `components/icons.tsx` (Material Symbols Outlined) — `eco`, `bolt`, `play_circle`, `check_circle`, `restaurant_menu`, `timer`, `center_focus_strong`, `insights`, `chat`, `speed`, `water_drop`, `no_meals`, `donut_large`, `edit_note`, `lock`, `robot_2`.

### Section-to-Component Mapping (faithful to `code.html`)

| code.html section | Anchor | Component | Visual treatments from `code.html` |
|-------------------|--------|-----------|------------------------------------|
| TopNavBar | — | `LandingNavbar` | sticky, `bg-surface/80 backdrop-blur-md`, `kinetic-gradient` CTA |
| Hero | — | `LandingHero` | two-column, blurred radial bgs, `glass-card` floating notification |
| Core Value Prop (Bento) | `#benefits` | `LandingKeyStats` | 3-column bento cards, hover scale |
| AI-Powered Tracking | `#how-it-works` | `LandingAIFeatures` | brain image, eyebrow label, icon list rows |
| Medical-Based Wellness | — | `LandingClinicalFocus` | large rounded card, `+` decoration, 2x1 card grid |
| Features Gallery | `#features` | `LandingVisualDemo` | progress ring 75%, chat mock with 3 messages |
| Pricing / Plans | `#pricing` | `LandingPricing` | 2 tiers, "Recomendado" badge, BRL pricing |
| Bottom Login/CTA | `#login` | `LandingCTA` | single button to `/login` (no form), trust badges |
| Footer | — | `Footer` | logo + copyright + legal links |

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

### Visual Building Blocks (declared once)

`code.html` defines three classes that the landing page must reproduce faithfully:

```css
.kinetic-gradient        { background: linear-gradient(135deg, #004c4b 0%, #006c45 100%); }
.kinetic-gradient-hover  { background: linear-gradient(135deg, #006664 0%, #03be7c 100%); }
.glass-card              { background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.3); }
```

These are added to `styles/globals.css` (or Tailwind plugin layer) and consumed by `LandingNavbar`, `LandingHero`, and `LandingCTA`. The Material Symbols Outlined font is loaded once in the root layout (already used elsewhere in the project).

### Data Models

New translation keys under the `landing` root namespace (added to `locales/pt.ts`, `locales/en.ts`, `locales/es.ts`):

```typescript
"landing": {
  "navbar": {
    "features": "Recursos",
    "benefits": "Benefícios",
    "pricing": "Preços",
    "login": "Login",
    "start": "Começar"
  },
  "hero": {
    "badge": "IA NUTRICIONAL",
    "title": "Nutrição Inteligente em 1 Minuto",
    "title_accent": "1 Minuto",
    "subtitle": "Acompanhe sua dieta sem planilhas complexas. Nossa IA analisa seus macros e necessidades médicas quase instantaneamente.",
    "cta_start": "Começar Agora",
    "cta_how": "Ver Como Funciona",
    "check_no_forms": "Sem questionários longos",
    "check_setup": "Setup em 60s",
    "float_badge_title": "Almoço Registrado",
    "float_badge_desc": "Macros calculados em 1.2s"
  },
  "benefits": {                       // Section: Core Value Prop / Key Stats
    "title": "Setup Rápido, Foco nos Resultados",
    "stat_1_title": "60 Segundos",
    "stat_1_desc": "Pule os formulários intermináveis. Nosso onboarding captura apenas o essencial para a IA começar a trabalhar.",
    "stat_2_title": "Zero Planilhas",
    "stat_2_desc": "Esqueça a contagem manual de calorias. Tire uma foto ou digite sua refeição, e nós fazemos o resto instantaneamente.",
    "stat_3_title": "Insights Diretos",
    "stat_3_desc": "Receba feedback claro sobre o que importa: seus macros diários e adequação aos seus objetivos de saúde."
  },
  "ai_features": {                   // Section: AI-Powered Tracking
    "eyebrow": "Motor de Inteligência",
    "title": "Análise de Macros em Segundos",
    "description": "Nossa IA avançada foi treinada para reconhecer alimentos e porções, traduzindo descrições simples em dados nutricionais precisos sem a necessidade de buscar em bancos de dados extensos.",
    "natural_input_title": "Entrada Natural",
    "natural_input_desc": "Apenas diga \"Comi 2 ovos mexidos e meio abacate\" e o sistema entende.",
    "instant_calc_title": "Cálculo Imediato",
    "instant_calc_desc": "Proteínas, carboidratos e gorduras calculados na hora, atualizando seu dashboard."
  },
  "clinical": {                      // Section: Medical-Based Wellness
    "badge": "Saúde Clínica",
    "title": "Foco em Condições Médicas",
    "description": "O LeveMente vai além do fitness. Nossa plataforma é otimizada para auxiliar quem precisa de controle rigoroso devido a condições de saúde.",
    "diabetes_title": "Diabetes",
    "diabetes_desc": "Controle preciso de índice glicêmico.",
    "intolerances_title": "Intolerâncias",
    "intolerances_desc": "Alertas automáticos de ingredientes."
  },
  "demo": {                          // Section: Features Gallery / Visual Demos
    "title": "Tudo que você precisa, nada que não precise",
    "subtitle": "Design limpo e focado na ação. Seu diário alimentar reimaginado para a velocidade.",
    "dashboard_title": "Dashboard Diário",
    "dashboard_subtitle": "Visão geral instantânea do seu progresso.",
    "dashboard_calories_label": "Calorias",
    "dashboard_protein_label": "Proteína",
    "dashboard_carbs_label": "Carbos",
    "chat_title": "Registro Simples",
    "chat_subtitle": "Adicione refeições como se estivesse mandando mensagem.",
    "chat_prompt": "O que você comeu no almoço?",
    "chat_user_meal": "1 filé de frango, 2 colheres de arroz e salada.",
    "chat_success": "Registrado! (350 kcal)",
    "chat_macros": "30g Prot | 40g Carb | 8g Gord"
  },
  "pricing": {
    "title": "Planos Simples e Transparentes",
    "subtitle": "Escolha o plano ideal para a sua jornada de bem-estar.",
    "cta_free": "Começar Grátis",
    "cta_member": "Assinar Agora",
    "loading": "Carregando planos...",
    "recommended": "Recomendado"
  },
  "cta": {                           // Section: Bottom Login/CTA (no form, only button)
    "title": "Pronto para transformar sua rotina?",
    "subtitle": "Acesse sua conta ou crie uma agora em menos de 1 minuto.",
    "check_instant": "Acesso instantâneo",
    "check_secure": "Dados seguros e privados",
    "button": "Começar Agora"
  },
  "footer": {
    "copyright": "© 2024 Levemente. All rights reserved.",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
    "support": "Contact Support"
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
| `components/landing/` | New (9 files: 8 sub-components + `LandingPageContent`) | All Landing Page sections | Create folder and sub-components |
| `components/payment/PlanCard.tsx` | Modified (minor) | Add optional `ctaLabel` prop | Backward-compatible; existing usages unaffected |
| `components/MacroProgressCard.tsx` | Modified (minor) | Add optional `className` prop | Backward-compatible; existing usages unaffected |
| `components/Footer.tsx` | Reused as-is | Already page-agnostic | No action required |
| `components/LanguageSwitcher.tsx` | Reused as-is | Already page-agnostic | No action required |
| `components/ThemeSwitcher.tsx` | Reused as-is | Already page-agnostic | No action required |
| `components/ui/Button.tsx` | Reused as-is | Already page-agnostic | No action required |
| `styles/globals.css` | Modified (minor) | Add `kinetic-gradient`, `kinetic-gradient-hover`, `glass-card` utility classes | Append at end of file |
| `app/layout.tsx` | Modified (minor) | Load Material Symbols Outlined web font (single link tag) | Append inside `<head>` if not already loaded |
| `locales/pt.ts`, `en.ts`, `es.ts` | Modified | Add `landing.*` keys | Append ~120 lines per file |
| `cypress/e2e/landing.cy.ts` | New | E2E coverage for landing flows | Create test file (single file) |
| `cypress/e2e/auth-routing.cy.ts` | Adjusted inline | Root-path assertions need to account for new landing page | Edit assertions, do not split |
| `cypress/e2e/basic.cy.ts` | Adjusted inline | First test asserts `/` shows login; update to landing | Edit assertions inline |

---

## Testing Approach

There are **no unit or component tests** for this feature. All quality is validated through Cypress E2E.

### Cypress E2E — `cypress/e2e/landing.cy.ts` (single file)

The file groups all landing-page coverage into the following `describe` blocks:

| Block | Coverage |
|-------|----------|
| Section rendering | All 9 sections render in order: navbar (sticky), hero (badge + headline + CTAs + phone mockup + glass card), `#benefits` (3 bento cards), `#how-it-works` (brain + 2 sub-features), clinical focus (Diabetes + Intolerâncias), `#features` (Dashboard Diário + Registro Simples), `#pricing` (Básico + Membro), `#login` (sign-off with button), footer |
| Anchor link scrolling | Clicking navbar anchors scrolls to `#features`, `#benefits`, `#pricing`, `#how-it-works`, `#login` |
| CTA button redirects | Navbar "Login" → `/login`; Navbar "Começar" → `/login`; Hero "Começar Agora" → `/login`; Hero "Ver Como Funciona" → `#how-it-works`; Bottom CTA "Começar Agora" → `/login` |
| Routing | `/` unauthenticated renders landing; `/` authenticated redirects to `/dashboard`; `/landing-page` renders for all users |
| Pricing feature flag | `feature_flag_enable_plans=false` hides pricing section; `=true` shows it |
| Theme switching | Toggling theme updates `<html class="dark">` and persists |
| Language switching | Switching to PT/EN/ES updates all `landing.*` strings |
| Responsive layout | Mobile (375px), tablet (768px), desktop (1024px) — sticky navbar, single-column collapse, no horizontal overflow |

### Inline adjustments to existing Cypress tests

Tests that depended on the old root-path behavior are updated inline (no file split, no removal):

- `cypress/e2e/auth-routing.cy.ts` — `Root Path Redirect` block:
  - `should redirect authenticated user from / to /dashboard` — unchanged (still valid).
  - `should show login page for unauthenticated user at /` — adjusted: `/` now renders the landing page. The test must assert landing-page markers (e.g. presence of hero headline or `[data-testid="landing-page"]` root) and follow a CTA to reach `/login` where the Google sign-in button is asserted.
- `cypress/e2e/basic.cy.ts` — first test:
  - `should show login page when not authenticated` — adjusted: visiting `/` now lands on the Landing Page; the test follows a CTA to reach `/login` and asserts "Sign in with Google".

All other Cypress tests that use `cy.visit('/')` only as a stepping stone to sign in are updated to either:
- `cy.visit('/')` then click a Landing Page CTA that goes to `/login`, then click the Google Sign-In button; **or**
- `cy.visit('/login')` directly (when the test does not depend on the root-path behavior).

---

## Development Sequencing

### Build Order

1. **Improve shared components** — Add `ctaLabel` to `PlanCard` and `className` to `MacroProgressCard`. No dependencies. Existing tests must still pass.
2. **Add localization keys** — Append `landing.*` namespace to `pt.ts`, `en.ts`, `es.ts`. Depends on step 1.
3. **Add visual building blocks** — Append `kinetic-gradient`, `kinetic-gradient-hover`, `glass-card` to `styles/globals.css`; ensure Material Symbols Outlined font is loaded in `app/layout.tsx`. Depends on step 1.
4. **Build `components/landing/` sub-components** — Implement all 8 section components. Depends on steps 1, 2, 3.
5. **Assemble `LandingPageContent.tsx`** — Compose all sub-components into a single layout wrapper. Depends on step 4.
6. **Create `app/landing-page/page.tsx`** — Render `LandingPageContent` unconditionally. Depends on step 5.
7. **Update `app/page.tsx`** — Conditionally render `LandingPageContent` for unauthenticated users, redirect to `/dashboard` otherwise. Depends on step 6.
8. **Write `cypress/e2e/landing.cy.ts`** and adjust inline `auth-routing.cy.ts` + `basic.cy.ts` — Run `pnpm cy:run`. Depends on step 7.
9. **Bump `package.json` version** from `1.14.6` → `1.14.7`. Depends on step 8 passing.

### Technical Dependencies

- `next-themes` already installed — `ThemeSwitcher` available with no new packages.
- Material Symbols Outlined web font is loaded once in `app/layout.tsx` (existing project pattern).
- `PlansRepository` mock must return valid data in `NEXT_PUBLIC_BACKEND_PROVIDER=mock` mode (already works per existing plans page).

---

## Monitoring and Observability

- `LandingPricing` catches plan fetch errors and logs `console.error('LandingPricing: failed to fetch plans', error)`.
- Auth redirect logic in `app/page.tsx` is synchronous with `loading` state; no redirect fires until `loading === false` to prevent flicker.

---

## Technical Considerations

### Key Decisions

- **Bottom CTA has only a button (no form)**: The email/password form shown in `code.html` is layout reference only. The MVP ships a single primary button that routes to `/login`. This keeps authentication in a single, well-tested route (`/login`) and avoids duplicating OAuth handling inside the landing page.
- **Reuse `PlanCard` instead of a new pricing component**: Requires only a one-line `ctaLabel` prop addition. Avoids duplicating feature-list rendering logic.
- **Reuse `MacroProgressCard` in `LandingVisualDemo`**: The dashboard demo section shows the same progress bar UI the app uses. Adding `className` makes it composable in the landing layout without overriding internal styles.
- **`LandingPageContent` is a `'use client'` component**: It reads `useAuth()` to ensure auth state is available for the `/landing-page` route (where we still want to show a "Go to Dashboard" CTA if logged in, instead of hiding the page).
- **No unit/component tests**: Coverage is provided exclusively by `cypress/e2e/landing.cy.ts`. This decision keeps the surface area small for an MVP and matches the project's existing E2E-first testing practice.

### Known Risks

- **Plans loading flash**: `LandingPricing` may render a loading skeleton briefly before plans resolve. Mitigation: show skeleton cards matching the layout.
- **Redirect flicker on `/`**: If `loading` from `AuthContext` takes >300ms, the Landing Page briefly flashes. Mitigation: render the landing hero immediately and only redirect after `loading === false && user !== null`.
- **Existing Cypress tests break on root path**: Mitigated by inline adjustments in `auth-routing.cy.ts` and `basic.cy.ts` (see Testing Approach).

---

## Architecture Decision Records

- [ADR-001: Separation of Landing Page and Login Page Route Structure](adrs/adr-001.md) — Establishes separate `/`, `/landing-page`, and `/login` routes with distinct responsibilities.
- [ADR-002: Modular Component Organization for Landing Page](adrs/adr-002.md) — Places all landing sub-components inside `components/landing/`.
- [ADR-003: Localized Demo Data Strategy for Landing Page Visual Widgets](adrs/adr-003.md) — Uses `locales/*.ts` under `landing.*` for all visual widget copy.
