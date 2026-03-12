"use strict";

const fs = require("fs");
const path = require("path");

function hashToColor(gameName) {
  let h = 0;
  for (let i = 0; i < gameName.length; i++) {
    h = (h << 5) - h + gameName.charCodeAt(i);
    h |= 0;
  }
  const hue = ((h % 360) + 360) % 360;
  const s = 65;
  const l = 45;
  const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l / 100 - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

async function generateAssets(appDir, gameName, displayName) {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    throw new Error(
      "Asset generation requires 'sharp'. Install with: pnpm add -D sharp -w"
    );
  }

  const assetsDir = path.join(appDir, "assets");
  fs.mkdirSync(assetsDir, { recursive: true });

  const bgColor = hashToColor(gameName);
  const letter = (displayName.trim() || gameName)[0].toUpperCase();

  const sizes = [
    { name: "icon.png", w: 1024, h: 1024 },
    { name: "adaptive-icon.png", w: 1024, h: 1024 },
    { name: "splash.png", w: 2048, h: 2048 },
    { name: "favicon.png", w: 48, h: 48 },
  ];

  const fontSize = (w) => Math.round(w * 0.4);
  for (const { name, w, h } of sizes) {
    const fontSz = fontSize(w);
    const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="${bgColor}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSz}" fill="white" font-family="sans-serif" font-weight="bold">${letter}</text>
</svg>`;
    const outPath = path.join(assetsDir, name);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
  }

  return assetsDir;
}

module.exports = { generateAssets, hashToColor };
