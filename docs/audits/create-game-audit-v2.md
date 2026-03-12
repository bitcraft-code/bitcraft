# create-game script — Audit v2

Audit report for the production-grade `create-game` script (v2). For use by engineers reviewing the implementation.

---

## 1. Full contents of the new script

Path: `scripts/create-game.js`

```javascript
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");
const TEMPLATE_DIR = path.join(APPS_DIR, "template");

const GAME_NAME_REGEX = /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/;

const REPLACEMENT_FILE_EXT = /\.(ts|tsx|json|md)$/;

const LEAKAGE_PATTERNS = [
  { name: "Template (word)", regex: /\bTemplate\b/g },
  { name: "template (word)", regex: /\btemplate\b/g },
  { name: "@bitcraft/template", regex: /@bitcraft\/template/g },
  { name: "br.dev.bitcraft.template", regex: /br\.dev\.bitcraft\.template/g },
];

function parseArgs(argv) {
  const args = argv.slice(2).filter((a) => a !== "--dry-run");
  const dryRun = argv.includes("--dry-run");
  return { gameName: args[0], dryRun };
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function gameNameToPascal(name) {
  return name
    .split("-")
    .map((part) => capitalize(part))
    .join("");
}

function gameNameToDisplayName(name) {
  return name
    .split("-")
    .map((part) => capitalize(part))
    .join(" ");
}

function validateGameName(name) {
  if (!name || typeof name !== "string") {
    console.error("Error: Game name is required.");
    console.error("Usage: pnpm create-game <game-name> [--dry-run]");
    console.error("Example: pnpm create-game flappy");
    console.error("Example: pnpm create-game my-game --dry-run");
    process.exit(1);
  }
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) {
    console.error("Error: Game name cannot be empty.");
    process.exit(1);
  }
  if (!GAME_NAME_REGEX.test(trimmed)) {
    console.error(
      "Error: Game name must be lowercase, alphanumeric with optional hyphens (e.g. flappy, my-game)."
    );
    process.exit(1);
  }
  return trimmed;
}

function replaceInFile(filePath, content, pascalName, gameName) {
  return content
    .replace(/\bTemplate\b/g, () => pascalName)
    .replace(/\btemplate\b/g, () => gameName);
}

function walkDir(dir, extRegex, callback, baseDir = dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      walkDir(full, extRegex, callback, baseDir);
    } else if (e.isFile() && extRegex.test(e.name)) {
      callback(full, baseDir);
    }
  }
}

function detectLeakage(appDir) {
  const leaks = [];
  walkDir(appDir, REPLACEMENT_FILE_EXT, (filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(appDir, filePath);
    for (const { name, regex } of LEAKAGE_PATTERNS) {
      const re = new RegExp(regex.source);
      if (re.test(content)) {
        leaks.push({ file: relativePath, pattern: name });
      }
    }
  });
  return leaks;
}

function logCreatedApp(gameName, displayName, dryRun) {
  const prefix = dryRun ? "[dry-run] " : "";
  console.log("");
  console.log(`${prefix}Created app:`);
  console.log(`  apps/${gameName}`);
  console.log("");
  console.log(`${prefix}Updated identifiers:`);
  console.log(`  package.json name       → @bitcraft/${gameName}`);
  console.log(`  expo name               → Bitcraft ${displayName}`);
  console.log(`  expo slug               → ${gameName}`);
  console.log(`  scheme                  → bitcraft-${gameName}`);
  console.log(`  ios bundleIdentifier   → br.dev.bitcraft.${gameName}`);
  console.log(`  android package         → br.dev.bitcraft.${gameName}`);
  console.log("");
  console.log(`${prefix}Next steps:`);
  console.log(`  pnpm install`);
  console.log(`  pnpm --filter @bitcraft/${gameName} start`);
  console.log("");
}

function main() {
  const { gameName: rawName, dryRun } = parseArgs(process.argv);
  const gameName = validateGameName(rawName);
  const appDir = path.join(APPS_DIR, gameName);
  const displayName = gameNameToDisplayName(gameName);
  const pascalName = gameNameToPascal(gameName);

  if (fs.existsSync(appDir)) {
    console.error(`Error: App "apps/${gameName}" already exists.`);
    process.exit(1);
  }

  if (!fs.existsSync(TEMPLATE_DIR)) {
    console.error("Error: apps/template not found.");
    process.exit(1);
  }

  if (dryRun) {
    console.log("[dry-run] Would create app from template: apps/" + gameName);
    console.log("[dry-run] Identifiers that would be replaced:");
    console.log("  Template (word boundary) → " + pascalName);
    console.log("  template (word boundary) → " + gameName);
    console.log("[dry-run] Display name: Bitcraft " + displayName);
    console.log("[dry-run] Files that would be processed: .ts, .tsx, .json, .md (excluding node_modules)");
    logCreatedApp(gameName, displayName, true);
    return;
  }

  let created = false;
  try {
    fs.cpSync(TEMPLATE_DIR, appDir, { recursive: true });
    created = true;

    const nodeModulesDir = path.join(appDir, "node_modules");
    if (fs.existsSync(nodeModulesDir)) {
      fs.rmSync(nodeModulesDir, { recursive: true });
    }

    const packagePath = path.join(appDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    pkg.name = `@bitcraft/${gameName}`;
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");

    const appConfigPath = path.join(appDir, "app.config.ts");
    let appConfig = fs.readFileSync(appConfigPath, "utf8");
    appConfig = appConfig
      .replace(/name: "Bitcraft Template"/, `name: "Bitcraft ${displayName}"`)
      .replace(/slug: "template"/, `slug: "${gameName}"`)
      .replace(/scheme: "bitcraft-template"/, `scheme: "bitcraft-${gameName}"`)
      .replace(
        /bundleIdentifier: "br\.dev\.bitcraft\.template"/,
        `bundleIdentifier: "br.dev.bitcraft.${gameName}"`
      )
      .replace(
        /package: "br\.dev\.bitcraft\.template"/,
        `package: "br.dev.bitcraft.${gameName}"`
      );
    fs.writeFileSync(appConfigPath, appConfig);

    walkDir(appDir, REPLACEMENT_FILE_EXT, (filePath) => {
      const content = fs.readFileSync(filePath, "utf8");
      const next = replaceInFile(filePath, content, pascalName, gameName);
      if (next !== content) {
        fs.writeFileSync(filePath, next);
      }
    });

    const oldProviderPath = path.join(appDir, "src", "TemplateGameProvider.tsx");
    const newProviderPath = path.join(appDir, "src", `${pascalName}GameProvider.tsx`);
    if (fs.existsSync(oldProviderPath)) {
      fs.renameSync(oldProviderPath, newProviderPath);
    }

    const leaks = detectLeakage(appDir);
    if (leaks.length > 0) {
      const byFile = leaks.reduce((acc, { file, pattern }) => {
        if (!acc[file]) acc[file] = [];
        acc[file].push(pattern);
        return acc;
      }, {});
      console.warn("");
      console.warn("Warning: Possible template identifier leakage detected:");
      for (const [file, patterns] of Object.entries(byFile)) {
        console.warn(`  ${file}: ${patterns.join(", ")}`);
      }
      console.warn("");
    }

    console.log("Creating app from template: apps/" + gameName);
    logCreatedApp(gameName, displayName, false);
  } catch (err) {
    if (created && fs.existsSync(appDir)) {
      try {
        fs.rmSync(appDir, { recursive: true });
        console.error("Removed partially created app due to error.");
      } catch (rmErr) {
        console.error("Failed to remove partial app:", rmErr.message);
      }
    }
    throw err;
  }
}

main();
```

