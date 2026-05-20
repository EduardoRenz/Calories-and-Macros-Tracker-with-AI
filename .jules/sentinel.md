## 2025-05-14 - [Open Redirect in Auth and Payment flows]
**Vulnerability:** Open Redirect via `next` query param in auth callback and `successUrl`/`cancelUrl` in billing checkout.
**Learning:** External inputs were used directly in redirections without validation, allowing attackers to redirect users to malicious domains.
**Prevention:** Always validate that redirect targets are local paths (starting with `/`) and not protocol-relative (not starting with `//` or `/\`).
