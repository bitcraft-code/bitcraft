# Game Factory Evolution — Platform Audit

This document describes the evolution of the Bitcraft mobile game factory into a production-ready platform with genre templates, experiments, retention metrics, build pipeline, OTA readiness, ranking, shared telemetry, and release readiness tooling.

Audience: senior engineers reviewing or extending the platform.

---

## 1. Genre templates

**Location:** `templates/arcade`, `templates/puzzle`, `templates/runner`.

**Behaviour:** When you run `pnpm create-game <name> --genre arcade|puzzle|runner`, the generator copies from `templates/<genre>` instead of `apps/template`. If no genre is provided or the genre folder is missing, it falls back to `apps/template`.

**Structure per template:** Same as the base template: `app/` (Expo Router), `src/` (game state, provider, theme, i18n), `app.config.ts`, `package.json`, etc. Identifier replacement (`Template` → PascalName, `template` → gameName) runs over the copied tree, so all templates must keep those identifiers.

**Differences by genre:**

- **Arcade:** `game.ts` state has `score`, `lives`; home screen shows Score, Lives, High score.
- **Puzzle:** State has `level`, `moves`; home screen shows Level, Moves, High score.
- **Runner:** State has `distance`, `speed`; home screen shows Distance, Speed, High score.

**Adding a new genre:** See `templates/README.md`. Summary: create `templates/<genre>/` with the same layout as an existing template, customize `src/game.ts` and `app/index.tsx`, add the genre to `GENRES` and `GENRE_KEYWORDS` in `scripts/create-game.js`. No change to template resolution logic is required.

---

## 2. Experiment flags

**Location:** `apps/<game>/src/experiments.ts` (generated).

**Content:** Static flags, e.g. `newGameOverScreen`, `aggressiveAds`, `doubleCoinsReward`. Helper `isExperimentEnabled(key)` returns the boolean for that key.

**Usage:** Combine with feature flags in app code. One example gate is in the home screen: when `experiments.newGameOverScreen` is true, a short “[Experiment] New Game Over screen enabled” line is shown. Use the same pattern for A/B testing UX or monetization variants.

**Scope:** Local/static only. No remote config or backend. Toggle flags in code and rebuild (or later plug in a remote config that writes this file or provides overrides).

---

## 3. D1 / D7 retention logic

**Model:** Cohort = all users who had at least one session on the **earliest date** present in the game’s session data. D1 retention = share of that cohort that also has a session on (cohort date + 1 day). D7 = share of cohort with a session on (cohort date + 7 days). Percentages are rounded integers.

**Data requirement:** Sessions must include `date` (YYYY-MM-DD) and a stable `userId` (or equivalent) so we can say “user X played on day 0” and “user X played on day 1”. The test data generator assigns each session a `userId` from a fixed pool so some users naturally return on later days.

**Where it’s implemented:** `packages/analytics-dashboard/server.js`: `computeRetention(sessions)` builds a map of date → set of user ids, finds the minimum date as day 0, then counts cohort size and how many cohort users appear on day+1 and day+7. Aggregation merges all sessions per game before calling `computeRetention`.

**Assumptions:** Day 0 is the **oldest** date in the dataset. For production you may prefer a fixed cohort window (e.g. “first week of March”) and/or first-open date per user; the current logic is kept simple for dashboard and test data.

---

## 4. Build pipeline

**Scripts (root `package.json`):**

- **typecheck:all** — `pnpm -r typecheck` (all workspaces).
- **export:all** — `node scripts/export-all.js`: runs `npx expo export --platform web` in each app under `apps/`. Optional first argument = single app name (e.g. `pnpm run export:all -- flappy`).
- **validate:all** — `node scripts/validate-all.js`: runs typecheck for the whole workspace, then `npx expo config --type public` for each app, then `export:all`. Exits with code 1 if any step fails.
- **validate:app** — `node scripts/validate-app.js <app-name>`: typecheck, expo config, and web export for one app.

**Usage:** Before releases run `pnpm validate:all`. To validate or export a single app: `pnpm run validate:app -- flappy`, `pnpm run export:all -- flappy`.