---

## 2. Explanation of each improvement

| Area | Change | Rationale |
|------|--------|-----------|
| **Identifier replacement** | `content.split(from).join(to)` replaced by regex with word boundaries: `\bTemplate\b` and `\btemplate\b`. Replacement uses a function `() => pascalName` / `() => gameName` to avoid special-character issues in replacement strings. | Prevents replacing substrings inside other identifiers (e.g. `templateId`, `templateValue` stay unchanged). |
| **File types** | Replacement now runs on `.ts`, `.tsx`, `.json`, and `.md` (regex: `/\.(ts|tsx|json|md)$/`). `walkDir` still skips `node_modules`. | Ensures all relevant source and config files get identifier updates. |
| **Display name** | New `gameNameToDisplayName()`: split on `-`, capitalize each part, join with space. Example: `my-game` → `"My Game"`. Used in Expo `name: "Bitcraft My Game"`. PascalCase for code unchanged: `gameNameToPascal()` → `MyGame`. | Human-readable app name in launcher and Expo; code keeps valid PascalCase identifiers. |
| **Logging** | Dedicated `logCreatedApp()`: "Created app", "Updated identifiers" (package name, expo name/slug, scheme, bundleIdentifier, android package), "Next steps". | Clear, consistent output for production use. |
| **Template leakage** | After all writes, `detectLeakage()` scans the new app (same file types as replacement) for `\bTemplate\b`, `\btemplate\b`, `@bitcraft/template`, `br.dev.bitcraft.template`. Uses a new `RegExp(regex.source)` per test to avoid stateful `lastIndex`. Prints a warning and lists affected files. | Catches missed replacements or new template references. |
| **Workspace safety** | Script only creates/updates `apps/<game-name>`. It does not read or write `pnpm-workspace.yaml` or any path outside the new app directory. Existing apps are untouched. | Workspace stays valid; new app is picked up by `apps/*`. |
| **Dry-run** | `parseArgs()` reads `--dry-run` from `process.argv`. When set: no `fs.cpSync`, no file writes; prints what would be created and which identifiers would be replaced, then returns. | Safe preview before creating an app. |
| **Idempotency / cleanup** | Main work after copy is in a `try`/`catch`. On any throw, if `appDir` was created, it is removed with `fs.rmSync(appDir, { recursive: true })` and a message; then the error is rethrown. | Failed runs do not leave a half-created app. |

