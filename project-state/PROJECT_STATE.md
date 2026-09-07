# Project State — APIForge X

## Project: APIForge X — Premium Developer API Platform HTML Template

**Branch:** arena/01a07d58-api-template-html
**Phase:** PHASE 3 VISUAL QA & DESIGN REVIEW (gate) — then PHASE 3C remains
**Date:** 2026-09-07
**Status:** Phase 3 Visual QA gate PASS ✅ — 0 P0/P1, 2 P2 fixed (APIs method search, `<th scope="col">`); headless runtime QA 37/37 green; visual/responsive audits static-only (no browser in sandbox). Phase 3C (Team/Billing/Settings) plus docs/metrics/marketing remain.

---

## Current Phase Status

### PHASE 1: FOUNDATION & DESIGN SYSTEM — COMPLETE ✅

**Objectives Achieved:**
- [x] Vite + Bootstrap 5.3.8 + SCSS project structure (multi-page, `@` alias)
- [x] Design tokens: colors (dark/light), typography, spacing, radius, z-index
- [x] Base layout: sidebar 256px + header 56px + fluid main (logical properties)
- [x] Sidebar: groups, active state, icon rail (tablet), drawer + bottom bar (mobile)
- [x] Theme toggle: dark/light with localStorage + prefers-color-scheme + no-flash script
- [x] Environment switcher: Test/Live pill + test-mode banner
- [x] Core components: buttons, forms, tables, cards, badges, code blocks, empty states, skeletons, command palette, tooltip, modal, drawer, progress, timeline, toast, dropdown, copy
- [x] Command palette: ⌘K / Ctrl+K, fuzzy search, groups, keyboard navigation
- [x] Code blocks: dark wells, language tabs, copy-with-feedback, API-key injection
- [x] RTL system: Vazirmatn (300/400/500/700), logical properties, `.ltr-isolate`, Persian numbers, full Persian demo
- [x] Mock data: 50 logs, 5 keys, 3 webhooks, 30-day usage, 10 endpoints (seeded, regenerable)

**Artifacts Created:**
- `/package.json`, `/vite.config.js`, `/.gitignore`, `/README.md`
- `/src/scss/` — tokens, vendor, base, components, layouts, `main.scss`
- `/src/js/` — `main.js` (boot), components, data, utils, pages
- `/scripts/generate-mock-data.mjs`
- `/index.html` (hub), `/style-guide.html`, `/rtl.html`

**Exit Criteria (all passed):**
- [x] Vite dev server runs; dark/light toggle works; sidebar responsive; no flash
- [x] Core components visible in `/style-guide.html`
- [x] RTL page shows sidebar on the right, code LTR, no broken alignment
- [x] Command palette opens with ⌘K, fuzzy search works
- [x] Mock data renders in the table

---

### PHASE 2: FOUNDATION & DESIGN SYSTEM — PRODUCTION HARDENING — COMPLETE ✅

**Objectives Achieved:**
- [x] Semantic token system: `--surface-*` ladder, borders, elevation, motion, layout, typography, status foregrounds, focus-ring, code-border, shimmer, RGB triplets (dark + light)
- [x] Five typography lanes persisted: PERSIAN_UI (Vazirmatn) · LATIN_UI (Inter Variable) · TECHNICAL_TERM · CODE (JetBrains Mono) · NUMERIC_DATA — legacy aliases removed
- [x] All fonts locally bundled via Fontsource (no CDN); single Latin UI font (Inter Variable) documented in `base/_fonts.scss`
- [x] `@popperjs/core@2.11.8` added as an explicit dependency; curated Bootstrap import in `vendor/_bootstrap.scss`
- [x] Bootstrap `--bs-*` bridge maps to semantic tokens; no literal colors/spacing in components or layouts
- [x] Overlays migrated to Bootstrap data-APIs (dropdown/modal/offcanvas/tab/tooltip); custom dropdown/tooltip/modal modules deleted; offcanvas re-themed with logical RTL mirroring
- [x] Complete primitive set: Button, Icon Button, Input, Select, Search, Badge, Avatar, Tooltip, Dropdown, Tabs, Modal, Offcanvas, Toast, Alert, Table, Code Block, Pagination, Breadcrumb, Card, Stat, Chart Container, Empty State, Error State, Loading State, Skeleton
- [x] System theme (dark/light/system) with live matchMedia listener + no-flash + localStorage
- [x] `style-guide.html` hardened as the living component contract; `rtl-test.html` created (mixed RTL/LTR scenarios + theme/direction switching)

