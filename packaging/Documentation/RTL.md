# RTL and Persian usage

The template is **Persian-first**. Fresh loads use `lang="fa"` and `dir="rtl"` unless the visitor already saved English.

## Live switch

Every header includes a language control. It:

- Sets `lang` and `dir` on `<html>`
- Repaints `[data-i18n]` / `[data-i18n-attr]`
- Re-renders tables, charts, drawers, and the command palette
- Persists `afx-locale` (`fa` | `en`)

No full page reload.

## Layout rules (already implemented)

- Spacing uses **logical properties**: `margin-inline`, `padding-inline`, `inset-inline`, `border-inline`.
- `--dir-sign` is `1` in LTR and `-1` in RTL for directional motion.
- Drawers / offcanvas are remapped so “end” follows reading direction.

When you add CSS, prefer logical properties. Physical `left` / `right` will break RTL.

## What must stay LTR

Code, API keys, paths, JSON, IPs, UUIDs, URLs, and charts:

```html
<span class="ltr-isolate">sk_live_…</span>
```

`.ltr-isolate` sets `direction: ltr; unicode-bidi: isolate; text-align: left`.
Code blocks and chart bodies force LTR in SCSS.

## Digits and dates

- Prose and counts: Persian digits via `Intl` (`fa-IR`)
- Tabular/technical data: Latin digits
- Dates in Persian locale: Jalali through `Intl`

Helpers: `src/js/utils/format.js`.

## Directional icons

Register both chevrons/arrows in `icons.js`. Controls with `data-dir-icon="back|next"` pick the glyph for the active direction. Do not flip icons that are not directional (search, settings, check).

## QA pages

| Page | Role |
|------|------|
| `rtl.html` | Persian app demo |
| `rtl-persian-test.html` | Mixed script, isolation, forms, charts, overlays |

## Adding a translated string

1. Add the same key to `src/locales/fa.json` and `src/locales/en.json`.
2. Bind with `data-i18n` or `t()`.
3. Never leave a user-visible English-only label in markup without a key.
