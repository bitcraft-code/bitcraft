"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");
const TEMPLATES_DIR = path.join(ROOT, "templates");

function getTemplateDir(genre) {
  const genreDir = path.join(TEMPLATES_DIR, genre);
  if (GENRES.includes(genre) && fs.existsSync(genreDir)) {
    return genreDir;
  }
  return path.join(APPS_DIR, "template");
}

const GAME_NAME_REGEX = /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/;

const REPLACEMENT_FILE_EXT = /\.(ts|tsx|json|md)$/;

const LEAKAGE_PATTERNS = [
  { name: "Template (word)", regex: /\bTemplate\b/g },
  { name: "template (word)", regex: /\btemplate\b/g },
  { name: "@bitcraft/template", regex: /@bitcraft\/template/g },
  { name: "br.dev.bitcraft.template", regex: /br\.dev\.bitcraft\.template/g },
];

const FLAGS = ["--dry-run", "--no-assets", "--minimal", "--with-ads", "--with-analytics", "--genre"];
const GENRES = ["arcade", "puzzle", "runner"];
const GENRE_KEYWORDS = {
  arcade: ["arcade", "casual", "retro", "fast", "highscore", "endless", "action"],
  puzzle: ["puzzle", "brain", "casual", "logic", "relax", "mind"],
  runner: ["runner", "endless", "casual", "fast", "arcade", "action"],
};

function parseArgs(argv) {
  const args = [];
  let genre = "arcade";
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--genre" && argv[i + 1]) {
      genre = argv[i + 1].toLowerCase();
      i++;
    } else if (!FLAGS.includes(argv[i])) {
      args.push(argv[i]);
    }
  }
  return {
    gameName: args[0],
    genre: GENRES.includes(genre) ? genre : "arcade",
    dryRun: argv.includes("--dry-run"),
    noAssets: argv.includes("--no-assets"),
    minimal: argv.includes("--minimal"),
    withAds: argv.includes("--with-ads"),
    withAnalytics: argv.includes("--with-analytics"),
  };
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
    console.error("Usage: pnpm create-game <game-name> [--dry-run] [--no-assets] [--minimal] [--with-ads] [--with-analytics] [--genre arcade|puzzle|runner]");
    console.error("Example: pnpm create-game flappy --genre arcade");
    console.error("Example: pnpm create-game puzzle --minimal --genre puzzle");
    console.error("Example: pnpm create-game runner --with-ads --genre runner");
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
    .replace(/\bTemplateGameProvider\b/g, () => `${pascalName}GameProvider`)
    .replace(/\buseTemplateGame\b/g, () => `use${pascalName}Game`)
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

function getDifficultyDefaults(genre) {
  const base = { speedMultiplier: 1.0, spawnRate: 1.0, dynamicDifficulty: false };
  if (genre === "runner") return { mode: "normal", ...base };
  if (genre === "puzzle") return { mode: "normal", ...base, speedMultiplier: 1.0 };
  return { mode: "normal", ...base };
}

function writeGameConfig(appDir, gameName, genre) {
  const d = getDifficultyDefaults(genre);
  const content = `export const gameConfig = {
  gameId: "${gameName}",
  maxLives: 3,
  enableSound: true,
  enableHaptics: true,
  difficulty: {
    mode: "${d.mode}",
    speedMultiplier: ${d.speedMultiplier},
    spawnRate: ${d.spawnRate},
    dynamicDifficulty: ${d.dynamicDifficulty},
  },
};
`;
  fs.writeFileSync(path.join(appDir, "src", "gameConfig.ts"), content);
}

function writeGameMetadata(appDir, gameName, displayName, genre) {
  const keywords = GENRE_KEYWORDS[genre] || GENRE_KEYWORDS.arcade;
  const content = `export const gameMetadata = {
  gameId: "${gameName}",
  title: {
    en: "Bitcraft ${displayName}",
    es: "Bitcraft ${displayName}",
    de: "Bitcraft ${displayName}",
  },
  shortDescription: {
    en: "Play ${displayName}. A ${genre} game.",
    es: "Juega ${displayName}. Un juego ${genre}.",
  },
  keywords: ${JSON.stringify([...keywords, gameName])},
  category: "games",
  subcategory: "${genre}",
};
`;
  fs.writeFileSync(path.join(appDir, "src", "gameMetadata.ts"), content);
}

function writeFeatures(appDir, opts) {
  const ads = !opts.minimal || opts.withAds;
  const analytics = !opts.minimal || opts.withAnalytics;
  const content = `export const features = {
  ads: ${ads},
  analytics: ${analytics},
  inAppPurchases: ${!opts.minimal},
  haptics: true,
  sound: true,
};
`;
  fs.writeFileSync(path.join(appDir, "src", "features.ts"), content);
}

function writeExperiments(appDir) {
  const content = `/**
 * Experiment flags for A/B testing. Local/static only.
 * Toggle these to test different UX or monetization variants.
 */
export const experiments = {
  newGameOverScreen: false,
  aggressiveAds: false,
  doubleCoinsReward: false,
} as const;

export type ExperimentKey = keyof typeof experiments;

export function isExperimentEnabled(key: ExperimentKey): boolean {
  return experiments[key];
}
`;
  fs.writeFileSync(path.join(appDir, "src", "experiments.ts"), content);
}

