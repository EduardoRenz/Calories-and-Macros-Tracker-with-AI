# Sentinel's Security Journal 🛡️

## 2025-05-15 - Open Redirect in Auth Callbacks
**Vulnerability:** The authentication callback page (`/auth/callback`) was using a `next` query parameter directly in `router.push()` without validation. An attacker could craft a malicious link that redirects users to an external phishing site after successful authentication.
**Learning:** Redirect parameters from URLs should always be treated as untrusted input, especially in authentication flows.
**Prevention:** Use a validation utility to ensure redirect targets are internal relative paths (starting with a single `/` and not protocol-relative).

## 2025-05-15 - Reverse Tabnabbing in Footer Links
**Vulnerability:** Links with `target="_blank"` in the footer were missing `rel="noopener noreferrer"`. This could allow a destination site to gain partial access to the original page's `window.opener` object, potentially leading to phishing attacks.
**Learning:** All external links or links opening in new tabs should use proper relationship attributes for security.
**Prevention:** Always include `rel="noopener noreferrer"` when using `target="_blank"`.

## 2025-05-15 - Information Disclosure in Webhook Responses
**Vulnerability:** The AbacatePay webhook Supabase function was returning full error stack traces in the `detail` field of its 500 error response. This could leak internal file paths, dependency versions, and logic details to any caller.
**Learning:** Production error responses should never include stack traces or raw error messages. Log the full details server-side, but return a generic message like "Internal Server Error" to the client.
**Prevention:** Implement a standard error response utility that redacts sensitive details while ensuring they are captured in server-side logs.
