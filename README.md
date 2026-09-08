# APIForge X — Premium Developer API Platform HTML Template

A dark-first, keyboard-first, **RTL first-class** HTML template for API platforms
(AI APIs, infra APIs, BaaS, SaaS dev tools). Built from product intelligence in
`/docs/product/` — not a generic admin with 100 pages, but a specialized,
depth-over-breadth developer tool surface in the spirit of Stripe, Resend,
Vercel and Linear.

> **Status:** Phase 5.5 (Premium Visual Polish & Motion System) **complete** ✅ —
> APIForge X now carries a **premium SaaS atmosphere**: a token-driven atmospheric
> backdrop on the marketing + auth surfaces, a centralized motion system
> (`--motion-fast 150ms` · `--motion-normal 250ms` · `--motion-slow 400ms`,
> `cubic-bezier(.2,.8,.2,1)`), entrance choreography on the landing hero, card/table/
> button/dropdown/modal/drawer/toast micro-interactions, animated charts — and a
> rebuilt premium Toast. All **31 pages** build; every animation is transform/opacity
> only and fully disabled under `prefers-reduced-motion`. See `/PHASE_5_5_REPORT.md`.
>
> Phase 5 (Persian RTL Localization & Marketplace Readiness) **complete** ✅ —
> the template is **Persian-first and bilingual (fa ⇄ en)**: every page ships in
> Farsi with `dir="rtl"`, ~1,347 translation keys in `src/locales/fa.json` +
> `src/locales/en.json`, a live language/direction switch in every header, Jalali dates,
> Persian digits, Persian seeded mock data, and a dedicated `rtl-persian-test.html`
> QA harness. See `/PHASE_5_REPORT.md` and `/project-state/PROJECT_STATE.md`.

> **فتح بازار ایران:** متن رابط کاملاً فارسی و تخصصی، راست‌به‌چپ واقعی با ویژگی‌های
> منطقی، فونت وزیرمتن محلی، تاریخ شمسی و ارقام فارسی، دادهٔ نمایشی فارسی و تغییر
> زنده به انگلیسی — آمادهٔ فروش در راست‌چین.

## Stack

- **HTML5** + **Bootstrap 5.3.8** as the toolkit (grid, utilities, forms, modal,
  offcanvas, dropdown, tabs, tooltip, toast, alert, badge, breadcrumb, …) —
  re-themed via the token system, not the visual identity
- **SCSS** token system — dark-first CSS variables, light via `[data-theme="light"]`,
  system via `matchMedia`; all fonts self-hosted (Fontsource, no CDN)
- **Vite 7** — multi-page build, ES modules, no jQuery
- **Lucide** icons (tree-shaken registry), **Chart.js** (Phases 3+),
  **@popperjs/core** (explicit dependency for Bootstrap dropdown/tooltip positioning)
- **Vazirmatn** (Persian UI) + **Inter Variable** (single Latin UI font) +
  **JetBrains Mono** (code/data only)

