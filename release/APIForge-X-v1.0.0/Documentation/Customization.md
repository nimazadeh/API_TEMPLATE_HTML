# Customization guide

All visual decisions live in SCSS design tokens. Never scatter hex colors or
durations in page CSS — change the token, rebuild, done.

Work in **`APIForge-X-Developer/`**, then `npm run build`.

---

## Colors

File: `src/scss/tokens/_colors.scss`

- Dark theme values sit on `:root`
- Light theme overrides sit on `[data-theme="light"]`
- Surfaces: `--surface-canvas`, `--surface-1` … `--surface-3`, `--overlay`, `--code`
- Accent: `--accent` + `--accent-rgb` (drives glows and focus rings)
- Status: `--success*`, `--error*`, `--warning*`, `--info*`

Change the accent once; buttons, focus rings, charts, and the marketing
backdrop glow all follow. Bootstrap utilities are bridged
(`--bs-*` → tokens) in `src/scss/base/_bootstrap-overrides.scss`, so
`.bg-body`, `.text-primary`, `.border` and friends stay theme-aware.

## Fonts

File: `src/scss/base/_fonts.scss` (imports) + `src/scss/tokens/_typography.scss`
(stacks). All fonts are **self-hosted** via Fontsource — woff2 files are
bundled into `assets/`, zero CDN.

### The five lanes

| Lane | Token | Font | Use |
|------|-------|------|-----|
| Persian UI | `--font-persian-ui` | **Vazirmatn** | Primary face — every Persian UI text, headings, forms, numerics |
| Latin UI | `--font-latin-ui` | Inter Variable | English UI (the same product in LTR mode) |
| Technical term | `--font-technical` | Inter Variable | Latin terms inside Persian text (`.tech`) — stays Latin by design |
| Code | `--font-code` | JetBrains Mono | code, keys, endpoints, JSON (`.mono`) |
| Numeric data | `--font-numeric` | Inter / Vazirmatn | KPIs, tables — tabular figures (`.num`) |

### How the language switch works

Components never pick a language-specific font directly. They read the
**locale-resolved** token:

```scss
:root { --font-body: var(--font-latin-ui); }
[dir='rtl'], [lang='fa'] {
  --font-body: var(--font-persian-ui);   // Vazirmatn — the default locale
  --font-numeric: var(--font-persian-ui);
}
```

`body`, `.display` (hero headlines), `.form-control`, `.form-select` and
Bootstrap's `--bs-body-font-family` all use `var(--font-body)`, so flipping
the language in the header re-points the whole UI at the correct face —
Vazirmatn in Persian, Inter in English.

### Changing the Persian font

1. Replace the imports in `src/scss/base/_fonts.scss` with your Fontsource
   package (or add a `@font-face` block if the font is not on Fontsource).
2. Update the stack in `--font-persian-ui` in `src/scss/tokens/_typography.scss`.
3. `npm run build`.

Vazirmatn ships at weights **300 / 400 / 500 / 600 / 700** (arabic, latin and
latin-ext subsets). The Persian UI needs a taller line-height
(`--lh-body-fa: 1.7`) and no negative letter-spacing — both are already set
for `[dir='rtl']`.

### Changing the Latin / code fonts

Same pattern: swap the Fontsource import, update `--font-latin-ui` /
`--font-code`. One Latin family deliberately covers UI *and* display text
(tight display tracking comes from `--track-display`, not a second font file).

## Spacing, radius, type scale

- `src/scss/tokens/_spacing.scss` — `--space-1 … --space-8`
- `src/scss/tokens/_radius.scss`
- `src/scss/tokens/_typography.scss` — `--fs-*` scale, line heights, tracking

## Motion

File: `src/scss/tokens/_motion.scss`

| Token | Default |
|-------|---------|
| `--motion-fast` | 150ms |
| `--motion-normal` | 250ms |
| `--motion-slow` | 400ms (hard ceiling) |
| `--ease-standard` | `cubic-bezier(.2,.8,.2,1)` |

Only `transform` and `opacity` animate. `prefers-reduced-motion` disables all
decorative motion automatically. Directional motion mirrors in RTL via
`--dir-sign` (1 / −1).

## Copy and translations

- `src/locales/fa.json` / `src/locales/en.json` — UI catalogs (~1,347 keys)
- `src/js/data/docs-content.fa.js` / `docs-content.en.js` — long-form docs

Markup binds with `data-i18n="nav.logs"` or
`data-i18n-attr="aria-label:aria.search"`; JavaScript uses
`t('logs.countOf', { shown, total })`. Always add a key to **both** catalogs.

## Navigation

1. Update `<nav class="sidebar-nav">` on **every** app page (the shell is
   duplicated per HTML file by design — static MPA).
2. Update `src/js/data/commands.js` so the ⌘K palette stays accurate.
3. Marketing header/footer: `.site-header` / `.site-footer` on landing,
   pricing, changelog, status, 404.

## Branding

Replace “APIForge X” in page titles, locale strings (`site.*`, `cmd.*`),
landing hero copy, and `LICENSE.txt` stays with the template sale — your end
product can use its own name.

## Modifying components

Component styles are one file per pattern in `src/scss/components/`:

| Pattern | File |
|---------|------|
| Buttons, forms, tabs, badges | `_buttons.scss`, `_forms.scss`, `_tabs.scss`, `_badges.scss` |
| Cards, stats, tables | `_cards.scss`, `_stat.scss`, `_tables.scss` |
| Modal, drawer (offcanvas), dropdown, tooltip, toast | `_modal.scss`, `_split.scss`, `_dropdown.scss`, `_tooltip.scss`, `_toast.scss` |
| Code blocks, command palette | `_code.scss`, `_command-palette.scss` |
| Shell (sidebar, header, mobile nav) | `src/scss/layouts/` |

Edit the SCSS file, keep the token references, rebuild. JS behavior for each
pattern lives in the matching `src/js/components/<name>.js`.

## Adding new pages

The site is a Vite **multi-page app**: each screen = one root HTML file + one
JS entry.

### App page (sidebar shell)

1. Create `src/js/pages/your-page.js`:

   ```js
   import { boot } from '../main.js';
   boot();
   ```

2. Duplicate an existing app HTML file (e.g. `logs.html`).
3. Set a unique `<title>` and the page script tag:

   ```html
   <script type="module" src="./src/js/pages/your-page.js"></script>
   ```

4. Register the file in `vite.config.js` → `pageInputs`.
5. Add the sidebar link to **every** app page and to `src/js/data/commands.js`.
6. Add the nav label keys to `fa.json` / `en.json`.
7. New glyph? Add it to the tree-shaken registry in `src/js/components/icons.js`.

### Marketing page (site header/footer)

```js
import { bootSite } from '../site.js';
bootSite();
```

Copy `pricing.html` or `changelog.html` as the shell and register it in
`pageInputs` the same way.

### Data

Add fixtures in `scripts/generate-mock-data.mjs` and regenerate — never
hand-edit the `mock-*.json` dumps (they are generated and seeded).

## Rebuilding production files

```bash
npm run build      # → dist/ with hashed, relative-path assets
```

`dist/` is the exact contents of the HTML package. Replace the contents of
`APIForge-X-Preview/` with it (skip `rtl-persian-test.html`, which is the
source-only QA harness). Filenames are content-hashed — a fresh build is
atomic: either upload all new assets or none.

## Mock data

```bash
node scripts/generate-mock-data.mjs
```

Seeded and deterministic — the same demo data on every build, every buyer.
