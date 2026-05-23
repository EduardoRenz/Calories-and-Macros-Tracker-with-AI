## 2025-05-23 - Open Redirect Protection in Auth Callback
**Vulnerability:** Open Redirect via `next` query parameter in `app/auth/callback/page.tsx`.
**Learning:** Redirect parameters from URL query strings should always be validated to ensure they are internal paths to prevent phishing attacks.
**Prevention:** Use a centralized `isValidRedirect` utility to verify that redirect URLs start with a single `/` and are not protocol-relative (e.g., avoiding `//` or `/\` bypasses).