**Artifacts Created/Updated:**
- New tokens: `src/scss/tokens/_{colors,borders,elevation,motion,layout,typography}.scss`
- New base: `src/scss/base/_fonts.scss`; rewritten `_reset.scss`, `_typography.scss`, `_bootstrap-overrides.scss`
- New components: `tabs`, `alert`, `breadcrumb`, `avatar`, `stat`, `chart`, `loading`; `empty` gains `.error-state`
- New: `src/js/core/bootstrap.js`, rewritten `src/js/components/toast.js`, `src/scss/pages/_rtl-test.scss`, `src/js/pages/rtl-test.js`, `rtl-test.html`
- Deleted: `src/js/components/{dropdown,tooltip,modal}.js`
- `vite.config.js`: added `rtl-test` page input

**Exit Criteria:**
- [x] `vite build` green (PASS 2, re-run after refactor)
- [x] Dev server serves all four pages + module transforms (PASS 3)
- [x] Static QA clean (PASS 1): no stale overlay attrs, no duplicate IDs, labels present, all Lucide icons resolve
- [~] Interaction / responsive / visual QA not executed (no browser in sandbox) — recorded honestly, see TEST_STATUS.md

---

### PHASE 3A: CORE PRODUCT EXPERIENCE — COMPLETE ✅

**Objectives Achieved:**
- [x] `dashboard.html` — header (title, environment selector, date range, primary action), 4 KPI cards (Requests Today, Success Rate, Average Latency, Monthly Usage) with skeleton→content load, Chart.js request-volume + latency charts (24h/7d/30d), activity timeline (key created, webhook failed, endpoint updated…), quick actions (Create API key, Test endpoint, Debug a request)
- [x] `apis.html` — API catalog (name, description, version, status, endpoint count), endpoint table (method/path/summary/API) with filter, 60% docs / 40% tester split (`.split`), endpoint example (method badge, URL, parameters, headers), JSON response + cURL/Node/Python SDK tabs (always LTR), copy buttons, env-key injection, simulated send request (200 / 400 states)
- [x] `api-keys.html` — key list (name, permission, environment, created, last used, actions) filtered by environment; masked keys with reveal-once modal, copy/rotate/revoke with confirmation modal, create-key flow with scoped permissions + reveal-once, empty/loading states
- [x] `logs.html` — toolbar filters (method segments, status, environment, time range, search), dense table (status/method/endpoint/latency/timestamp/request-id/key), row-click detail drawer (request/response/headers/payload/timing/context, "Copy as cURL"), CSV export
- [x] `usage.html` — plan consumption (used/limit/resets-in + progress), requests-over-time chart (7d/30d), consumption-by-API doughnut, top endpoints, endpoint + environment attribution
- [x] Data layer rebuilt: deterministic generator (seed `20260907`) → 5 APIs, 15 endpoints, 6 keys, 80 logs, 30-day usage, 2 environments, plan, attribution (byEndpoint + byEnvironment), 8 activity events, metrics (24h/7d/30d KPIs + 24h hourly)
- [x] Shared components extended: icons registry, `format.js` (compactNumber/formatDate/percent), `theme.js` (dark/light/system + menu), `charts.js` (CSS-variable Chart.js theming + `afx:theme` re-render), `log-detail.js` (deterministic request inspector), `table.js` (`logRowFull`/`keyRow`), `code-block.js` (`initCodeBlock`)
- [x] New SCSS partials: `_segmented`, `_toolbar`, `_split`, `_inspector`, `_explorer`, `pages/_usage`
- [x] All 5 pages wired into `vite.config.js` pageInputs, command palette, sidebar nav (later phases remain disabled with tooltip), and the `index.html` hub

