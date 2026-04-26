# Uculi Launch Wishes Implementation Plan

Date: 26 April 2026

## Goal

Turn Uculi into a launch-ready, monetizable product that can support a free tier, a real premium subscription, an elderly-friendly mode, cleaner copy, consistent UI behavior, and a future premium shopping list.

## Current Audit Snapshot

### Already implemented or mostly implemented

- Free users are limited to 8 local recipes.
- A `premium` entitlement flag exists.
- Premium gates exist for families, publishing, sticky notes, and notebook cover customization.
- A Simple Mode exists and now auto-tags hidden recipe details.
- Local AI now replaces Gemini in the active recipe-generation and detail-autofill flows.

### Partial or still missing

- Notebook mode itself is not yet fully premium-gated.
- Share and PDF export are still visible and available in the recipe detail tools.
- Backup download is still exposed for free users.
- Real billing and subscription management do not exist yet.
- The premium upgrade flow is still simulated.
- Shopping List is still only mentioned as a future feature.
- First-run onboarding is missing.
- The “elderly experience” is only partially implemented through Simple Mode.
- Several clutter/filler copy strings still exist.
- Button behavior and visual consistency are only partially standardized.
- Responsive quality needs structured device testing, not just CSS spot-fixes.

## Wishlist Coverage Matrix

### 1. Free basic app with up to 8 local recipes, no account required

Status: Partial

What is already there:

- Local recipe cap is implemented.
- Local storage works without authentication.

What is still needed:

- Define the exact free feature boundary in one entitlement map.
- Block notebook mode itself for free users, not just notebook cover/sticky-note enhancements.
- Block sharing for free users if sharing is meant to be premium.
- Block PDF export and backup export if downloading is meant to be premium.
- Decide whether Browse is free or premium-assisted.
- Decide whether favorites and rating are free or premium.

Acceptance criteria:

- A signed-out user can store up to 8 local recipes.
- A signed-out user can view, edit, and delete their local recipes.
- Every premium-only action shows the same paywall and never partially works.
- No premium-only controls appear active without entitlement.

### 2. Premium subscription plans with all advanced features

Status: Partial

What is already there:

- Premium feature gating exists in the UI.
- A premium modal exists.

What is still needed:

- Replace the simulated upgrade with a real billing flow.
- Add subscription products, plan IDs, and renewal handling.
- Add entitlement persistence tied to account state.
- Add restore purchases / re-sync entitlement logic.
- Add billing states: active, grace period, canceled, expired, trial, payment failed.
- Define pricing presentation: monthly, yearly, launch offer, annual savings.

Recommended scope:

- Free: 8 local recipes, basic editor, local AI tagging, local-only storage.
- Premium Monthly: all advanced features.
- Premium Yearly: same features with annual discount.

Acceptance criteria:

- A user can purchase a plan.
- The entitlement persists across refresh and sign-in.
- A canceled or expired plan falls back cleanly without corrupting local data.
- Premium features unlock immediately after purchase.

### 3. Shopping List premium feature

Status: Missing

Required functionality:

- Add ingredients from one or more recipes into a shopping list.
- Merge duplicate ingredients intelligently where possible.
- Allow manual custom items.
- Allow checking items off while shopping.
- Allow sharing the shopping list.
- Make the full feature premium-only.

Data model:

- `shoppingLists`
- `shoppingListItems`
- `sourceRecipeIds`
- `checked`
- `custom`
- `sharedWith`

Implementation sequence:

- Add a shopping list store and item schema.
- Add “Add to shopping list” action at recipe detail level.
- Add a dedicated Shopping List screen.
- Add custom item input.
- Add check-off interaction with persistence.
- Add share payload for copy/share sheet.
- Gate Shopping List behind premium.

Acceptance criteria:

- A premium user can build, edit, share, and check off a list.
- A free user sees the feature preview and paywall, but cannot use it.

### 4. Textual clutter cleanup

Status: Partial

Known cleanup targets already visible in the current app:

- “Index your own and liked recipes”
- “Search, filter, and open your own recipes and saved Browse finds from one place.”
- Family explainer text that is longer than needed for core actions.
- Various notebook-adjacent descriptive lines that feel explanatory rather than emotional or useful.

Execution plan:

- Run a screen-by-screen copy audit.
- Label each string as one of: actionable, emotional, instructional, filler, redundant.
- Remove filler before rewriting anything.
- Rewrite surviving copy in a single voice: warm, calm, confident, low-friction.
- Keep elderly-facing copy shorter and more literal.

Acceptance criteria:

- Every screen has one clear primary message.
- No hero or helper copy reads like placeholder product copy.
- Empty states are useful, brief, and emotionally appropriate.

### 5. Uniform button behavior and visual consistency

Status: Partial

Current situation:

- Some detail actions are standardized through helper rendering.
- Many other screens still use one-off button class strings.

Implementation plan:

- Define button primitives: primary, secondary, ghost, danger, premium, icon-only.
- Standardize hover, focus, pressed, disabled, loading, and active states.
- Standardize corner radius, spacing, height, icon size, and tracking.
- Standardize destructive action confirmation behavior.
- Standardize button copy patterns: verb-first, concise, consistent casing.

Acceptance criteria:

- Buttons of the same type look and behave the same across all screens.
- Keyboard focus states are visible and accessible.
- Disabled and loading states are visually distinct everywhere.

