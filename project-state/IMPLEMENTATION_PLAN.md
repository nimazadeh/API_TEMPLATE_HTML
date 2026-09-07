# Implementation Plan — APIForge X

## Overview

This plan covers implementation from Phase 0 (complete) through Phase N (launch). It is based on product intelligence from /docs/product/.

**Stack:** HTML5, Bootstrap 5.3.x, SCSS, Vite, ES Modules, Chart.js, Lucide Icons, Vazirmatn, JetBrains Mono

**Philosophy:** Depth over page-count, dark-first, keyboard-first, tables primary, code respect, RTL first-class.

---

## Phase 0: Product Intelligence — COMPLETE ✅

**Duration:** 1 day (2026-09-07)
**Goal:** Determine exactly what to build and why
**Deliverables:** 8 product docs + 5 project-state docs (all done)
**Exit Criteria:** QA gate passed

---

## Phase 1: Foundation & Design System — COMPLETE ✅

**Duration:** 3-5 days
**Goal:** Build the skeleton that makes all pages possible — tokens, layout, core components, RTL system, mock data

### Tasks:

#### 1.1 Project Setup
- [x] Initialize Vite project (vite.config.js) with SCSS, multi-page input (rollupOptions.input for each HTML)
- [x] Install Bootstrap 5.3.x, sass, chart.js, lucide
- [x] Setup folder structure:
```
/src
  /assets
    /fonts (Vazirmatn woff2, JetBrains Mono)
    /images (placeholder, empty state icons)
  /js
    /components (command-palette.js, code-block.js, table.js, theme.js, env-switcher.js, copy.js)
    /data (mock-logs.json, mock-keys.json, mock-webhooks.json, mock-usage.json, mock-endpoints.json)
    main.js (entry)
  /scss
    /tokens (colors, typography, spacing, radius, shadows, z-index)
    /base (reset, typography, logical properties)
    /components (buttons, forms, tables, cards, badges, code, skeletons, empty, command-palette)
    /layouts (sidebar, header, main, app-shell)
    /themes (dark, light)
    main.scss
  /pages
    /app (overview.html, logs.html, etc.)
    /auth
    index.html (landing)
    pricing.html
```
- [x] Setup SCSS architecture: tokens as CSS variables, dark-first, light override via data-theme
- [ ] Setup ESLint + Prettier (optional — deferred to Phase 4 polish)

#### 1.2 Design Tokens
- [x] Colors: dark and light CSS variables (canvas, surfaces, border, text, accent, status) as per DESIGN_DIRECTION.md
- [x] Typography: Inter + Vazirmatn + JetBrains Mono, type scale, tracking, tabular numbers utility, Vazirmatn line-height 1.7
- [x] Spacing: 4px base, tokens
- [x] Radius: 6px, 12px, 9999px
- [x] Shadows: stacked for floating only
- [x] Z-index: sidebar, header, dropdown, modal, command palette

#### 1.3 Base Layout
- [x] App shell: sidebar 256px + header 56px + main fluid, with logical properties (inline-start)
- [x] Sidebar: groups, items with Lucide icons, active state, collapsible, bottom user menu + env switcher + theme toggle
- [x] Header: breadcrumb/title, search with Cmd+K hint, env switcher pill, help, user
- [x] Responsive: sidebar collapses to 64px icon rail on tablet, drawer + bottom tab bar on mobile
- [x] Theme toggle: dark/light with localStorage + prefers-color-scheme + no flash script
- [x] Env switcher: Test/Live pill + banner when test
- [x] RTL: Test sidebar on right when dir="rtl", logical properties

#### 1.4 Core Components (HTML + SCSS + JS)
- [x] Buttons: primary, secondary, ghost, destructive, sizes, loading, icon
- [x] Forms: input, textarea, select, checkbox, radio, label, help, error, search with Cmd+K
- [x] Tables: header uppercase, row 40px, hover, method badges, status badges with dot, latency color, skeleton, empty
- [x] Cards: default, interactive, code card
- [x] Badges: method (GET blue etc.), status (200 green etc.), scopes, neutral
- [x] Code blocks: dark well, header with language + copy + tabs, body mono 13px, LTR isolated, copy feedback, injection placeholder
- [x] Inline code: LTR isolated
- [x] Empty states: icon + title + description + code snippet + action
- [x] Skeletons: table rows, KPI cards, chart shimmer
- [x] Command palette: overlay, input autofocus, groups, fuzzy search (vanilla JS), keyboard nav, footer legend
- [x] Copy utility: copy button with "Copied!" state
- [x] Tooltip: minimal, delay first
- [x] Modal/Drawer: for key reveal-once, log detail, webhook detail
- [x] Progress: rate limit progress bar, usage progress
- [x] Timeline: webhook retry timeline visual

