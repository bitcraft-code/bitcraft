"use strict";

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");

function main() {
  let failed = false;

  console.log("[validate:all] Running typecheck across workspace...");
  try {
    execSync("pnpm -r typecheck", { cwd: ROOT, stdio: "inherit", encoding: "utf8" });
  } catch (e) {
    console.error("[validate:all] Typecheck failed.");
    failed = true;
  }

  const apps = fs.readdirSync(APPS_DIR).filter((name) => {
    const pkgPath = path.join(APPS_DIR, name, "package.json");
    return fs.existsSync(pkgPath);
  });

  for (const app of apps) {
    const appDir = path.join(APPS_DIR, app);
    console.log("[validate:all] Expo config:", app);
    try {
      execSync("npx expo config --type public", { cwd: appDir, stdio: "pipe", encoding: "utf8" });
    } catch (e) {
      console.error("[validate:all] Expo config failed for", app);
      failed = true;
    }
  }

  console.log("[validate:all] Exporting web builds...");
  try {
    execSync("node scripts/export-all.js", { cwd: ROOT, stdio: "inherit", encoding: "utf8" });
  } catch (e) {
    console.error("[validate:all] Export failed.");
    failed = true;
  }

  if (failed) process.exit(1);
  console.log("[validate:all] Done.");
}

main();
