# Product Requirements Document (PRD) - Levemente Landing Page

## Overview

High-level overview of the feature:
- **What problem it solves**: Currently, unauthenticated users visiting the application are presented directly with a bare login card. This lacks context, does not introduce the features of "Levemente" (AI-based macro analysis, clinical focus, simple logging), and misses an opportunity to engage potential users.
- **Who it is for**: Potential new users visiting the site for the first time, and existing users wanting to review product details.
- **Why it is valuable**: Engaging potential users with a visually rich, responsive, and high-fidelity Landing Page that details the value proposition, features, and plans of the application, thereby increasing user acquisition and sign-ups.

---

## Goals

Specific, measurable objectives for this feature:
- Implement a responsive, multi-language landing page matching the structure and elements of the design mockup.
- Establish clean routing where unauthenticated users visiting the home page (`/`) see the Landing Page, and logged-in users go straight to the `/dashboard`.
- Preserve existing authentication features (Google Sign-In) and support localizing all marketing/landing copy.
- Maintain compatibility with the Cypress test suite for existing E2E testing flows.

---

## User Stories

### Primary Personas and Flows
- **As an unauthenticated visitor**, I want to browse the Levemente Landing Page on `/` so that I can understand how the AI nutrition tracker works, what benefits it offers (like clinical focus), and how much it costs before I decide to sign up.
- **As a returning user**, I want to easily log in from the Landing Page so that I can access my dashboard and start logging my meals.
- **As a logged-in user**, I want to be redirected directly to my `/dashboard` when I visit the root page (`/`), but still be able to access the Landing Page on `/landing-page` if I want to refer to its content.

---

## Core Features

The Landing Page will consist of 9 main sections, prioritized for the MVP:

### 1. Header Navigation
- **Behavior**: A sticky navbar with links (anchor-scrolling to Features, Benefits, and Pricing), a language switcher dropdown (English, Spanish, Portuguese), and a theme toggle button (Light/Dark mode).
- **CTAs**: "Login" and "Get Started" buttons that redirect the user to `/login`.

### 2. Hero Section
- **Behavior**: An attention-grabbing layout containing:
  - An animated badge ("⚡ IA Nutricional" or localized equivalent).
  - Headline: "Nutrição Inteligente em 1 Minuto" (Smart Nutrition in 1 Minute).
  - Sub-headline and checkmarks (No long questionnaires, Setup in 60s).
  - Prominent CTAs (redirecting to `/login`).
  - Right-side phone mockup displaying the app dashboard with a floating notification bubble: "Almoço Registrado / Macros calculados em 12s".

### 3. Key Stats / Quick Setup (Benefits)
- **Behavior**: A 3-column feature showcase (60 Seconds, Zero Spreadsheets, Direct Insights) with micro-animations on hover to elevate the cards.

### 4. AI Engine / Macro Analysis (Features)
- **Behavior**: Explains the AI capabilities:
  - Left: Brain graphic visual assets ("AI-Powered Nutrition").
  - Right: Details on Natural Language Input ("Entrada Natural") and Immediate Calculations ("Cálculo Imediato").

### 5. Clinical Health Focus (Benefits)
- **Behavior**: Illustrates Levemente's medical/health support:
  - Highlighted cards for Diabetes (glycemic index control) and Intolerances (allergen alerts).
  - Right: Circular Levemente branding graphic.

### 6. Interactive Visual Demos (Features)
- **Behavior**: Visual representations of the app interface:
  - Daily Dashboard: Interactive progress ring showing "75% Calorias" and macro target bars.
  - Simple Logging: A mock chat interface showing natural text input and the AI's instant response.

### 7. Transparent Pricing (Pricing)
- **Behavior**: Standard pricing tier cards:
  - Basic (Free): Shows feature support list, requires personal API key.
  - Member (Premium): Recommended, list of all premium benefits, no API key needed.
  - *Note*: Visually controlled by the `FeatureFlags.ENABLE_PLANS` feature flag.

### 8. Login/CTA Section
- **Behavior**: A bottom-of-page sign-off section ("Pronto para transformar sua rotina?") that displays trust badges (Instant Access, Secure & Private) and a CTA button driving users to the `/login` route.

### 9. Footer
- **Behavior**: Clean footer with copyright text, language selectors (if not in navbar), and links to Privacy Policy, Terms of Use, and Support.

---

## User Experience

- **Visual Theme Adaptation**: The page must default to the system theme, but fully support both Light and Dark mode options. The light theme must stay faithful to the white/mint color palette of the mockup, while the dark theme will adapt to the dark slate and primary teal colors of the project.
- **Responsive Layout**: Designed mobile-first. In mobile viewports, the grid sections collapse into single-column flows, and the header links collapse into a hamburger menu or scrollable banner.
- **Scroll Animations**: Subtle fade-in animations on scroll and smooth anchor transitions for nav links.

---

## High-Level Technical Constraints

- **Routing Logic**:
  - `/` (Home): Logged-in -> redirects to `/dashboard`. Logged-out -> renders Landing Page.
  - `/login`: Logged-in -> redirects to `/dashboard`. Logged-out -> renders Login Page.
  - `/landing-page`: Renders Landing Page unconditionally.
- **Multi-language**: All static copy must use the `useTranslation` hook, referencing localized strings inside `locales/`.
- **Cypress Compatibility**: Ensure that the Google Sign-in button retains the test attribute `data-testid="google-signin-button"` and behaves exactly as before.

---

## Non-Goals (Out of Scope)

- **Inline Signup/Login**: Implementing complex inline registration/login inside the landing page is deferred to later phases. All CTAs will route to the dedicated `/login` page (as per ADR-001).
- **Interactive Chat Engine**: The chat and dashboard widgets on the landing page are static mockups/visual presentations, not live interactive inputs.

---

## Phased Rollout Plan

### MVP (Phase 1)
- Core layout and all 9 sections implemented on `/` and `/landing-page`.
- Full localization in PT, EN, and ES.
- Dark & Light mode compatibility.
- Separate `/login` page preserved for authentication.
- Success criteria: All Cypress tests pass and responsive rendering is correct.

---

## Success Metrics

- **Acquisition**: Increase in sign-up conversions from new visitors.
- **Performance**: Mobile PageSpeed score >= 80 (fast initial load).
- **Correctness**: Zero regression in authentication flows and 100% Cypress test passing rate.

---

## Risks and Mitigations

- **Risk**: Visual complexity slowing down initial page loads.
  - *Mitigation*: Optimize visual assets (SVGs where possible, modern Next.js `Image` formats for raster images).
- **Risk**: Redirection logic causing infinite loops.
  - *Mitigation*: Ensure robust auth state checks in `AuthContext` and proper route guards.

---

## Architecture Decision Records

- [ADR-001: Separation of Landing Page and Login Page Route Structure](adrs/adr-001.md) — Implements separate routes for the landing page (`/` and `/landing-page`) and the login panel (`/login`).

---

## Open Questions

- *None at this stage.*
