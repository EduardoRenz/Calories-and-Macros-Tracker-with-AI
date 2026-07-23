---
status: valid
file: components/landing/LandingPageContent.tsx
line: 25
severity: high
author: claude-code
provider_ref:
---

# Issue 001: Footer (Section 9) reuses the wrong component and ignores locale

## Review Comment

`LandingPageContent` renders `<Footer />` (the existing `components/Footer.tsx`) in
place of the landing-specific footer described in the PRD.

PRD Section 9 requires a footer on `bg-surface-container-highest` with a 2-column
grid (logo + copyright on the left, legal/support links on the right), a "Levemente"
wordmark with the `eco` Material Symbol, the fixed string "© 2024 Levemente. All
rights reserved.", and three links: "Privacy Policy", "Terms of Service",
"Contact Support". All copy is to be localized under `landing.footer.*`.

The current Footer:
- uses `bg-neutral-panel`, no 2-column grid, and no logo / `eco` icon
- renders only two legal links (Privacy / Terms) — "Contact Support" is missing
- hardcodes the entire copy in Portuguese ("Política de Privacidade",
  "Termos de Uso", "Suporte:", "LeveMente"), violating the localization
  requirement and ADR-003
- uses `© {new Date().getFullYear()} LeveMente` (dynamic) instead of the
  spec's static `© 2024 Levemente`

The locale files in `locales/{en,es,pt}.ts` already define
`landing.footer.{copyright,privacy,terms,support}` and ADR-002 calls for a
dedicated `components/landing/LandingFooter.tsx` — neither is honored.

Suggested fix: create `components/landing/LandingFooter.tsx` that uses the
`landing.footer.*` keys, renders the `eco` icon + "Levemente" wordmark, the
fixed copyright, and three links (mailto: support, `/privacy-policy`,
`/terms-of-use`). Keep the existing `components/Footer.tsx` for the
authenticated layout (where it is still imported) to avoid breaking the
dashboard.

## Triage

- Decision: `VALID`
- Notes: Confirmed by reading `components/Footer.tsx` (lines 18-40) and `components/landing/LandingPageContent.tsx:25`. The Footer is reused as-is and renders only Privacy/Terms links, hardcodes Portuguese text, and ignores `landing.footer.*` keys already present in all three locale files. The reuse is also called out by ADR-002 as a separate `LandingFooter.tsx` component. Fix approach: create `components/landing/LandingFooter.tsx` (faithful to PRD Section 9), swap the import in `LandingPageContent`, leave the existing `Footer.tsx` untouched (it is still imported by `app/(authenticated)/layout.tsx:65` and `app/plans/page.tsx:158`).
