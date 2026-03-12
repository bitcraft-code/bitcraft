"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");

const GENRE_KEYWORDS = {
  arcade: ["arcade", "casual", "retro", "fast", "highscore", "endless", "action", "fun", "free"],
  puzzle: ["puzzle", "brain", "casual", "logic", "relax", "mind", "strategy", "free"],
  runner: ["runner", "endless", "casual", "fast", "arcade", "action", "dodge", "free"],
};

function main() {
  const args = process.argv.slice(2);
  const gameName = args[0]?.trim().toLowerCase();
  const genre = (args[1]?.trim().toLowerCase() || "arcade");

  if (!gameName) {
    console.error("Usage: node generate-aso-keywords.js <game-name> [genre]");
    console.error("Example: node generate-aso-keywords.js flappy arcade");
    process.exit(1);
  }

  const appDir = path.join(APPS_DIR, gameName);
  if (!fs.existsSync(appDir)) {
    console.error(`Error: App apps/${gameName} not found. Run create-game first.`);
    process.exit(1);
  }

  const keywords = GENRE_KEYWORDS[genre] || GENRE_KEYWORDS.arcade;
  const topKeywords = [...new Set([...keywords, gameName])];
  const metadataDir = path.join(appDir, "metadata");
  fs.mkdirSync(metadataDir, { recursive: true });
  const outPath = path.join(metadataDir, "aso-keywords.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        gameName,
        genre,
        keywords: topKeywords,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    ) + "\n"
  );
  console.log("Wrote " + outPath);
  console.log("Top keywords: " + topKeywords.join(", "));
}

main();