#### 1.5 Mock Data & Utilities
- [x] Mock JSON: logs (50 entries with method, endpoint, status, latency, request ID, key prefix), keys (5), webhooks (3 endpoints with deliveries), usage (30 days), endpoints (10)
- [x] Utilities: format relative time, format latency with color, format status with badge, tabular numbers, copy, LTR isolate, Persian numbers toggle

#### 1.6 RTL System
- [x] Vazirmatn font loading (woff2, 300,400,500,700)
- [x] Logical properties throughout (margin-inline, etc.)
- [x] LTR isolation utility class: .ltr-isolate { direction: ltr; unicode-bidi: isolate; text-align: left; }
- [x] Test page with mixed Persian + English code

**Exit Criteria:**
- Vite dev server runs, dark/light toggle works, sidebar responsive, no flash
- Core components visible in style guide page (/style-guide.html)
- RTL test page shows sidebar on right, code LTR, no broken alignment
- Command palette opens with Cmd+K, fuzzy search works
- Mock data renders in table

---

## Phase 2: Foundation & Design System — Production Hardening — COMPLETE ✅

**Duration:** 1-2 days (2026-09-07)
**Goal:** Take the Phase 1 skeleton to a production-quality foundation — semantic
token system, five-lane typography, Bootstrap-as-toolkit integration, RTL/LTR
foundation, complete primitive set, and the two visual verification pages.
**No product/app pages are built in this phase** (those start in Phase 3).

### Tasks:

#### 2.1 Build & Dependency System
- [x] `@popperjs/core@2.11.8` added as an explicit dependency (Bootstrap dropdown/tooltip positioning) — documented in README
- [x] Curated Bootstrap import (`src/scss/vendor/_bootstrap.scss`) — variable overrides + component subset + utilities API; Bootstrap is a toolkit, not the identity
- [x] All fonts locally bundled (Fontsource → versioned woff2); no CDN

#### 2.2 Design Tokens (semantic, single source of truth)
- [x] Surface ladder: `--surface-canvas`, `--surface-0..3`, `--surface-interactive`, `--surface-overlay`, `--surface-code` (dark/light)
- [x] Borders, elevation, motion, layout, typography, color token partials under `src/scss/tokens/`
- [x] Status foregrounds + violet/orange families, focus-ring, code-border, shimmer, RGB-triplet tokens
- [x] No literal color/spacing values left in components/layouts (all `var(--…)`)
- [x] Bootstrap `--bs-*` bridge maps to semantic tokens; light theme flips via the same tokens

#### 2.3 Typography — five lanes
- [x] `PERSIAN_UI` Vazirmatn · `LATIN_UI` Inter Variable (single Latin font) · `TECHNICAL_TERM` · `CODE` JetBrains Mono · `NUMERIC_DATA` tabular
- [x] Legacy font aliases removed; canonical lane tokens are the only names
- [x] `.tech`, `.num`/`.tabular-nums`, `.num-fa`/`.num-en`, `.mono` utilities
- [x] RTL heading tracking loosened so Arabic script is never compressed

#### 2.4 Themes
- [x] Dark-first + light override via `[data-theme]`; system (OS) mode with live matchMedia listener
- [x] No-flash inline head script; localStorage persistence; centralized in `components/theme.js`

#### 2.5 Bootstrap integration & primitives (complete set)
- [x] Overlays migrated to Bootstrap data-APIs (`data-bs-toggle` dropdown/modal/offcanvas/tab/tooltip); custom dropdown/tooltip/modal modules deleted
- [x] Offcanvas re-themed + RTL mirroring (logical `offcanvas-start/end` overrides)
- [x] Primitives: Button, Icon Button, Input, Select, Search, Badge, Avatar, Tooltip, Dropdown, Tabs, Modal, Offcanvas/Drawer, Toast, Alert, Table, Code Block, Pagination, Breadcrumb, Card, Stat, Chart Container, Empty State, Error State, Loading State, Skeleton
- [x] States covered: default/hover/focus/active/disabled/loading/error, dark/light, RTL/LTR, mobile

