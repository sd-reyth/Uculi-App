# Uculi Next Week Coding Plan

Date: 30 April 2026

## Goal

Stabilize the public auth-first experience, remove remaining launch-risk technical debt, and prepare the app for real backend-backed Premium and family collaboration work.

## Monday - Public Shell And Auth Polish

1. Replace the Tailwind CDN runtime with a production CSS build so Hosting no longer depends on `cdn.tailwindcss.com`.
2. Move the landing and auth boot flow into one explicit startup path so the landing screen is the only first paint for signed-out users.
3. Confirm `Get Started` and `Login` both route into the auth gate consistently on desktop and mobile.
4. Keep the developer bypass local-only and document the exact QA usage pattern.

## Tuesday - Auth And Account Data Hardening

1. Re-test email/password registration, Google sign-in, sign-out, and password error states.
2. Verify first name and last name always become the initial Firebase display name.
3. Validate account-scoped local storage migration on old devices with pre-auth recipe data.
4. Add a compact signed-out regression checklist for profile, recipe create, notebook, family, and publish flows.
5. Restore and re-test the app-wide translation feature so it works reliably across the full app for at least English, Dutch, French, German, and Spanish.
6. Rebuild and re-test the Uculi AI Auto-Fill feature so it produces accurate, high-quality recipe metadata before re-enabling it in the editor.

## Wednesday - Family And Shared Archive Foundations

1. Move family records out of local-only storage and define the Firestore collection shape.
2. Add family membership reads/writes against authenticated user IDs instead of browser-local state only.
3. Keep family recipe labels, colors, and notebook framing exactly as-is in the UI while swapping the data source underneath.
4. Define failure behavior for removed members, pending members, and creator-only actions.

## Thursday - Premium And Billing Backend Start

1. Start from [docs/FINAL_BILLING_AI_EXECUTION_PLAN.md](c:\Users\mholt\Documents\Uculi App\docs\FINAL_BILLING_AI_EXECUTION_PLAN.md).
2. Finalize plan IDs, entitlement fields, and webhook event handling before changing any public upgrade UI.
3. Build the backend entitlement mirror first.
4. Keep the current public "Premium coming soon" lock in place until checkout, restore, and entitlement refresh all work end-to-end.

## Friday - Launch QA Sweep

1. Run viewport QA at 320, 360, 390, 412, 768, 1024, and 1280 widths.
2. Re-test landing, auth, notebook, recipe edit, family labels, version history, Premium locks, and sign-out.
3. Verify the local developer bypass can be enabled with `?dev-bypass=1` and cleared with `?dev-bypass=0` on `file:` and `localhost` only.
4. Rebuild `public/` from root and run one final Hosting smoke test.

## Deliverables By End Of Week

1. Production-safe startup flow.
2. Production Tailwind build instead of CDN runtime.
3. Firestore-backed family model ready for rollout.
4. Billing backend groundwork started behind the existing public lock.
5. A short launch regression checklist that can be reused before each deploy.

## Do Not Drift Into Yet

1. Publicly exposing unfinished billing controls.
2. Reworking the notebook design again unless QA finds a concrete regression.
3. Expanding Shopping List scope before auth, family storage, and billing are stable.

## Added From User Testing (30 April 2026)

1. Run a top-of-screen back-button audit for all major views (desktop + mobile), including a consistent floating back option where needed.
2. Fix notebook mode scaling edge cases for custom cover styles and sticker interaction controls (positioning/z-index).
3. Add a first-run interactive tutorial and a "Show tutorial again" action in Settings.
4. Add a concise in-app usage guide / Q&A page in Settings covering shopping list behavior, key buttons, color meanings, and main workflows.
