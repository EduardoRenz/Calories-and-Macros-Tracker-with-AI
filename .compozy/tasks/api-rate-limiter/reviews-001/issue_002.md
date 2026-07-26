---
status: resolved
file: data/infrastructure/RateLimitService.ts
line: 32
severity: medium
author: claude-code
provider_ref:
---

# Issue 002: Stale Map keys accumulate without cleanup

## Review Comment

In `RateLimitService.check()`, expired timestamps are filtered out (line 32), but when the resulting array becomes empty, the key itself is never removed from the Map. Over time, every unique user+category combination creates a permanent Map entry even after the user stops making requests. This is a memory leak for long-running processes.

**Fix:** After filtering, if `validTimestamps.length === 0`, delete the key from the Map instead of setting it:

```typescript
if (validTimestamps.length === 0) {
    this.requests.delete(key);
} else {
    this.requests.set(key, validTimestamps);
}
```

This applies to both the denied path (line 37) and the allowed path (line 45).

## Triage

- Decision: `valid`
- Notes: Added cleanup logic to delete Map keys when the timestamp array becomes empty after pruning.
