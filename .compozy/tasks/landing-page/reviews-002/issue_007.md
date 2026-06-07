---
status: valid
file: components/landing/LandingPageContent.tsx
line: 14
severity: medium
author: claude-code
provider_ref:
---

# Issue 007: Logged-in users on `/landing-page` see login CTAs instead of a "Go to Dashboard" CTA

## Review Comment

The TechSpec calls for `LandingPageContent` to be auth-aware:

> "`LandingPageContent` is a `'use client'` component: It reads `useAuth()`
>  to ensure auth state is available for the `/landing-page` route (where
>  we still want to show a 'Go to Dashboard' CTA if logged in, instead of
>  hiding the page)."

The current `LandingPageContent` does not consume `useAuth()` and always
renders the same navbar / hero / bottom-CTA copy, including the "Login" and
"Começar" links that point to `/login`. For a logged-in visitor to
`/landing-page` the result is:
- The navbar still shows "Login" and "Começar" pointing at `/login`
  (which immediately redirects them back to `/dashboard`, but wastes a
  click and breaks the marketing-page intent).
- The Hero "Começar Agora" and Bottom CTA both link to `/login` with the
  same dead-end.
- The Pricing CTAs are wired the same way.

`app/page.tsx` does handle the auth redirect for `/`, but the
`/landing-page` route renders `LandingPageContent` unconditionally, so the
spec'd CTA swap is missing.

Suggested fix: in `LandingPageContent`, call `useAuth()` and forward an
`isAuthenticated` prop (or expose it via context) to the sections that own
a CTA. `LandingNavbar`, `LandingHero` and `LandingCTA` should then render a
"Go to Dashboard" / `href="/dashboard"` variant when authenticated, while
keeping the marketing CTAs for anonymous visitors.

## Triage

- Decision: `VALID`
- Notes: Confirmed at `components/landing/LandingPageContent.tsx:14` — no `useAuth` import or call, so `/landing-page` shows marketing CTAs for all visitors. Fix approach: read `useAuth()` in `LandingPageContent` and forward an `isAuthenticated` prop to the three CTAs (Navbar, Hero, bottom CTA section), which then render a single "Go to Dashboard" `href="/dashboard"` link when authenticated. New locale keys `landing.{navbar,hero,cta}.dashboard` will be added. The auth redirect in `app/page.tsx` continues to handle the `/` route, so unauthenticated visitors still see the marketing page on `/` and logged-in visitors land on `/dashboard` immediately.