function writeMetadataFolder(appDir, gameName, displayName, genre) {
  const metadataDir = path.join(appDir, "metadata");
  fs.mkdirSync(metadataDir, { recursive: true });
  const keywords = GENRE_KEYWORDS[genre] || GENRE_KEYWORDS.arcade;
  const appstore = {
    title: `Bitcraft ${displayName}`,
    subtitle: `A ${genre} game`,
    description: `Play ${displayName}. A ${genre} game from Bitcraft.`,
    keywords: [...keywords, gameName].join(", "),
    supportUrl: "https://bitcraft.dev/support",
    privacyUrl: "https://bitcraft.dev/privacy",
  };
  const playstore = {
    title: `Bitcraft ${displayName}`,
    shortDescription: `Play ${displayName}. A ${genre} game.`,
    fullDescription: `Play ${displayName}. A ${genre} game from Bitcraft.`,
    keywords: [...keywords, gameName],
    supportUrl: "https://bitcraft.dev/support",
    privacyUrl: "https://bitcraft.dev/privacy",
  };
  fs.writeFileSync(path.join(metadataDir, "appstore.json"), JSON.stringify(appstore, null, 2) + "\n");
  fs.writeFileSync(path.join(metadataDir, "playstore.json"), JSON.stringify(playstore, null, 2) + "\n");
}

function writeAnalyticsEvents(appDir, gameName) {
  const content = `import {
  createGameOpenedEvent as createGameOpenedEventBase,
  createGameStartedEvent as createGameStartedEventBase,
  createGamePausedEvent as createGamePausedEventBase,
  createGameResumedEvent as createGameResumedEventBase,
  createGameOverEvent as createGameOverEventBase,
  standardGameEventNames,
} from "@bitcraft/analytics";

export const gameAnalyticsEventNames = {
  game_opened: standardGameEventNames.appOpened,
  game_started: standardGameEventNames.gameStarted,
  game_paused: standardGameEventNames.gamePaused,
  game_resumed: standardGameEventNames.gameResumed,
  game_over: standardGameEventNames.gameOver,
  high_score_updated: "high_score_updated",
  ad_reward_claimed: "ad_reward_claimed",
  purchase_completed: standardGameEventNames.purchaseCompleted,
} as const;

export const createGameOpenedEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGameOpenedEventBase("${gameName}", params);
export const createGameStartedEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGameStartedEventBase("${gameName}", params);
export const createGameOverEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGameOverEventBase("${gameName}", params);
export const createGamePausedEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGamePausedEventBase("${gameName}", params);
export const createGameResumedEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGameResumedEventBase("${gameName}", params);
`;
  fs.writeFileSync(path.join(appDir, "src", "analyticsEvents.ts"), content);
}

function writeMonetizationConfig(appDir, gameName) {
  const content = `import type { MonetizationServices } from "@bitcraft/monetization";
import { createMockMonetization } from "@bitcraft/monetization";

export const monetizationPlacements = {
  banner_home: "banner_home",
  banner_gameover: "banner_gameover",
  interstitial_gameover: "interstitial_gameover",
  reward_extra_life: "reward_extra_life",
  reward_double_coins: "reward_double_coins",
} as const;

export function getMonetization(): MonetizationServices {
  return createMockMonetization({
    namespace: "${gameName}",
    products: [],
  });
}
`;
  fs.writeFileSync(path.join(appDir, "src", "monetizationConfig.ts"), content);
}