#### 2.6 Application shell foundation
- [x] Sidebar → tablet rail → mobile drawer (Bootstrap offcanvas) + bottom tab bar; logical properties throughout

#### 2.7 Verification pages
- [x] `style-guide.html` — living component contract (all primitives, both themes, RTL/LTR)
- [x] `rtl-test.html` — mixed RTL/LTR scenarios + theme/direction switching harness

**Exit Criteria (QA loop PASS 1–8):**
- [x] PASS 1 static: no stale custom overlay attrs, no duplicate IDs, labels present, icons resolve
- [x] PASS 2 production build: `vite build` green
- [x] PASS 3 runtime: dev server serves all four pages + module transforms (200)
- [~] PASS 4 interaction: verified by code path + build (no headless browser in sandbox — not claimed)
- [~] PASS 5 responsive: CSS breakpoints verified statically (360–1920 not visually tested)
- [~] PASS 6 accessibility: static checks pass (lang/dir, labels, aria, focus-visible); full audit deferred
- [~] PASS 7 visual: not performed (no browser/preview tool available — recorded honestly)
- [x] PASS 8 refactor + rerun: `vite build` re-run after refactor, green

---

## Phase 3: Core App Pages — Observability First (P0)

> **Phase 3A status: COMPLETE ✅** (2026-09-07) — see the Phase 3A record below.
> Phase 3A shipped Dashboard, APIs (explorer), API Keys, Logs, Usage as one coherent
> product slice; the full Phase 3 scope (webhooks/docs/metrics/team/billing/settings)
> moves to Phases 3B/3C.

**Duration:** 5-7 days
**Goal:** Build most important pages: Overview, Logs, Keys, Usage — the daily-use pages

### Tasks:

#### 3.1 Overview (`/app/overview.html`)
- [ ] Quickstart card: env selector + key selector + code snippet tabs + copy + run mock
- [ ] KPI strip: 4 cards (Requests 24h, Error rate, P95 latency, Active keys) with comparison + sparkline (Chart.js)
- [ ] Recent errors: top 3 with count + link
- [ ] Recent requests: mini table 5 rows
- [ ] Webhook health: success rate
- [ ] Usage vs limit progress
- [ ] Empty state variant

#### 3.2 Logs (`/app/logs.html` + `/app/log-detail.html` or drawer)
- [ ] Filters: search request ID, status multi-select, method, endpoint, key, date range — URL state (?status=failed)
- [ ] Stats: requests in range, error rate, P95
- [ ] Table: full with method badges, status badges, latency color, request ID copy, key prefix
- [ ] Detail drawer: header with method+endpoint+status+latency+ID+copy as cURL, timeline, request/response sections with JSON pretty + copy, error explanation with doc link, context
- [ ] Pagination URL state
- [ ] Skeletons, empty

#### 3.3 API Keys (`/app/keys.html`)
- [ ] Table: name, prefix blur, scopes badges, last used, created, status, actions
- [ ] Create flow: modal with steps name→scopes→expiration→reveal once with warning + copy + "I copied" checkbox
- [ ] Detail drawer: usage chart per key, recent requests, rotate, revoke with confirm + undo toast
- [ ] Empty

#### 3.4 Usage (`/app/usage.html`)
- [ ] Time range selector URL state
- [ ] KPI: total, billable, errors, cost
- [ ] Area chart requests over time with comparison dashed
- [ ] Breakdown tables: by endpoint, by key, by status donut
- [ ] Rate limit progress + reset timer
- [ ] Export CSV button
- [ ] Sentence above chart

**Exit Criteria:**
- 4 pages fully functional with mock data, filters URL state, dark/light, RTL, responsive, keyboard, skeletons, empty

### Phase 3A record — CORE PRODUCT EXPERIENCE (COMPLETE ✅, 2026-09-07)

