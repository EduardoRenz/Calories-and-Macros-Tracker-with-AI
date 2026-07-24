# TechSpec: API Rate Limiter

## Executive Summary

Implement an in-memory sliding window rate limiter as a singleton service, integrated inline into each API route handler. The service tracks request timestamps per user+endpoint category in a `Map<string, number[]>`, prunes expired entries on each hit, and enforces configurable per-category limits defined in a constants file. Rate limit check returns `NextResponse | null` following the same pattern as `checkAiAccess`, making integration into existing routes a 2-3 line addition per route.

**Primary trade-off:** In-memory storage is fast and dependency-free but loses state on Vercel cold starts. This is acceptable at current scale; Redis-backed upgrade is a future option when accuracy across instances becomes critical.

## System Architecture

### Component Overview

```
Route Handler
  │
  ├─ verifyAuth() → AuthenticatedUser { uid }
  │
  ├─ checkRateLimit(uid, category) → NextResponse | null
  │     │
  │     ├─ RateLimitService.getInstance()
  │     │     ├─ Map<string, number[]> (key → timestamps)
  │     │     ├─ RATE_LIMIT_CONFIG (constants)
  │     │     └─ prune expired → count → compare
  │     │
  │     └─ Returns 429 with Retry-After OR null
  │
  ├─ checkAiAccess(authHeader, feature) → NextResponse | null
  │
  └─ Service call → NextResponse
```

**Components:**
- `RateLimitService` — singleton, owns the in-memory Map, performs sliding window checks
- `RATE_LIMIT_CONFIG` — constants file defining per-category limits
- `checkRateLimit()` — thin function that resolves userId from auth, calls the service, and returns `NextResponse | null`
- Route handlers — each calls `checkRateLimit` with the appropriate category after auth

## Implementation Design

### Core Interfaces

**Rate limit configuration type:**

```typescript
interface RateLimitCategory {
  maxRequests: number;
  windowMs: number;
}

type RateLimitConfig = Record<string, RateLimitCategory>;
```

**RateLimitService singleton (core logic):**

```typescript
export class RateLimitService {
  private static instance: RateLimitService;
  private requests: Map<string, number[]>;

  private constructor() {
    this.requests = new Map();
  }

  static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  check(userId: string, category: string): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
  }
}
```

**checkRateLimit function (route-level integration):**

```typescript
export async function checkRateLimit(
  authHeader: string | null,
  category: string
): Promise<NextResponse | null>
```

Returns `NextResponse` (429) if rate limited, `null` if allowed. Internally calls `verifyAuth` to get the user ID, then delegates to `RateLimitService.check()`.

### Data Models

**In-memory storage structure:**

```typescript
// Key format: "{userId}:{category}"
// Value: array of request timestamps (Date.now()) within the sliding window
Map<string, number[]>
```

Example entries after 3 chatbot requests from user `abc123`:
```
"abc123:chatbot" → [1721740800000, 1721740801500, 1721740803000]
"abc123:food_analysis" → [1721740802000]
```

**Constants configuration:**

```typescript
// domain/constants/rateLimit.ts
export const RATE_LIMIT_CONFIG: RateLimitConfig = {
  chatbot: { maxRequests: 12, windowMs: 60_000 },
  food_analysis: { maxRequests: 20, windowMs: 60_000 },
  nutrition_analysis: { maxRequests: 20, windowMs: 60_000 },
  image_recognition: { maxRequests: 20, windowMs: 60_000 },
  billing: { maxRequests: 10, windowMs: 60_000 },
};
```

**Rate limit response shape (on rejection):**

```json
{
  "error": "Rate limit exceeded. Please wait 12 seconds before trying again."
}
```

**Response headers (on success):**

```
X-RateLimit-Limit: 12
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 45
```

### API Endpoints

No new endpoints are created. Rate limiting is applied to existing endpoints:

| Route | Method | Category | Limit |
|-------|--------|----------|-------|
| `/api/assistant/chat` | POST | `chatbot` | 12/min |
| `/api/analyze-food` | POST | `food_analysis` | 20/min |
| `/api/analyze-nutrition` | POST | `nutrition_analysis` | 20/min |
| `/api/recognize-image` | POST | `image_recognition` | 20/min |
| `/api/billing/checkout` | POST | `billing` | 10/min |
| `/api/billing/cancel` | POST | `billing` | 10/min |
| `/api/billing/checkout-status` | GET | `billing` | 10/min |

**Rate-limited response format:**

```json
HTTP/1.1 429 Too Many Requests
Retry-After: 12
X-RateLimit-Limit: 12
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 12

{
  "error": "Rate limit exceeded. Please wait 12 seconds before trying again."
}
```

## Integration Points

### Auth System

- `verifyAuth(authHeader)` returns `AuthenticatedUser { uid, email? }`
- Rate limiter uses `uid` as the user identifier key
- Auth is called within `checkRateLimit` — each route does not need to pass the userId separately

### Existing Access Control

- Rate limit check runs after `verifyAuth` but before `checkAiAccess` in the route handler flow
- Both functions follow the same `NextResponse | null` short-circuit pattern
- No interaction between rate limit and feature flag checks — they are independent gates

### Frontend Error Handling

