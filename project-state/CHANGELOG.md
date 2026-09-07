# Changelog — APIForge X

All notable changes to the project will be documented in this file.

Format based on Keep a Changelog, but adapted for product phases.

---

## [Phase 3 Visual QA & Design Review] — 2026-09-07 — VERIFICATION GATE PASS ✅

### Fixed
- `src/js/pages/apis.js` — endpoint search now matches the HTTP method (typing "POST" previously returned an empty list); method/path/summary/group all matched
- 11 HTML files — added `scope="col"` to every table header `<th>` (api-keys, apis, endpoints, environments, errors, logs, rate-limits, rtl-test, rtl, style-guide, webhooks)

### Verified (executed)
- Headless runtime QA (jsdom, built `dist/` chunks in a real DOM): **37/37 interaction scenario steps PASS** across all 10 product pages with **0 jsdom errors, 0 console errors, 0 module eval errors** (dashboard 3, apis 3, api-keys 2, logs 3, usage 2, webhooks 5, endpoints 4, errors 4, rate-limits 4, environments 7)
- Static design audits against `DESIGN_DIRECTION.md`: breakpoints (576/768/992/1200/1400 + max-widths), `[dir=rtl]` rules + logical properties, `.ltr-isolate`, code/chart LTR forcing, five typography lanes, local fonts (no Inter Tight/Geist/CDN), reduced-motion (35), `:focus-visible` ring, `color-scheme`
- Structural a11y audit (13 pages): 0 unlabelled controls/icon-buttons, 0 tables outside `.table-responsive`, 0 missing alt, 0 duplicate ids — after the `scope="col"` fix
- Contrast computed from tokens (dark primary 17.6–19.0:1, secondary 7.2–7.7:1; light primary 17.3–17.7:1)

### Remaining limitations (recorded honestly — NOT executed)
- Real-browser visual/responsive QA — no browser/preview available in the sandbox (E2B preview token-gated); nothing marked PASS without execution
- Chart.js pixel rendering, keyboard focus traversal, in-situ contrast — code present, not browser-verified
- Full WCAG 2.x claim — NOT made (static checks only)

---

## [Phase 3B] — 2026-09-07 — ADVANCED DEVELOPER WORKFLOWS COMPLETE ✅

### Added
- Five advanced pages: `webhooks.html`, `endpoints.html`, `errors.html`, `rate-limits.html`, `environments.html` + page modules in `src/js/pages/`
- `src/js/components/webhook-detail.js` — delivery drawer: attempt timeline (created → sent → delivered/failed/retrying) + Payload/Headers/Response/Signature inspector with syntax-highlighted JSON + retry/replay/copy-payload
- `src/js/components/error-detail.js` — issue drawer: message/type, simulated stack trace (faulting frame highlighted), request info, user context, environment, mark-resolved + assign
- `highlightJson()` in `src/js/components/code-block.js` — 4-color JSON syntax highlighter (keys/strings/numbers/keywords), escaped, reused by the webhook and endpoint drawers
- Icons: `Bug`, `FileText`, `Pencil` added to the Lucide registry (now 70 registered)
- `src/scss/pages/_errors.scss`, `src/scss/pages/_rate-limits.scss` (registered in `main.scss`); `.timeline__node` gained `is-info`/`is-neutral` states
- Deterministic mock data (seed `20260907`, separate `randB` PRNG keeps Phase 3A byte-identical apart from `Date.now()` timestamps): `mock-webhooks.json` (6), `mock-webhook-deliveries.json` (26 with attempt timelines + payload/headers/response/signature), `mock-errors.json` (12 with stack traces), `mock-rate-limits.json` (3 current + 14-day history + 6 rules), `mock-variables.json` (16); `mock-environments.json` → Production/Staging/Development (3), `mock-keys.json` → +2 staging keys
- Navigation: sidebar + mobile drawer enabled for Webhooks/Endpoints/Errors/Rate Limits/Environments across all app pages; Metrics retagged to Phase 3C; `commands.js` + `index.html` hub updated

### Changed
- `vite.config.js` — `pageInputs` 9 → 14 pages
- `index.html` hub — eyebrow retagged Phase 3B and 5 new product cards added