- [x] **Data:** `scripts/generate-mock-data.mjs` rewritten (seed `20260907`) → 5 APIs, 15 endpoints, 6 keys, 80 logs, 30-day usage, 2 environments, plan, attribution, 8 activity events, metrics; regenerated `src/js/data/mock-*.json`
- [x] **Shared:** `charts.js`, `log-detail.js`, rewritten `table.js`/`theme.js`, extended `icons.js`/`format.js`/`code-block.js`; new partials `_segmented`/`_toolbar`/`_split`/`_inspector`/`_explorer`/`pages/_usage`
- [x] **dashboard.html** — toolbar header, 4 KPI cards (skeleton→content), request + latency Chart.js (24h/7d/30d), activity timeline, quick actions
- [x] **apis.html** — catalog, endpoint filter table, 60/40 docs+tester split, `GET /users`-style endpoint reference (method badge/URL/params/response JSON), cURL/Node/Python SDK tabs, copy, env-key injection, simulated Send (200/400)
- [x] **api-keys.html** — env-filtered list, masked keys, reveal-once modal, copy/rotate/revoke with confirm, create flow with scopes, deep link `#create`
- [x] **logs.html** — method/status/env/time/search filters, dense table, row-click → inspector drawer (request/response/timing/context + "Copy as cURL"), CSV export
- [x] **usage.html** — plan consumption (used/limit/resets), requests-over-time (7d/30d), consumption-by-API doughnut, top endpoints, endpoint+environment attribution
- [x] **Wiring:** `vite.config.js` pageInputs (9 inputs), command palette (`commands.js`), sidebar nav (later phases disabled + tooltip), `index.html` hub links
- [x] **QA:** `vite build` green; dev-server HTTP 200 for all pages/modules; static QA clean; interaction/responsive/visual NOT executed (no browser in sandbox)

---

## Phase 4: Differentiators — Webhooks, APIs, Errors (P1)

**Duration:** 5-7 days
**Goal:** Build differentiators that make template feel specialized

#### 4.1 Webhooks (`/app/webhooks.html`, `/app/webhook-detail.html`)
- [ ] List: endpoint URL, events badges, status, success rate, last delivery
- [ ] Create: URL, events checkboxes, secret generate, test
- [ ] Detail: overview + delivery log table + attempt detail with payload JSON tree + retry timeline visual + signature helper + actions retry/disable/rotate/delete/test

#### 4.2 APIs / Endpoints (`/app/apis.html`, `/app/api-detail.html`)
- [ ] Catalog: grouped by resource, endpoint list with method badge + path + description
- [ ] Detail: method+path header, description, auth, params table, request body schema, response example, code examples tabs with key injection, interactive tester form → response viewer
- [ ] Search filter
- [ ] Version switcher

#### 4.3 Errors & Rate Limits (`/app/errors.html`, `/app/rate-limits.html`)
- [ ] Errors: breakdown by code with count, last, %, docs link, detail explanation + fix
- [ ] Rate Limits: overview current plan limits, usage progress bars, reset timers, per endpoint table, 429 guide, upgrade CTA

#### 4.4 SDKs & Environments (`/app/sdks.html`)
- [ ] Environments explanation, banner, base URLs
- [ ] SDK cards per language with install command, version, GitHub, code example
- [ ] Postman, OpenAPI download

**Exit Criteria:**
- Webhook debugger feels Stripe-quality, API explorer with tester, errors actionable

---

## Phase 5: Management & Polish (P2)

**Duration:** 3-4 days
**Goal:** Team, Billing, Settings, Docs, Auth, plus polish

#### 5.1 Team (`/app/team.html`)
- Table, invite, roles explanation, audit log

#### 5.2 Billing (`/app/billing.html`)
- Current plan card, usage projection chart, invoices table, payment method, upgrade

#### 5.3 Settings (`/app/settings.html`)
- Profile, workspace, security 2FA, notifications, danger zone — tabs

#### 5.4 Docs In-App (`/app/docs.html`)
- Sidebar groups, main with code blocks, key injection, try-it

#### 5.5 Auth (`/auth/sign-in.html`, `/auth/sign-up.html`)
- Minimal, like Vercel, dark, with logo, form, OAuth buttons optional

#### 5.6 Polish
- [ ] All pages have LTR and RTL demo (or lang toggle)
- [ ] All pages dark/light
- [ ] Keyboard: ? help modal, g+letter shortcuts, / focus search, Esc close
- [ ] Skeletons for all tables/charts
- [ ] Empty states for all tables
- [ ] Error states
- [ ] 404 page
- [ ] Performance: Lighthouse 95+, no layout shift RTL/LTR, Vazirmatn subset
- [ ] Accessibility: WCAG AA, focus rings, aria-labels, tabular numbers

**Exit Criteria:**
- All 12 app sections done, polished

---

## Phase 6: Marketing + Final Launch

**Duration:** 2-3 days
**Goal:** Landing, Pricing, Changelog, Status, final docs, marketplace assets

