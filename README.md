# Bitcraft — Mobile Game Factory Platform

Bitcraft is a **mobile game factory platform** built with Expo, React Native, TypeScript, and `pnpm` workspaces.

The repository is designed to:

- **generate new mobile games quickly** from opinionated templates
- **experiment with multiple game ideas** in parallel (genre templates, feature/experiment flags)
- **analyze performance across games** using a shared analytics pipeline and dashboard

There is no monolithic “engine” here. Instead, apps share only what creates real leverage: shell, analytics, monetization, storage, and generation tools.

---

## Quick Start

From the repository root:

```bash
pnpm install
pnpm create-game my-game
pnpm dev:my-game
```

This will:

- scaffold `apps/my-game` from a template
- wire up configs and basic metadata
- start the Expo dev server for `my-game`

You can pass a genre (e.g. `--genre arcade`) to get genre-specific starting gameplay.

---

## Core Commands

From the repo root:

```bash
pnpm create-game <name>                 # generate a single game (supports --genre, --minimal, etc.)
pnpm create-games <name-a> <name-b>     # batch-generate multiple games
pnpm create-game-branch <game-name> <genre>  # create a git feature branch and scaffold a new game
pnpm create-game-wizard                      # interactive wizard for creating a game branch and scaffold
pnpm generate-screenshots <game>        # create placeholder store screenshots
pnpm generate-aso-keywords <game> <genre>  # generate ASO keyword set for a game/genre
pnpm check-release-readiness <game>     # run release checklist and write metadata/release-readiness.md
pnpm dashboard                          # start analytics dashboard (compare games, retention, ranking)
pnpm list:games                         # list all games and portfolio info
pnpm refresh:game -- <game>             # refresh ASO/screenshots/readiness for one game
```

For validation/build pipeline:

```bash
pnpm validate:all        # typecheck + Expo config + web export for all apps
pnpm validate:app -- <game>   # validate a single app
pnpm lint:architecture        # check architecture invariants and forbidden imports
pnpm doctor                   # quick health check of repo structure and docs
```

---

## Platform Workflow

Typical lifecycle for a new game:

```text
idea
↓
pnpm create-game my-game
↓
develop & test locally
↓
generate screenshots and metadata
↓
pnpm check-release-readiness my-game
↓
submit to stores
↓
collect analytics
↓
compare performance in dashboard
```

---

## Repository Structure

High-level layout:

- `apps/` — individual Expo apps, one per game (e.g. `snake`, `tictactoe`, generated games)
- `packages/` — shared internal packages under `@bitcraft/*` (app-shell, game-core, storage, analytics, monetization, dashboard)
- `templates/` — genre-aware game templates used by `create-game` (arcade, puzzle, runner, etc.)
- `scripts/` — CLI tooling (game generator, batch generator, ASO keywords, screenshots, test data, release readiness)
- `docs/` — architecture, audits, and guides for humans and AI agents

Each app lives under `apps/*`, has its own `app.config.ts` and `eas.json`, and can evolve independently while sharing cross-cutting concerns via `@bitcraft/*`.

---

## Documentation

The README is intentionally concise. For deeper documentation, see:

- `docs/instructions/game-factory-human-guide.md` — **main guide for developers**: concepts, workflows, examples for creating, iterating, and shipping games.
- `docs/instructions/game-factory-ai-spec.md` — **spec optimized for AI agents**: structure, constraints, and invariants the tooling expects when an AI edits or extends the platform.

Audit/arquitetura detalhada da plataforma e dos scripts vive em:

- `docs/audits/game-factory-platform-audit.md` — visão de produção da plataforma de game factory.
- `docs/audits/game-factory-evolution-audit.md` — evolução da plataforma (templates por gênero, experiments, retenção, ranking, release readiness).
- `docs/audits/game-factory-architecture-audit.md` — arquitetura da game factory em alto nível.
- `docs/audits/monorepo-architecture-audit.md` — auditoria da arquitetura do monorepo Bitcraft.

Use o guia humano como entrada principal; os audits são referência para revisões técnicas e troubleshooting.

## AI / Agent Usage

This repository is designed to be compatible with AI coding agents.

Agents modifying the platform should consult:

[`docs/instructions/game-factory-ai-spec.md`](docs/instructions/game-factory-ai-spec.md)

before editing generators, templates, or platform tooling.

The AI specification describes:

- repository structure
- generator invariants
- telemetry schema
- expected automation workflows