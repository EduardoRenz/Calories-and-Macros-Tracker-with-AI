# Stripe Webhook Function

Public endpoint:

```text
https://<project-ref>.supabase.co/functions/v1/stripe-webhook
```

Required Supabase secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=...
supabase secrets set STRIPE_WEBHOOK_SECRET=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

Expected runtime variables:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: HMAC key used to validate the raw request body. (whsec_...)
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: service-role key used to persist inbound events.

Deployment:

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

Only this function has JWT verification disabled in `supabase/config.toml`.