---

## 3. Example command

```bash
pnpm create-game flappy
```

With dry-run:

```bash
pnpm create-game flappy --dry-run
pnpm create-game my-game --dry-run
```

---

## 4. Example output logs

**Normal run (`pnpm create-game flappy`):**

```
Creating app from template: apps/flappy

Created app:
  apps/flappy

Updated identifiers:
  package.json name       → @bitcraft/flappy
  expo name               → Bitcraft Flappy
  expo slug               → flappy
  scheme                  → bitcraft-flappy
  ios bundleIdentifier   → br.dev.bitcraft.flappy
  android package         → br.dev.bitcraft.flappy

Next steps:
  pnpm install
  pnpm --filter @bitcraft/flappy start
```

**Dry-run (`pnpm create-game my-game --dry-run`):**

```
[dry-run] Would create app from template: apps/my-game
[dry-run] Identifiers that would be replaced:
  Template (word boundary) → MyGame
  template (word boundary) → my-game
[dry-run] Display name: Bitcraft My Game
[dry-run] Files that would be processed: .ts, .tsx, .json, .md (excluding node_modules)

[dry-run] Created app:
  apps/my-game

[dry-run] Updated identifiers:
  package.json name       → @bitcraft/my-game
  expo name               → Bitcraft My Game
  expo slug               → my-game
  scheme                  → bitcraft-my-game
  ios bundleIdentifier   → br.dev.bitcraft.my-game
  android package         → br.dev.bitcraft.my-game

[dry-run] Next steps:
  pnpm install
  pnpm --filter @bitcraft/my-game start
```

**If leakage is detected (example):**

```
Warning: Possible template identifier leakage detected:
  some/file.ts: template (word), Template (word)
```

---

## 5. Dry-run mode

