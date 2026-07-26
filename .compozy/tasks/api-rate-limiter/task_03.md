---
status: completed
title: Create checkRateLimit function
type: backend
complexity: medium
dependencies:
  - task_02
---

# Task 03: Create checkRateLimit function

## Overview
Create a thin `checkRateLimit()` function that integrates auth verification with the rate limiter service. This function follows the same `NextResponse | null` return pattern as `checkAiAccess`, making it a drop-in addition to any route handler. It extracts the user ID from the JWT via `verifyAuth`, calls `RateLimitService.check()`, and returns either a 429 response with headers or null.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `app/api/rate-limit.ts` following the pattern of `app/api/auth-middleware.ts`
- MUST export an async function `checkRateLimit(authHeader: string | null, category: string): Promise<NextResponse | null>`
- MUST call `verifyAuth(authHeader)` to get the user ID — throw on auth failure (propagate the error)
- MUST call `RateLimitService.getInstance().check(user.uid, category)` to evaluate the rate limit
- MUST return `null` when the request is allowed (after adding rate limit headers to a base response — OR leave header addition to the caller for simplicity)
- MUST return a `NextResponse` with status 429, `{ error: "Rate limit exceeded. Please wait X seconds before trying again." }` body, and `Retry-After` header when rate limited
- MUST add `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers to the 429 response
- MUST use the `@/` path alias for all imports
</requirements>

## Subtasks
- [ ] 3.1 Create `app/api/rate-limit.ts` file
- [ ] 3.2 Implement `checkRateLimit()` that calls `verifyAuth` then `RateLimitService.check()`
- [ ] 3.3 Build 429 NextResponse with error body, Retry-After header, and X-RateLimit-* headers
- [ ] 3.4 Return null when allowed (no headers on success — callers add their own response)
- [ ] 3.5 Verify TypeScript compiles without errors

## Implementation Details
This file lives in `app/api/` alongside `auth-middleware.ts` and `feature-flag-check.ts`. The function signature mirrors `checkAiAccess`: takes an auth header and a category string, returns `NextResponse | null`. On rate limit exceeded, build a NextResponse with status 429, JSON body with error message including the wait time in seconds, Retry-After header with seconds, and X-RateLimit-Limit/Remaining/Reset headers. On allowed, return null. Auth errors should propagate (throw) rather than being caught, matching how `checkAiAccess` handles auth failures in the `premium_only` path.

### Relevant Files
- `app/api/auth-middleware.ts` — pattern for auth header extraction and verifyAuth call
- `app/api/feature-flag-check.ts` — pattern for `NextResponse | null` return type
- `data/infrastructure/RateLimitService.ts` — service to call (created in task_02)

### Dependent Files
- `app/api/assistant/chat/route.ts` — will call `checkRateLimit` (task_04)
- `app/api/analyze-food/route.ts` — will call `checkRateLimit` (task_04)
- `app/api/analyze-nutrition/route.ts` — will call `checkRateLimit` (task_04)
- `app/api/recognize-image/route.ts` — will call `checkRateLimit` (task_04)
- `app/api/billing/checkout/route.ts` — will call `checkRateLimit` (task_05)
- `app/api/billing/cancel/route.ts` — will call `checkRateLimit` (task_05)
- `app/api/billing/checkout-status/route.ts` — will call `checkRateLimit` (task_05)

### Related ADRs
- [ADR-002: Inline Rate Limit Check in Route Handlers](../adrs/adr-002.md) — integration approach decision

## Deliverables
- `app/api/rate-limit.ts` with exported `checkRateLimit` function
- TypeScript compiles without errors
- All tests passing

## Tests
- Unit tests:
  - [ ] Valid auth + within limit returns `null`
  - [ ] Valid auth + over limit returns NextResponse with status 429
  - [ ] 429 response body contains `{ error: "..." }` with wait time
  - [ ] 429 response has `Retry-After` header with seconds value
  - [ ] 429 response has `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
  - [ ] Missing auth header throws error (propagated from verifyAuth)
  - [ ] Invalid token throws error (propagated from verifyAuth)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `checkRateLimit` follows the same `NextResponse | null` pattern as `checkAiAccess`
- 429 response includes all required headers (Retry-After, X-RateLimit-*)
- Auth errors propagate correctly (throw, not swallowed)