**Artifacts Created/Updated:**
- New pages: `dashboard.html`, `apis.html`, `api-keys.html`, `logs.html`, `usage.html` + `src/js/pages/{dashboard,apis,api-keys,logs,usage}.js`
- New components: `charts.js`, `log-detail.js`; rewritten `table.js`, `theme.js`; extended `icons.js`, `format.js`, `code-block.js`
- New partials: `_segmented`, `_toolbar`, `_split`, `_inspector`, `_explorer`, `pages/_usage`; edited `_chart`, `_dropdown`, `_sidebar`, `_tables`, `_toolbar`
- Data: `scripts/generate-mock-data.mjs` rewritten + regenerated `src/js/data/mock-*.json`
- `vite.config.js` pageInputs += 5 pages; `index.html` hub links the product pages

**Exit Criteria:**
- [x] `vite build` green (all 9 page inputs)
- [x] Dev server serves all pages + module transforms over HTTP (200)
- [x] Static QA: no stale class refs (`filterbar`/`chart-card`/`segmented` removed), script refs resolve, Lucide icons resolve
- [~] Interaction / responsive / visual QA not executed (no browser in sandbox) — recorded honestly, see TEST_STATUS.md

---

### PHASE 3B: ADVANCED DEVELOPER WORKFLOWS — COMPLETE ✅

**Objectives Achieved:**
- [x] `webhooks.html` — Webhooks Debugger (Stripe/Linear/Vercel-inspired): webhook endpoint list (event, endpoint, status, attempts, last delivery, environment) + recent-deliveries table + delivery detail drawer with attempt timeline (created → sent → delivered/failed/retrying, each with timestamp/status/latency) and a Payload Inspector (Payload / Headers / Response / Signature tabs, syntax-highlighted JSON, copy, LTR-isolated); actions retry / replay / copy payload; empty + loading states
- [x] `endpoints.html` — Endpoint Management: table (method, path, service, version, status) with search/method/service/status filters; detail drawer (description, authentication, parameters table, request schema, response schema); Create/Edit modal (method, path, service, auth type, description) with validation + toast
- [x] `errors.html` — Error Monitoring (Sentry/Vercel-inspired): overview cards (total errors, affected endpoints, error rate, resolved %), severity/message/endpoint/occurrences/last-seen list with severity/status/environment filters, detail drawer (message, simulated stack trace with faulting frame, request info, user context, environment, timestamp) with mark-resolved + assign actions
- [x] `rate-limits.html` — Rate Limits: current-limit cards (requests/minute, requests/day, monthly quota) with progress + reset info, usage visualization (14-day requests/day bar chart with limit line + monthly remaining doughnut), rules table (API, limit, window, current usage, status) with warning/breached states and a warning banner
- [x] `environments.html` — Environment Management: Production/Staging/Development switcher, production warning banner ("You're working in Production"), per-environment summary, variables table (name, masked value, updated) with reveal/copy/delete + add-variable modal, API keys separated by environment
- [x] Data layer extended deterministically (seed `20260907`): webhooks (6), webhook deliveries (26, with attempt timelines + payloads/headers/response/signature), errors (12 with stack traces), rate limits (3 current + 14-day history + 6 rules), variables (16), plus a third environment (`staging`) and 2 staging keys — new entities use a **separate PRNG instance** so Phase 3A datasets stay byte-identical except `Date.now()` timestamps
- [x] Reused components end-to-end: `.table`/`.table-card`, `.toolbar`/`.filter-bar`/`.seg`/`.stat-strip`, `.offcanvas`/`.modal`, `.code-block` + new `highlightJson()`, `.timeline` (+ `is-info`/`is-neutral` node states), `.kv`, `.params-table`, `.kpi`, `.progress`/`.usage-row`, `.empty-state`, `charts.js`, `copy.js`, `afxToast`
- [x] New components: `webhook-detail.js` (delivery drawer), `error-detail.js` (issue drawer); new partials: `pages/_errors`, `pages/_rate-limits` (only genuinely-new styles)
- [x] All 5 pages wired into `vite.config.js` pageInputs (now 14), sidebar + mobile drawer nav (enabled Webhooks/Endpoints/Errors/Rate Limits/Environments; Metrics retagged Phase 3C), command palette (`commands.js`), and `index.html` hub