function appendAppConfigAssets(appConfigPath) {
  let c = fs.readFileSync(appConfigPath, "utf8");
  if (c.includes("icon:")) return;
  c = c.replace(
    /(const config: ExpoConfig = \{)\n/,
    "$1\n  icon: \"./assets/icon.png\",\n  splash: { image: \"./assets/splash.png\", resizeMode: \"contain\", backgroundColor: \"#ffffff\" },\n  "
  );
  c = c.replace(
    /(android: \{\s*)(package:)/,
    "$1adaptiveIcon: { foregroundImage: \"./assets/adaptive-icon.png\", backgroundColor: \"#ffffff\" },\n    $2"
  );
  if (!c.includes("web:")) {
    c = c.replace(/(\n};)/, "\n  web: { favicon: \"./assets/favicon.png\" },\n};");
  } else if (!c.includes("favicon")) {
    c = c.replace(/web: \{\s*/, "web: { favicon: \"./assets/favicon.png\", ");
  }
  fs.writeFileSync(appConfigPath, c);
}

function addRootScripts(gameName) {
  const pkgPath = path.join(ROOT, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const filter = `@bitcraft/${gameName}`;
  const scripts = pkg.scripts || {};
  if (!scripts[`dev:${gameName}`]) scripts[`dev:${gameName}`] = `pnpm --filter ${filter} start`;
  if (!scripts[`ios:${gameName}`]) scripts[`ios:${gameName}`] = `pnpm --filter ${filter} ios`;
  if (!scripts[`android:${gameName}`]) scripts[`android:${gameName}`] = `pnpm --filter ${filter} android`;
  if (!scripts[`web:${gameName}`]) scripts[`web:${gameName}`] = `pnpm --filter ${filter} web`;
  pkg.scripts = scripts;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

function runValidation(appDir, gameName) {
  const { execSync } = require("child_process");
  try {
    execSync("pnpm install --no-frozen-lockfile", { cwd: ROOT, stdio: "pipe", encoding: "utf8" });
  } catch (e) {
    throw new Error(`pnpm install failed: ${e.message || e}`);
  }
  try {
    execSync(`pnpm --filter @bitcraft/${gameName} typecheck`, {
      cwd: ROOT,
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch (e) {
    const stdout = e.stdout || "";
    const stderr = e.stderr || "";
    const details = [stdout.trim(), stderr.trim()].filter(Boolean).join("\n\n");
    throw new Error(
      `Typecheck failed: ${e.message || e}${
        details ? `\n\nTypecheck output:\n${details}` : ""
      }`
    );
  }
  try {
    execSync("npx expo config --type public", {
      cwd: appDir,
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch (e) {
    throw new Error(`Expo config validation failed: ${e.message || e}`);
  }
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

async function main() {
  const opts = parseArgs(process.argv);
  const gameName = validateGameName(opts.gameName);
  const appDir = path.join(APPS_DIR, gameName);
  const displayName = gameNameToDisplayName(gameName);
  const pascalName = gameNameToPascal(gameName);

  const includeAnalytics = !opts.minimal || opts.withAnalytics;
  const includeMonetization = !opts.minimal || opts.withAds;

  if (fs.existsSync(appDir)) {
    console.error(`Error: App "apps/${gameName}" already exists.`);
    process.exit(1);
  }

  const templateDir = getTemplateDir(opts.genre);
  if (!fs.existsSync(templateDir)) {
    console.error("Error: Template not found. Expected apps/template or templates/" + opts.genre + ".");
    process.exit(1);
  }

  if (opts.dryRun) {
    console.log("[dry-run] Would create app from template: " + path.relative(ROOT, templateDir));
    console.log("[dry-run] Genre: " + opts.genre + " (template, ASO keywords, metadata, difficulty defaults)");
    console.log("[dry-run] Identifiers that would be replaced:");
    console.log("  Template (word boundary) → " + pascalName);
    console.log("  template (word boundary) → " + gameName);
    console.log("[dry-run] Display name: Bitcraft " + displayName);
    console.log("[dry-run] Files that would be processed: .ts, .tsx, .json, .md (excluding node_modules)");
    if (!opts.noAssets) {
      console.log("[dry-run] Assets that would be generated:");
      console.log("  assets/icon.png (1024x1024), assets/adaptive-icon.png (1024x1024), assets/splash.png (2048x2048), assets/favicon.png (48x48)");
    }
    console.log("[dry-run] Generated files: src/gameConfig.ts (with difficulty), src/gameMetadata.ts, src/features.ts, src/experiments.ts");
    console.log("[dry-run] Metadata: metadata/appstore.json, metadata/playstore.json");
    if (includeAnalytics) console.log("[dry-run] Would create: src/analyticsEvents.ts");
    if (includeMonetization) console.log("[dry-run] Would create: src/monetizationConfig.ts");
    console.log("[dry-run] Theme files/settings: src/theme.ts, src/useThemePreference.ts (already in template, identifiers replaced)");
    console.log("[dry-run] i18n: src/i18n/*.json, src/i18n/index.ts (already in template, identifiers replaced)");
    console.log("[dry-run] Root scripts that would be added: dev:" + gameName + ", ios:" + gameName + ", android:" + gameName + ", web:" + gameName);
    logCreatedApp(gameName, displayName, true);
    return;
  }

  let created = false;
  try {
    fs.cpSync(templateDir, appDir, { recursive: true });
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

    writeGameConfig(appDir, gameName, opts.genre);
    writeGameMetadata(appDir, gameName, displayName, opts.genre);
    writeFeatures(appDir, opts);
    writeExperiments(appDir);
    writeMetadataFolder(appDir, gameName, displayName, opts.genre);
    if (includeAnalytics) writeAnalyticsEvents(appDir, gameName);
    if (includeMonetization) writeMonetizationConfig(appDir, gameName);

    if (!opts.noAssets) {
      const { generateAssets } = require("./create-game-assets.js");
      await generateAssets(appDir, gameName, displayName);
      appendAppConfigAssets(appConfigPath);
    }

    addRootScripts(gameName);

    runValidation(appDir, gameName);
  } catch (err) {
    if (created && fs.existsSync(appDir)) {
      try {
        fs.rmSync(appDir, { recursive: true });
        console.error("Removed partially created app due to error.");
      } catch (rmErr) {
        console.error("Failed to remove partial app:", rmErr.message);
      }
    }
    console.error(err.message || err);
    process.exit(1);
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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
