---
status: valid
file: components/landing/LandingVisualDemo.tsx
line: 45
severity: medium
author: claude-code
provider_ref:
---

# Issue 006: `MacroProgressCard` reuses testids that collide with the dashboard

## Review Comment

`LandingVisualDemo` reuses the shared `MacroProgressCard` for the dashboard
demo. The component hardcodes its `data-testid` as
`macro-goal-${title.toLowerCase()}` (`components/MacroProgressCard.tsx:21`),
and the landing demo passes the localized labels:

```tsx
<MacroProgressCard
  title={t('landing.demo.dashboard_protein_label')}   // "Protein"
  current={120}
  goal={150}
  ...
/>
<MacroProgressCard
  title={t('landing.demo.dashboard_carbs_label')}     // "Carbs"
  current={150}
  goal={250}
  ...
/>
```

That produces the testids `macro-goal-protein` and `macro-goal-carbs` on the
landing page — the same selectors used by `cypress/e2e/dashboard.cy.ts:115`
to assert non-zero goals on the dashboard. Beyond the uniqueness smell, the
landing page and the dashboard now share two global testids, so any test
that visits `/` (e.g. `cypress/e2e/landing.cy.ts`,
`cypress/e2e/auth-routing.cy.ts`, `cypress/e2e/basic.cy.ts`) and queries
`[data-testid="macro-goal-protein"]` would silently match the landing-page
element instead of (or in addition to) the dashboard one.

Suggested fix: either (a) make the `data-testid` namespace-aware in
`MacroProgressCard` by accepting an optional `dataTestIdPrefix` prop, or
(b) replace the inline `MacroProgressCard` calls in `LandingVisualDemo`
with a static, purpose-built progress-bar component that uses its own
testids (e.g. `data-testid="landing-demo-protein"`).

## Triage

- Decision: `VALID`
- Notes: Confirmed at `components/landing/LandingVisualDemo.tsx:45-60` and `components/MacroProgressCard.tsx:21`. The shared card bakes its `data-testid` as `macro-goal-${title.toLowerCase()}`, and the landing demo passes the localized "Protein"/"Carbs" titles, colliding with `cypress/e2e/dashboard.cy.ts:115`. Fix approach: add an optional `testId` prop to `MacroProgressCard` (backward compatible — default keeps current behaviour) and pass `landing-demo-protein` / `landing-demo-carbs` from the landing section.
