\"use strict\";

const { execSync, spawnSync } = require(\"child_process\");
const path = require(\"path\");

const ROOT = path.resolve(__dirname, \"..\");

const SUPPORTED_GENRES = [\"arcade\", \"puzzle\", \"runner\"];

function parseDirectArgs(argv) {
  const args = [];
  let dryRun = false;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === \"--dry-run\") {
      dryRun = true;
    } else {
      args.push(arg);
    }
  }

  const gameName = args[0];
  const genre = args[1];

  return { gameName, genre, dryRun };
}

function validateGameName(gameName) {
  if (!gameName) {
    throw new Error(
      \"Game name is required. Usage: pnpm create-game-branch <game-name> <genre> [--dry-run]\"
    );
  }
  const trimmed = gameName.trim();
  if (!trimmed) {
    throw new Error(\"Game name cannot be empty.\");
  }
  return trimmed;
}

function validateGenre(genre) {
  if (!genre) {
    throw new Error(
      \"Genre is required. Usage: pnpm create-game-branch <game-name> <genre> [--dry-run]\"
    );
  }
  const normalized = genre.trim().toLowerCase();
  if (!SUPPORTED_GENRES.includes(normalized)) {
    throw new Error(
      `Invalid genre \"${genre}\". Supported genres: ${SUPPORTED_GENRES.join(\", \")}`
    );
  }
  return normalized;
}

function assertCleanGit(dryRun) {
  try {
    const status = execSync(\"git status --porcelain\", {
      cwd: ROOT,
      encoding: \"utf8\",
    }).trim();
    if (status) {
      throw new Error(
        \"Git working tree is not clean. Please commit or stash your changes before creating a game branch.\"
      );
    }
    if (dryRun) {
      console.log(\"[dry-run] Git working tree is clean.\");
    }
  } catch (err) {
    if (err.stdout || err.stderr) {
      throw new Error(
        `Failed to check git status. Ensure this directory is a git repository. Original error: ${err.message || err}`
      );
    }
    throw err;
  }
}

function createGitBranch(branchName, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] Would create git branch: ${branchName}`);
    return;
  }
  console.log(`Creating git branch: ${branchName}`);
  const result = spawnSync(\"git\", [\"checkout\", \"-b\", branchName], {
    cwd: ROOT,
    stdio: \"inherit\",
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`Failed to create git branch ${branchName} (exit code ${result.status}).`);
  }
}

function runCreateGame(gameName, genre, dryRun) {
  const args = [\"create-game\", gameName, \"--genre\", genre];
  if (dryRun) {
    console.log(`[dry-run] Would run: pnpm ${args.join(\" \")}`);
    return;
  }
  console.log(`Running scaffold: pnpm ${args.join(\" \")}`);
  const result = spawnSync(\"pnpm\", args, {
    cwd: ROOT,
    stdio: \"inherit\",
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(
      `create-game failed for ${gameName} with genre ${genre} (exit code ${result.status}).`
    );
  }
}

function stageAll(dryRun) {
  if (dryRun) {
    console.log(\"[dry-run] Would stage generated files: git add .\");
    return;
  }
  const result = spawnSync(\"git\", [\"add\", \".\"], {
    cwd: ROOT,
    stdio: \"inherit\",
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`git add failed (exit code ${result.status}).`);
  }
}

function createInitialCommit(gameName, genre, dryRun) {
  const message = `feat: add ${gameName} ${genre} game scaffold`;
  if (dryRun) {
    console.log(`[dry-run] Would create commit: ${message}`);
    return;
  }
  console.log(`Creating commit: ${message}`);
  const result = spawnSync(\"git\", [\"commit\", \"-m\", message], {
    cwd: ROOT,
    stdio: \"inherit\",
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`git commit failed (exit code ${result.status}).`);
  }
}

function printNextSteps(gameName) {
  console.log(\"\");
  console.log(\"Next steps:\");
  console.log(`  pnpm validate:app -- ${gameName}`);
  console.log(\"\");
}

async function runCreateGameBranchFlow(options) {
  const { gameName: rawGameName, genre: rawGenre, dryRun = false, skipGitChecks = false } =
    options;

  const gameName = validateGameName(rawGameName);
  const genre = validateGenre(rawGenre);
  const branchName = `feat/${gameName}`;

  if (!skipGitChecks) {
    assertCleanGit(dryRun);
  }

  createGitBranch(branchName, dryRun);
  runCreateGame(gameName, genre, dryRun);
  stageAll(dryRun);
  createInitialCommit(gameName, genre, dryRun);

  if (!dryRun) {
    printNextSteps(gameName);
  } else {
    console.log(\"[dry-run] Flow completed. No changes were made.\");
    console.log(\"[dry-run] After running for real, recommended next step:\");
    console.log(`  pnpm validate:app -- ${gameName}`);
  }
}

module.exports = {
  ROOT,
  SUPPORTED_GENRES,
  parseDirectArgs,
  validateGameName,
  validateGenre,
  assertCleanGit,
  createGitBranch,
  runCreateGame,
  stageAll,
  createInitialCommit,
  printNextSteps,
  runCreateGameBranchFlow,
};