## Quick start

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # outputs dist/
npm run preview   # serve the production build
```

Product pages (Phases 3A + 3B):

| Page | Purpose |
|------|---------|
| `/dashboard.html` | Overview — KPI cards, request/latency charts, activity feed, quick actions |
| `/apis.html` | API explorer — catalog, endpoint reference docs + interactive tester |
| `/endpoints.html` | Endpoint management — filterable table, reference drawer, create/edit |
| `/api-keys.html` | API keys — masked list, reveal-once, create/rotate/revoke |
| `/logs.html` | Request log inspector — filters, dense table, detail drawer + cURL |
| `/webhooks.html` | Webhooks debugger — endpoints + deliveries, attempt timeline, payload inspector |
| `/errors.html` | Error monitoring — overview KPIs, issue list, stack-trace drawer, resolve/assign |
| `/rate-limits.html` | Rate limits — current-limit cards, usage charts, per-API rules |
| `/usage.html` | Usage — plan consumption, charts, attribution, top endpoints |
| `/environments.html` | Environments — Production/Staging/Development, variables + keys per environment |

Phase 3C pages:

| Page | Purpose |
|------|---------|
| `/team.html` | Team — members, roles/status, invitations, role change/suspend/remove |
| `/billing.html` | Billing — plan, usage + projection, invoices, payment method, upgrade/downgrade |
| `/settings.html` | Settings — workspace, developer preferences, security, sessions, danger zone |
| `/profile.html` | Profile — personal info, preferences, developer identity |
| `/notifications.html` | Notification center — errors, webhooks, rate limits, billing, team, security |
| `/docs.html` | Documentation portal — 3-pane guides with search, TOC and code samples |
| `/sdk.html` | SDK catalog — JS/Node/Python/PHP/Go/Ruby with install + quick-usage code |
| `/api-reference.html` | API reference — endpoint parameters, schemas, responses, errors, code samples |
| `/metrics.html` | Metrics — observability KPIs, charts, breakdowns, Production-vs-Staging |
| `/login.html` · `/forgot-password.html` · `/invite.html` | Persian-first auth screens (simulated) |

Foundation pages:

| Page | Purpose |
|------|---------|
| `/` | Premium marketing landing — hero with a **live** product preview, features, page directory, pricing teaser |
| `/style-guide.html` | The living component contract — every primitive (incl. marketing), both themes, RTL/LTR |
| `/rtl-persian-test.html` | **Persian RTL QA harness** — mixed-script sentences, digits, LTR isolation, code blocks, tables, forms, charts, dropdowns, modals, pagination, alerts + live fa/en & theme switching |
| `/rtl.html` | Persian / RTL demo — sidebar right, Vazirmatn, LTR-isolated code |
| `/visual-showcase.html` | **Visual & motion QA page** — backdrop layers, motion tokens, card/button micro-interactions, modal, drawer, dropdown, tabs and every toast state, live in dark/light × RTL/LTR |

Marketing pages (Phase 4):

| Page | Purpose |
|------|---------|
| `/pricing.html` | Plans (Developer/Pro/Scale), usage-based overage, comparison table, FAQ |
| `/changelog.html` | Versioned release notes from v1.0.0 → v2.3.0 |
| `/status.html` | Uptime bars, component health, incident history (deterministic) |
| `/404.html` | Branded not-found with CTA back to the dashboard |

## Structure

```
src/
  scss/
    tokens/     # colors, borders, elevation, motion, layout, typography, spacing,
                # radius, z-index, mixins (CSS variables)
    vendor/     # curated Bootstrap import + variable overrides
    base/       # fonts, reset, typography (5 lanes), utilities, Bootstrap var bridge
    components/ # buttons, forms, badges, tables, cards, code, skeletons, empty,
                # tooltip, modal/offcanvas, progress, timeline, toast, dropdown,
                # tabs, alert, breadcrumb, avatar, stat, chart, loading, palette,
                # segmented, toolbar, split, inspector, explorer, shortcuts,
                # backdrop (atmospheric layer), motion (entrance system)
    pages/      # per-page styles (rtl-test, usage, errors, rate-limits, marketing,
                # auth, docs, workspace, visual-showcase)
    layouts/    # app shell, sidebar, header, mobile nav, site (marketing shell)
    main.scss
  locales/    # fa.json + en.json — the full translation catalogs (~1,347 keys)
  js/
    core/       # bootstrap.js — Bootstrap ESM data-API imports
                # i18n.js — locale resolution, t(), [data-i18n] painter, RTL/LTR sync
    components/ # theme, env switcher, command palette, code block, copy, icons,
                # log/webhook/error detail drawers, charts, shortcuts, toast,
                # motion (IntersectionObserver reveal), …
    data/       # mock JSON (regenerate: node scripts/generate-mock-data.mjs)
                # docs-content.{en,fa}.js — long-form docs, authored per locale
    utils/      # formatting (relative time, latency, badges, Persian digits)
    pages/      # per-page entry scripts
    main.js     # shared boot() — app pages
    site.js     # shared bootSite() — marketing pages (no palette/env switcher)