**Artifacts Created/Updated:**
- New pages: `webhooks.html`, `endpoints.html`, `errors.html`, `rate-limits.html`, `environments.html` + `src/js/pages/{webhooks,endpoints,errors,rate-limits,environments}.js`
- New components: `src/js/components/webhook-detail.js`, `error-detail.js`; extended `code-block.js` (`highlightJson`), `icons.js` (+`Bug`, `FileText`, `Pencil`), `_timeline.scss` (+`is-info`/`is-neutral`)
- New partials: `src/scss/pages/_errors.scss`, `_rate-limits.scss` (registered in `main.scss`)
- Data: `scripts/generate-mock-data.mjs` extended + regenerated (`mock-webhooks`, `mock-webhook-deliveries`, `mock-errors`, `mock-rate-limits`, `mock-variables`; `mock-environments` → 3 envs; `mock-keys` → +2 staging)
- Nav updated across all 5 Phase 3A pages + `commands.js` + `index.html` hub

**Exit Criteria:**
- [x] `vite build` green (14 page inputs)
- [x] Dev server serves all 14 pages + new modules transform over HTTP (200)
- [x] Static QA: `getElementById` targets resolve, `data-copy-target` ids resolve, drawers exist on their pages, no broken links, no missing icons, no unused imports, no `Phase 3B` tooltips left in nav
- [~] Interaction / responsive / visual QA not executed (no browser in sandbox) — recorded honestly, see TEST_STATUS.md

---

### PHASE 3 VISUAL QA & DESIGN REVIEW (gate) — PASS ✅

**Objectives Achieved:**
- [x] Headless runtime QA via a jsdom harness against the BUILT `dist/` pages: **37/37 interaction scenarios green** across all 10 product pages (dashboard 3, apis 3, api-keys 2, logs 3, usage 2, webhooks 5, endpoints 4, errors 4, rate-limits 4, environments 7) with **0 jsdom/console/module-eval errors**
- [x] Static design audit vs `DESIGN_DIRECTION.md`: breakpoints (576/768/992/1200/1400 + max-widths), dark multi-layer surface hierarchy, light override, system theme, `[dir=rtl]` + logical properties, `.ltr-isolate`, code/chart LTR forcing, five typography lanes (Inter Variable only, no Inter Tight/Geist, no CDN, fonts local), reduced-motion (35), `:focus-visible` ring
- [x] Structural a11y audit (13 pages) clean after the `scope="col"` fix

**Fixed (2 P2, low-risk + systemic):**
- `src/js/pages/apis.js` — search now matches HTTP method (typing "POST" no longer returns empty)
- 11 HTML files — `<th scope="col">` on all table headers (WCAG 1.3.1)

**Honest limitations (browser unavailable in this sandbox):**
- Real-browser visual/responsive at 360/390/430/768/1024/1440, real chart painting, keyboard traversal, in-situ contrast, and full WCAG were NOT executed — recorded, not claimed.

---

### PHASE 0: PRODUCT INTELLIGENCE — COMPLETE ✅ (historical)

**Objectives Achieved:**
- [x] Ideal Customer Profile defined (3 ICPs, Iranian market specifics)
- [x] Jobs-To-Be-Done defined (Buyer + End-User, Tier 1-3 prioritized)
- [x] Core Product Model defined (what API platform contains)
- [x] Information Architecture defined (12 sections max, grouped, depth over breadth)
- [x] Visual references analyzed (Resend, Vercel, Linear, Stripe)
- [x] Reference matrix created (principles extracted, what NOT to copy)
- [x] Differentiation defined (10 strong differentiators)
- [x] Visual direction defined (measurable premium principles)
- [x] Persian/RTL requirements defined (Vazirmatn, LTR isolation, logical properties)
- [x] Technology direction validated (Bootstrap 5.3.x + SCSS + Vite + ES Modules + Chart.js + Lucide + Vazirmatn)
- [x] Implementation plan exists
- [x] Project state persisted

