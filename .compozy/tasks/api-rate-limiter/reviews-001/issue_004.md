---
status: resolved
file: cypress/e2e/rate-limiting.cy.ts
line: 11
severity: medium
author: claude-code
provider_ref:
---

# Issue 004: Cypress tests may fail due to incorrect auth token retrieval

## Review Comment

The Cypress tests retrieve the auth token via `window.localStorage.getItem('mock_token')` (lines 11, 36, 68, 98). However, the mock auth flow (`MockAuthRepository`) may store the token in a cookie or sessionStorage rather than localStorage. If the token is not at the `mock_token` key in localStorage, the `Authorization` header will be `Bearer mock-token` (the fallback), which may not pass `verifyAuth` validation.

**Fix:** Verify how `MockAuthRepository` stores the auth token and use the correct retrieval method. Check `cypress/support/commands.ts` — the `login` command navigates to `/login` and clicks "Sign in with Google", which triggers the mock auth flow. The token storage location should match what the tests expect.

If the mock token is indeed in localStorage but under a different key, update the key name. If it's in a cookie, use `cy.getCookie()` instead.

## Triage

- Decision: `invalid`
- Notes: MockAuthVerifier (AuthVerifier.ts:54-59) ignores the token entirely and always returns `{ uid: 'mock-user-id' }`. Any token string works in mock mode. The `Bearer mock-token` fallback is sufficient. Simplified tests to use a constant token.
