# Strata

A meditative sediment-sorting puzzle built as a Progressive Web App. You play as a field scientist moving between five research sites, extracting and organizing core samples so each tube contains only one sediment color.

## How to play

1. **Select** a source core tube.
2. **Pour** its top matching layers into another tube.
3. **Tamp** a bottom block of matching layers (2+) to compress them into one layer using a limited tamp charge.
4. Clear every tube to a single uniform color to complete the sample.

Earn up to 3 stars by finishing within the target moves and preserving unused tamp charges.

## Research sites

The campaign is split into five themed research sites, each with 40 levels:

- **Arctic Station** (a01–a40)
- **Desert Outpost** (d01–d40)
- **Deep Sea Lab** (s01–s40)
- **Volcanic Ridge** (v01–v40)
- **Meteorite Crater** (m01–m40)

Each site introduces its own sediment palette and ramps difficulty from guided tutorials to advanced master layouts.

## Tech stack

- TypeScript + Vite
- Plain HTML/CSS (no UI framework)
- Workbox/Vite PWA plugin for offline installability
- Python reverse-scramble generator for puzzle levels

## Development

```bash
npm install
npm run dev          # local dev server
npm run build      # typecheck and production build
npm run preview    # preview production build

# Regenerate levels (optional: edit scripts/expand_levels.py first)
npm run expand-levels
```

Puzzles live in `src/engine/puzzles.json`. The generator in `scripts/expand_levels.py` keeps the existing Arctic levels intact and appends new themed sites with per-site color palettes and tiered parameters.

## Project structure

```
src/
  app.ts              # main app wiring, map + screens
  style.css           # global styles, tube/map themes
  engine/
    constants.ts      # colors, sites, settings
    game-logic.ts     # pour, tamp, undo, win checks
    puzzles.json      # level bank (200 levels)
    storage.ts        # localStorage save + legacy migration
    types.ts          # shared type definitions
scripts/
  generate-puzzles.py # original reverse-scramble solver
  expand_levels.py    # batch generator for the 5-site campaign
```

## Saving

Progress is stored in `localStorage` under `strata-save-v1`. Previous builds that used `catalyst-save` are migrated automatically on first launch.

## License

MIT-style — part of the [kimmania](https://github.com/kimmania) PWA puzzle collection.
