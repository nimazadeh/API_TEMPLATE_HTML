# APIForge X — Premium Developer API Platform HTML Template

A dark-first, keyboard-first, **RTL first-class** HTML template for API platforms
(AI APIs, infra APIs, BaaS, SaaS dev tools). Built from product intelligence in
`/docs/product/` — not a generic admin with 100 pages, but a specialized,
depth-over-breadth developer tool surface in the spirit of Stripe, Resend,
Vercel and Linear.

> **Status:** Phase 4 (Marketplace Excellence & Commercial Polish) **complete** ✅ —
> all 30 pages (26 product/auth + landing/pricing/changelog/status/404), keyboard
> shortcuts, buyer docs and marketplace assets. Headless runtime QA 114/114
> scenario steps green across 30 pages; static + a11y audits clean; visual/responsive
> audits static-only (no browser in the sandbox — see `/marketplace/SCREENSHOTS_MANIFEST.md`
> for the capture script that produces real screenshots). See `/project-state/PROJECT_STATE.md`.

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
| `/rtl-test.html` | RTL/LTR test harness — mixed-direction scenarios, theme + direction switching |
| `/rtl.html` | Persian / RTL demo — sidebar right, Vazirmatn, LTR-isolated code |

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
                # segmented, toolbar, split, inspector, explorer, shortcuts
    layouts/    # app shell, sidebar, header, mobile nav, site (marketing shell)
    pages/      # per-page styles (rtl-test, usage, errors, rate-limits, marketing)
    main.scss
  js/
    core/       # bootstrap.js — Bootstrap ESM data-API imports
    components/ # theme, env switcher, command palette, code block, copy, icons,
                # log/webhook/error detail drawers, charts, shortcuts, …
    data/       # mock JSON (regenerate: node scripts/generate-mock-data.mjs)
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

## RTL / Persian

- All layout uses logical properties (`margin-inline`, `inset-inline-end`, …) so
  the app mirrors automatically under `<html dir="rtl" lang="fa">`.
- Code, keys, endpoints, IDs and URLs are LTR-isolated:
  `dir="ltr"` + `.ltr-isolate { direction: ltr; unicode-bidi: isolate; }`.
- Persian digits via `.num-fa`, Western digits via `.num-en`.
- Charts and code blocks remain LTR regardless of document direction.

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
