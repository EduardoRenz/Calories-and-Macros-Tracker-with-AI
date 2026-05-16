# PRD: AbacatePay Subscription Management With Supabase-Centered Billing State

## Overview

This feature introduces paid subscription management for the app using AbacatePay as the initial billing provider while keeping Supabase as the product system of record for access control, subscription status, cancellation behavior, and financial history.

It is designed for authenticated users who want to upgrade from the free plan to a paid plan and manage that plan inside the app without depending on opaque provider behavior. It is also valuable for the business because it turns the existing plans and subscription surfaces into an operational billing flow with clear state, clearer support handling, and future provider flexibility.

The first release focuses on a reliable hosted checkout flow, in-app subscription visibility, cancellation at period end, immediate premium removal when billing is no longer regular, and a user-visible financial history.

## Goals

- Enable users to start a paid subscription from the existing plans experience.
- Make premium access reflect subscription state reliably inside the product.
- Let users cancel renewal while keeping access through the end of the current paid period.
- Remove premium access as soon as billing becomes irregular or unpaid.
- Show subscription status and financial history inside the app.
- Keep the billing model provider-agnostic enough to support a future provider change with limited product disruption.

Target outcomes for the first release:
- Users can complete subscription purchase from the current plans flow.
- Subscription state in the app matches the expected commercial state after provider events.
- Users can understand whether they are active, cancelled-at-period-end, or no longer in good standing.
- Users can view a financial history of paid, failed, and refunded billing events.

## User Stories

- As a free user, I want to upgrade from the plans page so that I can unlock premium features.
- As a paying user, I want to see my current subscription status so that I know whether my premium access is active.
- As a paying user, I want to cancel future renewals without losing access immediately so that I can use the time I already paid for.
- As a paying user, I want to understand when my subscription is no longer regular so that I know why premium access changed.
- As a paying user, I want to see my billing history so that I can verify paid charges, failed charges, and refunds.
- As the business, I want billing state represented inside the product so that access control and support flows do not depend entirely on a third-party dashboard.

## Core Features

- Hosted subscription checkout:
  Users can select an eligible paid plan and continue to a hosted billing flow to complete subscription purchase.

- Product-owned subscription state:
  The app stores and presents the customer’s subscription state in product terms, including active access, cancellation at period end, and irregular billing outcomes.

- In-app subscription management:
  Users can view their current plan, renewal state, and whether cancellation is scheduled for the end of the paid term.

- End-of-period cancellation experience:
  Users can stop future renewals while retaining premium access through the end of the current paid cycle.

- Strict access downgrade on irregular billing:
  If billing is no longer regular, premium access is removed promptly instead of allowing indefinite grace access.

- Financial history:
  Users can view billing events relevant to their account, including successful charges, failed charges, refunds, and the date of each event.

- Navigation and upgrade surfaces:
  The app reflects subscription state in the main navigation and settings/profile surfaces, including upgrade and manage entry points.

## User Experience

Primary flow:
1. User visits the plans page.
2. User selects a paid plan.
3. User enters the hosted checkout flow.
4. After payment completion, the app reflects premium access and current subscription status.
5. The user can later open subscription management from navigation or settings.
6. The user can review subscription state and billing history.
7. If the user cancels, the product clearly communicates that access remains until the current paid period ends.

Key experience principles:
- Users should always understand whether they are free, active, cancelled-at-period-end, or no longer in good standing.
- The difference between “will not renew” and “already lost access” must be explicit.
- Billing history should be easy to scan and should not require the user to leave the app.
- Upgrade and manage actions should appear in the places users naturally expect them: plan selection, profile/settings, and navigation.

Accessibility and trust considerations:
- Billing state labels must be plain and unambiguous.
- Time-based expectations such as renewal end should be visible in user language.
- Failed billing should explain the consequence to access in a direct, non-technical way.

## High-Level Technical Constraints

- The feature must work with the existing plans page and subscription context already present in the product.
- Supabase must remain the central product data layer for subscription-related state.
- The product must avoid hard-coding user-facing logic to one provider’s naming or lifecycle quirks.
- The product must support secure receipt of external billing events.
- User-visible billing history must respect account privacy and authenticated access boundaries.

## Non-Goals (Out of Scope)

- Building an advanced internal operations console in the first release.
- Supporting multiple billing providers at launch.
- Supporting manual reconciliation workflows as a user-facing feature in phase one.
- Exposing raw provider-specific objects and terminology directly in the product UI.
- Offering a full self-serve billing dispute workflow inside the app.
- Expanding the first release to non-subscription one-time purchases.

## Phased Rollout Plan

### MVP (Phase 1)
- Hosted checkout for paid plans
- Premium access updates based on product-owned subscription state
- In-app subscription status view
- Cancel-at-period-end behavior
- Immediate downgrade when billing becomes irregular
- User-visible financial history with paid, failed, and refunded events

Success criteria to proceed:
- Users can subscribe and see correct access state in the product
- Users understand cancellation timing
- Billing events are visible and comprehensible in-app

### Phase 2
- Improved messaging and recovery journeys for failed renewals
- Better lifecycle communication around upcoming renewal or expiry
- Additional support-facing observability for billing mismatches

Success criteria to proceed:
- Reduced support confusion around access state
- Fewer unresolved mismatches between billing status and product access

### Phase 3
- Expanded provider flexibility
- Richer billing self-service and account controls
- Broader subscription analytics and retention workflows

Long-term success criteria:
- Provider migration becomes feasible without major product redesign
- Billing state becomes a stable foundation for monetization expansion

## Success Metrics

- Paid plan checkout completion rate
- Percentage of premium users whose in-app status matches expected commercial state
- Reduction in support requests caused by unclear billing state
- Percentage of billing events visible to users in the history surface
- Cancellation clarity, measured by low confusion-related support volume after cancel-at-period-end actions
- Low incidence of users retaining premium access after billing becomes irregular

## Risks and Mitigations

- User confusion about cancellation timing:
  Mitigation: clearly distinguish active-until-date from immediate cancellation.

- User distrust when premium access changes after failed billing:
  Mitigation: communicate state changes plainly and show the relevant billing event in history.

- Product experience becoming too provider-shaped:
  Mitigation: keep user-facing status language centered on product access and billing standing, not provider internals.

- Support burden from mismatched expectations:
  Mitigation: make subscription state and financial history visible inside the app rather than requiring support to explain it manually.

- Scope expansion before validating the main billing loop:
  Mitigation: keep phase one focused on checkout, access state, cancellation timing, and financial visibility.

## Architecture Decision Records

- [ADR-001: Supabase As Source Of Truth For Subscription Access](adrs/adr-001.md) — The product will use AbacatePay for hosted checkout while keeping subscription access state and financial history centered in Supabase.

## Open Questions

- What exact user wording should distinguish active, cancelled-at-period-end, and irregular billing states in Portuguese and English?
- Should users see the next renewal date in the first release, or only current status and billing history?
- Should refunded events show a reason when one exists, or only the refund outcome and date?
- What level of billing history retention should be visible inside the user-facing app?
