# Persian / English localization

The default language is Persian (`fa`, RTL). The language menu or toggle updates the current page immediately and persists the choice for navigation/reloads.

## Adding content

- Add matching keys to **both** `src/locales/fa.json` and `src/locales/en.json`. Keep interpolation names such as `{count}` identical.
- Bind static text with `data-i18n`; bind accessible labels, placeholders and metadata with `data-i18n-attr="aria-label:your.key"`.
- Resolve JavaScript-rendered copy with `t()` **inside the renderer**, not at module initialization. Subscribe the renderer with `onLocaleChange()` and retain filters, selections and unsaved inputs.
- Use stable option values and enum IDs (`Developer`, `live`, `Bearer token`, etc.). Translate the displayed label, never the stored value.
- Use the helpers in `src/js/utils/format.js` for numbers, dates, latency, environment labels and chart dates. HTTP methods/status codes, URLs, tokens, code samples and API payloads remain technical data, not translated prose.

## Demo data

Human-readable fixtures have Persian `mock-*.json` sources and English `mock-*.en.json` counterparts. Keep their shapes, record order, IDs, dates, amounts and technical values identical; only authored prose should differ.

`localizedData(fa, en)` selects a read-only dataset for a render. `localizedFixture(fa, en)` creates stable, mutable records whose translated fields resolve at read time. Explicit edits replace those localized defaults, so changing language does not undo a read flag, role change or user-entered description. Do not spread a localized record into a new object if its prose must continue changing with the locale; spreading an array of records is fine.

When regenerating mock data, update the corresponding English fixtures together. The fixture consistency test catches stale IDs, amounts or timestamps rather than allowing a language switch to change business data.

## Charts and inspectors

`makeChart()` destroys any existing chart on the same canvas and removes it from the theme registry before recreating it. Page renderers must still rebuild locale-dependent chart labels. The shared chart helpers select the appropriate font, tooltip direction and number locale.

Call `trackLocalizedView(root, render)` after rendering an inspector or modal. It refreshes open views on a language change while keeping their selected record, tab and scroll position. Confirmation `title`, `body` and `confirmLabel` options can be functions so they resolve in the current language without losing the pending action.

## Regression tests

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:i18n
```

The tests build and serve the production template, exercise all 31 pages in both directions and on reload, and check catalog bindings, fixture parity, pricing/hero content, forms, filters, role changes and open dialogs. Browser output is ignored by Git.

An existing Chromium installation can be used with `CHROMIUM_EXECUTABLE_PATH=/path/to/chromium`. An already-running production preview on port 4173 is reused locally; CI starts a fresh one.
