# CLAUDE.md — bitcraft-landingpage

## Stack
- Next.js 16, React 19, TypeScript strict
- Tailwind CSS 3 (no tw-animate-css — use Framer Motion for JS animation)
- Framer Motion (`motion/react`) for component animations
- GSAP for timeline/scroll-driven sequences
- OGL for WebGL canvas effects (Iridescence, LetterGlitch, Grainient)
- pnpm (never npm or yarn)
- i18n via `lib/translations.ts` — pt-BR and en, locale detected at runtime

## File Structure
```
app/                  # Next.js App Router pages
  layout.tsx          # Root layout — metadata, fonts, PageTransition
  page.tsx            # Home — dynamic import of HomeContent (ssr: false)
  about/              # /about page
  agency/             # /agency page
  software/           # /software page
  contact/            # /contact page
components/           # All UI components (shared + page-specific)
lib/
  translations.ts     # Locale strings and detectLocale()
public/               # Static assets, favicons
.agents/skills/       # Installed agent skills (universal format)
.claude/skills/       # Symlinks for Claude Code
```

## Animation Architecture — Critical
Three systems coexist. Each has a defined role — **do not mix them within a single component**:

| System | Use for |
|--------|---------|
| `motion/react` (Framer Motion) | Component enter/exit, layout transitions, hover interactions |
| GSAP | Multi-step timelines, scroll-triggered sequences, coordinated sequences across elements |
| OGL | WebGL canvas effects: Grainient, Iridescence, LetterGlitch backgrounds |

**Always apply `/fixing-motion-performance` rules when touching animation code.**

## Component Patterns
- `h-dvh` — never `h-screen`
- `cn()` for conditional classes (clsx + tailwind-merge pattern)
- All animations: only `transform` and `opacity` — never layout props
- `prefers-reduced-motion` must be respected in every animated component
- Theme tokens: DARK/LIGHT objects in HomeContent drive all color values — no hardcoded colors in JSX style props
- Dark/light mode is runtime-toggled via state (not CSS media query / Tailwind dark:)

## Feature Flags
Optional / experimental sections are gated by `lib/features.ts` + `<FeatureGate name="...">`.
- Add new flag: edit `lib/features.ts`, document in `.env.example` as `NEXT_PUBLIC_FEATURE_<NAME>`, default OFF.
- Wrap section render with `<FeatureGate name="yourFlag">...</FeatureGate>`.
- Whole-route gating: page returns `notFound()` when flag off, header link wrapped in `FeatureGate`.
- Toggle on Vercel via project env vars, redeploy applies (~30s).
- Active flags: `logoCloud`, `testimonials`, `caseStudies`, `team`, `processTimeline`, `engagementModels`, `budgetTiers`, `specialist`, `blog`.

## Metadata
- Root metadata defined in `app/layout.tsx` only
- Per-page overrides via `export const metadata` in each `page.tsx`
- OG images must use absolute URLs
- Apply `/fixing-metadata` before shipping any new page
- Current lang: `pt-BR` in `<html>` tag

## Skills — When to Apply

| Skill | Invoke when |
|-------|-------------|
| `/fixing-motion-performance` | Any animation added, changed, or reviewed |
| `/baseline-ui` | Building or reviewing UI components, Tailwind layout |
| `/vercel-react-best-practices` | New components, data fetching, bundle concerns |
| `/fixing-metadata` | New pages, OG tags, SEO, social share |
| `/core-web-vitals` | Hero section changes, image handling, CLS/LCP concerns |

Skills are in `.claude/skills/` — already loaded as slash commands.

## Multi-Agent Rules
See `AGENTS.md` for domain ownership and coordination protocol.

## Non-Negotiables
- TypeScript strict — no `any`, explicit return types on exported functions
- No `console.log` left in committed code
- No inline `style` for values that Tailwind can express
- OGL components (`Iridescence`, `LetterGlitch`, `Grainient`) are render-only — never add business logic to them
- `app/layout.tsx` is the single source for root metadata — never add competing `<Head>` imports
