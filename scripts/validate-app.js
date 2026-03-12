"use strict";

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");

function main() {
  const appName = process.argv[2];
  if (!appName) {
    console.error("Usage: node scripts/validate-app.js <app-name>");
    console.error("Example: node scripts/validate-app.js flappy");
    process.exit(1);
  }

  const appDir = path.join(APPS_DIR, appName);
  if (!fs.existsSync(path.join(appDir, "package.json"))) {
    console.error("Error: App apps/" + appName + " not found.");
    process.exit(1);
  }

  let failed = false;

  console.log("[validate:app] Typecheck", appName);
  try {
    execSync("pnpm --filter @bitcraft/" + appName + " typecheck", {
      cwd: ROOT,
      stdio: "inherit",
      encoding: "utf8",
    });
  } catch (e) {
    failed = true;
  }

  console.log("[validate:app] Expo config", appName);
  try {
    execSync("npx expo config --type public", { cwd: appDir, stdio: "inherit", encoding: "utf8" });
  } catch (e) {
    failed = true;
  }

  console.log("[validate:app] Export web", appName);
  try {
    execSync("node scripts/export-all.js " + appName, { cwd: ROOT, stdio: "inherit", encoding: "utf8" });
  } catch (e) {
    failed = true;
  }

  if (failed) process.exit(1);
  console.log("[validate:app] Done.");
}

main();
