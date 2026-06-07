# Product Requirements Document (PRD) - Levemente Landing Page

## Overview

High-level overview of the feature:
- **What problem it solves**: Currently, unauthenticated users visiting the application are presented directly with a bare login card. This lacks context, does not introduce the features of "Levemente" (AI-based macro analysis, clinical focus, simple logging), and misses an opportunity to engage potential users.
- **Who it is for**: Potential new users visiting the site for the first time, and existing users wanting to review product details.
- **Why it is valuable**: Engaging potential users with a visually rich, responsive, and high-fidelity Landing Page that details the value proposition, features, and plans of the application, thereby increasing user acquisition and sign-ups.

The visual reference for every section is `.compozy/tasks/landing-page/code.html` and `.compozy/tasks/landing-page/screen.png`. The PRD, TechSpec, and tasks are intentionally a reinforcement of that mockup — section order, anchors, copy, and visual treatments must match the HTML reference.

---

## Goals

Specific, measurable objectives for this feature:
- Implement a responsive, multi-language landing page that mirrors the structure, sections, anchors, and visual treatment of `code.html` (Material Symbols icons, `kinetic-gradient` primary CTAs, `glass-card` floating surfaces, and the design tokens declared in `code.html`).
- Establish clean routing where unauthenticated users visiting the home page (`/`) see the Landing Page, and logged-in users go straight to the `/dashboard`.
- Preserve existing authentication (Google Sign-In on `/login`) and support localizing all marketing/landing copy in PT, EN, and ES.
- Maintain compatibility with the Cypress E2E test suite (no unit tests are required for this feature — coverage is provided by a single `cypress/e2e/landing.cy.ts` file plus inline adjustments to impacted existing tests).

---

## User Stories

### Primary Personas and Flows
- **As an unauthenticated visitor**, I want to browse the Levemente Landing Page on `/` so that I can understand how the AI nutrition tracker works, what benefits it offers (clinical focus, AI macro analysis, transparent pricing), and how to sign up before I decide to log in.
- **As a returning user**, I want to easily reach the Login Page from the Landing Page so that I can access my dashboard and start logging my meals.
- **As a logged-in user**, I want to be redirected directly to my `/dashboard` when I visit the root page (`/`), but still be able to access the Landing Page on `/landing-page` if I want to refer to its content.

---

## Core Features

The Landing Page is composed of **9 sections in the exact order of `code.html`**, with the anchor IDs declared by the mockup (`#benefits`, `#how-it-works`, `#features`, `#pricing`, `#login`):

### 1. Top Navigation Bar
- **Behavior**: Sticky, full-width nav with backdrop blur (`bg-surface/80 backdrop-blur-md`) anchored at the top of the page.
- **Logo block**: Brand mark (`eco` Material Symbol) + "Levemente" wordmark on the left.
- **Anchor links** (desktop only, hidden on `md` and below): `#features`, `#benefits`, `#pricing` — each uses the muted label color and animates to `text-primary` on hover.
- **Right-side actions**: "Login" text-link (→ `/login`) and the "Começar" filled CTA with `kinetic-gradient` background (→ `/login`).
- **Sticky styling**: `position: sticky; top: 0`; the bar must remain visible while the user scrolls between sections.

### 2. Hero Section
- **Behavior**: Two-column layout (left: copy + CTAs; right: phone mockup with floating glass card). Backgrounds include two large soft-blurred radial gradients (primary-fixed-dim + secondary-fixed) for depth.
- **Left column**:
  - Animated badge pill: `bolt` Material Symbol + "IA Nutricional".
  - Headline (`text-headline`): "Nutrição Inteligente em **1 Minuto**" (the second half highlighted with `text-secondary`).
  - Sub-headline explaining the AI macro analysis and clinical positioning.
  - Two CTAs:
    - Primary: `kinetic-gradient` filled button "Começar Agora" (→ `/login`).
    - Secondary: outline button with `play_circle` icon "Ver Como Funciona" (anchors to `#how-it-works`).
  - Trust micro-row with two `check_circle` items: "Sem questionários longos" and "Setup em 60s".
- **Right column**:
  - Phone-mockup container (`rounded-[3rem]`, `shadow-2xl`) with the dashboard app screenshot.
  - Floating glass card anchored to the bottom-left, with `restaurant_menu` icon, "Almoço Registrado" title, and "Macros calculados em 1.2s" subtitle. Bouncing animation (3s loop).

### 3. Core Value Prop / Key Stats (`id="benefits"`)
- **Behavior**: Centered section title "Setup Rápido, Foco nos Resultados" over a 3-column responsive grid of "Bento Box" cards. Background uses `bg-surface-container-lowest`.
- **Cards (1 per column)**:
  1. **60 Segundos** — `timer` icon in a `secondary-container` circle.
  2. **Zero Planilhas** — `center_focus_strong` icon in a `primary-container` circle.
  3. **Insights Diretos** — `insights` icon in a `tertiary-container` circle.
