"use strict";

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");

function main() {
  const singleApp = process.argv[2];
  let apps;
  if (singleApp) {
    const appDir = path.join(APPS_DIR, singleApp);
    if (!fs.existsSync(path.join(appDir, "package.json"))) {
      console.error("Error: App apps/" + singleApp + " not found.");
      process.exit(1);
    }
    apps = [singleApp];
  } else {
    apps = fs.readdirSync(APPS_DIR).filter((name) => {
      const pkgPath = path.join(APPS_DIR, name, "package.json");
      return fs.existsSync(pkgPath);
    });
  }

  let failed = 0;
  for (const app of apps) {
    const appDir = path.join(APPS_DIR, app);
    try {
      execSync("npx expo export --platform web", {
        cwd: appDir,
        stdio: "inherit",
        encoding: "utf8",
      });
      console.log(`[export:all] ${app} OK`);
    } catch (e) {
      console.error(`[export:all] ${app} FAILED`);
      failed++;
    }
  }
  if (failed > 0) {
    process.exit(1);
  }
}

main();
