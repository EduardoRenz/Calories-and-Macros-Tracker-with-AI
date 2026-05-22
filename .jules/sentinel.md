## 2025-05-15 - Open Redirect in Auth Callback
**Vulnerability:** The `next` query parameter in the authentication callback was used directly in `router.push()` without validation. An attacker could craft a login link that redirects the user to a malicious external site after successful authentication.
**Learning:** Redirect parameters are common targets for phishing attacks. Even in frameworks like Next.js, `router.push()` will happily navigate to any string provided, including external URLs.
**Prevention:** Always validate user-provided redirect targets. Implement a utility that ensures the URL starts with a single `/` and is not protocol-relative (e.g., `//evil.com` or `/\evil.com`).