- **Card interaction**: Subtle hover scale (`hover:scale-[1.02]`) and shadow lift.

### 4. AI-Powered Tracking (`id="how-it-works"`)
- **Behavior**: Two-column section on `bg-surface-container`, with the brain visual on the left and a description list on the right. Two decorative blurred orbs (`bg-secondary` and `bg-primary`) sit behind the visual.
- **Left column**: Square rounded container with the AI brain logo.
- **Right column**:
  - Eyebrow label "MOTOR DE INTELIGÊNCIA" (`text-secondary`, uppercase, `font-label`).
  - Title "Análise de Macros em Segundos" and supporting paragraph.
  - Two sub-feature rows, each with a circular icon container, title, and one-line description:
    - **Entrada Natural** (`chat` icon)
    - **Cálculo Imediato** (`speed` icon)

### 5. Medical-Based Wellness
- **Behavior**: Bordered, large rounded surface (`rounded-[3rem]`) on `bg-surface-container-low` containing a 2-column layout. A large `+` glyph is rendered behind the layout (decorative, `text-[300px]`, low opacity) to evoke the medical cross.
- **Left column**:
  - Pill badge "Saúde Clínica" on `error-container`.
  - Title "Foco em Condições Médicas" and supporting paragraph.
  - 2x1 card grid:
    - **Diabetes** — `water_drop` icon, "Controle preciso de índice glicêmico."
    - **Intolerâncias** — `no_meals` icon, "Alertas automáticos de ingredientes."
- **Right column**: Circular branded surface (the wellness bowl logo).

### 6. Features Gallery / Visual Demos (`id="features"`)
- **Behavior**: Centered title "Tudo que você precisa, nada que não precise" + subtitle, followed by a 2-column responsive grid of feature cards on `bg-surface`.
- **Card 1 — Dashboard Diário**:
  - Header with title/subtitle on the left, `donut_large` icon in a `primary-container` circle on the right.
  - Visual: SVG progress ring at **75% Calorias** + two macro bars (Proteína 120g, Carbos 150g).
- **Card 2 — Registro Simples**:
  - Header with title/subtitle on the left, `edit_note` icon in a `secondary-container` circle on the right.
  - Visual: Static chat mock with three messages (bot prompt, user meal, bot confirmation with macros).

### 7. Transparent Pricing (`id="pricing"`)
- **Behavior**: Centered title "Planos Simples e Transparentes" + subtitle, then a 2-column grid of plan cards on `bg-surface-container-lowest`.
- **Free Tier — "Básico"**:
  - Subtitle: "Para desenvolvedores e entusiastas que querem testar o motor."
  - Price: "Grátis".
  - Feature list: Base meal logging, daily dashboard, requires own OpenAI key, medical analysis crossed out.
  - CTA: "Começar Grátis" (outlined).
- **Premium Tier — "Membro"** (recommended):
  - "Recomendado" pill badge (`bg-tertiary-fixed`).
  - Subtitle: "Experiência completa, sem complicações técnicas."
  - Price: "R$ 29/mês".
  - Feature list: everything from Básico, **no API key needed**, medical analysis, priority support.
  - CTA: "Assinar Agora" (`kinetic-gradient`-style filled).
- **Feature flag**: Section is visually controlled by `FeatureFlags.ENABLE_PLANS` — when the flag is off, the entire section is hidden.

### 8. Bottom Login / CTA (`id="login"`)
- **Behavior**: A "sign-off" section on `bg-surface-container` with a large rounded card (`rounded-[3rem]`) containing a 2-column layout and a decorative blurred orb at the bottom.
- **Left column**:
  - Title: "Pronto para transformar sua rotina?"
  - Subtitle: "Acesse sua conta ou crie uma agora em menos de 1 minuto."
  - Two trust badges with icons: "Acesso instantâneo" (`bolt`) and "Dados seguros e privados" (`lock`).
- **Right column**:
  - **Only a single primary CTA button** (per product decision — the form shown in `code.html` is layout reference only and is not implemented in this MVP). The button uses `kinetic-gradient` styling and the label "Começar Agora" / "Entrar" and routes to `/login` (Google Sign-In).
- **Important**: The email/password/remember-me UI present in `code.html` is **not** part of the MVP. All authentication continues to happen on the dedicated `/login` page via Google Sign-In (ADR-001).

### 9. Footer
- **Behavior**: Full-width footer (`bg-surface-container-highest`) with a 2-column grid (logo + copyright on the left, legal/support links on the right).
- **Content**: "Levemente" wordmark with `eco` icon, copyright line "© 2024 Levemente. All rights reserved.", and three links: "Privacy Policy", "Terms of Service", "Contact Support".

---

## User Experience