### Fixed
- `src/js/pages/endpoints.js` — the service filter select (`#endpoint-service`) had no options (only the modal's select was populated); now both are filled from `mock-apis.json`
- `src/js/pages/dashboard.js` + `src/js/pages/errors.js` — replaced the dead `.kpi-foot` class (never styled in the design system) with the canonical `.stat-foot`

### Verified (executed)
- `vite build` green — 14 page inputs; per-page chunks emitted; `dist/*.html` asset refs resolve
- Runtime HTTP QA — all 14 pages + new page/component modules serve 200 with no transform errors
- Static wiring QA — every `getElementById` target in the 5 new page modules resolves; `data-copy-target` ids resolve; drawers exist on their pages
- Icon registry audit — 70 registered / 58 literal `data-lucide` usages / 0 missing
- Link audit — no broken `./*.html` links
- Import audit — no unused imports in the 7 new JS files
- Nav audit — no leftover `Phase 3B` tooltips; Metrics retagged Phase 3C

### Remaining limitations (recorded honestly)
- Interaction / visual / responsive QA NOT executed — no headless browser in the sandbox; run manually on the live preview
- Chart.js runtime rendering + theme re-render not observed in a browser (build + module transform only)
- Full WCAG audit deferred

---

## [Phase 3A — Verification] — 2026-09-07 — POST-IMPLEMENTATION VERIFICATION PASS ✅

### Fixed
- `src/js/components/icons.js` — added `RefreshCw` (Logs "Refresh" button icon was unregistered and would not render)
- `api-keys.html` — reveal-once modal "Done" button now dismisses the modal (`data-bs-dismiss="modal"`)
- `usage.html` + `src/js/pages/usage.js` — "Export" button wired to a daily-usage CSV export (was a dead button)
- `src/js/pages/logs.js` — removed unused `escapeHtml` import
- `src/js/pages/dashboard.js` — removed unused `absoluteTime` import

### Verified (executed)
- `vite build` green — 9 page inputs; per-page chunks for all 5 product pages; `dist/*.html` asset refs all resolve
- Runtime HTTP QA — all pages + modules serve 200 with no transform errors; dev-server asset refs resolve
- Static wiring QA — every `getElementById` target in the 5 page modules resolves to a real DOM id; no duplicate ids
- Icon registry audit — 67 registered / 53 used / 0 missing
- Import audit — all 24 JS files' relative imports resolve; no unused imports remain
- RTL/LTR static checks — code blocks LTR, `.ltr-isolate` on technical terms, logical table alignment, directional icons registered; `rtl.html`/`rtl-test.html` serve 200
- Accessibility static checks — labelled icon buttons, labelled dialogs/offcanvas, labelled checkboxes, `aria-pressed` segments, keyboard-activated rows

### Remaining limitations (recorded honestly)
- Interaction / visual / responsive QA NOT executed — no headless browser in the sandbox; run manually on the live preview
- Chart.js runtime rendering + theme re-render not observed in a browser (build + module transform only)
- Full WCAG audit deferred

---

## [Phase 3A] — 2026-09-07 — CORE PRODUCT EXPERIENCE IMPLEMENTATION COMPLETE ✅

### Added
- Five product pages: `dashboard.html`, `apis.html`, `api-keys.html`, `logs.html`, `usage.html` + page modules in `src/js/pages/`
- `src/js/components/charts.js` — tree-shaken Chart.js registration (Line/Bar/Doughnut + Category/Linear + Filler/Tooltip/Legend), CSS-variable theming, `makeChart`/`refreshCharts`/`initCharts`, `axis`/`tooltips` shared options
- `src/js/components/log-detail.js` — deterministic request inspector (`buildLogDetail`, `cURLFor`, `openLogDrawer` → Bootstrap offcanvas)
- SCSS partials: `_segmented`, `_toolbar`, `_split`, `_inspector`, `_explorer`, `pages/_usage` (registered in `main.scss`)
- Icon registry extended (GitBranch, LogOut, Globe, ExternalLink, Play, Braces, FileJson, FolderOpen, Server, Box, Lock, ShieldCheck, Ban, SlidersHorizontal, Filter, Calendar, Database, Download, PieChart, Timer, ArrowUpRight, Check)
- `format.js` helpers: `compactNumber`, `formatDate`, `percent`

### Changed
- `scripts/generate-mock-data.mjs` rewritten (seed `20260907`) — 5 APIs, 15 endpoints, 6 keys (env/permission/prefix/scopes/status), 80 enriched logs, 30-day usage, 2 environments, plan, attribution (byEndpoint + byEnvironment), 8 activity events, metrics (24h/7d/30d KPIs + 24h hourly)
- `table.js` rewritten — `logRow`/`logRowFull`/`keyRow` + `renderLogs`/`renderLogsFull`/`renderKeys` with copy binding
- `theme.js` rewritten — dark/light/system with 3-option `[data-theme-menu]` (retains `data-theme-toggle`)
- `code-block.js` — `initCodeBlock(block)` exported for dynamically rendered docs/tester code
- `_tables.scss` — `.is-selected` row state (API explorer endpoint list)
- `_toolbar.scss` — `.filter-bar__select` fixed width
- `vite.config.js` pageInputs += dashboard/apis/api-keys/logs/usage
- `index.html` hub now links the five product pages (label → Phase 3A)

### QA
- `vite build` green — 9 HTML pages; per-page JS chunks (`dashboard`, `apis`, `api-keys`, `logs`, `usage`)
- Dev server serves all pages + module transforms (200); no transform errors
- Static QA clean (class refs reconciled to `.filter-bar`/`.seg`/`.card--dense`+`.chart`)
- Interaction / responsive / visual QA NOT executed (no browser in sandbox) — recorded honestly in TEST_STATUS.md

---

## [Phase 2] — 2026-09-07 — FOUNDATION & DESIGN SYSTEM (PRODUCTION HARDENING) COMPLETE ✅

### Added
- Semantic token layer under `src/scss/tokens/`: colors (surface ladder, status foregrounds, violet/orange families, focus-ring, code-border, shimmer, RGB triplets), borders, elevation, motion, layout, typography — dark + `[data-theme="light"]`
- `src/scss/base/_fonts.scss` — single source of truth for local font loading (Inter Variable, JetBrains Mono, Vazirmatn); documents the five typography lanes
- `src/js/core/bootstrap.js` — Bootstrap ESM data-API imports (Dropdown, Modal, Offcanvas, Collapse, Tab, Toast, Tooltip)
- New primitives: `_tabs.scss`, `_alert.scss`, `_breadcrumb.scss`, `_avatar.scss`, `_stat.scss`, `_chart.scss`, `_loading.scss`; `.error-state` added to `_empty.scss`
- `rtl-test.html` + `src/js/pages/rtl-test.js` + `src/scss/pages/_rtl-test.scss` — mixed RTL/LTR scenarios with theme (dark/light/system) and direction switching
- `src/js/components/toast.js` rewritten on Bootstrap `Toast.getOrCreateInstance` (`afxToast`)
- `@popperjs/core@2.11.8` explicit dependency
- Directional icons (ArrowRight/Left, ChevronRight/Left) in the Lucide registry

### Changed
- Curated Bootstrap import (`src/scss/vendor/_bootstrap.scss`): variable overrides + component subset + utilities API; Bootstrap as toolkit, not identity
- Bootstrap `--bs-*` bridge (`src/scss/base/_bootstrap-overrides.scss`) now maps to semantic tokens (no literal light-theme block)
- Overlays migrated from custom modules to Bootstrap data-APIs: `data-bs-toggle`/`data-bs-target`/`data-bs-dismiss`/`data-bs-title`
- Offcanvas re-themed + logical RTL mirroring (`offcanvas-start/end`); `.sidebar-drawer` is now `offcanvas offcanvas-start sidebar-drawer`
- Sidebar chrome hoisted to top level (`_sidebar.scss`) so the mobile drawer reuses it
- Shell metrics (256/64/56/1440/24) tokenized into `--sidebar-width`, `--sidebar-rail-width`, `--header-height`, `--bottom-bar-height`, `--content-max-width`, `--content-pad`
- Legacy font aliases (`--font-sans`, `--font-display`, `--font-mono`, `--font-fa`) removed; canonical five-lane tokens only
- `style-guide.html` hardened as the living component contract (all primitives + states)
- RTL heading tracking loosened for Arabic script; focus ring tokenized; scrollbars theme-aware

### Removed
- `src/js/components/dropdown.js`, `tooltip.js`, `modal.js` (superseded by Bootstrap data-APIs)
- Legacy `--bg-*` / `--shadow-*` token references

### Decisions
- D-021…D-027 logged in DECISIONS.md (Bootstrap data-APIs, Inter Variable, five-lane tokens, semantic surface ladder, offcanvas drawers, rtl-test harness, offcanvas-first detail views)

### QA
- `vite build` green (CSS 268.70 kB / 51.62 kB gzip; main JS 104.79 kB / 33.11 kB gzip)
- Static + runtime QA clean; interaction/responsive/visual not executed (no browser in sandbox) — recorded honestly in TEST_STATUS.md

### Next
- Phase 3 (Core App Pages) — NOT yet authorized; wait for separate authorization

---

## [Phase 0] — 2026-09-07 — PRODUCT INTELLIGENCE COMPLETE ✅

### Added
- Created /docs/product/PRODUCT_BRIEF.md — Vision, positioning, problem/solution, target use cases, value props, success metrics
- Created /docs/product/ICP.md — 3 ICPs (API-First Founder primary, SaaS Team secondary, Freelance tertiary), anti-ICP, Iranian market specifics, buyer journey, willingness to pay
- Created /docs/product/JTBD.md — Buyer JTBD (3) + End-User JTBD Tier 1-3 (10 jobs), prioritization matrix, design implications, Persian additions
- Created /docs/product/COMPETITIVE_ANALYSIS.md — Real platforms (Stripe, Resend, Vercel, Linear, Supabase, Clerk, Unkey) + HTML template competitors (Concept, Sneat, Admindek etc.), gap analysis, positioning map
- Created /docs/product/VISUAL_REFERENCE_MATRIX.md — Detailed analysis of Resend, Vercel, Linear, Stripe across 16 dimensions (typography, spacing, density, grid, nav, surface, border, radius, color, dark-mode, hierarchy, interaction, motion, code, data viz, storytelling) + synthesized principles
- Created /docs/product/DESIGN_DIRECTION.md — Mood (midnight lab), personality, typography direction (Inter Tight/Geist + Vazirmatn + JetBrains Mono, strict lanes, type scale, Persian specifics), density, whitespace, grid (sidebar 256px + header 56px + main fluid), color (dark-first monochrome + indigo #6366f1 + status), dark/light themes, surfaces, borders, cards, radius (6px,12px,9999px), buttons, forms, tables (most important), charts (Chart.js discipline), code blocks (dark wells LTR isolated), navigation, motion (200ms transform/opacity), Lucide only, Persian RTL (Vazirmatn, logical props, LTR isolation, professional copy), measurable premium principles
- Created /docs/product/INFORMATION_ARCHITECTURE.md — IA philosophy (job-based, 12 max, depth over breadth), proposed IA (marketing 3 + app 12 grouped into 4 groups), sidebar structure, page count plan (20-25 deep), URL structure, state management (JSON + URL + localStorage), Persian IA, decision log
- Created /docs/product/DIFFERENTIATORS.md — 10 strongest differentiators (webhook debugger, log inspector, key lifecycle, code presentation LTR isolation, command palette Cmd+K, usage attribution, empty/error states, env switcher, keyboard-first, Persian RTL first-class) + micro-differentiators + anti-differentiators + validation test
- Created /project-state/PROJECT_STATE.md — Phase 0 status complete, product positioning summary, visual direction summary, IA summary, Persian summary, tech validation, next phase goals, risks, QA gate checklist
- Created /project-state/IMPLEMENTATION_PLAN.md — Phase 0-5 plan, Phase 1 detailed tasks (setup, tokens, layout, components, mock data, RTL), Phase 2-5 tasks, technical details (Vite config, SCSS arch, JS arch, RTL impl, performance), timeline 19-27 days, next immediate steps
- Created /project-state/DECISIONS.md — 15 decisions recorded (positioning specialized, visual refs, IA 12 max, dark-first monochrome+indigo, typography strict lanes, spacing 4px + 3 radii, hairlines over shadows, tables primary, code dark wells LTR isolated, command palette vanilla JS, Persian RTL first-class, tech stack validated, page count 20-25 deep, landing minimal, mock data JSON+URL+localStorage)
- Created /project-state/CHANGELOG.md (this file)
- Created /project-state/TEST_STATUS.md

### Research Conducted
- Web search: Resend dashboard UI, Vercel design principles, Linear design system, Stripe dashboard, developer API platform patterns, Vazirmatn Persian RTL, Bootstrap 5.3 dashboard, API platform must-have features, command palette pattern
- Fetch: resend.com, vercel.com/design/guidelines, resend.com/philosophy
- Analysis: Extracted principles from 4 references across 16 dimensions

### Validated
- Technology stack: HTML5 + Bootstrap 5.3.x + SCSS + Vite + ES Modules + Chart.js + Lucide + Vazirmatn + JetBrains Mono is appropriate, no change needed

### Decisions
- 15 decisions logged in DECISIONS.md

### QA Gate
- All 12 QA gate items passed (ICP clear, positioning clear, JTBD clear, use cases clear, IA coherent, visual refs analyzed, design principles extracted, differentiation defined, Persian/RTL defined, tech validated, impl plan exists, project state persisted)

### Next
- Phase 1: Foundation & Design System — Setup Vite + Bootstrap + SCSS + tokens + base layout + core components + RTL system + mock data

---

## [Phase 1] — 2026-09-07 — FOUNDATION & DESIGN SYSTEM COMPLETE ✅

### Added
- **Project setup:** `package.json` (Vite 7.3.6, Bootstrap 5.3.8, Sass, Lucide, Chart.js, Fontsource fonts), `vite.config.js` (multi-page inputs, `@` alias, relative base, 0.0.0.0 host + `allowedHosts` for the preview proxy), `.gitignore`
- **Design tokens** (`src/scss/tokens/`): colors (dark-first + light override, monochrome + indigo `#6366f1` + status), typography (Inter Variable / JetBrains Mono / Vazirmatn + type scale + tracking + line-heights), spacing (4px scale), radius (6/12/pill/4), z-index ladder, mixins (breakpoints, focus ring, motion, visually-hidden)
- **Vendor layer** (`src/scss/vendor/_bootstrap.scss`): curated Bootstrap subset (functions/variables/maps/mixins/utilities/root/reboot/type/images/containers/grid/helpers + utilities API) with variable overrides (dark body, hairline borders, 6/12/pill radius, no shadows, 24px gutters, `$enable-dark-mode: false`)
- **Base layer** (`src/scss/base/`): reset/polish, typography utilities (`.display`, `.eyebrow`, `.mono`, `.tabular-nums`, `.ltr-isolate`, `.num-fa`/`.num-en`), custom utilities (`.hairline`, `.floating`, `.sr-only`), Bootstrap `--bs-*` variable bridge
- **Core components** (`src/scss/components/` + JS): buttons (5 types, 3 sizes, icon, loading), forms (input/select/textarea/check/radio/search+⌘K/key reveal), badges (method + status + scope), tables (40px rows, hover, latency color, pagination), cards (default/interactive/KPI), code blocks (always-dark wells, 40px header, language tabs, copy, key injection), skeletons, empty states, tooltip, modal, drawer, progress, timeline, toast, dropdown, command palette (⌘K, fuzzy search, groups, keyboard nav)
- **Layouts** (`src/scss/layouts/` + `main.scss`): app shell (sidebar 256px + header 56px + fluid main, logical grid areas), sidebar (grouped nav, active state, foot cluster, 64px icon rail on tablet), header (breadcrumb, search field, env switcher, theme toggle, help, user), mobile nav (bottom tab bar + sidebar drawer)
- **JS architecture** (`src/js/`): `main.js` boot(), per-page entries, components (theme, env-switcher, command-palette, code-block, copy, dropdown, tooltip, modal, toast, reveal, table), formatting utils (relative time, latency class, status/method badges, Persian digits), deterministic mock-data generator
- **Mock data** (`src/js/data/` + `scripts/generate-mock-data.mjs`): 50 logs, 5 keys, 3 webhooks, 30-day usage, 10 endpoints — seeded & regenerable
- **Foundation pages:** `/` (temporary hub), `/style-guide.html` (full component showcase), `/rtl.html` (Persian RTL demo with LTR-isolated code + Persian labels)
- **README.md** — quick start, structure, theming, RTL notes

### Decisions
- Bootstrap imported as a curated `@import`-based subset (Bootstrap 5.3.8 partials share one scope; variable overrides must precede the import stack)
- Sass deprecation warnings (Bootstrap's legacy `color-functions`/`import`) silenced by ID via `silenceDeprecations` in Vite
- Lucide icons registered in a tree-shaken `icons.js` map instead of the full 1800-icon object (main JS bundle 370 KB → 26 KB)
- Single JS-managed global modal/drawer backdrop (fixed-position children inside transformed containers break against the viewport)
- RTL demo ships as a separate `rtl.html` with `dir="rtl" lang="fa"` (D-018: `?lang=fa` toggle deferred)
- Sidebar fixed 256px; resizable deferred (D-016)

### Validated
- `npm run build` clean (no warnings); CSS 170 KB → 37.2 KB gzip; main JS 26 KB → 9.3 KB gzip
- Dark/light toggle, env switcher, ⌘K palette, copy-with-feedback, code tabs + key injection all wired
- Mock logs render in the table; RTL page mirrors the shell with code LTR

### Next
- Phase 2: Core App Pages — Overview, Logs, Keys, Usage (observability first)

---

## Template for Future Phases

```
## [Phase X] — YYYY-MM-DD — Title
### Added
### Changed
### Fixed
### Removed
### Research
### Decisions
### Next
```

---

## Author

Product Intelligence Phase — Autonomous
Date: 2026-09-07