#### 6.1 Landing (`/index.html`)
- Hero with code + dashboard screenshot, social proof, features (Logs, Webhooks, Keys, Explorer), code examples, pricing teaser, CTA
- Dark-first, tight tracking, product screenshots as hero (Linear principle)

#### 6.2 Pricing (`/pricing.html`)
- Plans, usage-based, FAQ, comparison

#### 6.3 Changelog (`/changelog.html`) + Status (`/status.html`)
- Timeline, uptime

#### 6.4 Documentation for Buyers
- README.md with setup, theming, RTL, adding endpoint, structure
- Style guide page
- Comments in SCSS tokens

#### 6.5 Marketplace Assets
- Screenshots: Overview, Logs, Keys, Webhooks, Usage, RTL Persian, dark/light, command palette, code blocks
- Preview video (optional)
- Description copy for RTL-Theme and ThemeForest

**Exit Criteria:**
- Demo ready to share, buyer can launch in <1 day

---

## Technical Implementation Details

### Vite Config
- Multi-page: rollupOptions.input with all HTML files
- SCSS: additionalData for tokens import
- Alias: @ for src
- Dev server: host 0.0.0.0, port 3000, preview host allowlist for Arena

### SCSS Architecture
- Tokens: CSS variables in :root and [data-theme="dark"] / [data-theme="light"]
- Logical properties: Use mixins for margin-inline etc., or direct logical
- Bootstrap customization: Import only needed parts (grid, utilities, forms, buttons, etc.), override variables via SCSS, not just CSS vars

### JS Architecture
- ES Modules, no jQuery
- Components as classes or functions, initialized via data attributes
- Mock data: JSON imported, rendered via vanilla JS (no framework)
- Command palette: Vanilla JS with fuzzy search (simple includes + score)
- Theme: Inline script in head to prevent flash, then JS module for toggle
- Copy: Navigator clipboard with fallback
- Chart.js: Import, create charts with CSS variable colors, update on theme change via event

### RTL Implementation
- HTML dir attribute toggled via JS for demo (or separate /fa/ folder)
- Logical properties throughout SCSS
- LTR isolate class for code
- Vazirmatn loaded via @font-face woff2
- Test with mixed content: Persian sentence + English code inline

### Performance
- Vazirmatn subset: Only needed weights, woff2
- Lucide: Import only used icons via ES modules, tree-shaken
- Chart.js: Import only needed controllers (Line, Bar, Doughnut)
- Vite code-splitting: Per page
- No heavy images, CSS glows not images

---

## Risks & Mitigations (Implementation)

| Risk | Mitigation |
|------|------------|
| Bootstrap looks generic | Override heavily: dark-first, custom tables, no shadows, custom radius, custom buttons |
| RTL breaks | Implement logical props from Phase 1, test daily with Persian mixed content |
| Command palette complex in vanilla JS | Start simple: static index, includes search, then add fuzzy, then groups |
| Chart.js theming | Use CSS vars, listen to theme change event, update chart colors |
| Page count vs depth tension | Stick to 20-25 pages, document why depth > count in README |

---

## Timeline Summary

- Phase 0: 1 day (done)
- Phase 1: 3-5 days (foundation skeleton — done)
- Phase 2: 1-2 days (foundation hardening — done)
- Phase 3: 5-7 days (P0 core app pages)
- Phase 4: 5-7 days (P1 differentiators)
- Phase 5: 3-4 days (P2 management + polish)
- Phase 6: 2-3 days (marketing + launch)
- **Total:** ~20-29 days for full premium template

---

## Next Immediate Steps (Phase 3)

Phase 3 is NOT yet authorized. Do not start app pages until separately authorized.
When it is authorized, begin with:

1. `/app/overview.html` — quickstart card, KPI strip, recent errors/requests, webhook health
2. Extend `table.js` renderers with URL-state filters and pagination
3. Chart.js integration with CSS-variable theming + `afx:theme` re-theme listener
4. Log detail drawer (reuse Bootstrap offcanvas) with JSON viewer + "Copy as cURL"

---

## Success Metrics for Implementation

- Lighthouse 95+ performance, accessibility
- Zero layout shift between LTR/RTL
- All code blocks LTR and copyable in RTL
- Keyboard: Cmd+K works, ? help, g+letter
- Tables: 40px rows, method/status badges, latency color, skeleton, empty
- Webhook debugger: timeline visual, payload tree, retry
- No jQuery, no mixed icons, no heavy shadows

---

## Author

Frontend Technical Lead + Product Strategist
Date: 2026-09-07