- **Visual Theme Adaptation**: The page must default to the system theme and fully support both Light and Dark mode. The light theme must stay faithful to the white/mint palette of the mockup; the dark theme adapts to the dark slate + primary teal palette of the project.
- **Visual building blocks from `code.html`** (must be honored):
  - `kinetic-gradient` — `linear-gradient(135deg, #004c4b 0%, #006c45 100%)` for primary CTAs.
  - `kinetic-gradient-hover` — lighter gradient on hover.
  - `glass-card` — `rgba(255,255,255,0.7)` + `backdrop-filter: blur(16px)` for the floating hero notification.
  - Material Symbols Outlined (filled variant for emphasis icons, e.g. `check_circle` with `FILL 1`).
- **Responsive Layout**: Mobile-first. On mobile, multi-column grids collapse to a single column, the desktop nav links collapse to a hidden state (mobile may rely on the CTAs alone in MVP, mirroring the mockup), and spacing scales down.
- **Scroll Animations**: Subtle fade-in on scroll and smooth anchor transitions for nav links (`scroll-behavior: smooth`).
- **Iconography**: All icons must come from Material Symbols Outlined (already covered by the project's `components/icons.tsx`). The "Material Symbols" web font is loaded once in the root layout.

---

## High-Level Technical Constraints

- **Routing Logic**:
  - `/` (Home): Logged-in → redirect to `/dashboard`. Logged-out → renders Landing Page.
  - `/login`: Logged-in → redirect to `/dashboard`. Logged-out → renders Login Page.
  - `/landing-page`: Renders Landing Page unconditionally.
- **Multi-language**: All static copy uses the `useTranslation` hook under the `landing.*` namespace. The hero, all card titles, the chat mock strings, and the pricing labels are localized.
- **Cypress Compatibility**: The Google Sign-In button on `/login` retains the `data-testid="google-signin-button"` attribute. The bottom CTA button on the Landing Page is a link/button with `href="/login"` (no embedded form).
- **No Unit Tests**: This feature does not require unit/component test coverage. Quality is validated by a single Cypress E2E file (`cypress/e2e/landing.cy.ts`) that exercises the full landing page. Existing Cypress tests that depended on the old root-path behavior are adjusted inline to keep the suite green.

---

## Non-Goals (Out of Scope)

- **Embedded Login Form in the Bottom CTA**: The email/password form shown in `code.html` is a layout reference only; it is not implemented. All authentication continues to live on `/login` (Google Sign-In only).
- **Inline Signup/Login inside other sections**: All CTAs route to `/login`. No auth state, form, or OAuth interaction is embedded in the landing page.
- **Interactive Chat / Dashboard Engines**: The chat and dashboard widgets in the Visual Demos are static visual presentations. The progress ring renders a fixed 75% and the chat bubbles are not interactive.
- **Unit / Component Tests**: There are no unit or component-level tests for this feature.

---

## Phased Rollout Plan

### MVP (Phase 1)
- All 9 sections of `code.html` implemented on `/` and `/landing-page`.
- Full localization in PT, EN, and ES under `landing.*` namespace.
- Light & Dark mode compatibility.
- Separate `/login` page preserved for authentication.
- Single Cypress E2E file (`cypress/e2e/landing.cy.ts`) covering section rendering, navigation, theme, language, pricing flag, and routing.
- Inline adjustments to existing Cypress tests that relied on the previous root-path behavior.
- Success criteria: All Cypress tests pass and responsive rendering matches `code.html`.

---

## Success Metrics

- **Acquisition**: Increase in sign-up conversions from new visitors.
- **Performance**: Mobile PageSpeed score >= 80 (fast initial load).
- **Correctness**: Zero regression in authentication flows and 100% Cypress test passing rate, including the new `landing.cy.ts` file.
- **Visual Fidelity**: Section order, anchors, and copy match `code.html`.

---

## Risks and Mitigations

- **Risk**: Visual complexity slowing down initial page loads.
  - *Mitigation*: Optimize visual assets (SVGs where possible, modern Next.js `Image` formats for raster images).
- **Risk**: Redirection logic causing infinite loops.
  - *Mitigation*: Ensure robust auth state checks in `AuthContext` and proper route guards.
- **Risk**: New root-path behavior breaks existing Cypress tests.
  - *Mitigation*: Adjust inline the affected tests in `auth-routing.cy.ts` and `basic.cy.ts` so the suite passes without a behavioral regression in the app.

---

## Architecture Decision Records

- [ADR-001: Separation of Landing Page and Login Page Route Structure](adrs/adr-001.md) — Implements separate routes for the landing page (`/` and `/landing-page`) and the login panel (`/login`).
- [ADR-002: Modular Component Organization for Landing Page](adrs/adr-002.md) — Places all landing sub-components inside `components/landing/`.
- [ADR-003: Localized Demo Data Strategy for Landing Page Visual Widgets](adrs/adr-003.md) — Uses `locales/*.ts` under `landing.*` for all visual widget copy.

---

## Open Questions

- *None at this stage.*
