---
status: pending
title: Integrate rate limiting into billing routes
type: backend
complexity: medium
dependencies:
  - task_03
---

# Task 05: Integrate rate limiting into billing routes

## Overview
Add the `checkRateLimit` call to all 3 billing API route handlers: checkout, cancel, and checkout-status. These routes use `verifyAuth` directly (not `checkAiAccess`), so the rate limit check goes right after auth verification. The billing category has a tighter limit (10/min) to protect payment operations from abuse.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `import { checkRateLimit } from '../../rate-limit'` (or correct relative path) to each billing route file
- MUST call `const rateLimitCheck = await checkRateLimit(request.headers.get('authorization'), 'billing'); if (rateLimitCheck) return rateLimitCheck;` in each route handler
- MUST place the rate limit check after `verifyAuth` returns successfully
- MUST use category string `billing` for all 3 billing routes
- MUST NOT modify any existing business logic — only add the rate limit check lines
- MUST ensure the existing error handling (try/catch) still works correctly
</requirements>

## Subtasks
- [ ] 5.1 Add rate limit check to `app/api/billing/checkout/route.ts` with category `billing`
- [ ] 5.2 Add rate limit check to `app/api/billing/cancel/route.ts` with category `billing`
- [ ] 5.3 Add rate limit check to `app/api/billing/checkout-status/route.ts` with category `billing`
- [ ] 5.4 Verify all 3 routes compile without errors

## Implementation Details
Billing routes use `verifyAuth` directly (not `checkAiAccess`). The rate limit check goes after `verifyAuth` succeeds. The import path from billing routes to `rate-limit.ts` is `../../rate-limit` (two levels up from `billing/checkout/`). Note that `checkRateLimit` also calls `verifyAuth` internally, so auth will be verified twice per request. This is acceptable per the TechSpec.

### Relevant Files
- `app/api/billing/checkout/route.ts` — add rate limit check after verifyAuth
- `app/api/billing/cancel/route.ts` — add rate limit check after verifyAuth
- `app/api/billing/checkout-status/route.ts` — add rate limit check after verifyAuth
- `app/api/rate-limit.ts` — function to import (created in task_03)

### Dependent Files
- None — this task only modifies existing route files

### Related ADRs
- [ADR-002: Inline Rate Limit Check in Route Handlers](../adrs/adr-002.md) — integration pattern

## Deliverables
- 3 modified route handler files with rate limit check added
- TypeScript compiles without errors
- All tests passing

## Tests
- Unit tests:
  - [ ] Each billing route file imports `checkRateLimit` without errors
  - [ ] Rate limit check is placed after `verifyAuth` in each route
  - [ ] Category string `billing` is used in all 3 routes
- Integration tests:
  - [ ] POST /api/billing/checkout returns 429 when rate limit exceeded
  - [ ] POST /api/billing/cancel returns 429 when rate limit exceeded
  - [ ] GET /api/billing/checkout-status returns 429 when rate limit exceeded
  - [ ] All 3 routes return normal responses when within rate limit
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- All 3 billing routes have rate limit checks in the correct position
- Category string `billing` used consistently
- No existing business logic modified
- TypeScript compiles without errors for all 3 files