**Artifacts Created:**
- /docs/product/PRODUCT_BRIEF.md
- /docs/product/ICP.md
- /docs/product/JTBD.md
- /docs/product/COMPETITIVE_ANALYSIS.md
- /docs/product/VISUAL_REFERENCE_MATRIX.md
- /docs/product/DESIGN_DIRECTION.md
- /docs/product/INFORMATION_ARCHITECTURE.md
- /docs/product/DIFFERENTIATORS.md
- /project-state/PROJECT_STATE.md (this file)
- /project-state/IMPLEMENTATION_PLAN.md
- /project-state/DECISIONS.md
- /project-state/CHANGELOG.md
- /project-state/TEST_STATUS.md

---

## Product Positioning (Summary)

**What:** Premium HTML template for API platforms (AI APIs, infra APIs, BaaS, SaaS dev tools)

**For:** Backend developers, API founders, SaaS companies, technical startups — especially Iranian market needing RTL

**Why Different:** Not generic admin with 100 pages. Specialized, deep: webhook debugger like Stripe, request log inspector with cURL copy, API key reveal-once UX, code blocks LTR-isolated in RTL, Cmd+K palette, tables first.

**Design Pedigree:** Principles from Resend (dark + hairlines + code as component), Vercel (ink + gray + keyboard + URL state), Linear (density + 4px + hairlines + speed), Stripe (table discipline + job-based nav + microcopy trust)

**Stack:** HTML5, Bootstrap 5.3.x, SCSS, Vite, ES Modules, Chart.js, Lucide Icons, Vazirmatn, JetBrains Mono

---

## Visual Direction (Summary)

- **Mood:** Midnight lab — calm, focused, precise, technical
- **Dark-first:** Canvas #0a0a0a, surfaces #141415/#1a1a1c, border rgba(255,255,255,0.08), accent indigo #6366f1, status colors only
- **Typography:** Inter Tight/Geist 600 tight tracking for display, Inter/Vazirmatn 14px for UI, JetBrains Mono 13px for code/IDs, tabular numbers
- **Spacing:** 4px base, scale 4,8,12,16,24,32,48,96, 3 radii (6px interactive, 12px container, 9999px pill)
- **Density:** High density low clutter, 40px table rows, 4 KPIs max, tables primary
- **Grid:** Sidebar 256px + header 56px + main fluid 1440px max, 12-col, gutters 24px
- **Navigation:** Sidebar job-based, collapsible groups, mobile bottom bar, Cmd+K palette, g+letter shortcuts
- **Surface:** Hairlines not shadows for cards, stacked shadows only for floating
- **Code:** Dark wells #0f0f10, LTR isolated, copy + tabs + injection
- **Motion:** 200ms ease-out transform/opacity only, reduced-motion respected

---

## Information Architecture (Summary)

**Marketing (optional):** Landing, Pricing, Changelog/Status

**App (12 max, 4 groups):**
- Group Overview: Overview
- Group APIs: APIs/Endpoints, API Keys, SDKs
- Group Monitoring: Logs, Webhooks, Errors, Rate Limits, Usage
- Group Management: Team, Billing, Settings + Docs

**Page count:** 20-25 deep pages, not 100 shallow. Each with empty, skeleton, error, mobile, keyboard.

**URL as state:** Filters in query (?status=failed), shareable.

---

## Persian / RTL Requirements (Summary)

- Vazirmatn font for Persian, Inter for English, JetBrains Mono for code
- Logical properties (margin-inline, etc.) for auto mirroring
- LTR isolation for code, keys, endpoints, JSON, URLs: dir="ltr" + unicode-bidi: isolate
- Persian numbers utility .num-fa/.num-en
- Professional Persian copy, English terms where standard (API, Webhook)
- Full Persian demo with dir="rtl", sidebar on right, charts LTR always
- Test: No mirrored code blocks

---

## Technology Direction (Validated)

