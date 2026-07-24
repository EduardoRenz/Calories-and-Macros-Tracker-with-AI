---
status: pending
title: Integrate rate limiting into AI routes
type: backend
complexity: medium
dependencies:
  - task_03
---

# Task 04: Integrate rate limiting into AI routes

## Overview
Add the `checkRateLimit` call to all 4 AI-powered API route handlers: chat, food analysis, nutrition analysis, and image recognition. Each route already follows the same pattern (auth → feature access → service call), so the rate limit check slots in after auth/feature access with a 2-3 line addition per route.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `import { checkRateLimit } from '../rate-limit'` (or correct relative path) to each route file
- MUST call `const rateLimitCheck = await checkRateLimit(authHeader, 'category'); if (rateLimitCheck) return rateLimitCheck;` in each route handler
- MUST place the rate limit check after `checkAiAccess` returns null (or after `verifyAuth` for routes that don't use `checkAiAccess`)
- MUST use the correct category string for each route: `chatbot` for assistant/chat, `food_analysis` for analyze-food and analyze-nutrition, `image_recognition` for recognize-image
- MUST NOT modify any existing business logic — only add the rate limit check lines
- MUST ensure the existing error handling (try/catch) still works correctly
</requirements>

## Subtasks
- [ ] 4.1 Add rate limit check to `app/api/assistant/chat/route.ts` with category `chatbot`
- [ ] 4.2 Add rate limit check to `app/api/analyze-food/route.ts` with category `food_analysis`
- [ ] 4.3 Add rate limit check to `app/api/analyze-nutrition/route.ts` with category `food_analysis`
- [ ] 4.4 Add rate limit check to `app/api/recognize-image/route.ts` with category `image_recognition`
- [ ] 4.5 Verify all 4 routes compile without errors

## Implementation Details
Each AI route follows the same pattern. The rate limit check goes after `checkAiAccess` (which handles auth + feature flags). Since `checkAiAccess` already calls `verifyAuth` internally, and `checkRateLimit` also calls `verifyAuth`, there will be a double auth verification. This is acceptable per the TechSpec — auth verification is fast (JWT parsing, not a network call). The import path from each route to `rate-limit.ts` is `../rate-limit` for top-level routes or `../../rate-limit` for nested routes.

### Relevant Files
- `app/api/assistant/chat/route.ts` — add rate limit check after checkAiAccess
- `app/api/analyze-food/route.ts` — add rate limit check after checkAiAccess
- `app/api/analyze-nutrition/route.ts` — add rate limit check after checkAiAccess
- `app/api/recognize-image/route.ts` — add rate limit check after checkAiAccess
- `app/api/rate-limit.ts` — function to import (created in task_03)

### Dependent Files
- None — this task only modifies existing route files

### Related ADRs
- [ADR-002: Inline Rate Limit Check in Route Handlers](../adrs/adr-002.md) — integration pattern

## Deliverables
- 4 modified route handler files with rate limit check added
- TypeScript compiles without errors
- All tests passing

## Tests
- Unit tests:
  - [ ] Each route file imports `checkRateLimit` without errors
  - [ ] Rate limit check is placed after `checkAiAccess` in each route
  - [ ] Correct category string is passed for each route
- Integration tests:
  - [ ] POST /api/assistant/chat returns 429 when rate limit exceeded
  - [ ] POST /api/analyze-food returns 429 when rate limit exceeded
  - [ ] POST /api/analyze-nutrition returns 429 when rate limit exceeded
  - [ ] POST /api/recognize-image returns 429 when rate limit exceeded
  - [ ] All 4 routes return normal responses when within rate limit
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- All 4 AI routes have rate limit checks in the correct position
- Correct category strings used for each route
- No existing business logic modified
- TypeScript compiles without errors for all 4 files
