---
status: resolved
file: data/gateways/NextApiPaymentGateway.ts
line: 35
severity: critical
author: claude-code
provider_ref:
---

# Issue 001: Missing Authorization Header in NextApiPaymentGateway

## Review Comment

The `createHostedSubscriptionCheckout` and `cancelSubscriptionAtPeriodEnd` methods in `NextApiPaymentGateway` make `fetch` calls to protected backend routes (`/api/billing/checkout` and `/api/billing/cancel`) without including the `Authorization` header.

Since these routes use `verifyAuth` to validate the user session, all requests from the client will fail with a `401 Unauthorized` error in any environment where `NEXT_PUBLIC_BACKEND_PROVIDER` is set to `supabase` or `firebase`.

Suggested fix:
Retrieve the current session token (e.g., using `supabase.auth.getSession()`) and include it in the headers:
```typescript
const { data: { session } } = await getSupabaseClient().auth.getSession();
const token = session?.access_token;

const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    },
    // ...
});
```

## Triage

- Decision: `VALID`
- Notes: The client gateway is indeed missing the authorization header required by the backend routes. I will implement the suggested fix by retrieving the session token from the Supabase client and adding the Bearer token to the fetch headers.

