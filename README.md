# bitcraft-landingpage

Landing page for [BITCRAFT](https://bitcraft.dev.br) — software factory, AI, and marketing agency.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript strict |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion (`motion/react`) + GSAP + OGL (WebGL) |
| i18n | Runtime detection — `pt-BR` / `en` via `lib/translations.ts` |
| Package manager | pnpm |

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home — animated hero with rotating headline |
| `/about` | `app/about/page.tsx` | Who we are — pillars + FAQ |
| `/agency` | `app/agency/page.tsx` | Marketing agency — Iridescence bg |
| `/software` | `app/software/page.tsx` | Software factory |
| `/contact` | `app/contact/page.tsx` | Contact form |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm build    # production build
pnpm start    # serve production build
```

## Project Structure

```
app/                    # Next.js App Router
  layout.tsx            # Root layout — fonts, metadata, PageTransition
  page.tsx              # Home (dynamic import, ssr: false)
  [page]/page.tsx       # Per-page route + metadata export

components/             # All React components
  Grainient.tsx         # OGL — animated grain gradient background
  Iridescence.tsx       # OGL — iridescent WebGL surface
  LetterGlitch.tsx      # OGL — glitching character grid
  FaultyTerminal.tsx    # OGL — CRT terminal effect
  HeroCycle.tsx         # Hero animation switcher (decrypt / split / type)
  PageTransition.tsx    # Route transition wrapper
  BorderGlow.tsx        # Magnetic glow border primitive
  SiteHeader.tsx        # Nav — locale toggle + active route
  SiteFooter.tsx        # Footer
  ContactSection.tsx    # Contact form section
  FaqSection.tsx        # Accordion FAQ

lib/
  translations.ts       # Locale strings + detectLocale() + saveLocale()

.agents/skills/         # Agent skills (reinstall with: npx skills add)
```

## Animation Architecture

Three animation systems coexist. **Never mix them in the same component.**

| System | Role |
|--------|------|
| `motion/react` | Component mount/exit, layout transitions, hover |
| GSAP | Multi-step timelines, scroll sequences |
| OGL | WebGL canvas backgrounds (Grainient, Iridescence, LetterGlitch, FaultyTerminal) |

Rules: only animate `transform` and `opacity`. OGL components are render-only — no business logic inside them.

## Internationalization

Locale is detected at runtime from `localStorage` → `navigator.language`. No SSR locale routing.

```ts
import { detectLocale, saveLocale, type Locale } from '@/lib/translations'
```

To add a string: add to both `en` and `pt` blocks in `lib/translations.ts`.

## Agent Skills

Skills are installed in `.agents/skills/` and symlinked to `.claude/skills/`.  
Lock file: `skills-lock.json`.

To reinstall after cloning:
```bash
npx skills install
```

Available slash commands in Claude Code:

| Command | When to use |
|---------|------------|
| `/fixing-motion-performance` | Any animation change |
| `/baseline-ui` | UI components, Tailwind layout |
| `/vercel-react-best-practices` | New components, data fetching |
| `/fixing-metadata` | New pages, OG tags, SEO |
| `/core-web-vitals` | Hero, images, LCP/CLS |

See `AGENTS.md` for multi-agent coordination rules.

## Environment

No `.env` required for local development. The app is fully static with no backend dependencies.

For deployment to Vercel, no additional configuration is needed beyond connecting the repo.
