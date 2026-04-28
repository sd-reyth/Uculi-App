# Uculi Final Billing Execution Plan

Date: 27 April 2026

## Scope

Replace the current local Premium preview with real billing without rewriting the app architecture.

The goal is to keep the existing free-versus-premium boundaries intact, move entitlement truth to the backend, and keep client changes surgical.

## Current Repo Readiness

The client is already shaped for this work:

- `userSettings.billing` already exists.
- Premium access is already centralized through `hasPremiumAccess()`.
- Upgrade and restore hooks already exist in the UI flow.
- Settings already exposes a Billing and Entitlement surface.

Because of that, the billing pass should replace provider hooks and entitlement sources, not rebuild Premium gating.

## Decisions Required Before Coding

Confirm these before implementation starts:

1. Monthly only, yearly only, or both.
2. Final plan names and prices.
3. Billing currency.
4. Production domain and local test domain.
5. Support email shown in billing UI.
6. Refund and cancellation policy.
7. Whether customer portal is needed at launch.
8. Whether grace-period access stays active after failed payment.
9. Whether restore purchase requires Google sign-in before lookup.

## Recommended Stack

- Stripe for billing.
- Firebase Authentication for identity.
- Firestore for the app-visible entitlement mirror.
- Firebase Functions or Cloud Run for checkout, webhook, and restore endpoints.
- Webhooks as the source of truth for live entitlement state.

Never call Stripe secret-key endpoints directly from `index.html`.

## Billing Data Shape To Preserve

Keep the existing client-side shape and mirror it from the backend:

```javascript
{
  status: 'free' | 'preview' | 'active' | 'grace' | 'restored' | 'expired',
  entitlementSource: 'none' | 'preview' | 'stripe' | 'restore' | 'webhook',
  provider: 'Stripe' | '',
  planId: 'premium' | 'premium-monthly' | 'premium-yearly' | '',
  customerId: '',
  subscriptionId: '',
  priceId: '',
  currentPeriodEndsAt: '',
  cancelAtPeriodEnd: false,
  lastSyncedAt: '',
  previewActivatedAt: '',
  lastRestoreAttemptAt: ''
}
```

Do not collapse this shape just because the first live version does not use every field yet.

## Backend Work

1. Create a secure checkout-session endpoint.
2. Create a secure restore-purchase endpoint.
3. Optionally create a customer-portal endpoint if portal access is part of launch scope.
4. Create a Stripe webhook handler.
5. Deduplicate webhook events in a `billing-events` collection.
6. Mirror subscription state into the authenticated user's billing block in Firestore.

Recommended Firestore shape:

```text
users/{uid}
  billing
    provider
    status
    entitlementSource
    planId
    customerId
    subscriptionId
    priceId
    currentPeriodEndsAt
    cancelAtPeriodEnd
    lastSyncedAt

billing-events/{providerEventId}
  provider
  processedAt
  eventType
  customerId
  subscriptionId
```

## Client Work

1. Require authenticated identity before real checkout.
2. Implement `startBillingCheckout(origin)` against the secure backend endpoint.
3. Implement `restorePremiumEntitlement()` against the secure restore endpoint.
4. Refresh the mirrored billing state after sign-in and on app boot.
5. Merge the server billing block into `userSettings.billing` instead of relying on preview state.
6. Hide or dev-gate preview-only upgrade and reset controls before production release.

## Minimum Stripe Events To Handle

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Definition Of Done

- A paid user unlocks Premium after checkout.
- Restore purchase works on a new device after sign-in.
- Cancelled, expired, and grace states are reflected correctly in the app.
- Free users cannot unlock Premium through the local preview path in production.
- Billing secrets live only on the server side.

## Validation Checklist

1. Verify free users cannot use notebook mode, sharing, PDF export, backup download, families, or cloud sync.
2. Verify paid users unlock Premium after checkout and entitlement sync.
3. Verify restore purchase works after sign-in on a second device.
4. Verify duplicate webhook events do not duplicate side effects.
5. Verify checkout and restore failures do not accidentally unlock Premium.
6. Verify the billing card shows the expected provider, state, and IDs.
7. Run the relevant diagnostics or narrow checks after implementation.

## Files Expected To Change

- `index.html`
- `README.md`
- `PHASE_2_SETUP.md`
- `firebase.json`
- `.firebaserc`
- `functions/...` or the chosen backend equivalent

## Notes

- Keep the implementation surgical; do not rewrite the client into a framework.
- Firebase setup and billing setup are intentionally split across different docs.
- Treat webhooks plus Firestore entitlement state as the live source of truth.
