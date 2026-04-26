---
status: resolved
file: supabase/functions/abacatepay-webhook/processor.ts
line: 208
severity: medium
author: claude-code
provider_ref:
---

# Issue 004: Transaction ID collision risk in handleCheckoutTransactionEvent

## Review Comment

In the `handleCheckoutTransactionEvent` method, the `provider_transaction_id` is generated as:
`providerTransactionId: tx_${data.id}_${type}` (line 208).

Here, `data.id` is the AbacatePay checkout/bill ID and `type` is the transaction type (e.g., 'refund'). If a single checkout undergoes multiple events of the same type (for example, two partial refunds), they will both attempt to use the same `provider_transaction_id`.

Because the `billing_transactions` table has a `unique (provider, provider_transaction_id)` constraint, the second event will either overwrite the first one (due to `upsert`) or fail, leading to an incomplete financial history.

Suggested fix:
Include a more unique identifier in the `provider_transaction_id`, such as the provider's event ID or a timestamp:
```typescript
providerTransactionId: `tx_${data.id}_${type}_${Date.now()}`
```
Or ideally, if the provider payload includes a specific transaction/refund ID, use that.

## Triage

- Decision: `VALID`
- Notes: The risk of ID collision for multiple events of the same type on the same checkout is real. I will add a timestamp to the generated ID to ensure uniqueness.

