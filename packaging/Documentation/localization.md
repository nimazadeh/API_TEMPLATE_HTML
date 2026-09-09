# Persian / English localization

The default language is Persian (`fa`, RTL). The language menu or toggle
updates the current page immediately and persists the choice across
navigation and reloads.

## Adding content

- Add matching keys to **both** `src/locales/fa.json` and
  `src/locales/en.json`. Keep interpolation names such as `{count}` identical.
- Bind static text with `data-i18n`; bind accessible labels, placeholders
  and metadata with `data-i18n-attr="aria-label:your.key"`.
- Resolve JavaScript-rendered copy with `t()` **inside the renderer**, not at
  module initialization. Subscribe the renderer with `onLocaleChange()` and
  retain filters, selections and unsaved inputs.
- Use stable option values and enum IDs (`Developer`, `live`, `Bearer token`)
  and translate only the displayed label — never the stored value.
- Use the helpers in `src/js/utils/format.js` for numbers, dates, latency,
  environment labels and chart dates. HTTP methods, status codes, URLs,
  tokens and code samples are technical data, not translated prose.

## Demo data

Human-readable fixtures have Persian `mock-*.json` sources and English
`mock-*.en.json` counterparts. Keep their shapes, record order, IDs, dates,
amounts and technical values identical; only authored prose should differ.

`localizedData(fa, en)` selects a read-only dataset for a render.
`localizedFixture(fa, en)` creates stable, mutable records whose translated
fields resolve at read time. Explicit edits replace those localized
defaults, so changing language does not undo a read flag, role change or
user-entered description. Do not spread a localized record into a new object
if its prose must continue changing with the locale; spreading an array of
records is fine.

When you author new fixtures, update both language variants together so the
same business data shows in either language.

## Charts and inspectors

`makeChart()` destroys any existing chart on the same canvas and removes it
from the theme registry before recreating it. Page renderers must still
rebuild locale-dependent chart labels. The shared chart helpers pick the
appropriate font, tooltip direction and number locale per language.

Call `trackLocalizedView(root, render)` after rendering an inspector or
modal. It refreshes open views on a language change while keeping their
selected record, tab and scroll position. Confirmation `title`, `body` and
`confirmLabel` options can be functions so they resolve in the current
language without losing the pending action.

## Checking your translations

1. `npm run build`, then open the built site (or use `npm run dev`).
2. Toggle the language from the header on the pages you touched — in both
   directions, and again after a reload.
3. Skim `style-guide.html` and `rtl.html`: mixed-script lines, code blocks
   and forms are where a missing key or a stray English label shows first.
4. Keep the browser console open while you click — a missing catalog key
   logs a warning naming the key.

---

© Blue Studio — APIForge X is designed and maintained by Blue Studio.
