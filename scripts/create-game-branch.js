"use strict";

const {
  parseDirectArgs,
  runCreateGameBranchFlow,
} = require("./create-game-branch-core.js");

async function main() {
  try {
    const { gameName, genre, dryRun } = parseDirectArgs(process.argv);

    if (!gameName || !genre) {
      console.error(
        "Usage: pnpm create-game-branch <game-name> <genre> [--dry-run]"
      );
      console.error("Example: pnpm create-game-branch bitsnake arcade");
      console.error("Example: pnpm create-game-branch skycraft runner --dry-run");
      process.exit(1);
    }

    await runCreateGameBranchFlow({
      gameName,
      genre,
      dryRun,
      skipGitChecks: false,
    });
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

main();

