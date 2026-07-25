---
status: resolved
file: data/infrastructure/RateLimitService.ts
line: 47
severity: low
author: claude-code
provider_ref:
---

# Issue 002: Dead code — cleanup branch after push is unreachable

## Review Comment

After `validTimestamps.push(now)` on line 45, `validTimestamps.length` is guaranteed to be >= 1. The cleanup check on lines 47-48:

```typescript
if (validTimestamps.length === 0) {
    this.requests.delete(key);
```

is unreachable dead code. The `delete` branch can never execute because the push on line 45 always makes the array non-empty. The cleanup intent from review-001 issue_002 was placed after the push instead of before it.

**Fix:** Remove the dead conditional and simplify to:

```typescript
validTimestamps.push(now);
this.requests.set(key, validTimestamps);
```

The denied path (line 38) is correct — `validTimestamps.length >= config.maxRequests` guarantees non-empty, so no cleanup is needed there either.

## Triage

- Decision: `valid`
- Notes: Removed dead `if (length === 0)` branch and simplified to direct `set()`. Build passes, lint clean, all 4 Cypress tests pass.
