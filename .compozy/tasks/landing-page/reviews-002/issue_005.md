---
status: valid
file: app/page.tsx
line: 18
severity: medium
author: claude-code
provider_ref:
---

# Issue 005: Auth loading state shows a hardcoded placeholder instead of the landing page

## Review Comment

`app/page.tsx` shows a custom "Loading..." screen with a `bg-neutral-dark`
background while `AuthContext.loading` is true:

```tsx
if (loading) {
  return (
    <div className="bg-neutral-dark min-h-screen flex items-center justify-center">
      <p className="text-neutral-text-secondary">Loading...</p>
    </div>
  );
}
```

The TechSpec explicitly states the mitigation for the
"Redirect flicker on `/`" risk:

> "render the landing hero immediately and only redirect after
>  `loading === false && user !== null`"

The current implementation does the opposite: unauthenticated visitors see a
dark, light-mode-incompatible placeholder for as long as the auth repository
takes to resolve (often >300ms in mock mode), which is exactly the flicker
the spec tried to avoid. The `bg-neutral-dark` class also makes the screen
appear black-on-black in dark mode and dark-on-light in light mode depending
on which token wins.

Suggested fix: render `<LandingPageContent />` while `loading` is true, and
let the `useEffect` redirect kick in once `user !== null && !loading`. The
`AuthContext` already exposes `loading` and the LandingPageContent does not
depend on user state, so this is a one-line change.

## Triage

- Decision: `VALID`
- Notes: Confirmed at `app/page.tsx:18-24`. The TechSpec mitigation for "Redirect flicker on `/`" says "render the landing hero immediately and only redirect after `loading === false && user !== null`". The current code shows a dark loading placeholder instead. Fix approach: render `<LandingPageContent />` (wrapped in the `data-testid="landing-page"` div) while `loading` is true. The `useEffect` already guards the `router.push('/dashboard')` with `!loading`, so there is no redirect risk.
