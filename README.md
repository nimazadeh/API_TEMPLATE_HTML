# APIForge X — Premium Developer API Platform HTML Template

A dark-first, keyboard-first, **RTL first-class** HTML template for API platforms
(AI APIs, infra APIs, BaaS, SaaS dev tools). Built from product intelligence in
`/docs/product/` — not a generic admin with 100 pages, but a specialized,
depth-over-breadth developer tool surface in the spirit of Stripe, Resend,
Vercel and Linear.

> **Status:** Phase 1 — Foundation & Design System (current). Phase 0 — Product
> Intelligence complete. See `/project-state/PROJECT_STATE.md`.

## Stack

- **HTML5** + **Bootstrap 5.3.8** (curated subset: grid, utilities, reboot, type)
- **SCSS** token system — dark-first CSS variables, light via `[data-theme="light"]`
- **Vite 7** — multi-page build, ES modules, no jQuery
- **Lucide** icons (tree-shaken registry), **Chart.js** (Phases 2+), **Vazirmatn**
  + **Inter Variable** + **JetBrains Mono** (self-hosted via Fontsource)

## Quick start

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # outputs dist/
npm run preview   # serve the production build
```

Foundation pages in this phase:

| Page | Purpose |
|------|---------|
| `/` | Temporary foundation hub (landing ships in Phase 5) |
| `/style-guide.html` | Every core component — tokens, type, buttons, forms, tables, code blocks, overlays |
| `/rtl.html` | Persian / RTL demo — sidebar right, Vazirmatn, LTR-isolated code |

## Structure

```
src/
  scss/
    tokens/     # colors, type, spacing, radius, z-index, mixins (CSS variables)
    vendor/     # curated Bootstrap import + variable overrides
    base/       # reset, typography, utilities, Bootstrap var bridge
    components/ # buttons, forms, badges, tables, cards, code, skeletons, empty,
                # tooltip, modal, progress, timeline, toast, dropdown, command palette
    layouts/    # app shell, sidebar, header, mobile nav
    main.scss
  js/
    components/ # theme, env switcher, command palette, code block, copy, icons, …
    data/       # mock JSON (regenerate: node scripts/generate-mock-data.mjs)
    utils/      # formatting (relative time, latency, badges, Persian digits)
    pages/      # per-page entry scripts
    main.js     # shared boot()
scripts/generate-mock-data.mjs
```

## Theming

- Dark-first; light is an override layer on the same tokens.
- Theme resolves from `localStorage('afx-theme')` → `prefers-color-scheme` →
  dark, set inline in `<head>` so there is no flash.
- Bootstrap utilities are bridged to the token system (`--bs-*` → `--bg-*` /
  `--accent`) so `.text-primary`, `.bg-body`, `.border` stay theme-aware.

## RTL / Persian

- All layout uses logical properties (`margin-inline`, `inset-inline-end`, …) so
  the app mirrors automatically under `<html dir="rtl" lang="fa">`.
- Code, keys, endpoints, IDs and URLs are LTR-isolated:
  `dir="ltr"` + `.ltr-isolate { direction: ltr; unicode-bidi: isolate; }`.
- Persian digits via `.num-fa`, Western digits via `.num-en`.
- Charts and code blocks remain LTR regardless of document direction.

## Notes for the next phases

- App pages (`/app/*.html`) and the marketing pages are Phase 2–5; add each new
  HTML entry to the `pageInputs` map in `vite.config.js`.
- Add new Lucide icons to `src/js/components/icons.js` (keeps the bundle
  tree-shaken).
- Mock data is deterministic and regenerable via `node scripts/generate-mock-data.mjs`.