- **Trigger:** Any `process.argv` entry equal to `--dry-run` (e.g. `pnpm create-game flappy --dry-run`).
- **Behavior:** No files or directories are created or modified. The script validates the game name and that `apps/<game-name>` does not already exist and that `apps/template` exists, then prints:
  - That it would create `apps/<game-name>` from the template.
  - The two identifier replacements (Template → PascalCase name, template → game name).
  - The display name (e.g. "Bitcraft My Game").
  - The file extensions that would be processed.
  - The same "Created app", "Updated identifiers", and "Next steps" blocks as in a real run, prefixed with `[dry-run]`.
- **Purpose:** Let engineers and CI preview the effect of a create-game run without changing the repo.

---

## 6. Safety checks

- **Validation:** Game name required; must match `GAME_NAME_REGEX` (lowercase, alphanumeric + hyphens). Empty or invalid names exit with usage message.
- **Existing app:** If `apps/<game-name>` already exists, the script exits with an error and does not overwrite.
- **Template exists:** If `apps/template` is missing, the script exits with an error.
- **Template leakage:** After generation, the new app is scanned for remaining template identifiers; if any are found, a warning and file list are printed (non-blocking).
- **Cleanup on failure:** If an error is thrown after the directory copy, the new app directory is removed so the repo is not left in a half-created state.

---

## 7. Confirmation that template identifiers are replaced

| Identifier | Where | Replaced with |
|------------|--------|----------------|
| `@bitcraft/template` | package.json `name` | `@bitcraft/<game-name>` |
| `br.dev.bitcraft.template` | app.config.ts (ios, android) | `br.dev.bitcraft.<game-name>` |
| `Template` (whole word) | All scanned files | PascalCase name (e.g. `Flappy`, `MyGame`) |
| `template` (whole word) | All scanned files | `<game-name>` (e.g. `flappy`, `my-game`) |
| File `TemplateGameProvider.tsx` | Renamed | `<PascalName>GameProvider.tsx` (e.g. `FlappyGameProvider.tsx`) |

Expo `name` and `slug` in `app.config.ts` are set explicitly to `"Bitcraft <DisplayName>"` and `<game-name>`; scheme, bundleIdentifier, and android package are set via the same logic. Word-boundary replacement ensures identifiers like `templateId` or `templateValue` are not changed.

---

## 8. File types scanned for replacements

Extensions included in both replacement and leakage scan:

- `.ts`
- `.tsx`
- `.json`
- `.md`

Regex: `/\.(ts|tsx|json|md)$/`. The same `walkDir` is used for replacement and for leakage; it always skips the `node_modules` directory.

---

## 9. Example generated app.config.ts

For `pnpm create-game flappy`:

```typescript
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Bitcraft Flappy",
  slug: "flappy",
  scheme: "bitcraft-flappy",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  ios: {
    bundleIdentifier: "br.dev.bitcraft.flappy",
  },
  android: {
    package: "br.dev.bitcraft.flappy",
  },
};

export default config;
```

For `pnpm create-game my-game` the same structure would have `name: "Bitcraft My Game"`, `slug: "my-game"`, `scheme: "bitcraft-my-game"`, and identifiers `br.dev.bitcraft.my-game`.

---

## 10. Architecture compatibility with the monorepo

- **Workspace:** The repo uses `pnpm-workspace.yaml` with `apps/*` and `packages/*`. The script only creates a new directory under `apps/` and never modifies `pnpm-workspace.yaml`. Any new `apps/<game-name>` is therefore automatically part of the workspace.
- **Existing apps:** Only the new `apps/<game-name>` directory is created and written to. `apps/snake`, `apps/tictactoe`, and `apps/template` are never modified.
- **Packages:** The script does not touch `packages/`. The new app’s `package.json` is set to `@bitcraft/<game-name>` and keeps the same workspace dependencies (`@bitcraft/app-shell`, etc.); after `pnpm install`, the new app is linked like the others.
- **Root package.json:** The root script remains `"create-game": "node scripts/create-game.js"`. No other root scripts are changed. Arguments (e.g. `--dry-run`) are passed through by pnpm.

This keeps the script aligned with the existing monorepo layout and pnpm workspace behavior.