Existing per-app scripts (e.g. `dev:flappy`, `ios:flappy`, `build:flappy:production`) are unchanged.

---

## 5. OTA updates readiness

**What’s in place:** Each generated app’s `app.config.ts` includes a short comment block describing how to enable OTA (Expo Updates): add `expo-updates`, set `updates.url` (e.g. EAS Update URL), and set `runtimeVersion`. Two commented lines are present: `// updates: { url: "...", enabled: true }` and `// runtimeVersion: { policy: "appVersion" }`.

**What’s not done:** No production secrets, env vars, or deployment setup. No dependency on `expo-updates` is added by default. Uncomment and fill when you are ready for real OTA rollout.

---

## 6. Ranking model

**Purpose:** Compare games so developers can see which deserve more investment.

**Formula (explicit, in code and here):** A single score per game, 0–100, from:

- **Sessions (20%):** `min(sessions / 10, 1) * 100` — caps at 10 sessions for full points.
- **Avg playtime (25%):** `min(avgPlaytimeMs / 180_000, 1) * 100` — 3 minutes = full points.
- **D1 retention (25%):** `d1RetentionPercent` (already 0–100).
- **D7 retention (20%):** `d7RetentionPercent` (already 0–100).
- **Ad interactions (10%):** `min(adInteractions / 50, 1) * 100`.

**Implementation:** `rankScore(g)` in `packages/analytics-dashboard/server.js`. Games are sorted by this score descending. The dashboard UI shows a Rank column, Score column, and “Top games” / “Worst games” lists (top 5 and last 5).

**Tuning:** Edit `rankScore` in `server.js`: change weights (0.2, 0.25, …) or the normalisation divisors (10, 180000, 50) to match product priorities.

---

## 7. Shared telemetry schema

**Location:** `packages/analytics`: types and helper.

**Schema (TelemetryContext):** Events are encouraged to carry where relevant: `gameId`, `genre`, `sessionId`, `userId`, `buildVersion`, `platform`, `country`, `theme`, `language`, `timestamp`. All optional at the type level; `gameId` is already set by the existing `createGameOpenedEvent`-style helpers.

**Helper:** `withTelemetryContext(params, context)` merges a `TelemetryContext` into event params and ensures a `timestamp` (defaults to `new Date().toISOString()`). Apps can build a context object (e.g. from app config, locale, theme) and pass it when creating events so all games emit comparable fields.

**Test data:** `scripts/generate-test-data.js` emits events and sessions with `gameId`, `genre`, `sessionId`, `userId`, `buildVersion`, `platform`, `country`, `theme`, `language`, `timestamp`. Optional third argument: genre (default `arcade`).

**Dashboard:** Aggregation already uses `gameId`, `sessionId`, `userId` from sessions for retention and metrics. No schema change required there beyond the existing shape.

---

## 8. Release readiness checker

**Script:** `pnpm check-release-readiness <game-name>` → `node scripts/check-release-readiness.js <game-name>`.

**Checks:**

- Metadata: `metadata/appstore.json`, `metadata/playstore.json` exist.
- Screenshots: `metadata/screenshots/` exists and contains at least one image (PASS/WARN).
- Assets: `assets/icon.png`, `assets/splash.png` required; `assets/adaptive-icon.png` optional (WARN if missing).
- Config: `app.config.ts` exists and contains name, slug, bundleIdentifier, package.
- Features: `src/features.ts` exists.
- i18n: `src/i18n/` with at least one JSON (WARN if missing/empty).
- Theme: `src/theme.ts` (WARN if missing).
- Typecheck: `pnpm --filter @bitcraft/<game> typecheck`.
- Expo: `npx expo config --type public` in the app dir.

**Output:** Terminal summary (PASS/WARN/FAIL counts and items) and `apps/<game-name>/metadata/release-readiness.md` with the same breakdown plus a “Next steps” section (fix FAILs, add screenshots, fill store metadata, build and submit).

Exit code: 1 if any FAIL.

---

## 9. Example workflows

