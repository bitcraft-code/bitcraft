# AGENTS.md — bitcraft-landingpage

Universal agent configuration. Read this before making any change.
Works with: Claude Code, Cursor, GitHub Copilot, Codex, Gemini CLI, Cline, and all agents that respect `.agents/`.

---

## Project Overview

BITCRAFT landing page — marketing site for a software factory + AI + marketing agency.
Next.js 16 / React 19 / TypeScript strict / Tailwind CSS 3 / Framer Motion / GSAP / OGL (WebGL).
Internationalized (pt-BR + en) via runtime detection in `lib/translations.ts`.
No backend. No database. No auth. Static/SSG with client-side interactivity.

---

## Domain Map — Who Owns What

Agents working in parallel must respect these boundaries to avoid conflicts:

| Domain | Files | Skills to apply |
|--------|-------|-----------------|
| **Animation** | `components/Grainient.*`, `components/Iridescence.*`, `components/LetterGlitch.*`, `components/HeroCycle*.tsx`, `components/PageTransition.tsx`, any component using `motion/`, GSAP, or OGL | `fixing-motion-performance`, `baseline-ui` |
| **UI Components** | `components/*.tsx` (non-animation) | `baseline-ui`, `vercel-react-best-practices` |
| **Pages** | `app/**/page.tsx`, `app/**/layout.tsx` | `vercel-react-best-practices`, `fixing-metadata` |
| **Metadata / SEO** | `app/layout.tsx`, `app/**/page.tsx` (metadata exports) | `fixing-metadata`, `core-web-vitals` |
| **i18n** | `lib/translations.ts` | — |
| **Config** | `next.config.js`, `tailwind.config.js`, `tsconfig.json`, `package.json` | — |

---

## Skills

Installed in `.agents/skills/` (universal) and `.claude/skills/` (Claude Code symlinks).

### Active Skills

| Skill | Slash Command | When to invoke |
|-------|--------------|----------------|
| `fixing-motion-performance` | `/fixing-motion-performance` | Any animation work — mandatory |
| `baseline-ui` | `/baseline-ui` | Any UI component or Tailwind layout work |
| `vercel-react-best-practices` | `/vercel-react-best-practices` | New components, data fetching, bundle changes |
| `fixing-metadata` | `/fixing-metadata` | New pages, OG/Twitter cards, canonical, JSON-LD |
| `core-web-vitals` | `/core-web-vitals` | Hero changes, image handling, LCP/CLS/INP concerns |

### Usage Pattern
```
# Review a file before editing:
/fixing-motion-performance components/HeroCycle.tsx

# Apply constraints to entire session:
/baseline-ui

# Audit before shipping a new page:
/fixing-metadata app/about/page.tsx
```

---

## Animation Architecture — Critical for All Agents

Three systems coexist. **Never mix them within the same component.**

| System | Purpose | Files |
|--------|---------|-------|
| `motion/react` | Component mount/exit, layout transitions, hover | Most `components/*.tsx` |
| GSAP | Multi-step timelines, scroll sequences | Inline in page components |
| OGL | WebGL canvas backgrounds | `Grainient.tsx`, `Iridescence.tsx`, `LetterGlitch.tsx` |

**Rules (non-negotiable):**
- Animate only `transform` and `opacity` — never `width`, `height`, `top`, `left`, `margin`, `padding`
- OGL components are render-only — zero business logic inside them
- Every animated component must handle `prefers-reduced-motion`
- No `will-change` on large surfaces — only on elements actively transitioning

---

## Coding Constraints

- **TypeScript strict** — no `any`, no `// @ts-ignore`
- **`h-dvh` not `h-screen`** — mandatory for mobile browser chrome
- **`cn()`** for conditional Tailwind classes
- **No inline `style` props** for values Tailwind can express
- Metadata in one place per page — `app/layout.tsx` for root, `export const metadata` per page
- Dark/light mode: runtime state toggle (DARK/LIGHT objects) — not Tailwind `dark:` prefix
- pnpm only — never npm or yarn

---

## Multi-Agent Coordination

When running parallel agents (worktrees or subagents):

1. **Claim a domain** — each agent works within one domain from the Domain Map above
2. **No cross-domain edits** — if a change requires touching another domain, hand off or coordinate
3. **Animation + UI agents must not run simultaneously on the same component** — sequential only
4. **Config files** (`next.config.js`, `tsconfig.json`, `tailwind.config.js`) are shared — serialize changes, never parallel
5. **`lib/translations.ts`** — single writer at a time; add keys at the end of each locale block

### Parallel-safe task pairs
- Metadata work on `app/*/page.tsx` ↔ UI work on `components/`
- i18n additions in `lib/translations.ts` ↔ WebGL tuning in OGL components
- New page scaffold ↔ existing component refactor

### Must be sequential
- Any two agents touching the same component file
- Config changes + anything that depends on them
- Tailwind config changes + component styling work

---

## Commit Convention
```
feat(scope): summary
fix(scope): summary
chore(scope): summary
refactor(scope): summary
```
Scopes: `ui`, `animation`, `pages`, `meta`, `i18n`, `config`, `deps`

No `Co-Authored-By`. One logical change per commit.