- 429 responses use the same `{ error: string }` JSON shape as other error responses
- Frontend already handles error responses generically — 429 will display the error message
- `Retry-After` header is available for client-side countdown implementation (Phase 2)

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|---------------------|-----------------|
| `app/api/assistant/chat/route.ts` | modified | Add rate limit check after auth | Add 2-3 lines |
| `app/api/analyze-food/route.ts` | modified | Add rate limit check after auth | Add 2-3 lines |
| `app/api/analyze-nutrition/route.ts` | modified | Add rate limit check after auth | Add 2-3 lines |
| `app/api/recognize-image/route.ts` | modified | Add rate limit check after auth | Add 2-3 lines |
| `app/api/billing/checkout/route.ts` | modified | Add rate limit check after auth | Add 2-3 lines |
| `app/api/billing/cancel/route.ts` | modified | Add rate limit check after auth | Add 2-3 lines |
| `app/api/billing/checkout-status/route.ts` | modified | Add rate limit check after auth | Add 2-3 lines |
| `domain/constants/rateLimit.ts` | new | Rate limit configuration constants | Create file |
| `data/infrastructure/RateLimitService.ts` | new | Singleton rate limiter service | Create file |
| `app/api/rate-limit.ts` | new | checkRateLimit function (like auth-middleware.ts) | Create file |

## Testing Approach

### Unit Tests

- **RateLimitService.check()**: Test sliding window logic — within limit, at limit, over limit, expired window pruning
- **RateLimitService.check()**: Test memory cleanup — expired entries removed, Map doesn't grow unbounded
- **checkRateLimit()**: Test auth integration — valid token returns null or 429, invalid token throws
- **RATE_LIMIT_CONFIG**: Test that all defined categories have valid values (maxRequests > 0, windowMs > 0)
- Mock: `verifyAuth` for unit tests of checkRateLimit; no external service mocks needed

### Integration Tests

- **Route handler flow**: Verify that a request within limits proceeds, and a request over limits returns 429
- **Headers present**: Verify X-RateLimit-* headers on successful responses
- **Retry-After present**: Verify Retry-After header on 429 responses
- Environment: Use `pnpm dev:mock` with mock auth (all requests from `mock-user-id`)

## Development Sequencing

### Build Order

1. **Create `domain/constants/rateLimit.ts`** — no dependencies, defines configuration
2. **Create `data/infrastructure/RateLimitService.ts`** — depends on step 1 (reads config), implements core sliding window logic
3. **Create `app/api/rate-limit.ts`** — depends on steps 1-2, implements `checkRateLimit()` function using `verifyAuth` and `RateLimitService`
4. **Modify AI route handlers** (chat, food, nutrition, image) — depends on step 3, add `checkRateLimit` call to each route
5. **Modify billing route handlers** (checkout, cancel, checkout-status) — depends on step 3, add `checkRateLimit` call to each route
6. **Write unit tests for RateLimitService** — depends on step 2
7. **Write integration tests for rate-limited routes** — depends on steps 4-5

### Technical Dependencies

- No new npm packages required
- `verifyAuth` from `app/api/auth-middleware.ts` is reused (no changes needed)
- TypeScript types are self-contained within the new files

## Monitoring and Observability

### Key Metrics

- Rate limit hit count per category (log on 429)
- Active user count in the Map (log periodically or on high memory)
- Pruning efficiency (expired entries removed per check)

### Log Events

```
[RateLimit] 429 for user={uid} category={cat} remaining={n} reset={ms}
[RateLimit] Pruned {n} expired entries, {m} active keys
```

### Alerting

- No alerting in MVP — manual log monitoring
- Phase 2: Alert if >5% of requests receive 429 (potential abuse or limit too tight)

## Technical Considerations

### Key Decisions

- **Decision:** Use `Map<string, number[]>` for storage
- **Rationale:** Simple, direct, aligns with `ServiceCooldownManager` patterns. Timestamp array enables true sliding window.
- **Trade-offs:** O(n) prune per request where n = requests in window. Acceptable for n ≤ 60 per minute per user.
- **Alternatives rejected:** Fixed window counter (less accurate, allows burst at boundary), Redis (premature for current scale)

- **Decision:** `checkRateLimit` calls `verifyAuth` internally
- **Rationale:** Avoids requiring each route to extract userId and pass it. Consistent with `checkPremiumAccess` which also calls `verifyAuth` internally.
- **Trade-offs:** Auth is verified twice in some routes (once in `checkRateLimit`, once in `checkAiAccess`). This is negligible overhead (JWT parsing, not a network call in most cases).
- **Alternatives rejected:** Pass userId from route handler (requires each route to manage auth state)

### Known Risks

- **Cold-start bypass:** Vercel cold starts reset the Map. Likelihood: medium (every deploy). Mitigation: acceptable at current scale; Redis upgrade path exists.
- **Memory growth with many users:** Each active user contributes one Map entry per category used. Mitigation: aggressive pruning on every check; Map size bounded by active users × categories.
- **Double auth verification:** `checkRateLimit` and `checkAiAccess` both call `verifyAuth`. Mitigation: auth verification is fast (JWT parse + cached Supabase/Firebase lookup); acceptable overhead.

## Architecture Decision Records

- [ADR-001: In-Memory Sliding Window Rate Limiter](adrs/adr-001.md) — Chose in-memory sliding window over Redis or hybrid approach for MVP
- [ADR-002: Inline Rate Limit Check in Route Handlers](adrs/adr-002.md) — Chose inline route handler integration over middleware or HOF wrapper
