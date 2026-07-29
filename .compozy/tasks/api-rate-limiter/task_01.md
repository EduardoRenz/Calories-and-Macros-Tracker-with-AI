---
status: completed
title: Create rate limit constants
type: backend
complexity: low
dependencies: []
---

# Task 01: Create rate limit constants

## Overview
Create a constants file that defines per-endpoint rate limit configuration. Each endpoint category (chatbot, food_analysis, billing, etc.) gets a max request count and time window in milliseconds. This file is the single source of truth for all rate limit thresholds and must be modifiable without code changes to the rate limiter service itself.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `domain/constants/rateLimit.ts` following the pattern of existing constants files (`billing.ts`, `foodCategories.ts`)
- MUST define a `RateLimitCategory` interface with `maxRequests: number` and `windowMs: number`
- MUST define a `RateLimitConfig` type as `Record<string, RateLimitCategory>`
- MUST export a `RATE_LIMIT_CONFIG` constant with entries for: `chatbot` (12 req/60s), `food_analysis` (20 req/60s), `nutrition_analysis` (20 req/60s), `image_recognition` (20 req/60s), `billing` (10 req/60s)
- MUST use the `@/` path alias for imports if any are needed
- SHOULD follow the existing constants pattern: named exports, no default exports
</requirements>

## Subtasks
- [ ] 1.1 Create `domain/constants/rateLimit.ts` file
- [ ] 1.2 Define `RateLimitCategory` interface and `RateLimitConfig` type
- [ ] 1.3 Export `RATE_LIMIT_CONFIG` with all endpoint categories and their limits
- [ ] 1.4 Verify TypeScript compiles without errors

## Implementation Details
Create a new file in `domain/constants/` following the existing pattern. The file exports types and a configuration object. No external dependencies needed. Reference the TechSpec "Data Models" section for the exact configuration values.

### Relevant Files
- `domain/constants/billing.ts` — existing constants pattern to follow
- `domain/constants/foodCategories.ts` — existing constants pattern with types

### Dependent Files
- `data/infrastructure/RateLimitService.ts` — will import `RATE_LIMIT_CONFIG` (task_02)

### Related ADRs
- [ADR-001: In-Memory Sliding Window Rate Limiter](../adrs/adr-001.md) — defines the configurable per-endpoint limits

## Deliverables
- `domain/constants/rateLimit.ts` with types and `RATE_LIMIT_CONFIG` constant
- TypeScript compiles without errors
- All tests passing

## Tests
- Unit tests:
  - [ ] `RATE_LIMIT_CONFIG` contains all required categories (chatbot, food_analysis, nutrition_analysis, image_recognition, billing)
  - [ ] Each category has `maxRequests > 0` and `windowMs > 0`
  - [ ] `chatbot` category has `maxRequests: 12` and `windowMs: 60_000`
  - [ ] Types are properly exported and usable
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `RATE_LIMIT_CONFIG` exported with correct values for all 5 categories
- TypeScript types (`RateLimitCategory`, `RateLimitConfig`) exported
- File follows existing constants pattern in `domain/constants/`
