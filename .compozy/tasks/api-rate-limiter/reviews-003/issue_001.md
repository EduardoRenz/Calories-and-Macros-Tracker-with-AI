---
status: resolved
file: data/infrastructure/RateLimitService.ts
line: 49
severity: low
author: claude-code
provider_ref:
---

# Issue 001: Unreachable else branch in resetMs ternary

## Review Comment

After `validTimestamps.push(now)` on line 45, `validTimestamps.length` is always >= 1. The ternary on lines 49-51:

```typescript
const resetMs = validTimestamps.length > 0
    ? config.windowMs - (now - validTimestamps[0])
    : config.windowMs;
```

has an unreachable else branch (`config.windowMs`). Since length is guaranteed >= 1 after the push, the condition is always true.

**Fix:** Simplify to a direct calculation:

```typescript
const resetMs = config.windowMs - (now - validTimestamps[0]);
```

This is a minor code quality improvement — the dead else branch adds confusion without value.

## Triage

- Decision: `valid`
- Notes: Simplified ternary to direct calculation. Build passes, lint clean, all 4 Cypress tests pass.
