# Bitcraft Monorepo Architecture Audit

Date: <!-- keep this as a simple text so it does not get stale too quickly -->

## 1. Workspace Configuration

**Status:** ✅ Compliant

- `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- Root `package.json` workspaces:

```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

Both match the expected `apps/*` and `packages/*` pattern.

## 2. Package Naming

**Status:** ✅ Compliant

All internal packages use the `@bitcraft/*` namespace:

- `@bitcraft/app-shell`
- `@bitcraft/game-core`
- `@bitcraft/storage`
- `@bitcraft/analytics`
- `@bitcraft/monetization`

All apps also use the same namespace:

- `@bitcraft/snake`
- `@bitcraft/tictactoe`
- `@bitcraft/template`

## 3. Dependency Direction

### Expected Flow

```text
apps/*
   ↓
app-shell
   ↓
game-core
   ↓
storage

analytics
monetization
```

### Observed Dependencies

**Between packages:**

- `@bitcraft/app-shell`
  - depends on: `@bitcraft/game-core`
- `@bitcraft/game-core`
  - depends on: (none)
- `@bitcraft/storage`
  - peerDepends on: `@react-native-async-storage/async-storage`
  - depends on: (none internal)
- `@bitcraft/analytics`
  - depends on: (none internal)
- `@bitcraft/monetization`
  - depends on: (none internal)

**From apps to packages:**

- All apps import packages **only** via:
  - `@bitcraft/app-shell`
  - `@bitcraft/game-core`
  - `@bitcraft/storage`
  - `@bitcraft/analytics`
  - `@bitcraft/monetization`

### Rule Checks

- **`game-core` must not depend on UI**  
  - `@bitcraft/game-core` has **no** dependencies on `react`, `react-native`, or `@bitcraft/app-shell`.  
  - ✅ Compliant

- **`storage` must not depend on apps**  
  - `@bitcraft/storage` uses only AsyncStorage as a peer dependency and exports pure storage helpers.  
  - ✅ Compliant

- **`analytics` must not depend on apps**  
  - `@bitcraft/analytics` is entirely app-agnostic and uses only plain TypeScript types and console logging in the mock.  
  - ✅ Compliant

- **`monetization` must not depend on apps**  
  - `@bitcraft/monetization` is app-agnostic and only provides interfaces and mocks.  
  - ✅ Compliant

## 4. Public API Boundaries

**Status:** ✅ Compliant

Search results in `apps/*`:

- Imports from packages always use the public namespace:

```ts
import { GameShell, PrimaryButton, ... } from "@bitcraft/app-shell";
import { createGameSession, ... } from "@bitcraft/game-core";
import { createAsyncStorageAdapter, ... } from "@bitcraft/storage";
import { createAnalyticsClient, ... } from "@bitcraft/analytics";
import { createMockMonetization } from "@bitcraft/monetization";
```

- No occurrences of:
  - `../../packages/...`
  - `packages/*/src/*`
  - `../src/...` referencing shared packages

Apps only touch packages through their declared public entrypoints.

## 5. Circular Dependencies

**Status:** ✅ No circular dependencies detected

Based on `package.json` dependencies:

- `@bitcraft/game-core`: depends on none
- `@bitcraft/app-shell`: depends on `@bitcraft/game-core`
- `@bitcraft/storage`: no internal deps
- `@bitcraft/analytics`: no internal deps
- `@bitcraft/monetization`: no internal deps

There is no path from any package back to itself through other packages.

## 6. Native App Identifiers

**Status:** ✅ Compliant (after adjustment)

Each `app.config.ts` now uses `br.dev.bitcraft.<app>`:

- `apps/snake/app.config.ts`
  - `ios.bundleIdentifier: "br.dev.bitcraft.snake"`
  - `android.package: "br.dev.bitcraft.snake"`

- `apps/tictactoe/app.config.ts`
  - `ios.bundleIdentifier: "br.dev.bitcraft.tictactoe"`
  - `android.package: "br.dev.bitcraft.tictactoe"`

- `apps/template/app.config.ts`
  - `ios.bundleIdentifier: "br.dev.bitcraft.template"`
  - `android.package: "br.dev.bitcraft.template"`

Previously these used `com.bitcraft.*` and were updated to match the requested reverse-domain pattern.

