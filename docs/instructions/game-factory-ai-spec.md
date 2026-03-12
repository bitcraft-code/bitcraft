
# Bitcraft Game Factory — AI / Agent Platform Specification

## Platform Purpose

This repository is a **mobile game generation platform**.

It enables automated systems or AI agents to:

- generate new mobile games
- configure metadata
- generate assets and screenshots
- generate ASO keywords
- validate release readiness
- compare game performance

## AI Agent Operational Rules

This repository includes **strict operational rules for AI coding agents**.

The current file (`game-factory-ai-spec.md`) explains the **platform, structure, and capabilities** so agents understand how the game factory works.  
The companion file `docs/instructions/game-factory-agent-rules.md` defines the **strict operational constraints** that agents must follow when changing the platform.

Before modifying **generators, templates, shared packages, or platform tooling**, AI agents **must read and respect**:

`docs/instructions/game-factory-agent-rules.md`

Those rules cover, among other things:

- architecture invariants
- dependency constraints
- package creation rules
- generator safety contracts
- documentation update expectations

---

# Repository Architecture

```
apps/        → generated games
packages/    → shared internal libraries
templates/   → genre-specific game templates
scripts/     → platform tooling
docs/        → documentation
```

---

# Core Commands

Create a game:

```
pnpm create-game <game-name>
```

Create with genre:

```
pnpm create-game <game-name> --genre arcade|puzzle|runner
```

Batch generation:

```
pnpm create-games game1 game2 game3
```

---

# Generated Game Structure

```
apps/<game-name>/

app/                     → Expo Router screens
src/
  game.ts
  gameConfig.ts
  features.ts
  experiments.ts
  theme.ts
  i18n/
metadata/
assets/
```

---

# Platform Capabilities

## Game Generation

```
create-game
create-games
```

## Store Preparation

```
generate-screenshots
generate-aso-keywords
check-release-readiness
```

## Performance Analysis

```
analytics-dashboard
generate-test-data
list:games
```

## Maintenance & Governance

Agents should use the following scripts before and/or after structural changes (generators, templates, shared packages, platform tooling):

```
pnpm doctor
pnpm lint:architecture
```

`pnpm doctor` validates folder/docs/scripts assumptions; `pnpm lint:architecture` enforces import rules, @bitcraft/* usage, basic package graph sanity, and template placeholders.

---

# Automation Opportunities

AI agents can automate workflows such as:

### Idea exploration

```
generate multiple games
collect analytics
identify high-performing games
```

### Store preparation

```
generate screenshots
generate metadata
validate readiness
```

### Experimentation

Use:

```
experiments.ts
```

to toggle features and test variations.

---

# Telemetry Schema

Events may include:

```
gameId
genre
sessionId
userId
buildVersion
platform
country
theme
language
timestamp
```

Helper:

```
withTelemetryContext()
```

---

# Dashboard Metrics

The analytics dashboard supports:

```
sessions
average playtime
D1 retention
D7 retention
ad interactions
ranking score
```

Ranking logic is implemented in:

```
packages/analytics-dashboard/server.js
```

---

# Suggested Agent Workflows

Agents can automate:

```
generate multiple games
run analytics
rank games
continue development on top performers
```

or

```
auto-generate ASO
auto-update metadata
auto-run readiness checks
```
