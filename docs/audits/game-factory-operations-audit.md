# Game Factory Operations — Platform Audit

This document describes the four operational scripts added to the Bitcraft Mobile Game Factory Platform to improve **architecture governance**, **portfolio visibility**, and **game maintenance**.

Audience: senior engineers reviewing day‑to‑day operational tooling.

---

## 1. Overview of new scripts

New scripts under `scripts/`:

- `lint-architecture.js` → checks architecture invariants and forbidden import patterns.
- `doctor.js` → lightweight repository “doctor” for structural and documentation health.
- `list-games.js` → lists the current game portfolio and writes a JSON overview.
- `refresh-game.js` → refreshes operational artefacts for a single existing game.

They are wired into the root `package.json` as:

- `pnpm lint:architecture`
- `pnpm doctor`
- `pnpm list:games`
- `pnpm refresh:game -- <game-name>`

Goals:

- keep the **architecture clean** as the platform evolves,
- give quick **portfolio visibility** without opening multiple folders,
- make **per‑game maintenance** repeatable and scriptable.

---

## 2. lint-architecture.js

**Command:**

```bash
pnpm lint:architecture
```

**Responsibilities:**

- Enforce import rules:
  - no cross‑app imports (`apps/foo` must not import `apps/bar`),
  - no direct imports from `packages/*/src/*`,
  - no relative imports into `packages/` (e.g. `../../packages/*`, `../packages/*`),
  - shared code must be imported only via `@bitcraft/*`.
- Flag obvious misuses of the `@bitcraft/*` namespace (e.g. if someone tries to treat an app as a package).
- Perform a simple cycle detection over `@bitcraft/*` packages using their `package.json` dependency graph.
- Verify that **all templates** under `templates/*` still contain the placeholders:
  - `Template`
  - `template`

**Implementation notes:**

- File‑based, using `fs` + `path` only; no AST.
- Scans `.ts`, `.tsx`, `.js` under the repo (excluding `node_modules` / `.expo` artefacts).
- Uses regexes for `import ... from` and `require(...)` to collect module specifiers.
- Builds a small dependency graph from `packages/*/package.json` and runs DFS to detect cycles.

**Output:**

- Human‑readable console report:
  - `[FAIL] ... (file)` lines for violations,
  - `[WARN] ...` for softer issues, if any (currently focused on FAILs).
- Summary:

```text
Summary:
  FAIL: <n>
  WARN: <m>
  PASS: yes|no
```

- Exit code `1` if there is any FAIL; `0` otherwise.

**Example usage:**

```bash
pnpm lint:architecture
```

Run this before/after changes to generators, templates, or shared packages.

---

## 3. doctor.js

**Command:**

```bash
pnpm doctor
```

**Responsibilities:**

Lightweight health check of the repository:

1. **Top‑level folders:**
   - `apps/`, `packages/`, `templates/`, `scripts/`, `docs/` must exist.
2. **Doc entrypoints:**
   - `docs/instructions/game-factory-human-guide.md`
   - `docs/instructions/game-factory-ai-spec.md`
   - `docs/instructions/game-factory-agent-rules.md`
3. **Root scripts in `package.json`:**
   - `create-game`, `create-games`, `dashboard`,
   - `validate:all`, `validate:app`,
   - `check-release-readiness`,
   - `generate-screenshots`, `generate-aso-keywords`.
4. **Apps under `apps/*`:**
   - must have `package.json`,
   - must have `app.config.ts` or `app.json`,
   - must have `src/`,
   - check for `metadata/` (WARN if missing; may be intentional for template/minimal setups).
5. **Templates under `templates/*`:**
   - each template must have `app/`, `src/`, `package.json`, `app.config.ts`.

**Output:**

- `[PASS]`, `[WARN]`, `[FAIL]` lines describing each check.
- Summary:

```text
Summary:
  FAIL: <n>
  WARN: <m>
  PASS items: <k>
```

- Exit code:
  - `1` only if there is at least one FAIL (clearly broken structure),
  - `0` if only PASS/WARN.

**Example usage:**

```bash
pnpm doctor
```

Run this after cloning the repo or after big refactors (moving folders, renaming docs, etc.).

---

## 4. list-games.js

**Command:**

```bash
pnpm list:games
```

**Responsibilities:**

- Provide a quick **portfolio view** of all games under `apps/*` that have a `package.json`.
- For each game:
  - `game` name (app folder),
  - `genre`:
    - inferred from `src/gameMetadata.ts` (`subcategory`), or
    - from `metadata/appstore.json` subtitle (`"A <genre> game"`), or `"unknown"`,
  - `hasMetadata` (presence of `metadata/appstore.json` or `metadata/playstore.json`),
  - `hasScreenshots` (any `.png/.jpg/.jpeg` inside `metadata/screenshots/`),
  - `hasReleaseReadiness` (`metadata/release-readiness.md`),
  - `adsEnabled` / `analyticsEnabled`:
    - parsed from `src/features.ts` booleans, or `null` if not found.

