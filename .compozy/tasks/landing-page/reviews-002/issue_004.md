---
status: valid
file: components/landing/LandingHero.tsx
line: 18
severity: medium
author: claude-code
provider_ref:
---

# Issue 004: Hero headline missing `text-secondary` highlight on "1 Minuto"

## Review Comment

The PRD specifies the hero headline as `"Nutrição Inteligente em **1 Minuto**"`
with the second half highlighted using `text-secondary`. The current
implementation renders the entire string in `text-primary`:

```tsx
<h1 className="text-5xl lg:text-6xl font-headline font-bold text-primary leading-tight tracking-tight">
  {t('landing.hero.title')}
</h1>
```

The `landing.hero.title_accent` key ("1 Minuto" / "1 Minute") is defined in
all three locales (`locales/pt.ts:472`, `locales/en.ts:472`, `locales/es.ts:467`)
but is never read by any component, so it is dead code.

Suggested fix: split the title into two spans and apply `text-secondary` to
the accent portion. For example:

```tsx
<h1 className="text-5xl lg:text-6xl font-headline font-bold text-primary leading-tight tracking-tight">
  {t('landing.hero.title_prefix')} <span className="text-secondary">{t('landing.hero.title_accent')}</span>
</h1>
```

The locale key `title` already splits naturally at the suffix
(e.g. "Nutrição Inteligente em " + "1 Minuto"), so it can be replaced with
`title_prefix` (or simply hard-splice the accent) without breaking the other
locales.

## Triage

- Decision: `VALID`
- Notes: Confirmed at `components/landing/LandingHero.tsx:18-20` and the unused `landing.hero.title_accent` keys in `locales/pt.ts:472`, `locales/en.ts:472`, `locales/es.ts:467`. Fix approach: split the `<h1>` into two spans and apply `text-secondary` to the accent. The locale `title` already contains the full string, so the component will substring the title using the `title_accent` value as a stable anchor (works across all three locales).
