# CalorieCounter — Agent Instructions

## Quick start

- **Package manager:** `pnpm` (v10 in CI). Node 20 (`.nvmrc`).
- **Dev:** `pnpm dev` (Turbopack, requires `GEMINI_API_KEY`).
- **Dev (no real DB):** `pnpm dev:mock` — sets `NEXT_PUBLIC_BACKEND_PROVIDER=mock PAYMENT_PROVIDER=mock`.
- **Tests:** Start `pnpm dev:mock` first, then `pnpm cy:run` (Cypress e2e). Tests only work in mock mode.
- **Build:** `pnpm build` — outputs to `dist/` (see `next.config.ts` `distDir`).
- **Lint:** `pnpm lint` (ESLint, covers `app/ components/ contexts/ data/ domain/ hooks/ locales/ utils/`).
- **Env validation:** `env.ts` uses `@t3-oss/env-nextjs` + Zod. Skipped automatically when `NEXT_PUBLIC_BACKEND_PROVIDER=mock`.

## Architecture

- **Clean Architecture / SOLID.** Domain layer (`domain/`) is framework-agnostic. Data layer (`data/`) provides implementations.
- **Backend providers** (set via `NEXT_PUBLIC_BACKEND_PROVIDER`): `supabase`, `mock` (testing). Locked at build time.
- **Payment providers** (set via `NEXT_PUBLIC_PAYMENT_PROVIDER`): `stripe`, `mock`.
- **AI providers** (multi-provider fallback chain): OpenRouter > Gemini > OpenAI > DeepSeek. User can set own keys in-app (stored in `localStorage`). Server-side env vars used as fallback.
- **Factories:** `RepositoryFactory` (Strategy pattern — maps provider → repo impls), `ServiceFactory` (AI service chains with fallback), `ClientGatewayFactory` (payment gateways), `TelemetryFactory` (error tracking + analytics via `TelemetryService` implementations: Sentry, Google Analytics, Console, Noop — see `domain/services/TelemetryService.ts`).
- **Telemetry:** errors/logs go through `TelemetryFactory.getTelemetryService().captureError/trackEvent` — never call Sentry/gtag directly. Sentry client-side is gated by cookie consent; server-side always on. Enabled by `NEXT_PUBLIC_ERROR_TRACKING_PROVIDER`/`NEXT_PUBLIC_ANALYTICS_PROVIDER` (no-op without DSN/consent).
- **Singleton pattern:** All repositories and services expose `getInstance()` static method.
- **State:** React Contexts in `contexts/` (Auth, ChatAssistant, FeatureFlag, Language, Profile, Subscription, Toast).

## Key conventions

- Interfaces: no `I` prefix. Implementations: no `Impl` suffix. Name after the provider (e.g. `FirebaseAuthRepository`).
- Components: small, receive data as props + callbacks, extract into reusable pieces.
- i18n: all user-facing text goes through `useTranslation` from `locales/`. Languages: en, es, pt. Never hardcode display strings.
- Feature flags: always check `FeatureFlagRepository` before exposing new features.
- Caching: use `DataCacheManager` — do not create ad-hoc caching.
- No `any` — define proper types.
- `const` over `let` for non-reassigned variables.
- Error handling: every page must show user feedback + retry option.

## CI

- GitHub Actions on PRs to `main`: install → `pnpm build:mock` → `pnpm start` → `pnpm cy:run`. Timeout: 10 min.
- Vercel deploy: `pnpm build`, `pnpm install` (configured in `vercel.json`).

## Existing agent rules

- `.agents/rules/project-architecture.md` — Clean Architecture, Repository/Singleton patterns, domain entities with behavior.
- `.agents/rules/project-overall-rules.md` — pnpm, code legibility, i18n, testing expectations, component reuse.
