---
status: pending
title: "Replace Checkout UI With Hosted Billing Launch Flow"
type: frontend
complexity: medium
dependencies:
  - task_03
  - task_06
---

# Task 07: Replace Checkout UI With Hosted Billing Launch Flow

## Overview
Convert the current checkout experience from a mocked payment-method form into a hosted-checkout launch flow aligned with the new billing routes. This task makes the app’s purchase entry point match the actual subscription architecture and removes UI assumptions that do not fit the hosted recurring payment model.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- 1. MUST replace the current mock or inline checkout flow with a hosted-checkout launch behavior driven by the new billing route.
- 2. MUST keep plan resolution and authenticated-user expectations intact on the checkout page.
- 3. MUST remove or neutralize UI elements that imply unsupported payment methods for the recurring hosted-checkout MVP.
- 4. SHOULD surface loading and failure states that reflect hosted-checkout creation rather than local card form submission.
</requirements>

## Subtasks
- [ ] 7.1 Update the checkout page to call the new hosted billing route instead of the mocked payment flow.
- [ ] 7.2 Replace payment-method-selection assumptions with UI copy and state aligned to hosted checkout.
- [ ] 7.3 Preserve plan summary and authenticated contact context while redirecting to the provider-hosted URL.
- [ ] 7.4 Update loading and error states so users understand when checkout creation fails before redirect.

## Implementation Details
Reference the TechSpec "API Endpoints", "Impact Analysis", and "User Experience" sections. Keep the UI simple and provider-agnostic where possible: the page should launch billing, not simulate card capture. Use the existing client gateway or a narrowly evolved replacement to call the new server route cleanly.

### Relevant Files
- `app/(authenticated)/checkout/page.tsx` — Current checkout page with mocked payment method UI.
- `data/gateways/NextApiPaymentGateway.ts` — Current client-side route wrapper that may need to target the new billing endpoints.
- `components/payment/CheckoutSummary.tsx` — Existing plan summary surface likely retained.
- `components/payment/PaymentMethodSelector.tsx` — Likely needs removal, repurposing, or de-emphasis for the hosted MVP.
- `components/payment/CheckoutForm.tsx` — Current inline card-form UI likely no longer appropriate for this flow.

### Dependent Files
- `app/plans/page.tsx` — Routes users into the checkout experience.
- `locales/en.ts` — Checkout labels and error messages will need hosted-checkout wording.
- `locales/pt.ts` — Portuguese checkout labels and hosted-flow states.
- `locales/es.ts` — Spanish checkout labels and hosted-flow states.

### Related ADRs
- [ADR-001: Supabase As Source Of Truth For Subscription Access](adrs/adr-001.md) — Checkout launches billing but state is still read from Supabase.
- [ADR-004: Keep User Actions In Next.js Server Routes](adrs/adr-004.md) — Checkout UI must call the new app route boundary.

## Deliverables
- Updated checkout page for hosted billing launch
- Removal or replacement of mock payment-method UX that conflicts with the recurring hosted flow
- Localized loading and error states for checkout creation
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for checkout launch, redirect behavior, and failure handling **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Verify the checkout page requests a hosted checkout URL when a valid plan is loaded.
  - [ ] Verify unsupported mock payment method branches are no longer presented for the hosted recurring flow.
  - [ ] Verify checkout creation failures surface the expected localized error state.
- Integration tests:
  - [ ] Load the checkout page with a valid plan and verify the UI redirects to the hosted URL returned by the billing route.
  - [ ] Load the checkout page with a missing or invalid plan and verify it redirects back to the plans page.
  - [ ] Simulate a billing route failure and verify the user sees a stable error state without a broken redirect.
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- The checkout page launches hosted recurring billing instead of a mocked local payment flow
- The checkout UI remains coherent and localized after removing unsupported inline-payment assumptions
