"use strict";

const readline = require("readline");
const {
  SUPPORTED_GENRES,
  validateGameName,
  validateGenre,
  assertCleanGit,
  createGitBranch,
  runCreateGame,
  stageAll,
  createInitialCommit,
  printNextSteps,
} = require("./create-game-branch-core.js");

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function normalizeYesNo(input) {
  const value = input.trim().toLowerCase();
  if (!value) return false;
  return value === "y" || value === "yes";
}

async function main() {
  const rl = createInterface();

  try {
    console.log("Bitcraft - Create Game Branch Wizard");
    console.log("-----------------------------------");

    const rawGameName = await askQuestion(rl, "Game name? ");
    const rawGenre = await askQuestion(
      rl,
      `Genre? (${SUPPORTED_GENRES.join(", ")}) `
    );

    let gameName;
    let genre;
    try {
      gameName = validateGameName(rawGameName);
      genre = validateGenre(rawGenre);
    } catch (err) {
      console.error(err.message || err);
      process.exitCode = 1;
      return;
    }

    console.log("");
    const createBranchAnswer = await askQuestion(
      rl,
      `Create git branch feat/${gameName}? (y/n) `
    );
    const runScaffoldAnswer = await askQuestion(
      rl,
      "Run create-game scaffold? (y/n) "
    );
    const createCommitAnswer = await askQuestion(
      rl,
      "Create initial commit? (y/n) "
    );

    const doCreateBranch = normalizeYesNo(createBranchAnswer);
    const doRunScaffold = normalizeYesNo(runScaffoldAnswer);
    const doCreateCommit = normalizeYesNo(createCommitAnswer);

    console.log("");

    // Git safety: only check cleanliness if we will touch git state.
    const needsGitCheck = doCreateBranch || doCreateCommit;
    if (needsGitCheck) {
      assertCleanGit(false);
    }

    if (doCreateBranch) {
      createGitBranch(`feat/${gameName}`, false);
    } else {
      console.log("Skipping git branch creation.");
    }

    if (doRunScaffold) {
      runCreateGame(gameName, genre, false);
    } else {
      console.log("Skipping create-game scaffold.");
    }

    if (doCreateCommit) {
      // Only commit if scaffold was actually run.
      if (!doRunScaffold) {
        console.log(
          "Initial commit requested but scaffold was skipped. No commit will be created."
        );
      } else {
        stageAll(false);
        createInitialCommit(gameName, genre, false);
      }
    } else {
      console.log("Skipping initial commit.");
    }

    if (doRunScaffold) {
      printNextSteps(gameName);
    }
  } catch (err) {
    console.error(err.message || err);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();

