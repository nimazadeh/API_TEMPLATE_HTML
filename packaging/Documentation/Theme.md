# Theme customization

APIForge X is **dark-first**. Light is an override on the same tokens. System follows the OS.

## How theme is stored

1. Inline script in `<head>` reads `localStorage['afx-theme']` and sets `data-theme` before paint (no flash).
2. `src/js/components/theme.js` wires the header menu: dark / light / system.
3. `system` listens to `prefers-color-scheme`.

Valid values: `dark`, `light`, `system`.

## Changing palettes

Edit `src/scss/tokens/_colors.scss` only.

Bootstrap utilities are bridged (`--bs-*` → token surfaces) so `.bg-body`, `.text-primary`, and `.border` stay theme-aware.

Code wells stay dark in both themes on purpose (dashboard / Stripe convention).

## Charts

`src/js/components/charts.js` rebuilds on `afx:theme`. After a token change, rebuild the CSS; no chart code change is required if you only shift CSS variables.

## Marketing backdrop

`.backdrop` (grid + glow + mesh) is used on marketing and auth pages, not on the workspace. Tune `--backdrop-*` in the color tokens and `src/scss/components/_backdrop.scss`.

## QA

- `style-guide.html` — primitives in both themes
- `visual-showcase.html` — motion + toast + backdrop
- Header theme control on every page
