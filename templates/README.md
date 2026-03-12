# Genre-specific game templates

Used by `pnpm create-game <name> --genre <genre>`.

- **arcade** — Score, lives, high score. Use for arcade-style games.
- **puzzle** — Level, moves. Use for puzzle games.
- **runner** — Distance, speed. Use for endless runners.

## Adding a new genre template

1. Create a new folder: `templates/<genre>/` (e.g. `templates/strategy/`).

2. Copy the full structure from an existing template (e.g. `templates/arcade/`):
   - `app/` — _layout.tsx, index.tsx, settings.tsx
   - `src/` — game.ts, TemplateGameProvider.tsx, theme.ts, useThemePreference.ts, useLanguagePreference.ts, i18n/
   - Root: app.config.ts, package.json, tsconfig.json, babel.config.js, eas.json, expo-env.d.ts

3. Customize `src/game.ts`:
   - Define `TemplateState` with fields appropriate for the genre.
   - Keep `TemplateSettings`, `TemplateSession`, `createTemplateSession`, `refreshTemplateSession`, and the same identifiers (`Template`, `template`) so that `create-game` replacement works.

4. Customize `app/index.tsx` to display the genre-specific state (e.g. stats, labels).

5. Optionally customize `app/settings.tsx` and provider if needed.

6. In `scripts/create-game.js`:
   - Add the new genre to the `GENRES` array.
   - Add `GENRE_KEYWORDS[genre]` for ASO.
   - Template resolution already uses `templates/<genre>` when the folder exists; no further change required if the folder is named exactly the genre.

7. Run `pnpm create-game mygame --genre <genre>` to verify.
