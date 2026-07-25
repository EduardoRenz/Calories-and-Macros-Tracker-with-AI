---
status: resolved
file: data/infrastructure/RateLimitService.ts
line: 0
severity: low
author: claude-code
provider_ref:
---

# Issue 002: No unit tests for RateLimitService sliding window logic

## Review Comment

The TechSpec (Testing Approach section) specifies unit tests for `RateLimitService.check()` covering: within limit, at limit, over limit, expired window pruning, and memory cleanup. The only tests are Cypress E2E tests (`cypress/e2e/rate-limiting.cy.ts`) which verify the HTTP-level behavior (429 status, headers) but do not exercise the sliding window edge cases directly.

Missing test scenarios:
- Window expiry: timestamps older than `windowMs` are pruned, allowing new requests
- Unknown category: returns `allowed: true` with `Infinity` remaining
- Multiple users: user A's limit does not affect user B
- Boundary: request at exactly `maxRequests` is allowed, `maxRequests + 1` is denied

**Fix:** Add a unit test file (e.g., `__tests__/RateLimitService.test.ts`) that imports `RateLimitService` directly and tests the sliding window logic with `Date.now()` mocked or with short `windowMs` values for fast expiry tests.

## Triage

- Decision: `invalid`
- Notes: Project uses Cypress E2E only — no Jest/Vitest configured. No `*.test.ts` files exist, no test script in package.json. Adding a unit test framework is out of scope for this fix batch.
