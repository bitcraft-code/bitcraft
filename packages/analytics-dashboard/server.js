"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");

const PORT = process.env.PORT || 3999;
const DATA_DIR = path.join(__dirname, "data");
const PUBLIC_DIR = path.join(__dirname, "public");

function readJsonFiles(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const out = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      out.push(JSON.parse(raw));
    } catch (_) {}
  }
  return out;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function computeRetention(sessions) {
  if (!sessions || sessions.length === 0) return { d1Percent: null, d7Percent: null };
  const byDate = new Map();
  for (const s of sessions) {
    const date = s.date || s.timestamp?.slice(0, 10);
    if (!date) continue;
    const uid = s.userId || s.sessionId;
    if (!byDate.has(date)) byDate.set(date, new Set());
    byDate.get(date).add(uid);
  }
  const dates = Array.from(byDate.keys()).sort();
  const day0 = dates[0];
  if (!day0) return { d1Percent: null, d7Percent: null };
  const cohort = byDate.get(day0);
  if (!cohort || cohort.size === 0) return { d1Percent: null, d7Percent: null };
  const day1 = addDays(day0, 1);
  const day7 = addDays(day0, 7);
  const usersDay1 = byDate.get(day1) || new Set();
  const usersDay7 = byDate.get(day7) || new Set();
  let d1Count = 0;
  let d7Count = 0;
  for (const u of cohort) {
    if (usersDay1.has(u)) d1Count++;
    if (usersDay7.has(u)) d7Count++;
  }
  return {
    d1Percent: Math.round((d1Count / cohort.size) * 100),
    d7Percent: Math.round((d7Count / cohort.size) * 100),
  };
}

function aggregateGames(datasets) {
  const games = new Map();
  const allSessionsByGame = new Map();
  for (const d of datasets) {
    if (!d.gameId) continue;
    if (!games.has(d.gameId)) {
      games.set(d.gameId, {
        gameId: d.gameId,
        sessions: 0,
        totalPlaytimeMs: 0,
        highScore: 0,
        adInteractions: 0,
        d1RetentionPercent: null,
        d7RetentionPercent: null,
      });
      allSessionsByGame.set(d.gameId, []);
    }
    const g = games.get(d.gameId);
    if (d.sessions) {
      g.sessions += d.sessions.length;
      g.totalPlaytimeMs += d.sessions.reduce((s, x) => s + (x.playtimeMs || 0), 0);
      allSessionsByGame.get(d.gameId).push(...d.sessions);
    }
    if (d.highScores?.length) g.highScore = Math.max(g.highScore, ...d.highScores.map((h) => h.highScore || 0));
    if (d.adInteractions) g.adInteractions += d.adInteractions.length;
  }
  for (const [gameId, g] of games) {
    const sessions = allSessionsByGame.get(gameId) || [];
    const retention = computeRetention(sessions);
    g.d1RetentionPercent = retention.d1Percent;
    g.d7RetentionPercent = retention.d7Percent;
    g.rankScore = rankScore(g);
  }
  const list = Array.from(games.values());
  list.sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0));
  return list;
}

/**
 * Ranking formula: normalized score for comparing games.
 * Weights: sessions (0.2), playtime per session (0.25), D1 retention (0.25), D7 retention (0.2), ad interactions (0.1).
 * Normalize by max observed so score is 0–100. Documented in docs/game-factory-evolution-audit.md.
 */
function rankScore(g) {
  const sessions = g.sessions || 0;
  const playtimeMs = g.totalPlaytimeMs || 0;
  const avgPlaytimeMs = sessions > 0 ? playtimeMs / sessions : 0;
  const d1 = g.d1RetentionPercent != null ? g.d1RetentionPercent : 0;
  const d7 = g.d7RetentionPercent != null ? g.d7RetentionPercent : 0;
  const ads = g.adInteractions || 0;
  const raw =
    0.2 * Math.min(sessions / 10, 1) * 100 +
    0.25 * Math.min(avgPlaytimeMs / 180000, 1) * 100 +
    0.25 * (d1 / 100) * 100 +
    0.2 * (d7 / 100) * 100 +
    0.1 * Math.min(ads / 50, 1) * 100;
  return Math.round(raw);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (url.pathname === "/api/games" || url.pathname === "/api/games/") {
    const datasets = readJsonFiles(DATA_DIR);
    const games = aggregateGames(datasets);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ games }));
    return;
  }
  if (url.pathname === "/api/data" || url.pathname === "/api/data/") {
    const datasets = readJsonFiles(DATA_DIR);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ datasets }));
    return;
  }
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const htmlPath = path.join(PUBLIC_DIR, "index.html");
    if (fs.existsSync(htmlPath)) {
      res.setHeader("Content-Type", "text/html");
      res.end(fs.readFileSync(htmlPath, "utf8"));
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.end(`
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Analytics Dashboard</title></head>
<body>
  <h1>Bitcraft Analytics Dashboard</h1>
  <p>Data source: <code>packages/analytics-dashboard/data/*.json</code></p>
  <p>Generate test data: <code>node scripts/generate-test-data.js &lt;game-name&gt; [days]</code></p>
  <p><a href="/api/games">/api/games</a> — aggregated per game</p>
  <p><a href="/api/data">/api/data</a> — raw datasets</p>
</body></html>`);
    return;
  }
  res.statusCode = 404;
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("Analytics dashboard: http://localhost:" + PORT);
});
