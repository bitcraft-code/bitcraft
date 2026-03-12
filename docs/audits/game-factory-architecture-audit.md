# Mobile Game Factory — Architecture Audit

This document describes the scalable "mobile game factory" setup: how new games are generated, what is created, and how to operate at scale.

---

## 1. Mobile game factory architecture

The repository is a **pnpm workspace monorepo** with:

- **apps/** — One directory per game (e.g. `snake`, `tictactoe`, `template`). Each app is an Expo (React Native) app with its own `app.config.ts`, EAS config, and game logic.
- **packages/** — Shared libraries: `app-shell`, `game-core`, `storage`, `analytics`, `monetization`. Apps depend on these via `@bitcraft/*`.
- **scripts/** — Tooling. `create-game.js` scaffolds a new game from `apps/template`.
- **docs/** — Architecture and audit docs (this file, create-game audits).

**Factory flow:** Run `pnpm create-game <game-name>`. The script copies `apps/template`, replaces all template identifiers with the game name, generates assets and config files, adds root scripts, and validates the new app. The new app is automatically part of the workspace (`apps/*`) and can be run with `pnpm dev:<game-name>` after `pnpm install`.

---

## 2. How create-game works

1. **Parse CLI:** `<game-name>` plus optional flags: `--dry-run`, `--no-assets`, `--minimal`, `--with-ads`, `--with-analytics`.
2. **Validate:** Game name must be lowercase, alphanumeric with optional hyphens. Fail if `apps/<game-name>` already exists or `apps/template` is missing.
3. **Copy:** Recursively copy `apps/template` → `apps/<game-name>`. Remove `node_modules` from the copy.
4. **Identifiers:** In `package.json` set `name` to `@bitcraft/<game-name>`. In `app.config.ts` set slug, name, scheme, `ios.bundleIdentifier`, `android.package`. In all `.ts`, `.tsx`, `.json`, `.md` (excluding `node_modules`), replace whole-word `Template` → PascalCase name and `template` → game name. Rename `src/TemplateGameProvider.tsx` → `src/<PascalName>GameProvider.tsx`.
5. **Generated files:** Always write `src/gameConfig.ts`. If not `--minimal` or if `--with-analytics`, write `src/analyticsEvents.ts`. If not `--minimal` or if `--with-ads`, write `src/monetizationConfig.ts`.
6. **Assets (unless `--no-assets`):** Create `assets/` and generate `icon.png` (1024×1024), `adaptive-icon.png` (1024×1024), `splash.png` (2048×2048), `favicon.png` (48×48) using a hash-derived background color and the game’s first letter. Update `app.config.ts` with `icon`, `splash`, `android.adaptiveIcon`, `web.favicon`.
7. **Root scripts:** Append to root `package.json`: `dev:<game-name>`, `ios:<game-name>`, `android:<game-name>`, `web:<game-name>` (each calling `pnpm --filter @bitcraft/<game-name> …`).
8. **Validation:** Run `pnpm install --no-frozen-lockfile`, then `pnpm --filter @bitcraft/<game-name> typecheck`, then `npx expo config --type public` in the app directory. If any step fails, remove the generated app directory and exit with an error.
9. **Leakage check:** Scan the new app for remaining `Template`, `template`, `@bitcraft/template`, `br.dev.bitcraft.template`. If found, print a warning and list files.
10. **Output:** Print created app path, updated identifiers, and next steps (`pnpm install`, `pnpm --filter @bitcraft/<game-name> start`).

On any error after the directory is created, the script removes the partial app directory and exits.

---

## 3. Asset generation system

- **Location:** `scripts/create-game-assets.js`. Used by `create-game.js` when `--no-assets` is not set.
- **Input:** Game name and display name (e.g. `flappy`, `Flappy`).
- **Output:** Under `apps/<game-name>/assets/`:
  - `icon.png` — 1024×1024
  - `adaptive-icon.png` — 1024×1024
  - `splash.png` — 2048×2048
  - `favicon.png` — 48×48
- **Style:** Background color is derived from a hash of the game name (HSL → RGB). A single centered letter (first letter of display name) is drawn in white, sans-serif, bold. Implemented via SVG and **sharp** (Node) to produce PNGs.
- **Expo config:** After generation, `app.config.ts` is updated with `icon`, `splash` (image, resizeMode, backgroundColor), `android.adaptiveIcon` (foregroundImage, backgroundColor), and `web.favicon`.

---

## 4. Analytics system

- **Package:** `@bitcraft/analytics` (mock provider, event types, helpers).
- **Generated file (when not `--minimal` or with `--with-analytics`):** `apps/<game-name>/src/analyticsEvents.ts`.
- **Contents:** Re-export of standard event names (e.g. `game_opened`, `game_started`, `game_paused`, `game_resumed`, `game_over`, `high_score_updated`, `ad_reward_claimed`, `purchase_completed`) and helpers that fix `gameId` to the new game name: `createGameStartedEvent()`, `createGameOverEvent()`, `createGamePausedEvent()`, `createGameResumedEvent()`.
- **Usage:** The app’s provider or screens import these and call `trackEvent(createGameOverEvent({ score: 100 }))` etc.

---

## 5. Monetization system

- **Package:** `@bitcraft/monetization` (mock ads and IAP).
- **Generated file (when not `--minimal` or with `--with-ads`):** `apps/<game-name>/src/monetizationConfig.ts`.
- **Contents:** Placements: `banner_home`, `banner_gameover`, `interstitial_gameover`, `reward_extra_life`, `reward_double_coins`. A `getMonetization()` function returns `createMockMonetization({ namespace: "<game-name>", products: [] })`.
- **Usage:** The app’s provider uses `getMonetization()` for ads and purchases; default is mock.

---

## 6. CLI options

| Option | Effect |
|--------|--------|
| (none) | Full setup: assets, gameConfig, analytics, monetization, root scripts, validation. |
| `--dry-run` | No files written; print what would be created (app path, identifiers, assets, files, root scripts). |
| `--no-assets` | Skip asset generation and do not add icon/splash/favicon to `app.config.ts`. |
| `--minimal` | Skip `analyticsEvents.ts` and `monetizationConfig.ts`. Still creates `gameConfig.ts`, theme/i18n (from template), and root scripts. |
| `--with-ads` | Ensure `monetizationConfig.ts` is created even when `--minimal` is set. |
| `--with-analytics` | Ensure `analyticsEvents.ts` is created even when `--minimal` is set. |

**Examples:**

```bash
pnpm create-game flappy
pnpm create-game puzzle --minimal
pnpm create-game runner --with-ads
pnpm create-game demo --no-assets --dry-run
```

---

## 7. Example commands

```bash
# Full game
pnpm create-game flappy

# Minimal (no analytics/monetization config)
pnpm create-game puzzle --minimal

# With ads config only (e.g. with minimal)
pnpm create-game runner --minimal --with-ads

# No assets (e.g. you will add your own)
pnpm create-game mygame --no-assets

# Preview only
pnpm create-game mygame --dry-run
```

After creation:

```bash
pnpm install
pnpm dev:flappy
pnpm ios:flappy
pnpm android:flappy
pnpm web:flappy
```

---

## 8. Example generated app structure

```
apps/<game-name>/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── settings.tsx
├── assets/              # if not --no-assets
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash.png
│   └── favicon.png
├── src/
│   ├── <PascalName>GameProvider.tsx
│   ├── game.ts
│   ├── gameConfig.ts
│   ├── analyticsEvents.ts    # unless --minimal (or with --with-analytics)
│   ├── monetizationConfig.ts # unless --minimal (or with --with-ads)
│   ├── theme.ts
│   ├── useThemePreference.ts
│   ├── useLanguagePreference.ts
│   └── i18n/
│       ├── index.ts
│       ├── en.json
│       ├── es.json
│       ├── de.json
│       ├── fr.json
│       ├── it.json
│       └── pt-BR.json
├── app.config.ts
├── package.json
├── tsconfig.json
├── eas.json
└── ...
```

---

## 9. Safety mechanisms

- **Validation:** Game name format; app directory must not exist; template must exist.
- **Idempotency:** On any error after creating the app directory, the script removes that directory and exits so the repo is not left in a half-created state.
- **No overwrite:** Existing apps (e.g. `snake`, `tictactoe`, `template`) are never modified. Only `apps/<game-name>` and root `package.json` (new scripts only) are written.
- **Workspace:** The script does not modify `pnpm-workspace.yaml`. New apps are picked up by `apps/*`.
- **Post-generation validation:** `pnpm install`, typecheck, and `expo config` run; on failure the new app is deleted and an error is printed.
- **Leakage check:** After generation, the new app is scanned for leftover template identifiers; warnings are printed and files listed.

---

## 10. How to create 10+ games quickly

1. **Batch with a shell loop:**

   ```bash
   for name in game1 game2 game3; do pnpm create-game "$name"; done
   ```

2. **Use `--minimal`** when you do not need analytics/monetization config yet to speed up and reduce generated surface.
3. **Use `--no-assets`** when you will replace all assets with custom art.
4. **Run `pnpm install` once** after creating multiple apps so the lockfile and links are updated once.
5. **Root scripts:** Each new game gets `dev:<name>`, `ios:<name>`, `android:<name>`, `web:<name>`, so you can run any game with `pnpm dev:<name>` etc.
6. **Dry-run first:** Use `pnpm create-game <name> --dry-run` to confirm identifiers and options before creating many games.

---

## 11. Theme system

Every generated app includes:

- **`src/theme.ts`** — Defines `ThemeMode` (`"system" | "light" | "dark"`) and a storage key (namespace uses game name after replacement).
- **`src/useThemePreference.ts`** — Hook that loads/saves theme preference via `@bitcraft/storage` (async storage adapter with game namespace). Returns `themePreference`, `setThemePreference`, `ready`.
- **Settings:** The generated settings screen includes a theme selector (System / Light / Dark). The app shell can consume the theme mode for styling.

Default is **system**; user can override to light or dark. Preference is persisted so it survives restarts.

---

## 12. i18n (internationalization)

Every generated app includes a minimal i18n setup.

**Supported languages:**

- English (en) — default fallback  
- Spanish (es)  
- German (de)  
- French (fr)  
- Italian (it)  
- Portuguese Brazil (pt-BR)

**Language mode options:** `system`, `en`, `es`, `de`, `fr`, `it`, `pt-BR`.

**Behavior:**

- Default language mode is **system**.
- When mode is **system**, the app should use the device language (e.g. via `expo-localization`).
- If the device language is supported, use it; otherwise fall back to **English (en)**.

**Files:**

- `src/i18n/index.ts` — Exports `t(key)` (e.g. `t("game.start")`, `t("settings.language")`), locale type, and supported locales. Template uses a simple nested lookup; can be extended with typed keys.
- `src/i18n/en.json`, `es.json`, `de.json`, `fr.json`, `it.json`, `pt-BR.json` — Flat or nested keys for game and settings strings (e.g. Game Over, Pause, Resume, Settings, Language, Sound, Haptics).

**Locale detection:**

- Use an Expo-compatible approach (e.g. `expo-localization`) to read system locale.
- Normalize codes (e.g. `en-US` → `en`, `en-GB` → `en`, `es-MX` → `es`, `pt-BR` / `pt-PT` → `pt-BR` or fallback to `pt-BR`).

**Persistence:**

- `@bitcraft/storage` stores the user’s language preference (e.g. key `languagePreference`). Values: `system`, `en`, `es`, `de`, `fr`, `it`, `pt-BR`.

**Settings:**

- The generated settings screen includes a language selector: System, English, Español, Deutsch, Français, Italiano, Português (Brasil). On change, persist and update i18n context so the UI updates.

**Adding a new language:**

1. Add a new locale code (e.g. `ja`) to the supported list and type.
2. Add `src/i18n/ja.json` with the same key structure as `en.json`.
3. Register the translations in `i18n/index.ts` (or your loader).
4. Add the option to the language selector in settings and to the persisted `languagePreference` values.

Dry-run output mentions that theme and i18n files/settings would be created (they are part of the template and get identifier replacement).