### 6. Responsive optimization for all screens

Status: Partial

Current situation:

- The app has mobile-oriented CSS and multiple breakpoints.
- There is not yet a structured responsive QA matrix.

Implementation plan:

- Build a test matrix for common widths: 320, 360, 390, 412, 768, 1024, 1280.
- Audit every major view: Index cards, Notebook, Detail, Add/Edit, Browse, Profile, Settings, Families, premium modals.
- Check thumb reach, button density, line length, modal height, sticky elements, overflow, and keyboard overlap.
- Reduce tap complexity on mobile by collapsing non-essential actions.
- Ensure older users can complete core flows on a phone with one hand.

Acceptance criteria:

- No clipped UI, horizontal scroll, or stacked action chaos at mobile widths.
- All primary tasks remain reachable without guesswork.
- Keyboard and modal behavior are stable on smaller screens.

### 7. Elderly experience / normal experience choice

Status: Partial

Current situation:

- Simple Mode exists.
- It already changes the recipe editor behavior and hides detail clutter.
- There is no first-run choice yet.
- The mode does not yet reshape enough of the whole app.

Feasibility assessment:

- Yes, it is feasible.
- The correct architecture is one shared data model with two presentation modes.
- Do not fork backend logic or content structure.
- Keep recipes, sharing, families, and premium entitlements identical underneath.
- Change presentation density, wording, navigation burden, and automation level only.

Implementation plan:

- Add first-run onboarding asking: Normal or Simple.
- Save that choice locally, and sync it if the user signs in.
- Expand Simple Mode beyond the recipe form.
- Simplify navigation labels and reduce the number of simultaneous visible controls.
- Increase font sizes, tap targets, spacing, and contrast in Simple Mode.
- Prefer explicit buttons over icon-only actions in Simple Mode.
- Convert dense filter areas into step-by-step actions.
- Hide advanced publishing/family controls unless explicitly opened.

Acceptance criteria:

- A first-time user can pick a mode in under 10 seconds.
- Switching modes does not alter recipe data or shared-content compatibility.
- Simple Mode reduces visible complexity without removing core usefulness.

### 8. First-run onboarding

Status: Missing

Implementation plan:

- Add a first-run modal or screen.
- Ask for experience type: Normal or Simple.
- Explain local vs premium in one clean screen.
- Show the free-tier limit clearly.
- Offer sign-in later instead of forcing it.

Acceptance criteria:

- First launch explains the product clearly in under 3 screens.
- The user understands what is free, what is premium, and what mode they selected.

### 9. Real launch readiness

Status: Partial

Still required before launch:

- Replace simulated premium with real billing.
- Add analytics for conversion funnel and retention.
- Add error logging and crash visibility.
- Add legal pages: privacy policy, terms, refund policy if required.
- Add account recovery and restore-purchase flows.
- Add basic performance budget checks.
- Add launch QA checklist across devices and browsers.

Acceptance criteria:

- The app is monetizable, observable, and supportable.
- There is a known answer for payments, refunds, entitlement restore, and account state.

## Recommended Implementation Phases

### Phase 0: Launch Audit and Freeze

- Freeze new feature additions except shopping list planning.
- Build a single entitlement map for free vs premium.
- Build a copy audit checklist.
- Build a responsive QA checklist.

### Phase 1: Finish the Free/Premium Boundary

- Gate notebook mode itself.
- Gate share.
- Gate PDF export.
- Gate backup download if downloading must be premium.
- Gate any remaining advanced collaboration or sync tools.
- Remove premium controls from free flows where possible, or downgrade them into previews.

### Phase 2: Real Subscription Infrastructure

- Choose billing provider.
- Add products and price IDs.
- Add entitlement sync.
- Replace simulated upgrade button.
- Add restore purchase / account sync path.

### Phase 3: Elderly Experience and First-Run Choice

- Add onboarding selection.
- Expand Simple Mode across Index, Detail, Settings, and Browse.
- Reduce visual density in Simple Mode.
- Add larger touch targets and plain-language actions.

### Phase 4: Copy and Design System Polish

- Rewrite all cluttered copy.
- Centralize button styles and interaction states.
- Standardize helper text and empty states.

### Phase 5: Responsive and Accessibility QA

- Device-width pass.
- Accessibility pass: contrast, focus, semantics, tap sizes.
- Elderly-mode usability pass.

### Phase 6: Shopping List Premium Build

- Add shopping list data layer.
- Add recipe-to-list actions.
- Add list UI with sharing and check-off.
- Gate behind premium.

### Phase 7: Launch Prep

- Analytics.
- Error tracking.
- Legal/support.
- Pricing page copy.
- App-store/landing-page assets if needed.

## Suggested Priority Order

1. Finish the free/premium boundary.
2. Replace simulated premium with real billing.
3. Add first-run Normal vs Simple onboarding.
4. Do the copy cleanup and button consistency pass.
5. Run full responsive QA.
6. Build Shopping List as the post-launch premium expansion.

## What I Would Do Next

1. Lock down the exact free-tier rule set in code and UI.
2. Remove the remaining free access to notebook mode, sharing, and downloads if that matches the business model.
3. Add the first-run mode selector.
4. Start a structured copy sweep beginning with the Index hero and notebook-adjacent text.
5. Add a real billing provider and entitlement persistence.
