# AGENTS.md

## Cursor Cloud specific instructions

Uculi is a **static, local-first single-file recipe web app**. There is no build step and no
backend required for the core product. State is stored in the browser (`localStorage`), so the
"app" is just static files served over HTTP.

### Layout / what to run
- `index.html` — public landing page. Links into the app via `app.html?auth=login`.
- `app.html` — the actual application (UI + state + logic are inlined in a `<script>` near the
  bottom of the file). This is what you run/test.
- `script.js` — a large standalone JS file that is **not referenced by any HTML** (the live app
  logic lives inline in `app.html`). Don't assume editing `script.js` changes the running app.
- `functions/` — optional Firebase Cloud Functions (moderation). Requires a real Firebase
  project + credentials and cannot run locally without them; not needed for the core app.

### Run the app (dev)
Serve the repo root as static files and open `index.html` / `app.html`, e.g.:

```
python3 -m http.server 5502
```

Then open `http://localhost:5502/index.html` (landing) or `http://localhost:5502/app.html` (app).
The README also mentions VS Code Live Preview on port 5502. Do **not** open the files via
`file://` — third-party CDN scripts (Tailwind, lucide, Firebase) and the app behave best over HTTP.

### Lint / test / build
- There is **no test suite, no linter, and no build** for the static app.
- `functions/` has `npm run lint` but it is a stub (`echo 'No lint configured'`).
- To syntax-check functions: `node --check functions/index.js`.

### Hello-world / smoke test
Open `app.html`, complete the first-run flow (create a local account, skip the tutorial via
"Overslaan", accept terms), click **+ Add Recipe**, fill Title/ingredient/instruction, then
**SAVE RECIPE**. Gotcha: ingredient and instruction inputs require clicking the **+** button to
add each item to the list — typing alone does not add them.

### Cloud features (optional)
Google sign-in, Firestore sync, and publishing are Premium-gated and require Firebase config in
`app.html` (`initializeFirebase()`) plus a real project. See `docs/PHASE_2_SETUP.md`. Not required
to run or test the local-first product.
