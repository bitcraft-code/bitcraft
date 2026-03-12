"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");
const PACKAGES_DIR = path.join(ROOT, "packages");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const SCRIPTS_DIR = path.join(ROOT, "scripts");
const DOCS_DIR = path.join(ROOT, "docs");

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const results = { pass: [], warn: [], fail: [] };
  const add = (level, msg, detail) => results[level].push({ msg, detail });

  console.log("=== Bitcraft Doctor ===");

  // 1. Required top-level folders.
  const requiredDirs = [
    { dir: APPS_DIR, label: "apps" },
    { dir: PACKAGES_DIR, label: "packages" },
    { dir: TEMPLATES_DIR, label: "templates" },
    { dir: SCRIPTS_DIR, label: "scripts" },
    { dir: DOCS_DIR, label: "docs" },
  ];
  for (const { dir, label } of requiredDirs) {
    if (fs.existsSync(dir)) add("pass", `Folder exists: ${label}/`, label);
    else add("fail", `Missing folder: ${label}/`, label);
  }

  // 2. Required doc entrypoints.
  const requiredDocs = [
    "instructions/game-factory-human-guide.md",
    "instructions/game-factory-ai-spec.md",
    "instructions/game-factory-agent-rules.md",
  ];
  for (const rel of requiredDocs) {
    const p = path.join(DOCS_DIR, rel);
    if (fs.existsSync(p)) add("pass", `Doc entrypoint exists: docs/${rel}`, rel);
    else add("fail", `Missing doc entrypoint: docs/${rel}`, rel);
  }

  // 3. Root package.json scripts.
  const pkgPath = path.join(ROOT, "package.json");
  const pkg = readJson(pkgPath);
  const expectedScripts = [
    "create-game",
    "create-games",
    "dashboard",
    "validate:all",
    "validate:app",
    "check-release-readiness",
    "generate-screenshots",
    "generate-aso-keywords",
  ];
  if (!pkg || !pkg.scripts) {
    add("fail", "Root package.json is missing or invalid", "package.json");
  } else {
    for (const s of expectedScripts) {
      if (pkg.scripts[s]) add("pass", `Script present: ${s}`, s);
      else add("fail", `Missing required root script: ${s}`, s);
    }
  }

  // 4. Apps health.
  if (fs.existsSync(APPS_DIR)) {
    const entries = fs.readdirSync(APPS_DIR, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const appName = e.name;
      const appDir = path.join(APPS_DIR, appName);
      const pkgFile = path.join(appDir, "package.json");
      if (!fs.existsSync(pkgFile)) {
        add("warn", `App missing package.json: apps/${appName}`, appName);
        continue;
      }
      const hasAppConfigTs = fs.existsSync(path.join(appDir, "app.config.ts"));
      const hasAppJson = fs.existsSync(path.join(appDir, "app.json"));
      const hasSrc = fs.existsSync(path.join(appDir, "src"));
      const hasMetadata = fs.existsSync(path.join(appDir, "metadata"));

      if (!hasAppConfigTs && !hasAppJson) {
        add("fail", `App missing Expo config (app.config.ts or app.json): apps/${appName}`, appName);
      } else {
        add("pass", `Expo config present for app: ${appName}`, appName);
      }

      if (!hasSrc) {
        add("fail", `App missing src/ directory: apps/${appName}`, appName);
      } else {
        add("pass", `src/ directory present for app: ${appName}`, appName);
      }

      if (!hasMetadata) {
        add("warn", `App missing metadata/ directory (may be template or incomplete): apps/${appName}`, appName);
      } else {
        add("pass", `metadata/ directory present for app: ${appName}`, appName);
      }
    }
  }

  // 5. Templates health.
  if (fs.existsSync(TEMPLATES_DIR)) {
    const entries = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const name = e.name;
      const tDir = path.join(TEMPLATES_DIR, name);
      const hasApp = fs.existsSync(path.join(tDir, "app"));
      const hasSrc = fs.existsSync(path.join(tDir, "src"));
      const hasPkg = fs.existsSync(path.join(tDir, "package.json"));
      const hasConfig = fs.existsSync(path.join(tDir, "app.config.ts"));
      if (hasApp && hasSrc && hasPkg && hasConfig) {
        add("pass", `Template is structurally healthy: templates/${name}`, name);
      } else {
        add(
          "fail",
          `Template missing required pieces (app/, src/, package.json, app.config.ts): templates/${name}`,
          name,
        );
      }
    }
  }

  // Report
  console.log("");
  console.log("=== Doctor Report ===");
  for (const { msg, detail } of results.fail) {
    console.log(`[FAIL] ${msg}${detail ? "  (" + detail + ")" : ""}`);
  }
  for (const { msg, detail } of results.warn) {
    console.log(`[WARN] ${msg}${detail ? "  (" + detail + ")" : ""}`);
  }
  for (const { msg, detail } of results.pass) {
    console.log(`[PASS] ${msg}${detail ? "  (" + detail + ")" : ""}`);
  }

  console.log("");
  console.log("Summary:");
  console.log(`  FAIL: ${results.fail.length}`);
  console.log(`  WARN: ${results.warn.length}`);
  console.log(`  PASS items: ${results.pass.length}`);

  if (results.fail.length > 0) {
    process.exit(1);
  }
}

main();

