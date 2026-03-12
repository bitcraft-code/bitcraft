"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");
const OUTPUT_DIR = path.join(ROOT, "packages", "analytics-dashboard", "data");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function main() {
  const gameName = process.argv[2]?.trim().toLowerCase();
  const days = parseInt(process.argv[3], 10) || 7;
  const genre = process.argv[4]?.trim().toLowerCase() || "arcade";
  if (!gameName) {
    console.error("Usage: node generate-test-data.js <game-name> [days=7] [genre=arcade]");
    console.error("Example: node generate-test-data.js flappy 14 arcade");
    process.exit(1);
  }

  const appDir = path.join(APPS_DIR, gameName);
  if (!fs.existsSync(appDir)) {
    console.error(`Error: App apps/${gameName} not found.`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const events = [];
  const sessions = [];
  const highScores = [];
  const adInteractions = [];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const numUsers = 40;
  const userIds = Array.from({ length: numUsers }, (_, i) => `user-${gameName}-${i}`);

  for (let d = 0; d < days; d++) {
    const date = new Date(now - d * dayMs);
    const dateStr = date.toISOString().slice(0, 10);
    const sessionsCount = randomInt(5, 50);
    for (let i = 0; i < sessionsCount; i++) {
      const userId = pick(userIds);
      const sessionId = `${gameName}-${dateStr}-${i}`;
      const playtimeMs = randomInt(30000, 300000);
      const score = randomInt(0, 50000);
      sessions.push({
        gameId: gameName,
        date: dateStr,
        sessionId,
        userId,
        playtimeMs,
        score,
      });
      const ts = (ms) => new Date(date.getTime() + ms).toISOString();
      const telemetry = {
        gameId: gameName,
        genre,
        sessionId,
        userId,
        buildVersion: "1.0.0",
        platform: pick(["ios", "android", "web"]),
        country: pick(["US", "BR", "DE", "ES"]),
        theme: pick(["light", "dark", "system"]),
        language: pick(["en", "es", "pt-BR"]),
      };
      events.push({
        ...telemetry,
        name: "app_opened",
        sessionId,
        userId,
        timestamp: ts(i * 60000),
        params: {},
      });
      events.push({
        ...telemetry,
        name: "game_over",
        sessionId,
        userId,
        timestamp: ts(i * 60000 + playtimeMs),
        params: { score, highScore: score },
      });
    }
    highScores.push({
      gameId: gameName,
      date: dateStr,
      highScore: randomInt(1000, 45000),
    });
    for (let a = 0; a < randomInt(2, 15); a++) {
      adInteractions.push({
        gameId: gameName,
        date: dateStr,
        placement: pick(["banner_home", "banner_gameover", "interstitial_gameover", "reward_extra_life"]),
        type: pick(["impression", "click"]),
      });
    }
  }

  const payload = {
    gameId: gameName,
    generatedAt: new Date().toISOString(),
    days,
    events,
    sessions,
    highScores,
    adInteractions,
  };

  const outPath = path.join(OUTPUT_DIR, `${gameName}-test-data.json`);
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
  console.log("Wrote " + outPath);
  console.log("  events: " + events.length);
  console.log("  sessions: " + sessions.length);
  console.log("  highScores: " + highScores.length);
  console.log("  adInteractions: " + adInteractions.length);
}

main();
