"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");
const OUTPUT_JSON = path.join(ROOT, "docs", "audits", "game-portfolio-overview.json");

function safeReadFile(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function inferGenre(appDir) {
  const metaTs = path.join(appDir, "src", "gameMetadata.ts");
  const content = safeReadFile(metaTs);
  if (content) {
    const m = content.match(/subcategory:\s*"(.*?)"/);
    if (m && m[1]) return m[1];
  }
  const appstore = readJson(path.join(appDir, "metadata", "appstore.json"));
  if (appstore && typeof appstore.subtitle === "string") {
    const mm = appstore.subtitle.match(/A\s+(\w+)\s+game/i);
    if (mm && mm[1]) return mm[1].toLowerCase();
  }
  return "unknown";
}

function readFeatures(appDir) {
  const featuresPath = path.join(appDir, "src", "features.ts");
  const content = safeReadFile(featuresPath);
  if (!content) return { ads: null, analytics: null };
  const adsMatch = content.match(/ads:\s*(true|false)/);
  const analyticsMatch = content.match(/analytics:\s*(true|false)/);
  return {
    ads: adsMatch ? adsMatch[1] === "true" : null,
    analytics: analyticsMatch ? analyticsMatch[1] === "true" : null,
  };
}

function main() {
  if (!fs.existsSync(APPS_DIR)) {
    console.error("apps/ directory not found.");
    process.exit(1);
  }

  const entries = fs.readdirSync(APPS_DIR, { withFileTypes: true });
  const games = [];

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const appName = e.name;
    const appDir = path.join(APPS_DIR, appName);
    const pkgPath = path.join(appDir, "package.json");
    if (!fs.existsSync(pkgPath)) continue;

    const genre = inferGenre(appDir);
    const metadataDir = path.join(appDir, "metadata");
    const hasMetadata =
      fs.existsSync(path.join(metadataDir, "appstore.json")) ||
      fs.existsSync(path.join(metadataDir, "playstore.json"));
    const screenshotsDir = path.join(metadataDir, "screenshots");
    const hasScreenshots =
      fs.existsSync(screenshotsDir) &&
      fs.readdirSync(screenshotsDir).some((f) => /\.(png|jpg|jpeg)$/i.test(f));
    const readinessPath = path.join(metadataDir, "release-readiness.md");
    const hasReadiness = fs.existsSync(readinessPath);

    const { ads, analytics } = readFeatures(appDir);

    games.push({
      game: appName,
      genre,
      hasMetadata,
      hasScreenshots,
      hasReleaseReadiness: hasReadiness,
      adsEnabled: ads,
      analyticsEnabled: analytics,
    });
  }

  console.log("=== Game Portfolio ===");
  if (games.length === 0) {
    console.log("No apps with package.json found under apps/.");
  } else {
    console.table(
      games.map((g) => ({
        game: g.game,
        genre: g.genre,
        metadata: g.hasMetadata ? "yes" : "no",
        screenshots: g.hasScreenshots ? "yes" : "no",
        releaseReadiness: g.hasReleaseReadiness ? "yes" : "no",
        ads: g.adsEnabled === null ? "unknown" : g.adsEnabled ? "yes" : "no",
        analytics: g.analyticsEnabled === null ? "unknown" : g.analyticsEnabled ? "yes" : "no",
      })),
    );
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ generatedAt: new Date().toISOString(), games }, null, 2) + "\n");
  console.log("");
  console.log("Wrote portfolio JSON: " + path.relative(ROOT, OUTPUT_JSON));
}

main();

