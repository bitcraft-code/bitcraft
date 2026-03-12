"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");

const SIZES = {
  "iphone-6.5": { w: 1284, h: 2778 },
  "iphone-5.5": { w: 1242, h: 2208 },
  "android-phone": { w: 1080, h: 1920 },
  "tablet-12": { w: 2048, h: 2732 },
};

async function generateScreenshot(outPath, width, height, title, score = "12,450") {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("sharp is required. Run: pnpm add -D sharp -w");
    process.exit(1);
  }
  const fontSize = Math.round(Math.min(width, height) * 0.06);
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#1a1a2e"/>
  <rect x="${width * 0.1}" y="${height * 0.2}" width="${width * 0.8}" height="${height * 0.5}" rx="16" fill="#16213e" stroke="#0f3460" stroke-width="2"/>
  <text x="50%" y="${height * 0.35}" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}" fill="#e94560" font-family="sans-serif" font-weight="bold">${title}</text>
  <text x="50%" y="${height * 0.5}" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize * 0.6}" fill="#a0a0a0">Mock gameplay</text>
  <rect x="${width * 0.7}" y="${height * 0.02}" width="${width * 0.26}" height="${height * 0.08}" rx="8" fill="#0f3460"/>
  <text x="${width * 0.83}" y="${height * 0.06}" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize * 0.5}" fill="white">Score: ${score}</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

async function main() {
  const gameName = process.argv[2]?.trim().toLowerCase();
  if (!gameName) {
    console.error("Usage: node generate-screenshots.js <game-name>");
    console.error("Example: node generate-screenshots.js flappy");
    process.exit(1);
  }

  const appDir = path.join(APPS_DIR, gameName);
  if (!fs.existsSync(appDir)) {
    console.error(`Error: App apps/${gameName} not found.`);
    process.exit(1);
  }

  const title = "Bitcraft " + gameName.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  const screenshotsDir = path.join(appDir, "metadata", "screenshots");
  fs.mkdirSync(screenshotsDir, { recursive: true });

  for (const [name, { w, h }] of Object.entries(SIZES)) {
    const outPath = path.join(screenshotsDir, `${name}.png`);
    await generateScreenshot(outPath, w, h, title);
    console.log("Generated " + outPath);
  }
  console.log("Screenshots written to " + screenshotsDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
