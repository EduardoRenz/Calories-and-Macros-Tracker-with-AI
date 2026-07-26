---
status: resolved
file: app/api/analyze-nutrition/route.ts
line: 15
severity: medium
author: claude-code
provider_ref:
---

# Issue 001: analyze-nutrition uses wrong rate limit category

## Review Comment

The TechSpec (line 143) specifies `/api/analyze-nutrition` should use the `nutrition_analysis` category with a 20/min limit. However, the implementation on line 15 uses `food_analysis`:

```typescript
const rateLimitCheck = await checkRateLimit(authHeader, 'food_analysis');
```

This causes nutrition analysis to share the same rate limit counter as food analysis (20/min combined), when the spec intended them to have independent 20/min buckets. A user performing both food and nutrition analysis would hit the shared limit twice as fast as expected.

**Fix:** Change the category on line 15 from `'food_analysis'` to `'nutrition_analysis'`:

```typescript
const rateLimitCheck = await checkRateLimit(authHeader, 'nutrition_analysis');
```

The `nutrition_analysis` category is already defined in `RATE_LIMIT_CONFIG` with the correct limits.

## Triage

- Decision: `valid`
- Notes: Changed `'food_analysis'` to `'nutrition_analysis'` on line 15. The `nutrition_analysis` category was already defined in `RATE_LIMIT_CONFIG` with identical limits (20/min). Build passes, all 4 Cypress tests pass.