scripts/generate-mock-data.mjs
marketplace/    # buyer assets: screenshot manifest, description copy, capture script
```

## Theming

- Dark-first; light is an override layer on the same tokens; `system` follows
  the OS via `matchMedia` (with live listener).
- Theme resolves from `localStorage('afx-theme')` → `prefers-color-scheme` →
  dark, set inline in `<head>` so there is no flash.
- Bootstrap utilities are bridged to the token system (`--bs-*` → `--surface-*` /
  `--accent` / `--border`) so `.text-primary`, `.bg-body`, `.border` stay theme-aware.

## Motion system

One place defines every animation in the product — `src/scss/tokens/_motion.scss`
(speeds + easing), `src/scss/components/_motion.scss` (keyframes + the reveal
contract) and `src/js/components/motion.js` (a single IntersectionObserver).

| Token | Value | Used for |
|-------|-------|----------|
| `--motion-fast` | 150ms | hover, focus ring, tooltips, toasts |
| `--motion-normal` | 250ms | buttons, cards, dropdowns, modals, tables |
| `--motion-slow` | 400ms | entrances, drawers, chart reveals (hard ceiling) |
| `--ease-standard` | `cubic-bezier(.2,.8,.2,1)` | everything |
| `--motion-stagger` | 60ms | gap between staggered siblings |
| `--motion-shift` | 8px | vertical travel of an entrance |
| `--dir-sign` | `1` / `-1` | multiplies directional travel so RTL mirrors |

- **Only `transform`, `translate`, `scale`, `opacity`.** No width/height/top/left
  animation, no layout recalculation, no continuous or looping motion.
- **Scroll reveals** are opt-in: `data-motion` on an element, `data-motion-group`
  on a container to stagger its children (`--motion-i` is assigned in CSS).
  `motion.js` arms an element at the exact moment it starts observing it, so a
  page without JS (or with a failing script) never hides content — and content
  inside a modal / offcanvas / collapse / inactive tab is never armed at all.
- **`prefers-reduced-motion`** disables every entrance, the backdrop fade, chart
  animation and the drawer/modal transitions.
- **Atmospheric backdrop** (`.backdrop` → `__grid` / `__glow` / `__mesh`) is used
  on the marketing and auth surfaces only; the application workspace stays clean.
  Variants: `.backdrop--quiet` (docs/SDK/reference) and `.backdrop--auth`.

## Localization (Persian ⇄ English)

The template is **Persian-first**: the markup ships in Farsi and every visible
label is bound to a translation key.

| Piece | Where |
|-------|-------|
| Translation catalogs | `src/locales/fa.json`, `src/locales/en.json` |
| Runtime | `src/js/core/i18n.js` — `t()`, `setLocale()`, `onLocaleChange()`, `[data-i18n]` painter |
| Binding a static string | `data-i18n="nav.logs"` (uses `innerHTML` when the value carries markup) |
| Binding an attribute | `data-i18n-attr="aria-label:aria.searchLogs,placeholder:form.searchEndpoint"` |
| Binding a JS string | `import { t } from '../core/i18n.js'` — `t('logs.countOf', { shown, total })` |
| Long-form docs | `src/js/data/docs-content.{en,fa}.js` + the `docs-content.js` locale dispatcher |

- **No flash.** An inline `<head>` script reads `localStorage('afx-locale')` and sets
  `<html lang dir>` before first paint; `initI18n()` then paints the catalog.
- **Live switching.** A language control in every header (app, marketing and auth
  pages) flips locale, direction and every JS-rendered string without a reload.
- **Locale-aware formatting.** `src/js/utils/format.js` switches numbers, compact
  numbers, dates (Jalali in Persian), relative time and percentages on
  `afx:localechange`; page modules re-render charts, tables and drawers.

See [localization maintenance and regression tests](docs/localization.md) for paired fixtures, mutable state, inspectors and `npm run test:i18n`.

## RTL / Persian

- All layout uses logical properties (`margin-inline`, `padding-inline`,
  `inset-inline`, `border-inline`) so the app mirrors automatically under
  `<html dir="rtl" lang="fa">`.
- Code, keys, endpoints, IDs, tokens, IPs, UUIDs and URLs are LTR-isolated:
  `dir="ltr"` + `.ltr-isolate { direction: ltr; unicode-bidi: isolate; }`.
- Persian digits for prose and counts (`Intl` with `fa-IR`), Latin digits for
  tabular data; Jalali dates in the Persian locale.
- Charts and code blocks remain LTR regardless of document direction.
- Directional glyphs (arrow / chevron) mirror in RTL; explicit back/next controls
  pick their glyph per direction (`.no-dir-flip`).
- **`rtl.html`** — the polished Persian app demo.
  **`rtl-persian-test.html`** — the RTL QA harness (mixed-script sentences, digits,
  isolation, code, tables, forms, charts, dropdowns, modals, pagination, alerts).

## Customization reference

Every common change is one file:

| I want to… | Edit |
|------------|------|
| Change the accent / surface / status colors | `src/scss/tokens/_colors.scss` (dark in `:root`, light in `[data-theme="light"]`) |
| Change spacing / radius / type scale | `src/scss/tokens/_spacing.scss` / `_radius.scss` / `_typography.scss` |
| Change animation speeds / easing | `src/scss/tokens/_motion.scss` (`--motion-fast` · `--motion-normal` · `--motion-slow`) |
| Change the backdrop intensity | `src/scss/components/_backdrop.scss` + the `--backdrop-*` tokens in `_colors.scss` |
| Change the fonts | `src/scss/base/_fonts.scss` (self-hosted Fontsource imports) |
| Change the sidebar / nav items | the `<nav class="sidebar-nav">` block on every page, and `src/js/data/commands.js` for the palette |
| Add or change a translation | `src/locales/fa.json` + `src/locales/en.json` (keys are referenced by `data-i18n` / `t()`) |
| Change marketing nav / footer | the `.site-header` / `.site-footer` blocks on the marketing pages |
| Flip the whole app to RTL | `setLocale('fa')` — or set `<html dir="rtl" lang="fa">`; logical properties handle the rest (see `rtl.html`) |
| Add or change an icon | `src/js/components/icons.js` (tree-shaken registry) |
| Add a page | see “Adding a page” below |

## Deploying

`npm run build` writes a static `dist/` folder — no server runtime, no
environment variables, no database. Upload `dist/` to any static host
(Netlify, Vercel, GitHub Pages, cPanel, an nginx bucket, or a Persian CDN).
The build uses a relative `base: './'`, so it works from any sub-directory.

## Adding a page

Every page is a top-level HTML file + a `src/js/pages/*.js` entry, registered in
`vite.config.js`. To add one (e.g. a new endpoint page):

1. Create `src/js/pages/your-page.js`:
   ```js
   import { boot } from '../main.js'; // app shell (sidebar + header)
   // or: import { bootSite } from '../site.js'; // marketing shell
   boot();
   ```
2. Create `your-page.html`. Copy the shell (sidebar/header/main or the `.site`
   header/footer) from an existing page, set `<body data-page="your-page">`
   for marketing pages, and add `<script type="module" src="./src/js/pages/your-page.js">`.
3. Add the page to `pageInputs` in `vite.config.js`.
4. Add it to the sidebar nav on every app page (or the site nav on marketing
   pages) and to `src/js/data/commands.js` (command palette).
5. Add any new data to `scripts/generate-mock-data.mjs` (deterministic, seeded)
   and regenerate — never hand-edit the `mock-*.json` files.
6. Add new Lucide icons to `src/js/components/icons.js` (keeps the bundle tree-shaken).

## Keyboard shortcuts

Wired globally on app pages (`src/js/components/shortcuts.js`):

| Key | Action |
|-----|--------|
| `?` | Toggle the shortcut help modal |
| `⌘K` / `Ctrl+K` | Command palette |
| `g` then a letter | Jump to a page (e.g. `g l` → Logs, `g d` → Overview) |
| `/` | Focus the page search (or open the palette where there is no search) |
| `Esc` | Close dialogs and overlays |

## Notes

- Charts are registered tree-shaken in `src/js/components/charts.js`
  (`makeChart`/`initCharts`); re-theme on `afx:theme` is automatic.
- Bootstrap JS is bound through `src/js/core/bootstrap.js`; add a component to
  its import list only if a page needs that data-API.
- Mock data is deterministic and regenerable via `node scripts/generate-mock-data.mjs`.
- Marketplace screenshots are produced with `node marketplace/capture-screenshots.mjs`
  (requires a local Chromium) — see `/marketplace/README.md` for the full shot list.
