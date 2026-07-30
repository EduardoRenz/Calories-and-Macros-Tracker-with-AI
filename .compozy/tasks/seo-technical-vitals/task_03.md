---
status: pending
title: Calculadora Pública de Macros com Gráficos e SEO
type: frontend
complexity: medium
---

# Task 3: Calculadora Pública de Macros com Gráficos e SEO

## Overview
Build a public, unauthenticated macro calculator page (`/calculadora-macros`) that lets visitors calculate their daily calorie target and macro split (protein, carbs, fats) instantly. The page reuses existing domain entities (`PersonalInfo`, `FitnessGoals` from `domain/entities/profile.ts`) and the pure `CalorieCalculationService.calculateGoals()` for TDEE/macro computation. It renders visual charts and a conversion CTA, and is fully indexable by search engines via dynamic SEO metadata.

<critical>
- ALWAYS READ the PRD, the TechSpec, and their catalogs (`_user_stories.md`, `_tests.md`) before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — implement every test case assigned in ## Tests
</critical>

<requirements>
- MUST create `/calculadora-macros` as a public, unauthenticated page with instant client-side macro/calorie calculation.
- MUST reuse existing domain types (`PersonalInfo`, `FitnessGoals`) and `CalorieCalculationService.calculateGoals()` — do not duplicate calculation logic.
- MUST provide a clean form with fields: age, weight, height, gender, activity level, and goal (lose/maintain/gain).
- MUST display results with visual charts showing calorie target and macro split (protein, carbs, fats).
- MUST include a prominent CTA "Salvar dieta no Levemente AI" linking to `/login`.
- MUST use `generateMetadata()` + `buildSeoMetadata()` for per-route dynamic metadata and JSON-LD structured data.
- MUST be indexable by search engines — server-rendered shell with client island for the interactive form.
</requirements>

## Subtasks
- [ ] 3.1 Create `app/calculadora-macros/page.tsx` as a server component shell with `generateMetadata()` using `buildSeoMetadata()`.
- [ ] 3.2 Create `app/calculadora-macros/CalculatorForm.tsx` as a client component with inputs for age, weight, height, gender, activity level, and goal.
- [ ] 3.3 Integrate `CalorieCalculationService.calculateGoals()` for instant client-side results.
- [ ] 3.4 Render result charts (calorie target and macro split) — reuse `MacroSplitChart` or a lightweight inline chart.
- [ ] 3.5 Add prominent CTA linking to `/login` with "Salvar dieta no Levemente AI".
- [ ] 3.6 Write Cypress tests for UT-006 and E2E-005.

## Implementation Details

### Relevant Files
- `app/calculadora-macros/page.tsx` — Server component with `generateMetadata()` (new).
- `app/calculadora-macros/CalculatorForm.tsx` — Client component with form + chart (new).
- `domain/entities/profile.ts` — Reuses `PersonalInfo`, `FitnessGoals` types and `isProfileComplete()`.
- `domain/services/CalorieCalculationService.ts` — Reuses pure `calculateGoals()` function.
- `components/MacroSplitChart.tsx` — Existing chart component for macro visualization.

### Dependent Files
- `utils/seo/metadata.ts` — Consumed by `generateMetadata()`.
- `utils/seo/jsonld.ts` — JSON-LD schema builders.
- `components/seo/JsonLd.tsx` — Renders JSON-LD script tags.

### Related ADRs
- [ADR-002: Pure Utility Functions for SEO](../adrs/adr-002.md) — Pure function consumption in route metadata.

## Deliverables
- `app/calculadora-macros/page.tsx` with SEO metadata and server shell.
- `app/calculadora-macros/CalculatorForm.tsx` with form inputs, instant calculation, charts, and CTA.
- Every test case assigned in `## Tests` implemented and passing **(REQUIRED)**.

## Tests

- [ ] **UT-006** — `CalorieCalculationService.calculateGoals`: given valid personal info and fitness goals, returns correct calorie/macro values with Mifflin-St Jeor formula.
- [ ] **E2E-005** — Unauthenticated visitor visits `/calculadora-macros` → fills age, weight, height, activity, goal → calculates macros → sees chart with calorie target and macro split → clicks CTA to register.

## Success Criteria
- Every assigned test case implemented and passing
- `/calculadora-macros` usable in 3 clicks without registration
- Page is indexable by search engines (meta tags, JSON-LD, no login wall)
- Macro results include calories, protein, carbs, and fats with visual chart
