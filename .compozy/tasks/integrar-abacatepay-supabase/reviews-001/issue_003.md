---
status: resolved
file: supabase/functions/abacatepay-webhook/processor.ts
line: 71
severity: medium
author: claude-code
provider_ref:
---

# Issue 003: Potential syntax issue in onConflict parameter

## Review Comment

Several `upsert` calls in `processor.ts` (lines 71, 90, 176, 263) use the `onConflict` option with spaces between column names, for example: `{ onConflict: 'user_id, provider' }`.

In many versions of the Supabase client and the underlying PostgREST API, spaces within the `onConflict` string can lead to parsing errors or cause the conflict resolution to fail silently, potentially resulting in duplicate records or primary key violations.

Suggested fix:
Remove the space after the comma in all `onConflict` strings:
```typescript
.upsert({ ... }, { onConflict: 'user_id,provider' })
```

Affected lines: 71, 90, 176, 263.

## Triage

- Decision: `VALID`
- Notes: The use of spaces in the `onConflict` parameter is indeed risky and unconventional for the Supabase client. I will remove the spaces to ensure consistent behavior.