**Output formats:**

1. **Console table** via `console.table`:

```text
=== Game Portfolio ===
┌─────────┬──────────────┬─────────┬─────────────┬─────────────────────┬──────┬───────────┐
│ (index) │    game      │ genre   │ metadata    │ screenshots         │ ads  │ analytics │
├─────────┼──────────────┼─────────┼─────────────┼─────────────────────┼──────┼───────────┤
│    0    │ flappy       │ arcade  │ yes         │ yes                 │ yes  │ yes       │
│    1    │ tictactoe    │ puzzle  │ yes         │ no                  │ no   │ yes       │
│   ...   │ ...          │ ...     │ ...         │ ...                 │ ...  │ ...       │
└─────────┴──────────────┴─────────┴─────────────┴─────────────────────┴──────┴───────────┘
```

2. **JSON file**:

```text
docs/audits/game-portfolio-overview.json
```

Shape:

```json
{
  "generatedAt": "2026-03-12T12:34:56.789Z",
  "games": [
    {
      "game": "flappy",
      "genre": "arcade",
      "hasMetadata": true,
      "hasScreenshots": true,
      "hasReleaseReadiness": true,
      "adsEnabled": true,
      "analyticsEnabled": true
    }
  ]
}
```

**Example usage:**

```bash
pnpm list:games
```

Use this to quickly see which games are operationally “complete” vs. which are still missing metadata, screenshots, or flags.

---

## 5. refresh-game.js

**Command:**

```bash
pnpm refresh:game -- <game-name>
```

**Responsibilities:**

Refresh operational artefacts for an **existing** game (does not recreate it):

1. **Regenerate ASO keywords** if `apps/<game>/metadata/` exists:
   - calls `node scripts/generate-aso-keywords.js <game>` (defaults genre when not specified).
2. **Regenerate placeholder screenshots**:
   - calls `node scripts/generate-screenshots.js <game>`,
   - clearly logs that placeholders may overwrite previous placeholder screenshots (but not hand‑curated assets if the user has changed names/locations).
3. **Re‑run release readiness**:
   - calls `node scripts/check-release-readiness.js <game>`,
   - keeps the Markdown report up to date.
4. **Optionally re‑run validation**:
   - calls `pnpm validate:app -- <game>`,
   - failures are logged as warnings but do not abort the entire refresh.

If the app does not exist (`apps/<game>` without `package.json`), the script fails fast with a clear error and exit code `1`.

**Example usage:**

```bash
pnpm refresh:game -- flappy
```

Useful when metadata, config, or templates have changed and a game needs its ASO/screenshots/readiness refreshed without re‑running `create-game`.

---

## 6. Documentation updates

The following documentation files were updated to describe the new scripts:

- `README.md`
  - Added `pnpm list:games` and `pnpm refresh:game -- <game>` to **Core Commands**.
  - Added `pnpm lint:architecture` and `pnpm doctor` under the validation/build section, with brief descriptions.
- `docs/instructions/game-factory-human-guide.md`
  - New **Repository Maintenance** section describing:
    - `pnpm lint:architecture`,
    - `pnpm doctor`,
    - `pnpm list:games`,
    - `pnpm refresh:game -- <game-name>`.
- `docs/instructions/game-factory-ai-spec.md`
  - Extended **Platform Capabilities** / **Performance Analysis** with `list:games`.
  - Added a **Maintenance & Governance** subsection explaining that agents should use:
    - `pnpm doctor`,
    - `pnpm lint:architecture`,
    before/after structural changes.
- `docs/instructions/game-factory-agent-rules.md`
  - In **Recommended Agent Workflow**, the “Before finishing” checklist now explicitly recommends running:
    - `pnpm doctor`,
    - `pnpm lint:architecture`,
    as part of the final validation.

---

## 7. How these scripts reduce architecture drift and maintenance cost

Together, these scripts close operational gaps that appear as the platform grows:

- **lint-architecture** makes it cheap to enforce architecture invariants:
  - no cross‑app imports,
  - only `@bitcraft/*` for shared code,
  - templates remain generator‑compatible,
  - simple cycle detection across internal packages.
- **doctor** guards the **skeleton** of the repo:
  - required folders,
  - key documentation entrypoints,
  - expected root scripts,
  - basic app/template structure.
- **list-games** provides a **single place** to understand the current portfolio:
  - which games exist,
  - which have metadata/screenshots/readiness,
  - which have ads/analytics enabled.
- **refresh-game** standardizes **per‑game maintenance**:
  - ASO keywords, screenshots, and readiness stay in sync with the latest platform expectations,
  - avoids re‑running `create-game` or ad‑hoc manual steps.

For senior engineers, this means:

- faster reviews (run `pnpm doctor` and `pnpm lint:architecture` to get immediate signal),
- easier triage when a game looks “off” in stores or analytics (use `pnpm list:games` + `pnpm refresh:game`),
- lower risk of architecture drift over time as more games and features are added.

