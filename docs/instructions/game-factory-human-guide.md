
# Bitcraft Game Factory — Human-Friendly Guide

## What this repository is

This repository is a **mobile game factory** designed to rapidly create, test, and evaluate many simple mobile games.

It uses:
- Expo + React Native
- pnpm monorepo
- Shared internal packages
- Automated generators and tooling

The goal is to **generate many games quickly**, test them, measure their performance, and focus development on the best-performing ones.

---

# Repository Structure

```
apps/        → individual games
packages/    → shared libraries
templates/   → genre-specific game templates
scripts/     → generators and tooling
docs/        → architecture and usage documentation
```

---

# Creating a New Game

Basic usage:

```
pnpm create-game my-game
```

Create with a genre:

```
pnpm create-game my-runner --genre runner
```

Supported genres:

- arcade
- puzzle
- runner

The generator will:

- copy the appropriate template
- replace identifiers
- generate assets
- create metadata
- configure analytics and monetization
- validate the generated app

---

# Running a Game

After creation:

```
pnpm install
pnpm dev:my-game
```

Other useful commands:

```
pnpm ios:my-game
pnpm android:my-game
pnpm web:my-game
```

---

# Creating Multiple Games

```
pnpm create-games game1 game2 game3 --genre arcade
```

Failures do not stop the batch.

---

# Game Configuration

Each game contains configuration files:

```
src/gameConfig.ts
src/features.ts
src/experiments.ts
```

Example feature flags:

```
ads
analytics
inAppPurchases
sound
haptics
```

---

# Metadata for App Stores

Each game contains:

```
metadata/appstore.json
metadata/playstore.json
metadata/aso-keywords.json
metadata/screenshots/
```

These should be edited before submitting to app stores.

---

# Generating Screenshots

```
pnpm generate-screenshots my-game
```

Creates placeholder screenshots which should be replaced with real ones before publishing.

---

# Generating ASO Keywords

```
pnpm generate-aso-keywords my-game arcade
```

Creates:

```
metadata/aso-keywords.json
```

---

# Analytics Dashboard

Start the dashboard:

```
pnpm dashboard
```

Open:

```
http://localhost:3999
```

Shows:

- sessions
- playtime
- retention (D1 / D7)
- ad interactions
- ranking of games

---

# Release Readiness

Check if a game is ready for publishing:

```
pnpm check-release-readiness my-game
```

This generates:

```
apps/my-game/metadata/release-readiness.md
```

---

# Typical Workflow

Create a game:

```
pnpm create-game test-runner --genre runner
```

Test it:

```
pnpm dev:test-runner
```

Generate store assets:

```
pnpm generate-screenshots test-runner
pnpm generate-aso-keywords test-runner runner
```

Check readiness:

```
pnpm check-release-readiness test-runner
```

Submit to app stores.

---

# Experimentation Strategy

The platform is designed for **rapid experimentation**.

Recommended process:

```
Create many games
↓
Collect analytics
↓
Identify the top performers
↓
Continue development on the best ones
```

---

# Repository Maintenance

To keep the factory healthy as it evolves, use the maintenance scripts:

## Architecture and health

```bash
pnpm lint:architecture   # checks import rules, @bitcraft/* usage, templates placeholders, basic cycles
pnpm doctor              # lightweight repo health check (folders, docs, root scripts, app/templates structure)
```

Run these when changing generators, templates, or shared packages.

## Portfolio overview

```bash
pnpm list:games
```

Shows a table with all games (name, inferred genre, metadata/screenshots/release-readiness presence, ads/analytics flags) and writes:

```text
docs/audits/game-portfolio-overview.json
```

## Refreshing a single game

```bash
pnpm refresh:game -- my-game
```

This will:

- regenerate ASO keywords (using the current genre/defaults)
- regenerate placeholder screenshots (overwriting previous placeholders, not hand-made assets)
- rerun `check-release-readiness`
- run `validate:app` for that game

Use this after metadata or configuration changes to bring a game back in sync with the platform tooling.
