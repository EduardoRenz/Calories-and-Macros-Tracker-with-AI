---
status: valid
file: components/landing/LandingHero.tsx
line: 52
severity: medium
author: claude-code
provider_ref:
---

# Issue 003: Hero, AI and Clinical visuals are placeholder icons

## Review Comment

Three sections use a single Material Symbol icon as a placeholder where
`code.html` (and the PRD) require an actual visual asset:

- `components/landing/LandingHero.tsx:50-53` — Hero right column shows a
  `phone_iphone` icon inside `rounded-[3rem] shadow-2xl bg-surface-container`
  instead of the "dashboard app screenshot" the PRD specifies.
- `components/landing/LandingAIFeatures.tsx:14-18` — left column shows a
  `psychology` icon inside the `rounded-[3rem]` brain container instead of
  the "AI brain logo".
- `components/landing/LandingClinicalFocus.tsx:38-42` — right column shows a
  `heart_plus` icon inside the circular branded surface instead of the
  "wellness bowl logo".

These are visible spec deviations and the components lose the "high-fidelity
Landing Page" character the PRD explicitly calls out. The whole point of
`code.html` is to anchor the design of these surfaces; shipping an icon as
the visual defeats the brief.

Suggested fix: extract the three visual assets from `code.html`/Figma into
`public/landing/` (or inline SVGs) and embed them in the corresponding
component. The `rounded-[3rem] shadow-2xl` containers, blurred orbs, and
icon circles are already in place; only the central art needs to land.

## Triage

- Decision: `VALID`
- Notes: Confirmed in `code.html` lines 160, 217, 283 — the design references three real PNG/SVG assets (App Interface, AI Brain Logo, Wellness Bowl Logo) hosted on `lh3.googleusercontent.com`. The implementation replaces them with Material Symbol icons (`phone_iphone`, `psychology`, `heart_plus`). We will not pull third-party images into production; instead each visual becomes a self-contained inline SVG that fits the design system (matching the existing pattern in `components/icons.tsx`) so the page works fully offline and respects the existing token set.
