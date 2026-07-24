---
status: pending
title: Cypress E2E test for rate limiting
type: test
complexity: medium
dependencies:
  - task_04
  - task_05
---

# Task 06: Cypress E2E test for rate limiting

## Overview
Create Cypress E2E tests that verify the rate limiter works correctly in the running application. Since the project uses mock auth (`pnpm dev:mock`) with a fixed `mock-user-id`, all requests from the same session share one rate limit counter. The tests send rapid requests to an AI endpoint and verify that 429 responses are received when the limit is exceeded, and that requests succeed again after the window expires.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create a new Cypress test file in `cypress/e2e/` following the existing test pattern
- MUST use `cy.login()` and other existing custom commands from `cypress/support/commands.ts`
- MUST test that rapid requests to an AI endpoint (e.g., chatbot) trigger 429 responses
- MUST test that the 429 response contains an error message
- MUST test that requests succeed again after waiting for the rate limit window to reset
- MUST run tests with `pnpm cy:run` using mock backend (`NEXT_PUBLIC_BACKEND_PROVIDER=mock`)
- SHOULD test at least one AI endpoint and one billing endpoint
</requirements>

## Subtasks
- [ ] 6.1 Create `cypress/e2e/rate-limiting.cy.ts` with test structure
- [ ] 6.2 Implement test: rapid requests to chatbot endpoint trigger 429
- [ ] 6.3 Implement test: 429 response body contains error message
- [ ] 6.4 Implement test: requests succeed after waiting for window reset
- [ ] 6.5 Implement test: different endpoints have independent rate limits
- [ ] 6.6 Run tests with `pnpm cy:run` and verify they pass

## Implementation Details
The mock auth returns a fixed `mock-user-id` for all requests, so all requests in a test session share one rate limit counter. To trigger 429, send `maxRequests + 1` requests within the window. For the chatbot category (12/min), sending 13 rapid POST requests to `/api/assistant/chat` should result in the last one returning 429. Use `cy.request()` for direct API calls rather than UI interactions to keep tests fast and focused. The test file follows the pattern of existing E2E tests in `cypress/e2e/`.

### Relevant Files
- `cypress/e2e/ai-access-control.cy.ts` — existing test pattern to follow
- `cypress/support/commands.ts` — custom commands (cy.login, etc.)
- `cypress/tsconfig.json` — TypeScript config for Cypress tests

### Dependent Files
- `app/api/assistant/chat/route.ts` — endpoint under test (modified in task_04)
- `app/api/billing/checkout/route.ts` — endpoint under test (modified in task_05)

### Related ADRs
- [ADR-001: In-Memory Sliding Window Rate Limiter](../adrs/adr-001.md) — algorithm being tested

## Deliverables
- `cypress/e2e/rate-limiting.cy.ts` with E2E tests
- Tests pass with `pnpm cy:run`
- All tests passing

## Tests
- Integration tests:
  - [ ] 13 rapid POST requests to /api/assistant/chat result in at least one 429 response
  - [ ] 429 response body contains `{ error: "..." }` with wait time message
  - [ ] After waiting for window reset, requests succeed again
  - [ ] Rate limit on chatbot does not affect food_analysis endpoint (independent counters)
  - [ ] Billing endpoints have independent rate limits from AI endpoints
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Cypress tests verify 429 behavior, error message, and window reset
- Tests run successfully with `pnpm cy:run`
- Tests follow existing Cypress test patterns in the project
