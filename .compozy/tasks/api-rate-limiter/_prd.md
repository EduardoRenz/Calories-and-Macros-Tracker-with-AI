# API Rate Limiter

## Overview

The application currently has no mechanism to limit how often users can make API requests. This leaves AI endpoints — especially the chatbot — exposed to abuse, DDoS attacks, and excessive AI token consumption. A rate limiter protects the backend by enforcing per-user request limits on all API routes, with configurable thresholds per endpoint category. The immediate priority is the chatbot, where a single user sending rapid requests can burn significant AI tokens with no cost control.

This feature affects all authenticated API consumers. The system identifies users via their Supabase user ID, which is the canonical identifier across all authentication methods (email, Google OAuth, Apple, SSO). Unauthenticated requests are not rate-limited — existing auth middleware already blocks them on protected routes.

## Goals

- Prevent abuse and DDoS attacks on AI endpoints by enforcing per-user request frequency limits
- Reduce AI token costs from excessive or malicious chatbot usage
- Provide configurable, per-endpoint rate limits that can be tuned without code changes
- Return clear, standard HTTP responses (429 with Retry-After) so clients can handle throttling gracefully
- Maintain low latency — rate limit checks must not introduce perceptible delay to legitimate users

## User Stories

### Primary: Authenticated User

- As a regular user, I want to use the chatbot and AI features at a reasonable pace without being blocked, so that the app remains responsive for everyone
- As a premium user, I want fair access to AI features without being affected by other users' abuse

### Primary: App Operator

- As the app operator, I want to set per-endpoint rate limits via a configuration file, so I can tune thresholds without redeploying code
- As the app operator, I want to receive clear 429 responses with retry information, so I can display helpful messages to users

### Secondary: Abusive User

- As a malicious actor, I want to flood the API with requests — but the system should prevent this and protect AI token budgets

## Core Features

### Per-Endpoint Rate Limit Configuration

A constants file defines maximum requests per minute for each endpoint category. Each category groups related endpoints (e.g., chatbot, food analysis, billing) with independent limits. Limits are tuned per-category based on AI cost sensitivity — chatbot has the tightest limits, billing has the most conservative.

### Sliding Window Request Tracking

The system tracks request timestamps per user per endpoint category within a sliding time window. On each request, expired entries are automatically pruned and the current count is compared against the configured limit. Memory usage stays bounded because old entries are cleaned on every hit.

### Rate Limit Response Headers

Every API response includes standard rate limit headers: `X-RateLimit-Limit` (max allowed), `X-RateLimit-Remaining` (requests left in window), and `X-RateLimit-Reset` (seconds until the window resets). This lets the frontend display quota information and implement client-side throttling.

### Standard 429 Rejection

When a user exceeds the limit, the endpoint returns HTTP 429 with a `Retry-After` header indicating how many seconds to wait. The frontend displays a user-friendly message explaining the limit and when to retry.

### Configurable Time Window

The base time window is 60 seconds, but individual endpoint categories can override this. The chatbot uses a 60-second window with a limit of 12 requests (equivalent to 1 request every 5 seconds). This flexibility avoids forcing all endpoints into the same time bucket.

## User Experience

### Normal Usage Flow

1. User sends a chat message or triggers an AI analysis
2. The rate limiter checks the user's request count for that endpoint category within the current window
3. Request is within limits — it proceeds normally, and response headers show remaining quota
4. User sees the remaining quota in the UI (optional, non-blocking)

### Rate-Limited Flow

1. User sends a request that exceeds the configured limit
2. The system returns HTTP 429 with a Retry-After header
3. The frontend detects the 429 and displays a friendly message: "You've made too many requests. Please wait X seconds before trying again."
4. After the retry period, the user can make requests again normally

### UI Feedback

The chatbot UI should show a brief notification when the user is rate-limited, including the wait time. Other AI endpoints (food analysis, image recognition) should display an inline error with the retry countdown. No persistent blocking or account-level惩罚 — the user simply waits a few seconds.

## High-Level Technical Constraints

