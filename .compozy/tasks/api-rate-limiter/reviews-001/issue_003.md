---
status: resolved
file: app/api/rate-limit.ts
line: 13
severity: medium
author: claude-code
provider_ref:
---

# Issue 003: No rate limit headers on successful responses

## Review Comment

The PRD states: "Every API response includes standard rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset." However, the current implementation only adds these headers when returning a 429 response. On successful requests (returns `null`), no headers are added. The TechSpec notes this as acceptable for MVP ("leave header addition to the caller for simplicity"), but the PRD requirement is unmet.

For Phase 2 (frontend quota display), these headers will be needed on success. Consider adding them now to avoid a breaking change later. The simplest approach: change `checkRateLimit` to return a result object with `{ response: NextResponse | null; headers: Record<string, string> }` so callers can merge headers into their success responses.

If deferring to Phase 2 is intentional, this should be documented as a known deviation from the PRD.

## Triage

- Decision: `valid`
- Notes: Deferred to Phase 2 as per TechSpec design. The TechSpec explicitly states "leave header addition to the caller for simplicity" for MVP. Added maxRequests to result type which enables future header addition without API change. Documented as known deviation from PRD.
