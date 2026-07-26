---
status: resolved
file: app/api/rate-limit.ts
line: 25
severity: high
author: claude-code
provider_ref:
---

# Issue 001: X-RateLimit-Limit header returns wrong value on 429

## Review Comment

When a request is rate limited, `X-RateLimit-Limit` is set to `result.remaining + 1` (line 25). Since `remaining` is always 0 when `allowed` is false, this evaluates to `1` — which is incorrect. The `X-RateLimit-Limit` header should represent the maximum number of requests allowed in the window (e.g., 12 for chatbot), not `remaining + 1`.

**Fix:** The `RateLimitService.check()` method should return the configured `maxRequests` value in its result. Then `rate-limit.ts` can use `result.maxRequests` for the `X-RateLimit-Limit` header instead of `result.remaining + 1`.

In `RateLimitService.ts`, add `maxRequests: number` to the `RateLimitResult` interface and populate it from `config.maxRequests` in both the allowed and denied paths. Then in `rate-limit.ts` line 25, change to `'X-RateLimit-Limit': String(result.maxRequests)`.

Also affected: `data/infrastructure/RateLimitService.ts` (interface definition).

## Triage

- Decision: `valid`
- Notes: Added `maxRequests` to `RateLimitResult` interface, populated from `config.maxRequests` in both paths. Updated `rate-limit.ts` to use `result.maxRequests`.
