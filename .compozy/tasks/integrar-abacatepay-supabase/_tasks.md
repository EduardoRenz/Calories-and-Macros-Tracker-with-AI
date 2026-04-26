# Integrar AbacatePay Supabase — Task List

## Tasks

| # | Title | Status | Complexity | Dependencies |
|---|-------|--------|------------|--------------|
| 01 | Create Dedicated Billing SQL For Subscriptions | completed | medium | — |
| 02 | Add Canonical Plan Mapping Read Path | completed | medium | task_01 |
| 03 | Rebuild Billing Provider Adapter And App Routes | completed | high | task_01, task_02 |
| 04 | Implement Supabase Webhook Function And Event Processing | completed | critical | task_01 |
| 05 | Apply Subscription State Transitions And Transaction Persistence | completed | high | task_04 |
| 06 | Update Subscription Read Model And Billing History Access | completed | medium | task_01, task_05 |
| 07 | Replace Checkout UI With Hosted Billing Launch Flow | completed | medium | task_03, task_06 |
| 08 | Add Manage Subscription And Financial History Surfaces | completed | high | task_06, task_07 |
| 09 | Add Billing Observability, Fixtures, And Final Verification Coverage | completed | medium | task_03, task_04, task_05, task_06, task_07, task_08 |