## 7. Package Public API

**Status:** ✅ Compliant

Each package exposes a `src/index.ts` (or `index.tsx`) and apps import from those entrypoints:

- `packages/app-shell/src/index.tsx`
- `packages/game-core/src/index.ts`
- `packages/storage/src/index.ts`
- `packages/analytics/src/index.ts`
- `packages/monetization/src/index.ts`

No app imports internal deep files inside these packages.

## 8. Template App Integrity

**Status:** ✅ Compliant

Checks on `apps/template`:

- No references to `snake` or `tictactoe` in:
  - `app/*.tsx`
  - `src/*.ts` / `src/*.tsx`
  - `app.config.ts`
  - `package.json`

The template:

- has its own generic copy in English
- references only `template` in analytics and monetization mocks
- does not depend on game-specific logic from other apps

This makes it safe to clone as a starting point for a third (or nth) game.

## 9. Build Validation

**Status:** ✅ All requested commands pass

Executed commands:

- `pnpm install --no-frozen-lockfile`
- `pnpm typecheck`
- `pnpm --filter @bitcraft/snake exec expo export --platform web --output-dir .expo-dist-web`
- `pnpm --filter @bitcraft/tictactoe exec expo export --platform web --output-dir .expo-dist-web`

All completed successfully with Expo Router and SDK 55.

## 10. Import Violations

**Status:** ✅ None found

Searches for problematic patterns:

- `../../packages/`
- `packages/*/src/*`
- `../src/` (for shared code)

Result: no such imports in `apps/*`. All shared concerns are accessed via `@bitcraft/*` namespaces.

## Dependency Graph (Summary)

```text
apps/snake
   ├─ @bitcraft/app-shell
   ├─ @bitcraft/game-core
   ├─ @bitcraft/storage
   ├─ @bitcraft/analytics
   └─ @bitcraft/monetization

apps/tictactoe
   ├─ @bitcraft/app-shell
   ├─ @bitcraft/game-core
   ├─ @bitcraft/storage
   ├─ @bitcraft/analytics
   └─ @bitcraft/monetization

apps/template
   ├─ @bitcraft/app-shell
   ├─ @bitcraft/game-core
   ├─ @bitcraft/storage
   ├─ @bitcraft/analytics
   └─ @bitcraft/monetization

@bitcraft/app-shell
   └─ @bitcraft/game-core

@bitcraft/game-core
   └─ (no internal deps)

@bitcraft/storage
   └─ (no internal deps; AsyncStorage as peer)

@bitcraft/analytics
   └─ (no internal deps)

@bitcraft/monetization
   └─ (no internal deps)
```

## Violations Summary

**Current:**  
- None. All 10 checks are currently passing after adjustments.

**Previously (fixed during this audit):**

- Native identifiers used `com.bitcraft.*` instead of the requested `br.dev.bitcraft.*`.

## Recommendations

- **Lock interfaces in small packages (optional):**  
  Consider adding a small `@bitcraft/types` package only if cross-cutting types start leaking across multiple packages. At the current size, keeping types local is fine.

- **Explicit testing harness package (future):**  
  If you add more games, a tiny `test-harness` or `dev-tools` package for mock-only helpers (e.g. debug overlays, test-only menus) might help avoid leaking debug logic into production packages.

- **Document new game checklist in-code (DX):**  
  The README already has a good checklist. Mirroring a short, code-level checklist (comments or small helper file in `apps/template`) can further streamline onboarding.

- **Consider stricter linting for imports (future):**  
  A lint rule (e.g. ESLint `no-restricted-imports`) could enforce:
  - no `../../packages/` imports
  - no imports from other apps
  This would turn current conventions into enforceable rules.

## Architecture Score

**Score:** **9/10**

Rationale:

- ✅ Clear workspace and naming conventions
- ✅ Clean dependency graph, no cycles
- ✅ UI, session model, storage, analytics, and monetization are well-separated
- ✅ Template app is generic and reusable
- ✅ All packages expose clean `src/index.ts` entrypoints
- ✅ Builds and exports pass in a monorepo setting

The remaining point is reserved for future hardening (lint rules for imports, explicit tests for dependency direction, and possibly a small documentation layer inside the repo that codifies the architecture rules as “contracts”).*** End Patch