- Rate limiting must not add perceptible latency to legitimate requests (target: <5ms overhead per check)
- The system must identify users by their Supabase user ID, which is the canonical identifier regardless of which authentication provider was used
- Rate limits must be configurable per endpoint category without requiring code changes
- Memory usage must be bounded — no unbounded growth of tracking data
- The solution must work within the existing Clean Architecture: agnostic services, repository pattern, singleton instances, factory-based instantiation

## Non-Goals (Out of Scope)

- **IP-based rate limiting** — not needed since all API routes already require authentication
- **Per-plan tier limits** (free vs premium) — deferred to a future phase when plan differentiation is needed
- **Persistent rate limiting across cold starts** — acceptable for current scale; Redis-backed upgrade is a future option
- **Rate limiting Supabase Edge Functions** — webhooks are out of scope; they are triggered by external services, not users
- **Bot detection or CAPTCHA** — separate concern from rate limiting
- **Rate limiting on the client side only** — server-side enforcement is the priority; client-side throttling is a nice-to-have

## Phased Rollout Plan

### MVP (Phase 1)

- Per-endpoint rate limit constants file with configurable limits per category
- In-memory sliding window service as a singleton
- Rate limit enforcement on all authenticated API routes (chat, food analysis, nutrition analysis, image recognition, billing)
- Standard 429 response with Retry-After header
- Rate limit headers on all responses (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- Frontend 429 error handling with user-friendly messages and retry guidance

**Success criteria:** Rate limiting is active on all endpoints, 429 responses are handled gracefully by the frontend, and no legitimate user complaints about being blocked during normal usage.

### Phase 2

- Frontend displays remaining quota in chatbot UI before hitting the limit
- Client-side pre-emptive throttling (disable send button when quota is low)
- Per-plan tier limits (free users get lower limits than premium)
- Monitoring/alerting when rate limits are frequently hit (potential abuse indicator)

**Success criteria:** Users can see their remaining quota, premium users get higher limits, and abuse patterns are visible in monitoring.

### Phase 3

- Redis-backed persistent rate limiting (if scale demands it)
- Rate limiting on unauthenticated routes (IP-based fallback)
- Adaptive limits based on endpoint cost (more expensive AI calls get tighter limits)
- Rate limit bypass mechanism for specific trusted users or admin accounts

**Success criteria:** Rate limiting is accurate across all deployment scenarios, costs are fully controlled per endpoint.

## Success Metrics

- **Abuse reduction:** Zero successful DDoS-style attacks on AI endpoints after implementation
- **Cost protection:** AI token consumption from any single user does not exceed budgeted thresholds per minute
- **Legitimate user impact:** <1% of legitimate requests receive 429 responses during normal usage
- **Latency overhead:** Rate limit check adds <5ms to average API response time
- **Operator control:** Rate limit changes are deployed via constants file update without code changes

## Risks and Mitigations

- **False positives on legitimate users:** Aggressive limits may block power users during normal workflows. Mitigation: conservative initial limits, frontend quota visibility, easy limit adjustment via constants file.
- **Cold-start limit bypass on serverless:** Vercel cold starts reset in-memory state, allowing brief limit bypass. Mitigation: acceptable at current scale; Redis upgrade available when needed.
- **User frustration from 429 errors:** Users may not understand why they are blocked. Mitigation: clear frontend messaging with retry countdown, non-punitive design (user just waits a few seconds).
- **Limits too generous for abuse:** If initial limits are too high, they may not adequately protect against token burn. Mitigation: start with conservative defaults (12/min for chatbot), tighten based on monitoring data.

## Architecture Decision Records

- [ADR-001: In-Memory Sliding Window Rate Limiter](adrs/adr-001.md) — Chose in-memory sliding window over Redis or hybrid approach for MVP

## Open Questions

- Should the rate limiter also protect the Supabase Edge Function webhook endpoints, or are those out of scope indefinitely?
- Is there a need for an admin dashboard to view rate limit metrics and adjust limits in production?
- Should premium users get higher rate limits in the MVP, or is that strictly Phase 2?
