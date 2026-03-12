"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CREATE_GAME_SCRIPT = path.join(ROOT, "scripts", "create-game.js");

function main() {
  const names = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (names.length === 0) {
    console.error("Usage: pnpm create-games <game-name> [game-name2 ...]");
    console.error("Example: pnpm create-games game1 game2 game3");
    process.exit(1);
  }

  const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
  let failed = 0;
  for (const name of names) {
    console.log("\n--- Creating app: " + name + " ---");
    const result = spawnSync("node", [CREATE_GAME_SCRIPT, name, ...flags], {
      cwd: ROOT,
      stdio: "inherit",
      shell: true,
    });
    if (result.status !== 0) {
      console.error("create-game failed for " + name + " (exit " + result.status + ")");
      failed++;
    }
  }
  console.log("\nDone. Created " + (names.length - failed) + "/" + names.length + " games.");
  if (failed > 0) process.exit(1);
}

main();
