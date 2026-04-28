# AbacatePay Webhook Function

Public endpoint:

```text
https://<project-ref>.supabase.co/functions/v1/abacatepay-webhook
```

Required Supabase secrets:

```bash
supabase secrets set ABACATE_PAY_WEBHOOK_SECRET=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

Expected runtime variables:

- `ABACATE_PAY_WEBHOOK_SECRET`: HMAC key used to validate the raw request body.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: service-role key used to persist inbound events.

Deployment:

```bash
supabase functions deploy abacatepay-webhook --no-verify-jwt
```

Only this function has JWT verification disabled in `supabase/config.toml`.