**Create and validate one arcade game:**

```bash
pnpm create-game my-arcade --genre arcade
pnpm install
pnpm run validate:app -- my-arcade
pnpm check-release-readiness my-arcade
```

**Batch create three games and run full validation:**

```bash
pnpm create-games game-a game-b game-c --genre puzzle
pnpm install
pnpm validate:all
```

**Generate test data and open dashboard with retention and ranking:**

```bash
node scripts/generate-test-data.js flappy 14 arcade
node scripts/generate-test-data.js snake 14 arcade
pnpm dashboard
# Open http://localhost:3999 — table shows D1/D7 retention and rank score.
```

**Prepare one game for store submission:**

```bash
pnpm check-release-readiness mygame
# Fix any FAIL; address WARN (e.g. add real screenshots).
pnpm generate-screenshots mygame   # if placeholders are acceptable
# Edit metadata/appstore.json and metadata/playstore.json.
# Build and submit via EAS or Expo.
```

---

## 10. How to add a new genre

1. Create `templates/<new-genre>/` (copy from `templates/arcade` or another).
2. Adjust `src/game.ts`: define `TemplateState` and initial/refresh logic for that genre (keep `Template`/`template` identifiers).
3. Adjust `app/index.tsx`: show the relevant state fields and labels.
4. In `scripts/create-game.js`: append the new genre to `GENRES` and set `GENRE_KEYWORDS[newGenre]`.
5. Run `pnpm create-game test-new --genre new-genre` and fix any leakage or missing replacements.

See `templates/README.md` for the full checklist.

---

## 11. How to tune the ranking formula

Edit `rankScore` in `packages/analytics-dashboard/server.js`. Current weights: sessions 0.2, avg playtime 0.25, D1 0.25, D7 0.2, ads 0.1. Change the coefficients to emphasize retention vs engagement vs monetization. Change the divisors (10, 180000, 50) to shift the “full score” thresholds. Restart the dashboard server to apply changes.

---

## 12. How to prepare one game for release

1. Run **check-release-readiness:** `pnpm check-release-readiness <game-name>`. Open `apps/<game-name>/metadata/release-readiness.md`.
2. Fix all **FAIL** items (metadata, assets, config, typecheck, expo config).
3. Optionally fix **WARN** (screenshots, adaptive icon, i18n, theme).
4. Add or generate screenshots: `pnpm generate-screenshots <game-name>` for placeholders, or replace with real assets in `metadata/screenshots/`.
5. Edit **metadata/appstore.json** and **metadata/playstore.json** (title, description, keywords, support/privacy URLs).
6. Enable OTA in `app.config.ts` if desired (uncomment `updates` and `runtimeVersion`, add `expo-updates`).
7. Build: e.g. `pnpm --filter @bitcraft/<game-name> build:production` (or your EAS profile).
8. Submit to App Store Connect and Google Play Console using their workflows.

---

## Summary of new/updated artefacts

| Item | Location |
|------|----------|
| Genre templates | `templates/arcade`, `templates/puzzle`, `templates/runner`, `templates/README.md` |
| Experiment flags | `apps/<game>/src/experiments.ts` (generated), `src/experiments.ts` in templates |
| Retention | `packages/analytics-dashboard/server.js` (`computeRetention`), UI columns D1/D7 |
| Build pipeline | `scripts/export-all.js`, `scripts/validate-all.js`, `scripts/validate-app.js`; root scripts typecheck:all, export:all, validate:all, validate:app, export:app |
| OTA | Comment block and commented `updates`/`runtimeVersion` in `app.config.ts` (template and genre templates) |
| Ranking | `rankScore` in dashboard server; dashboard UI Rank, Score, Top/Worst lists |
| Telemetry schema | `packages/analytics`: `TelemetryContext`, `withTelemetryContext`; test data generator emits full context |
| Release readiness | `scripts/check-release-readiness.js`; `apps/<game>/metadata/release-readiness.md` |
| Generator | `create-game.js`: `getTemplateDir(genre)`, `writeExperiments`, dry-run mentions experiments and template source |
