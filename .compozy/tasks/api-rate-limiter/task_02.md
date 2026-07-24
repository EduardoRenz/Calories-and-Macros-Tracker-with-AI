---
status: pending
title: Create RateLimitService singleton
type: backend
complexity: medium
dependencies:
  - task_01
---

# Task 02: Create RateLimitService singleton

## Overview
Create a singleton service that implements the sliding window rate limiting algorithm. The service stores request timestamps per user+endpoint category in a `Map<string, number[]>`, prunes expired entries on each hit, and compares the current count against configurable limits from the constants file. This is the core engine of the rate limiter — all other components depend on it.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `data/infrastructure/RateLimitService.ts` as a singleton following the `ServiceCooldownManager` pattern (private constructor, static `getInstance()`)
- MUST use `Map<string, number[]>` for storage where key is `"{userId}:{category}"` and value is an array of `Date.now()` timestamps
- MUST implement a `check(userId: string, category: string)` method that returns `{ allowed: boolean; remaining: number; resetMs: number }`
- MUST prune expired timestamps (older than `windowMs`) from the array before counting on every `check()` call
- MUST read limits from `RATE_LIMIT_CONFIG` imported from `@/domain/constants/rateLimit`
- MUST NOT let the Map grow unbounded — expired entries for inactive users should eventually be cleaned (acceptable to clean on access only for MVP)
- SHOULD log rate limit rejections with user ID and category for observability
</requirements>

## Subtasks
- [ ] 2.1 Create `data/infrastructure/RateLimitService.ts` with singleton pattern
- [ ] 2.2 Implement `check()` method with sliding window logic: prune expired, count remaining, compare to limit
- [ ] 2.3 Implement return type with `allowed`, `remaining`, and `resetMs` fields
- [ ] 2.4 Add console logging for 429 rejections
- [ ] 2.5 Verify TypeScript compiles without errors

## Implementation Details
Follow the `ServiceCooldownManager` singleton pattern exactly. The `check()` method should: (1) build the key as `${userId}:${category}`, (2) get the config for the category from `RATE_LIMIT_CONFIG`, (3) filter the timestamp array to remove entries older than `windowMs`, (4) compare the filtered count to `maxRequests`, (5) if allowed, push `Date.now()` to the array and return `{ allowed: true, remaining: maxRequests - count, resetMs: windowMs - (now - oldest) }`, (6) if not allowed, return `{ allowed: false, remaining: 0, resetMs: windowMs - (now - oldest) }`.

### Relevant Files
- `data/infrastructure/ServiceCooldownManager.ts` — singleton pattern to follow
- `domain/constants/rateLimit.ts` — configuration to import (created in task_01)

### Dependent Files
- `app/api/rate-limit.ts` — will call `RateLimitService.getInstance().check()` (task_03)

### Related ADRs
- [ADR-001: In-Memory Sliding Window Rate Limiter](../adrs/adr-001.md) — core algorithm decision

## Deliverables
- `data/infrastructure/RateLimitService.ts` with singleton, sliding window check, and logging
- TypeScript compiles without errors
- All tests passing

## Tests
- Unit tests:
  - [ ] Happy path: request within limit returns `{ allowed: true, remaining: N }`
  - [ ] At limit: request at exact limit returns `{ allowed: true, remaining: 0 }`
  - [ ] Over limit: request beyond limit returns `{ allowed: false, remaining: 0, resetMs: >0 }`
  - [ ] Expired window: old timestamps are pruned and new requests are allowed again
  - [ ] Multiple users: different users have independent counters
  - [ ] Multiple categories: same user in different categories have independent counters
  - [ ] Singleton: `getInstance()` returns the same instance on multiple calls
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `RateLimitService` is a proper singleton with private constructor
- Sliding window correctly prunes expired timestamps
- `check()` returns correct `allowed`, `remaining`, and `resetMs` values
- 429 rejections are logged with user ID and category
