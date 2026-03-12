"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");
const PACKAGES_DIR = path.join(ROOT, "packages");
const TEMPLATES_DIR = path.join(ROOT, "templates");

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function walkFiles(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      walkFiles(full, exts, out);
    } else if (e.isFile()) {
      if (!exts || exts.includes(path.extname(e.name))) {
        out.push(full);
      }
    }
  }
  return out;
}

function collectAllowedBitcraftImports() {
  const pkgs = [];
  if (fs.existsSync(PACKAGES_DIR)) {
    const entries = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const pkgPath = path.join(PACKAGES_DIR, e.name, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = readJson(pkgPath);
        if (pkg && typeof pkg.name === "string" && pkg.name.startsWith("@bitcraft/")) {
          pkgs.push(pkg.name);
        }
      }
    }
  }
  return new Set(pkgs);
}

function parseImports(content) {
  const specs = [];
  const importRe = /import\s+[^'"]*['"]([^'"]+)['"]/g;
  const requireRe = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = importRe.exec(content))) {
    specs.push(m[1]);
  }
  while ((m = requireRe.exec(content))) {
    specs.push(m[1]);
  }
  return specs;
}

function detectCyclesInPackages() {
  const graph = {};

  if (!fs.existsSync(PACKAGES_DIR)) return [];

  const entries = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const pkgPath = path.join(PACKAGES_DIR, e.name, "package.json");
    if (!fs.existsSync(pkgPath)) continue;
    const pkg = readJson(pkgPath);
    if (!pkg || !pkg.name) continue;
    const from = pkg.name;
    graph[from] = graph[from] || [];
    const depNames = Object.assign(
      {},
      pkg.dependencies || {},
      pkg.devDependencies || {},
      pkg.peerDependencies || {},
    );
    for (const dep of Object.keys(depNames)) {
      if (dep.startsWith("@bitcraft/")) {
        graph[from].push(dep);
      }
    }
  }

  const visited = new Set();
  const stack = new Set();
  const cycles = [];

  function dfs(node, pathAcc) {
    if (stack.has(node)) {
      const idx = pathAcc.indexOf(node);
      const cyclePath = idx >= 0 ? pathAcc.slice(idx).concat(node) : pathAcc.concat(node);
      cycles.push(cyclePath.join(" → "));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    const neighbors = graph[node] || [];
    for (const n of neighbors) {
      if (graph[n]) {
        dfs(n, pathAcc.concat(node));
      }
    }
    stack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

function lintArchitecture() {
  const issues = { fail: [], warn: [] };
  const add = (level, msg, file) => {
    issues[level].push({ msg, file });
  };

  const allowedBitcraft = collectAllowedBitcraftImports();

  // 1–3: imports between apps / forbidden package paths / only @bitcraft/* for shared code.
  const codeFiles = walkFiles(ROOT, [".ts", ".tsx", ".js"])
    .filter((p) => !p.includes("/node_modules/") && !p.includes("/.expo/") && !p.includes("/.expo-dist-web/"));

  for (const file of codeFiles) {
    const rel = path.relative(ROOT, file);
    const content = fs.readFileSync(file, "utf8");
    const specs = parseImports(content);
    const inApps = file.startsWith(APPS_DIR);
    const currentApp = inApps ? path.relative(APPS_DIR, file).split(path.sep)[0] : null;

    for (const spec of specs) {
      // Shared packages must be via @bitcraft/*
      if (spec.includes("packages/") || spec.includes("../packages")) {
        add("fail", `Forbidden import path to packages: "${spec}"`, rel);
      }

      if (spec.startsWith("@bitcraft/")) {
        if (!allowedBitcraft.has(spec)) {
          add("fail", `Import to non-package @bitcraft module (likely app cross-import): "${spec}"`, rel);
        }
      }

      if (inApps && spec.startsWith("@bitcraft/")) {
        if (!allowedBitcraft.has(spec)) {
          add("fail", `App importing another app via @bitcraft: "${spec}"`, rel);
        }
      }

      if (inApps && spec.startsWith("..")) {
        const target = path.resolve(path.dirname(file), spec);
        if (target.startsWith(APPS_DIR)) {
          const targetApp = path.relative(APPS_DIR, target).split(path.sep)[0];
          if (targetApp && targetApp !== currentApp) {
            add("fail", `Cross-app relative import from "${currentApp}" to "${targetApp}"`, rel);
          }
        }
      }
    }
  }

  // 4. Obvious circular deps between internal packages.
  const cycles = detectCyclesInPackages();
  for (const c of cycles) {
    add("fail", `Detected cycle in @bitcraft/* packages: ${c}`, "packages/*");
  }

  // 5. Templates still contain placeholders.
  if (fs.existsSync(TEMPLATES_DIR)) {
    const templateDirs = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const d of templateDirs) {
      const dirPath = path.join(TEMPLATES_DIR, d.name);
      const files = walkFiles(dirPath, [".ts", ".tsx", ".json", ".md"]);
      let hasTemplate = false;
      let hastemplate = false;
      for (const f of files) {
        const content = fs.readFileSync(f, "utf8");
        if (content.includes("Template")) hasTemplate = true;
        if (content.includes("template")) hastemplate = true;
        if (hasTemplate && hastemplate) break;
      }
      if (!hasTemplate || !hastemplate) {
        add(
          "fail",
          `Template "${d.name}" is missing required placeholders "Template" and/or "template"`,
          path.relative(ROOT, dirPath),
        );
      }
    }
  }

  // Report
  console.log("=== Architecture Lint ===");
  if (issues.fail.length === 0 && issues.warn.length === 0) {
    console.log("No issues found.");
  } else {
    for (const { msg, file } of issues.fail) {
      console.log(`[FAIL] ${msg}${file ? "  (" + file + ")" : ""}`);
    }
    for (const { msg, file } of issues.warn) {
      console.log(`[WARN] ${msg}${file ? "  (" + file + ")" : ""}`);
    }
  }

  console.log("");
  console.log("Summary:");
  console.log(`  FAIL: ${issues.fail.length}`);
  console.log(`  WARN: ${issues.warn.length}`);
  console.log(`  PASS: ${issues.fail.length === 0 ? "yes" : "no"}`);

  if (issues.fail.length > 0) {
    process.exit(1);
  }
}

lintArchitecture();

