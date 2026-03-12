
# Bitcraft Game Factory — Agent Rules

This document defines **operational rules for AI coding agents** working in this repository.

Its purpose is to help agents modify or extend the platform **without breaking the intended architecture**.

Agents should read this document together with:

- docs/instructions/game-factory-ai-spec.md
- docs/instructions/game-factory-human-guide.md

---

# Architecture Invariants

The following rules must **never be broken**:

- All games live under `apps/*`
- Shared reusable code lives under `packages/*`
- Games must import shared code only through `@bitcraft/*`
- Do not import across apps
- Do not import from `packages/*/src/*`
- Generators must preserve monorepo compatibility
- New games must remain independently buildable and shippable
- Templates must remain generic and reusable
- Keep app‑specific logic inside apps, not shared packages

---

# Dependency Rules

Allowed dependency direction:

apps/* → @bitcraft/app-shell  
apps/* → @bitcraft/game-core  
apps/* → @bitcraft/storage  
apps/* → @bitcraft/analytics  
apps/* → @bitcraft/monetization  

@bitcraft/app-shell → @bitcraft/game-core

Forbidden:

- app-shell → apps/*
- game-core → UI packages
- storage → apps/*
- analytics → apps/*
- monetization → apps/*
- imports between apps

Agents must not introduce dependency cycles.

---

# Package Creation Rules

Create a new shared package only when:

- code is reused by **2 or more games**
- the responsibility is clearly independent
- the public API can remain small and stable

Do NOT create new packages for:

- one‑off app logic
- premature abstractions
- visual components used by a single app
- gameplay logic specific to a genre

When in doubt, keep the code inside the app.

---

# Template Rules

Templates are the foundation for generated apps.

Rules:

- Templates must preserve placeholder identifiers:
  - `Template`
  - `template`
- Templates must remain generator compatible
- Genre templates should differ in gameplay structure, not platform structure
- Do not hardcode identifiers of existing games
- If a new genre is added:
  - create `templates/<genre>`
  - update `GENRES` in the generator
  - add keyword mappings

---

# Generator Safety Contract

`create-game` must always:

- validate the game name
- prevent overwriting existing apps
- support dry-run mode
- safely replace template identifiers
- keep workspace compatibility
- generate required metadata/config files
- preserve TypeScript compatibility

`create-games` must:

- continue execution when one game fails
- report failures clearly

Generators must never break existing apps.

---

# Definition of Done

A task is complete only if:

- architecture invariants are preserved
- generated apps still validate
- no forbidden imports were introduced
- templates remain generator-compatible
- documentation is updated when behavior changes
- analytics schema compatibility is preserved

---

# Documentation Rules

Documentation must be updated when changing:

- generators
- templates
- workspace structure
- CLI flags
- telemetry schema
- dashboard metrics
- release readiness checks

Documentation locations:

- usage guides → `docs/instructions/`
- architecture reviews → `docs/audits/`

---

# Telemetry Contract

Cross‑game analytics must remain comparable.

Events should include where possible:

- gameId
- genre
- sessionId
- userId (or anonymous token)
- timestamp

Preferred additional fields:

- buildVersion
- platform
- country
- theme
- language

Telemetry helpers should be used to attach this context.

---

# Decision Hierarchy

When making design trade‑offs, prioritize in this order:

1. Preserve architecture
2. Keep generators stable
3. Avoid over‑engineering
4. Keep app creation fast
5. Optimize developer experience
6. Add flexibility only when clearly needed

---

# Recommended Agent Workflow

Before editing:

1. Inspect documentation in `docs/instructions/` and `docs/audits/`
2. Confirm architecture invariants
3. Identify whether the change belongs in:
   - app
   - template
   - package
   - script

When implementing changes:

1. Prefer modifying existing systems over creating new ones
2. Update generators only if the feature should apply to **future games**
3. Keep templates generic

Before finishing:

1. Validate affected apps (e.g. `pnpm validate:app -- <game>`)
2. Run governance scripts when relevant:
   - `pnpm doctor`
   - `pnpm lint:architecture`
3. Check for forbidden imports
4. Confirm documentation accuracy
5. Ensure the generator still works

---

# Goal

The goal of these rules is to ensure that:

- the platform remains **stable**
- the architecture remains **clean**
- agents can extend the system **without degrading it over time**
