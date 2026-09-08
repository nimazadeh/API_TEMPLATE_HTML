# Customization guide

All visual decisions live in SCSS tokens. Do not scatter hex colors in page CSS.

Work in **Source-Version**, then `npm run build`.

## Colors

File: `src/scss/tokens/_colors.scss`

- Dark theme values sit on `:root`
- Light theme overrides sit on `[data-theme="light"]`
- Surfaces: `--canvas`, `--surface-1` … `--surface-3`, `--overlay`, `--code`
- Accent: `--accent` and `--accent-rgb` (used for glows)
- Status: `--success*`, `--error*`, `--warning*`, `--info*`

Change the accent once; buttons, focus rings, charts, and marketing glow follow.

## Fonts

File: `src/scss/base/_fonts.scss`

Five lanes (do not mix them):

| Lane | Font | Use |
|------|------|-----|
| Persian UI | Vazirmatn | Default UI when `lang="fa"` |
| Latin UI | Inter Variable | English UI |
| Technical term | Inter | Latin words inside Persian UI |
| Code | JetBrains Mono | code, keys, JSON |
| Numeric | `tabular-nums` | tables and KPIs |

Fonts are Fontsource packages in `package.json` (self-hosted woff2). Adding a CDN font is not recommended.

## Spacing, radius, type scale

- `src/scss/tokens/_spacing.scss`
- `src/scss/tokens/_radius.scss`
- `src/scss/tokens/_typography.scss`

## Motion

`src/scss/tokens/_motion.scss`

| Token | Default |
|-------|---------|
| `--motion-fast` | 150ms |
| `--motion-normal` | 250ms |
| `--motion-slow` | 400ms |
| `--ease-standard` | `cubic-bezier(.2,.8,.2,1)` |

`prefers-reduced-motion` disables decorative motion.

## Copy / translations

- `src/locales/fa.json`
- `src/locales/en.json`

Keep keys in sync. Markup uses `data-i18n="nav.logs"` and `data-i18n-attr="aria-label:aria.search"`. JavaScript uses `t('logs.countOf', { shown, total })`.

Long-form docs: `src/js/data/docs-content.fa.js` and `docs-content.en.js`.

## Navigation

1. Update `<nav class="sidebar-nav">` on every app page (the shell is duplicated per HTML file by design — static MPA).
2. Update `src/js/data/commands.js` so ⌘K stays accurate.
3. Marketing header/footer: `.site-header` / `.site-footer` on landing, pricing, changelog, status, 404.

## Branding

Replace product name “APIForge X” in:

- Page titles (`<title>`)
- Locale strings (`site.*`, `cmd.*`, marketing keys)
- Landing hero copy
- `LICENSE.txt` is for the template sale; your end product can use its own name.

## Mock data

```bash
node scripts/generate-mock-data.mjs
```

Seeded and deterministic. Prefer editing the generator, not the JSON dumps.