**Stack:** HTML5 + Bootstrap 5.3.x + SCSS + Vite + Modern JS ES Modules + Chart.js + Lucide Icons + Vazirmatn + JetBrains Mono

**Validated as appropriate:**
- Bootstrap 5.3.x: Still dominant in Iranian marketplace, RTL buyers prefer Bootstrap, good grid, utilities, no jQuery. Can be customized via SCSS tokens to look not like Bootstrap (like Concept template does).
- SCSS: Needed for token system, theming, dark/light
- Vite: Modern, fast HMR, code-splitting, ES modules, same as Concept (Vite 7.3) — validated
- Chart.js: Lightweight, good for area/bar/donut, uses canvas (LTR always), easy theming via CSS variables. Alternative ApexCharts heavier, ECharts heavier. Chart.js sufficient for our chart discipline (1-2 series).
- Lucide: Single icon system, consistent stroke, modern, used by Vercel/shadcn — better than FontAwesome mix
- Vazirmatn: Best Persian font, open-source, used by GitHub/Telegram, variable, highly legible
- JetBrains Mono: Best for code, ligatures, readable

**No change needed.** Only additions: maybe cmdk-like fuzzy search implemented in vanilla JS, not heavy lib.

---

## Next Phase: PHASE 3C — WORKSPACE MANAGEMENT (Team · Billing · Settings)

**Ready to start:** NOT YET AUTHORIZED — wait for separate authorization.

**Phase 3C Scope (draft):**
- `team.html` — members table (avatar, name, email, role, last active), invite flow, roles/permissions, audit log
- `billing.html` — current plan card, usage projection, invoices table, payment method, upgrade/downgrade
- `settings.html` — profile, workspace, security (2FA/sessions), notifications, danger zone
- Remaining out-of-scope items (not scheduled): in-app `docs.html`, `metrics.html` (nav item currently disabled), marketing landing/pricing/changelog/status

**Reuse from Phase 3A/3B:** `boot()`, `charts.js`, `log-detail.js`/`webhook-detail.js`/`error-detail.js` drawer pattern, `table.js` renderers, `.filter-bar`/`.seg`/`.toolbar`/`.offcanvas`/`.modal`/`.kpi`/`.empty-state`, command palette index, env switcher, deterministic mock data.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Bootstrap looks like Bootstrap | Heavy SCSS customization, dark-first, hairlines, custom radius, no default Bootstrap card shadows, custom table styles |
| RTL code blocks break | LTR isolation system tested early, with Persian mixed content examples |
| Page-count pressure from marketplace | Educate buyer: depth over count, show differentiators (webhook debugger) as value, not page count |
| Chart.js theming | Use CSS variables for colors, update on theme change |
| Performance | Vite code-splitting, no jQuery, Lucide tree-shaken, Vazirmatn woff2 subset |

---

## QA Gate — Phase 0

- [x] ICP is clear (3 ICPs, Iranian specifics)
- [x] Product positioning is clear (specialized API platform, not generic admin)
- [x] JTBD is clear (Buyer + End-User Tier 1-3)
- [x] Target use cases are clear (AI API #1, infra, data, BaaS)
- [x] Information architecture is coherent (12 max, grouped, depth)
- [x] Visual references have been analyzed (Resend, Vercel, Linear, Stripe)
- [x] Design principles have been extracted (10 principles)
- [x] Differentiation is defined (10 differentiators, anti-differentiators)
- [x] Persian/RTL requirements are defined (Vazirmatn, LTR isolation, logical props)
- [x] Technical direction is validated (Bootstrap 5.3 + Vite + SCSS + Chart.js + Lucide + Vazirmatn)
- [x] Implementation plan exists (see IMPLEMENTATION_PLAN.md)
- [x] Project state is persisted (this file + others)

**Phase 0 Status:** COMPLETE ✅ (historical — superseded by Phase 1)

---

## Filesystem Source of Truth

All decisions, plans, and product memory are in filesystem, not just chat. Future phases must read /docs/product/ and /project-state/ before coding.

---

## Author

Principal Product Strategist + Senior UX Architect + Developer Experience Architect — Autonomous research, no unnecessary questions.

Date: 2026-09-07
