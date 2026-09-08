# Theme system

APIForge X is **dark-first**. Light is a token override, system follows the
OS. Three states: `dark`, `light`, `system`.

## How the theme is stored

1. A no-flash inline script in every page's `<head>` reads
   `localStorage['afx-theme']` and sets `data-theme` **before first paint**
   (`system` resolves through `prefers-color-scheme`).
2. `src/js/components/theme.js` wires the header theme menu
   (dark / light / system) and persists the choice.
3. The switch emits an `afx:theme` event; components that render pixels
   (charts, backdrops) rebuild from the new CSS variables.

Changing the theme never reloads the page and never flashes the wrong
palette.

## Changing palettes

Edit **`src/scss/tokens/_colors.scss` only**:

- Dark values on `:root`
- Light overrides on `[data-theme="light"]`
- Accent `--accent` / `--accent-rgb` — one change re-skins buttons, focus
  rings, chart series, the marketing glow and the active nav rail

Bootstrap utilities are bridged in `src/scss/base/_bootstrap-overrides.scss`
(`--bs-*` → tokens), so `.bg-body`, `.text-primary`, `.border`, `.bg-success`
and the rest stay theme-aware without touching Bootstrap itself.

Deliberate conventions:

- **Code wells stay dark in both themes** (dashboard/Stripe convention) —
  code readability wins over pure symmetry.
- Surfaces are layered: `--surface-canvas` (page) → `--surface-1` (cards) →
  `--surface-2/3` (nested), `--overlay` for modals, `--code` for wells.

## Charts

`src/js/components/charts.js` reads palette tokens and rebuilds on
`afx:theme`. After a token change, a CSS rebuild is enough — no chart code
changes required unless you add new data series.

## Marketing backdrop

`.backdrop` (fine developer grid + controlled accent glow + infrastructure
lattice) is applied to **marketing and auth pages only** — the workspace
stays a clean, distraction-free tool. Variants: `.backdrop--quiet`,
`.backdrop--auth`. Tune via `--backdrop-*` color tokens and
`src/scss/components/_backdrop.scss`.

## Verifying a theme change

- `style-guide.html` — every primitive in dark and light
- `visual-showcase.html` — motion, toast, backdrop in dark/light × RTL/LTR
- The header theme control on every page
- `npm run test:responsive` re-runs the layout matrix in both themes
