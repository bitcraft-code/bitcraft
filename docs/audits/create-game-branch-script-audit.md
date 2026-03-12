# Audit — Create Game Branch Tooling

## Purpose

The `create-game-branch` tooling automates the **typical workflow for starting a new game** in the Bitcraft Mobile Game Factory Platform:

1. Creating a git feature branch for the new game.
2. Running the existing `create-game` generator with a chosen genre.
3. Creating an initial semantic commit for the generated scaffold.

Legacy migration logic and ports of existing games are **explicitly out of scope** for these scripts and are handled by separate agents and workflows.

---

## Scripts Overview

- `scripts/create-game-branch-core.js`
  - Shared implementation used by both CLIs.
  - Provides argument validation, git safety checks, branch creation, game scaffold execution, staging, and commit creation.
- `scripts/create-game-branch.js`
  - Direct, non-interactive CLI.
  - Intended for fast automation and CI-friendly usage.
- `scripts/create-game-wizard.js`
  - Interactive wizard for humans.
  - Guides the developer through each step with yes/no prompts.

---

## CLI Usage

### Direct script

From the repository root:

```bash
pnpm create-game-branch <game-name> <genre> [--dry-run]
```

Examples:

```bash
pnpm create-game-branch bitsnake arcade
pnpm create-game-branch skycraft runner --dry-run
```

Arguments:

- `game-name` — new game id (must be a non-empty string, further constraints are enforced by the `create-game` script).
- `genre` — must be one of:
  - `arcade`
  - `puzzle`
  - `runner`
- `--dry-run` (optional) — prints intended actions without executing git or generator commands.

On successful, non–dry-run execution the script prints the recommended next step:

```bash
pnpm validate:app -- <game-name>
```

### Interactive wizard

From the repository root:

```bash
pnpm create-game-wizard
```

The wizard asks:

1. `Game name?`
2. `Genre?` (must be `arcade`, `puzzle`, or `runner`)
3. `Create git branch feat/<game-name>? (y/n)`
4. `Run create-game scaffold? (y/n)`
5. `Create initial commit? (y/n)`

Based on these answers, the wizard executes the requested steps sequentially, reusing the same core logic as the direct script.

---

## Safety Checks

Both CLIs share the same safety guarantees:

- **Clean working tree check**
  - Before any git state change (branch creation or commit), the core module runs:
    - `git status --porcelain`
  - If there are uncommitted changes, the scripts abort with an error message and **do not** create branches, scaffolds, or commits.
  - In dry-run mode, the direct script still checks the status but only reports that the tree is clean.

- **Branch creation**
  - Branches are created using:
    - `git checkout -b feat/<game-name>`
  - If this command fails (non-zero exit code), execution stops immediately and no further actions are attempted.

- **Scaffold execution**
  - Game scaffolding uses the existing generator:
    - `pnpm create-game <game-name> --genre <genre>`
  - If the generator fails (non-zero exit code), the flow aborts:
    - No files are staged.
    - No commits are created.
    - No automatic branch switches or rollbacks are attempted.

- **Commit creation**
  - Staging uses:
    - `git add .`
  - The initial commit uses:
    - `git commit -m "feat: add <game-name> <genre> game scaffold"`
  - If either `git add` or `git commit` fails, the error is surfaced and execution stops without trying to change branches.

The scripts **never** attempt to automatically change branches after a failure, and they **do not** perform any legacy migration logic.

---

## Branch Naming Convention

The tooling enforces a simple, semantic branch naming scheme for new games:

```text
feat/<game-name>
```

Examples:

- `feat/bitsnake`
- `feat/skycraft`

This convention matches the intent of the work (adding a new feature/game) and keeps branches easily discoverable in the repository.

---

## Commit Message Convention

When the initial commit is requested and the scaffold succeeds, the core module creates a semantic commit with the format:

```text
feat: add <game-name> <genre> game scaffold
```

Examples:

- `feat: add bitsnake arcade game scaffold`
- `feat: add skycraft runner game scaffold`

This message:

- Clearly identifies the new game.
- Includes the chosen genre.
- Uses the `feat:` prefix to align with common conventional commit practices.

---

## Wizard Workflow

The `pnpm create-game-wizard` command implements a **step-by-step** workflow:

1. Prompt for `game-name` and `genre`.
2. Validate:
   - `game-name` is non-empty (further validation happens inside `create-game`).
   - `genre` is one of `arcade`, `puzzle`, `runner`.
3. Ask whether to:
   - Create git branch `feat/<game-name>`.
   - Run the `create-game` scaffold.
   - Create the initial commit.
4. If any git operation (branch or commit) is requested, ensure the working tree is clean before proceeding.
5. Execute requested steps in order:
   - If branch creation is confirmed, create `feat/<game-name>`.
   - If scaffold is confirmed, run `pnpm create-game <game-name> --genre <genre>`.
   - If commit is confirmed:
     - Only proceed if the scaffold step was actually executed.
     - Stage generated files with `git add .`.
     - Create the semantic commit `feat: add <game-name> <genre> game scaffold`.
6. If the scaffold step ran successfully, print the recommended validation command:

```bash
pnpm validate:app -- <game-name>
```

This wizard allows human operators to opt in or out of each step while preserving the same safety properties and conventions as the direct script.

