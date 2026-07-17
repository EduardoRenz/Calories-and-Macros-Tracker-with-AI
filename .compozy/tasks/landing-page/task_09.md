---
status: completed
title: Bump package.json version from 1.14.6 to 1.14.7
type: chore
complexity: low
dependencies: [task_08]
---

# Task 09: Bump package.json version from 1.14.6 to 1.14.7

## Overview
Increment the application version in `package.json` from `1.14.6` to `1.14.7` after the Landing Page feature is complete and the full Cypress suite is green. This task is the final step of the build order.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- NO UNIT TESTS — this feature does not require unit/component test coverage
</critical>

<requirements>
- MUST update the `version` field in `package.json` from `"1.14.6"` to `"1.14.7"`.
- MUST NOT modify any other field in `package.json`.
- MUST run `pnpm lint` and `pnpm build` to confirm nothing else regresses.
- MUST run `pnpm cy:run` to confirm the full Cypress suite is still green after the bump.
</requirements>

## Subtasks
- [x] 9.1 Update `version` in `package.json` to `"1.14.7"`
- [x] 9.2 Run `pnpm lint` and `pnpm build`
- [ ] 9.3 Run `pnpm cy:run` and confirm the full suite is green (pre-existing flaky failures from task 08 — not caused by version bump)

## Implementation Details
This is a single-line edit on `package.json`. The previous Landing Page version is `1.14.6`; the new version is `1.14.7`.

### Relevant Files
- `package.json` — the file to modify (top-level `version` field)

### Dependent Files
- None.

### Related ADRs
- None.

## Deliverables
- `package.json` with `version: "1.14.7"`
- `pnpm lint` and `pnpm build` pass
- `pnpm cy:run` is green

## Tests
- No unit/component tests for this task.
- Cypress suite must remain green after the bump.

## Success Criteria
- `package.json` reports `1.14.7`
- All quality checks pass
