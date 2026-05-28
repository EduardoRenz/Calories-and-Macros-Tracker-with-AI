# Sentinel's Security Journal 🛡️

## 2025-05-15 - Open Redirect in Auth Callbacks
**Vulnerability:** The authentication callback page (`/auth/callback`) was using a `next` query parameter directly in `router.push()` without validation. An attacker could craft a malicious link that redirects users to an external phishing site after successful authentication.
**Learning:** Redirect parameters from URLs should always be treated as untrusted input, especially in authentication flows.
**Prevention:** Use a validation utility to ensure redirect targets are internal relative paths (starting with a single `/` and not protocol-relative).

## 2025-05-15 - Reverse Tabnabbing in Footer Links
**Vulnerability:** Links with `target="_blank"` in the footer were missing `rel="noopener noreferrer"`. This could allow a destination site to gain partial access to the original page's `window.opener` object, potentially leading to phishing attacks.
**Learning:** All external links or links opening in new tabs should use proper relationship attributes for security.
**Prevention:** Always include `rel="noopener noreferrer"` when using `target="_blank"`.

## 2025-05-15 - Open Redirect in Billing Checkout
**Vulnerability:** The billing checkout API (`/api/billing/checkout`) accepted absolute URLs for `successUrl` and `cancelUrl` without validation. These were passed directly to payment gateways, allowing attackers to redirect users to malicious sites after the payment flow.
**Learning:** Payment flow redirections are as sensitive as authentication ones. Validating redirect targets on the server before passing them to third-party providers is essential.
**Prevention:** Force the use of relative paths for redirect parameters in API requests and validate them using `isValidRedirect` before resolving them to absolute URLs on the server.
