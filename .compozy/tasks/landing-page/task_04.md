---
status: completed
title: Add visual building blocks (kinetic-gradient, glass-card) and Material Symbols font
type: frontend
complexity: low
dependencies: []
---

# Task 04: Add visual building blocks and Material Symbols font

## Overview
`code.html` defines three CSS utility classes (`kinetic-gradient`, `kinetic-gradient-hover`, `glass-card`) and loads the Material Symbols Outlined web font. This task makes those building blocks available project-wide so the landing page sub-components can reuse them faithfully.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- NO UNIT TESTS — this feature does not require unit/component test coverage
</critical>

<requirements>
- MUST add the three utility classes from `code.html` to `styles/globals.css` (or Tailwind plugin layer) with identical declarations.
- MUST ensure the Material Symbols Outlined web font is loaded once in `app/layout.tsx` (or root layout). If the project already loads it elsewhere, MUST verify it is available on every page that uses landing components and avoid duplicate `<link>` tags.
- MUST NOT break any existing component that already uses Material Symbols via `components/icons.tsx`.
- MUST NOT introduce new runtime dependencies (the web font is loaded from Google Fonts via `<link>`).
</requirements>

## Subtasks
- [x] 4.1 Append `kinetic-gradient`, `kinetic-gradient-hover`, and `glass-card` to `styles/globals.css`
- [x] 4.2 Verify the Material Symbols Outlined web font is loaded once in `app/layout.tsx` (or document its existing location)
- [x] 4.3 Confirm no duplicate `<link>` tags are introduced
- [x] 4.4 Run `pnpm lint` and `pnpm build` to confirm no regressions

## Implementation Details
See TechSpec "Visual Building Blocks (declared once)" section for the exact CSS declarations to copy from `code.html`.

The three utility classes are:
```css
.kinetic-gradient        { background: linear-gradient(135deg, #004c4b 0%, #006c45 100%); }
.kinetic-gradient-hover  { background: linear-gradient(135deg, #006664 0%, #03be7c 100%); }
.glass-card              { background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.3); }
```

### Relevant Files
- `styles/globals.css` — append the three utility classes
- `app/layout.tsx` — verify/add the Material Symbols Outlined `<link>` tag (preconnect + stylesheet)
- `.compozy/tasks/landing-page/code.html` — source of truth for declarations

### Dependent Files
- `components/landing/LandingNavbar.tsx` — consumes `kinetic-gradient`
- `components/landing/LandingHero.tsx` — consumes `glass-card` and `kinetic-gradient`
- `components/landing/LandingCTA.tsx` — consumes `kinetic-gradient`
- All icon-using landing sub-components (Material Symbols)

### Related ADRs
- [ADR-002: Modular Component Organization for Landing Page](../adrs/adr-002.md) — Centralizes visual building blocks

## Deliverables
- `styles/globals.css` updated with the three utility classes
- `app/layout.tsx` confirmed to load Material Symbols Outlined (single tag)
- `pnpm lint` and `pnpm build` pass

## Tests
- No unit/component tests for this task.
- Visual verification is performed through `cypress/e2e/landing.cy.ts` (created in task_08).

## Success Criteria
- The three utility classes from `code.html` are present in the global stylesheet with byte-identical declarations
- Material Symbols Outlined font is loaded exactly once in the root document
- `pnpm lint` and `pnpm build` pass with no errors
