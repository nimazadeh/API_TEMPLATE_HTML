# APIForge X — Premium Developer API Platform HTML Template

A dark-first, keyboard-first, **RTL first-class** HTML template for API platforms
(AI APIs, infra APIs, BaaS, SaaS dev tools). Built from product intelligence in
`/docs/product/` — not a generic admin with 100 pages, but a specialized,
depth-over-breadth developer tool surface in the spirit of Stripe, Resend,
Vercel and Linear.

> **Status:** Phase 3 Visual QA & Design Review gate **passed** ✅ (0 P0/P1, 2 P2
> fixed; headless runtime QA 37/37 green; visual/responsive audits static-only —
> no browser in the sandbox). Ten product pages ship as a working vertical slice
> (Dashboard, APIs, Endpoints, API Keys, Logs, Webhooks, Errors, Rate Limits,
> Usage, Environments). See `/project-state/PROJECT_STATE.md`.

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

Foundation pages:

| Page | Purpose |
|------|---------|
| `/` | Temporary foundation hub (landing ships in Phase 6) |
| `/style-guide.html` | The living component contract — every primitive, both themes, RTL/LTR |
| `/rtl-test.html` | RTL/LTR test harness — mixed-direction scenarios, theme + direction switching |
| `/rtl.html` | Persian / RTL demo — sidebar right, Vazirmatn, LTR-isolated code |

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
                # segmented, toolbar, split, inspector, explorer
    layouts/    # app shell, sidebar, header, mobile nav
    pages/      # per-page styles (rtl-test, usage, errors, rate-limits)
    main.scss
  js/
    core/       # bootstrap.js — Bootstrap ESM data-API imports
    components/ # theme, env switcher, command palette, code block, copy, icons,
                # log/webhook/error detail drawers, charts, …
    data/       # mock JSON (regenerate: node scripts/generate-mock-data.mjs)
    utils/      # formatting (relative time, latency, badges, Persian digits)
    pages/      # per-page entry scripts
    main.js     # shared boot()
scripts/generate-mock-data.mjs
```

## Theming

- Dark-first; light is an override layer on the same tokens; `system` follows
  the OS via `matchMedia` (with live listener).
- Theme resolves from `localStorage('afx-theme')` → `prefers-color-scheme` →
  dark, set inline in `<head>` so there is no flash.
- Bootstrap utilities are bridged to the token system (`--bs-*` → `--surface-*` /
  `--accent` / `--border`) so `.text-primary`, `.bg-body`, `.border` stay theme-aware.

## RTL / Persian

- All layout uses logical properties (`margin-inline`, `inset-inline-end`, …) so
  the app mirrors automatically under `<html dir="rtl" lang="fa">`.
- Code, keys, endpoints, IDs and URLs are LTR-isolated:
  `dir="ltr"` + `.ltr-isolate { direction: ltr; unicode-bidi: isolate; }`.
- Persian digits via `.num-fa`, Western digits via `.num-en`.
- Charts and code blocks remain LTR regardless of document direction.

## Notes for the next phases

- Remaining app pages (Documentation, Metrics, Team, Billing, Settings) and
  the marketing pages are Phase 3C+; add each new HTML entry to the
  `pageInputs` map in `vite.config.js`.
- Add new Lucide icons to `src/js/components/icons.js` (keeps the bundle
  tree-shaken).
- Charts are registered tree-shaken in `src/js/components/charts.js`
  (`makeChart`/`initCharts`); re-theme on `afx:theme` is automatic.
- Bootstrap JS is bound through `src/js/core/bootstrap.js`; add a component to
  its import list only if a page needs that data-API.
- Mock data is deterministic and regenerable via `node scripts/generate-mock-data.mjs`.
