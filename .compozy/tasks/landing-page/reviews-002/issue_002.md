---
status: valid
file: components/landing/LandingPricing.tsx
line: 101
severity: high
author: claude-code
provider_ref:
---

# Issue 002: Error fallback reuses the loading translation key

## Review Comment

In the pricing error branch the component renders
`t('landing.pricing.loading')` ("Loading plans...") for the user-facing
message, which is misleading once a fetch has actually failed:

```tsx
) : error ? (
  <div className="col-span-full text-center py-12">
    <p className="text-on-surface-variant">{t('landing.pricing.loading')}</p>
  </div>
) : (
  plans.map(...)
)
```

The TechSpec also calls for the section to "handle fetch errors gracefully
(log error, show a fallback message)". Logging is in place, but the fallback
message is the same as the loading skeleton, so a user with a real network
or repository failure will see the page advertise that plans are still
loading.

Suggested fix: add a dedicated key (e.g. `landing.pricing.error`) to
`locales/{en,es,pt}.ts` and use it here, e.g.
`{t('landing.pricing.error')}` plus a retry affordance.

## Triage

- Decision: `VALID`
- Notes: Confirmed at `components/landing/LandingPricing.tsx:99-102`. The error branch renders `t('landing.pricing.loading')` ("Loading plans..."), which is misleading once the fetch has actually failed. Fix approach: add a new `landing.pricing.error` key in `locales/{en,es,pt}.ts` and replace the `t('landing.pricing.loading')` call with `t('landing.pricing.error')`.
