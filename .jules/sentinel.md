## 2025-05-15 - [Open Redirect in Auth Callback]
**Vulnerability:** Unvalidated `next` query parameter in `app/auth/callback/page.tsx` allowed redirection to any external domain after authentication.
**Learning:** Auth callbacks that use client-side redirection based on URL parameters are high-risk entry points for Open Redirects.
**Prevention:** Always validate that redirect targets are relative URLs (start with a single `/`) and not protocol-relative (do not start with `//` or `/\`).
