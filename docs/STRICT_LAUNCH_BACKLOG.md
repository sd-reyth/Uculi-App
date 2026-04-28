# Uculi Active Launch Backlog

Date: 27 April 2026

## Purpose

This is the only active launch backlog.

Use it together with:

- `FINAL_BILLING_AI_EXECUTION_PLAN.md` for the detailed billing track.
- `PHASE_2_SETUP.md` for Firebase auth, sync, and publishing setup.

Do not create a second launch-plan file unless scope changes materially.

## Current Product Priority

Before the next large implementation block, the priority is:

1. UX and UI consistency.
2. App behavior and working interactions.
3. Responsive quality and clarity.
4. Billing after the product surface feels stable.

Billing still matters for launch, but it is not the next working priority.

## Completed Foundations

These items are already handled and were removed from the active task list to reduce noise:

- Landing page and app shell cleanup, including the nav and modal shell pass.
- First-run onboarding with `Normal` versus `Simple` mode choice.
- Free-versus-premium boundary for notebook mode, sharing, PDF export, backup download, covers, sticky notes, cloud sync, families, and publishing.
- Simple Mode expansion beyond the recipe editor.
- In-app privacy policy, terms, and local diagnostics surfaces.
- Initial responsive and bottom-nav cleanup groundwork.

If any of these regress, treat them as bugs instead of reopening the old planning track.

## P0 - Current Working Priority

### UI consistency

- Roll `getAppButtonClasses()` through the remaining one-off buttons.
- Standardize disabled, hover, active, and loading states everywhere.
- Review profile, family, and action-bar areas for remaining legacy button classes.

### App functioning

- Audit remaining buttons and controls for broken, partial, or placeholder behavior.
- Check that every visible action either works fully or clearly communicates that it is not implemented yet.
- Remove or soften UI that suggests completed functionality where only scaffolding exists.
- Tighten modal, form, and navigation behavior so the app feels consistent across screens.

### QA

- Re-run responsive QA across 320, 360, 390, 412, 768, 1024, and 1280 widths.
- Re-test bottom navigation, modal height, keyboard overlap, and long-form screens.
- Re-test the major free-tier flows before any new major implementation work starts.

### Visual and copy polish

- Improve visual hierarchy where screens still feel dense or uneven.
- Tighten family-management copy and locked-state previews.
- Improve empty states and first-success moments.

## P1 - Next After UX Stabilization

### Billing and entitlement

- Integrate a real billing provider.
- Persist Premium entitlement from the backend instead of the local preview flow.
- Implement restore purchase for signed-in users.
- Remove or dev-gate the preview-only upgrade path before release.

### Launch-facing commercial copy

- Replace remaining preview and placeholder billing copy in Settings and Premium surfaces.
- Add final pricing, support, refund, and cancellation language once billing decisions are fixed.

## P2 - Post-Billing / Launch Window

- Improve the Premium modal with real plan information.

## P3 - Post-Launch Or Future Work

### Shopping List

- Add the shopping list data model.
- Add recipe-to-shopping-list actions so ingredients can be pushed in directly from recipes.
- Add custom items next to recipe ingredients.
- Add live shared check-off state for cooking partners and family members.
- Add the store-friendly check-off flow so ingredients can be crossed off in real time while someone is shopping.
- Gate the full feature behind Premium.

## Current Execution Order

1. Finish the remaining button and interaction consistency pass.
2. Audit visible actions for broken, partial, or misleading behavior.
3. Run the next responsive and usability QA sweep.
4. Tighten copy, empty states, and visual hierarchy.
5. Only then start billing and entitlement implementation.

## Explicitly Not In Scope Right Now

- Reopening completed onboarding work.
- Reopening completed free-tier gating work unless a regression is found.
- Starting billing implementation before the current UX and behavior pass is done.
- Starting Shopping List before billing and entitlement are stable.
