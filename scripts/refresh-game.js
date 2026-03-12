"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");

function parseArgs(argv) {
  const args = [];
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--") continue;
    args.push(argv[i]);
  }
  return { gameName: args[0] ? args[0].trim().toLowerCase() : null };
}

function main() {
  const { gameName } = parseArgs(process.argv);
  if (!gameName) {
    console.error("Usage: pnpm refresh:game -- <game-name>");
    console.error("Example: pnpm refresh:game -- flappy");
    process.exit(1);
  }

  const appDir = path.join(APPS_DIR, gameName);
  if (!fs.existsSync(appDir) || !fs.existsSync(path.join(appDir, "package.json"))) {
    console.error(`Error: App apps/${gameName} not found. Run create-game first.`);
    process.exit(1);
  }

  console.log("=== Refresh game ===");
  console.log("Game:", gameName);
  console.log("Path:", path.relative(ROOT, appDir));
  console.log("");

  const metadataDir = path.join(appDir, "metadata");
  if (!fs.existsSync(metadataDir)) {
    console.log("[WARN] metadata/ directory not found. Skipping ASO keywords and screenshots.");
  } else {
    // 1. Regenerate ASO keywords (default genre if not known).
    try {
      console.log("[INFO] Regenerating ASO keywords (may overwrite previous keywords)...");
      execSync(`node scripts/generate-aso-keywords.js ${gameName}`, {
        cwd: ROOT,
        stdio: "inherit",
        encoding: "utf8",
      });
    } catch (e) {
      console.error("[WARN] Failed to regenerate ASO keywords:", e.message || e);
    }

    // 2. Regenerate placeholder screenshots.
    try {
      console.log("[INFO] Regenerating placeholder screenshots (may overwrite previous placeholders)...");
      execSync(`node scripts/generate-screenshots.js ${gameName}`, {
        cwd: ROOT,
        stdio: "inherit",
        encoding: "utf8",
      });
      console.log(
        "[INFO] Screenshots regenerated. If you had custom screenshots, ensure they are backed up before running refresh.",
      );
    } catch (e) {
      console.error("[WARN] Failed to regenerate screenshots:", e.message || e);
    }
  }

  // 3. Re-run release readiness check.
  try {
    console.log("[INFO] Re-running release readiness check...");
    execSync(`node scripts/check-release-readiness.js ${gameName}`, {
      cwd: ROOT,
      stdio: "inherit",
      encoding: "utf8",
    });
  } catch (e) {
    console.error("[WARN] Release readiness check reported failures. See metadata/release-readiness.md for details.");
  }

  // 4. Optionally re-run validation for the game.
  try {
    console.log("[INFO] Running validate:app for the game...");
    execSync(`pnpm validate:app -- ${gameName}`, {
      cwd: ROOT,
      stdio: "inherit",
      encoding: "utf8",
    });
  } catch (e) {
    console.error(
      "[WARN] validate:app failed for this game. Inspect logs above; this does not stop refresh, but game may not be build-ready.",
    );
  }

  console.log("");
  console.log("Refresh complete for game:", gameName);
}

main();

