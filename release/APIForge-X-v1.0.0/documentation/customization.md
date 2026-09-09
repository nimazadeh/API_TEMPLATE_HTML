# Customization guide

Everything visual in APIForge X is driven by SCSS design tokens. Change the
token, rebuild, done — never scatter hex colors or durations through page
CSS.

This guide assumes you are working in `APIForge-X-Developer/` (see
`installation.md` for setup). Small copy and link edits can also be made
directly in the `.html` files of the ready-to-run package.

---

## Colors

File: `src/scss/tokens/_colors.scss`

- Dark theme values sit on `:root`; light overrides on `[data-theme="light"]`
- Surfaces: `--surface-canvas`, `--surface-1` … `--surface-3`, `--surface-overlay`, `--surface-code`
- Accent: `--accent` + `--accent-rgb` (drives glows, focus rings and charts)
- Status: `--success*`, `--error*`, `--warning*`, `--info*`

Change the accent once and buttons, focus rings, charts and the marketing
backdrop glow all follow. Bootstrap utilities are bridged (`--bs-*` →
tokens) in `src/scss/base/_bootstrap-overrides.scss`, so `.bg-body`,
`.text-primary` and friends stay theme-aware automatically.

## Fonts

Files: `src/scss/base/_fonts.scss` (imports) and
`src/scss/tokens/_typography.scss` (stacks). All fonts are self-hosted via
Fontsource — no CDN, no external requests.

### The five lanes

| Lane | Token | Font | Use |
|------|-------|------|-----|
| Persian UI | `--font-persian-ui` | **Vazirmatn** | Every Persian interface text — body, headings, forms |
| Latin UI | `--font-latin-ui` | Inter Variable | English interface |
| Technical term | `--font-technical` | Inter Variable | Latin terms inside Persian text (`.tech`) — stays Latin by design |
| Code | `--font-code` | JetBrains Mono | code, keys, endpoints, JSON (`.mono`) |
| Numeric data | `--font-numeric` | Inter / Vazirmatn | KPIs, tables — tabular figures (`.num`) |

Components never pick a language-specific font directly. They read the
**locale-resolved** token:

```scss
:root { --font-body: var(--font-latin-ui); }
[dir='rtl'], [lang='fa'] {
  --font-body: var(--font-persian-ui);   // Vazirmatn — the default locale
}
```

`body`, hero displays, form controls and Bootstrap's `--bs-body-font-family`
all use `var(--font-body)`, so flipping the language in the header re-points
the whole UI at the correct face automatically.

### Swapping a font

1. Replace the Fontsource import in `src/scss/base/_fonts.scss`.
2. Update the matching stack token in `src/scss/tokens/_typography.scss`.
3. `npm run build`.

Vazirmatn ships at weights 300–700 (arabic, latin, latin-ext subsets).
Persian text gets a taller line-height (`--lh-body-fa: 1.7`) and no negative
letter-spacing — both already set for `[dir='rtl']`.

## Spacing, radius, type scale

- `src/scss/tokens/_spacing.scss` — `--space-1 … --space-8` (4px grid)
- `src/scss/tokens/_radius.scss` — 6px interactive, 12px containers, pill, 4px data
- `src/scss/tokens/_typography.scss` — `--fs-*` scale, line heights, tracking

## Motion

File: `src/scss/tokens/_motion.scss`

| Token | Default |
|-------|---------|
| `--motion-fast` | 150ms |
| `--motion-normal` | 250ms |
| `--motion-slow` | 400ms (hard ceiling) |
| `--ease-standard` | `cubic-bezier(.2,.8,.2,1)` |

Only `transform` and `opacity` animate. `prefers-reduced-motion` disables
decorative motion automatically. Directional motion mirrors in RTL via
`--dir-sign` (1 / −1).

## Copy and translations

- `src/locales/fa.json` / `src/locales/en.json` — the UI catalogs
- `src/js/data/docs-content.fa.js` / `docs-content.en.js` — long-form docs

Markup binds with `data-i18n="nav.logs"` or
`data-i18n-attr="aria-label:aria.search"`; JavaScript uses
`t('logs.countOf', { shown, total })`. Always add a key to **both**
catalogs — see `localization.md` for the full workflow.

## Navigation

1. Update `<nav class="sidebar-nav">` on every workspace page (the shell is
   duplicated per HTML file by design — it is a static multi-page app).
2. Update `src/js/data/commands.js` so the ⌘K palette stays accurate.
3. Marketing header/footer: `.site-header` / `.site-footer` on landing,
   pricing, changelog, status, 404.

## Branding

Replace "APIForge X" in page titles, locale strings (`site.*`, `cmd.*`) and
the landing hero copy. `LICENSE.md` stays with the template purchase; your
finished end product carries its own name and terms.

## Modifying components

Component styles are one file per pattern in `src/scss/components/`:

| Pattern | File |
|---------|------|
| Buttons, forms, tabs, badges | `_buttons.scss`, `_forms.scss`, `_tabs.scss`, `_badges.scss` |
| Cards, stats, tables | `_cards.scss`, `_stat.scss`, `_tables.scss` |
| Modal, drawer, dropdown, tooltip, toast | `_modal.scss`, `_split.scss`, `_dropdown.scss`, `_tooltip.scss`, `_toast.scss` |
| Code blocks, command palette | `_code.scss`, `_command-palette.scss` |
| Shell (sidebar, header, mobile nav) | `src/scss/layouts/` |

Keep the token references, rebuild, and the pattern re-themes everywhere.
JS behavior for each pattern lives in the matching `src/js/components/<name>.js`.

## Adding pages

The site is a Vite multi-page app: each screen is one root HTML file plus one
JS entry.

**Workspace page (sidebar shell):**

1. Create `src/js/pages/your-page.js`:

   ```js
   import { boot } from '../main.js';
   boot();
   ```

2. Duplicate an existing workspace page (e.g. `logs.html`), set a unique
   `<title>` and point its script tag at your new entry.
3. Register the file in `vite.config.js` → `pageInputs`.
4. Add the sidebar link to the workspace pages and to `commands.js`.
5. Add the nav label keys to `fa.json` / `en.json`.
6. New icon? Add it to the tree-shaken registry in `src/js/components/icons.js`.

**Marketing page (site header/footer):** start from `pricing.html`, import
`bootSite()` from `../site.js`, and register it in `pageInputs` the same way.

## Demo data

Fixtures live in `src/js/data/` as plain JSON: `mock-*.json` (Persian
default) with `mock-*.en.json` counterparts for the English locale. Keep the
two variants structurally identical — same records, IDs, dates and amounts;
only the authored prose differs. Edit values directly and rebuild.

## Rebuilding the production files

```bash
npm run build      # → dist/ with hashed, relative-path assets
```

`dist/` is a ready-to-deploy static site with the same structure as the
ready-to-run package. Content-hashed filenames make each build atomic —
deploy all new assets together.

---

© Blue Studio — APIForge X is designed and maintained by Blue Studio.
