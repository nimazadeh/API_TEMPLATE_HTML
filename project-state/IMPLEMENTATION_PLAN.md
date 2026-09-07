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

## Phase 1: Foundation & Design System (Next)

**Duration:** 3-5 days
**Goal:** Build the skeleton that makes all pages possible — tokens, layout, core components, RTL system, mock data

### Tasks:

#### 1.1 Project Setup
- [ ] Initialize Vite project (vite.config.js) with SCSS, multi-page input (rollupOptions.input for each HTML)
- [ ] Install Bootstrap 5.3.x, sass, chart.js, lucide
- [ ] Setup folder structure:
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
- [ ] Setup SCSS architecture: tokens as CSS variables, dark-first, light override via data-theme
- [ ] Setup ESLint + Prettier (optional but recommended)

#### 1.2 Design Tokens
- [ ] Colors: dark and light CSS variables (canvas, surfaces, border, text, accent, status) as per DESIGN_DIRECTION.md
- [ ] Typography: Inter + Vazirmatn + JetBrains Mono, type scale, tracking, tabular numbers utility, Vazirmatn line-height 1.7
- [ ] Spacing: 4px base, tokens
- [ ] Radius: 6px, 12px, 9999px
- [ ] Shadows: stacked for floating only
- [ ] Z-index: sidebar, header, dropdown, modal, command palette

#### 1.3 Base Layout
- [ ] App shell: sidebar 256px + header 56px + main fluid, with logical properties (inline-start)
- [ ] Sidebar: groups, items with Lucide icons, active state, collapsible, bottom user menu + env switcher + theme toggle
- [ ] Header: breadcrumb/title, search with Cmd+K hint, env switcher pill, help, user
- [ ] Responsive: sidebar collapses to 64px icon rail on tablet, drawer + bottom tab bar on mobile
- [ ] Theme toggle: dark/light with localStorage + prefers-color-scheme + no flash script
- [ ] Env switcher: Test/Live pill + banner when test
- [ ] RTL: Test sidebar on right when dir="rtl", logical properties

#### 1.4 Core Components (HTML + SCSS + JS)
- [ ] Buttons: primary, secondary, ghost, destructive, sizes, loading, icon
- [ ] Forms: input, textarea, select, checkbox, radio, label, help, error, search with Cmd+K
- [ ] Tables: header uppercase, row 40px, hover, method badges, status badges with dot, latency color, skeleton, empty
- [ ] Cards: default, interactive, code card
- [ ] Badges: method (GET blue etc.), status (200 green etc.), scopes, neutral
- [ ] Code blocks: dark well, header with language + copy + tabs, body mono 13px, LTR isolated, copy feedback, injection placeholder
- [ ] Inline code: LTR isolated
- [ ] Empty states: icon + title + description + code snippet + action
- [ ] Skeletons: table rows, KPI cards, chart shimmer
- [ ] Command palette: overlay, input autofocus, groups, fuzzy search (vanilla JS), keyboard nav, footer legend
- [ ] Copy utility: copy button with "Copied!" state
- [ ] Tooltip: minimal, delay first
- [ ] Modal/Drawer: for key reveal-once, log detail, webhook detail
- [ ] Progress: rate limit progress bar, usage progress
- [ ] Timeline: webhook retry timeline visual

#### 1.5 Mock Data & Utilities
- [ ] Mock JSON: logs (50 entries with method, endpoint, status, latency, request ID, key prefix), keys (5), webhooks (3 endpoints with deliveries), usage (30 days), endpoints (10)
- [ ] Utilities: format relative time, format latency with color, format status with badge, tabular numbers, copy, LTR isolate, Persian numbers toggle

#### 1.6 RTL System
- [ ] Vazirmatn font loading (woff2, 300,400,500,700)
- [ ] Logical properties throughout (margin-inline, etc.)
- [ ] LTR isolation utility class: .ltr-isolate { direction: ltr; unicode-bidi: isolate; text-align: left; }
- [ ] Test page with mixed Persian + English code

**Exit Criteria:**
- Vite dev server runs, dark/light toggle works, sidebar responsive, no flash
- Core components visible in style guide page (/style-guide.html)
- RTL test page shows sidebar on right, code LTR, no broken alignment
- Command palette opens with Cmd+K, fuzzy search works
- Mock data renders in table

---

## Phase 2: Core App Pages — Observability First (P0)

**Duration:** 5-7 days
**Goal:** Build most important pages: Overview, Logs, Keys, Usage — the daily-use pages

### Tasks:

#### 2.1 Overview (`/app/overview.html`)
- [ ] Quickstart card: env selector + key selector + code snippet tabs + copy + run mock
- [ ] KPI strip: 4 cards (Requests 24h, Error rate, P95 latency, Active keys) with comparison + sparkline (Chart.js)
- [ ] Recent errors: top 3 with count + link
- [ ] Recent requests: mini table 5 rows
- [ ] Webhook health: success rate
- [ ] Usage vs limit progress
- [ ] Empty state variant

#### 2.2 Logs (`/app/logs.html` + `/app/log-detail.html` or drawer)
- [ ] Filters: search request ID, status multi-select, method, endpoint, key, date range — URL state (?status=failed)
- [ ] Stats: requests in range, error rate, P95
- [ ] Table: full with method badges, status badges, latency color, request ID copy, key prefix
- [ ] Detail drawer: header with method+endpoint+status+latency+ID+copy as cURL, timeline, request/response sections with JSON pretty + copy, error explanation with doc link, context
- [ ] Pagination URL state
- [ ] Skeletons, empty

#### 2.3 API Keys (`/app/keys.html`)
- [ ] Table: name, prefix blur, scopes badges, last used, created, status, actions
- [ ] Create flow: modal with steps name→scopes→expiration→reveal once with warning + copy + "I copied" checkbox
- [ ] Detail drawer: usage chart per key, recent requests, rotate, revoke with confirm + undo toast
- [ ] Empty

#### 2.4 Usage (`/app/usage.html`)
- [ ] Time range selector URL state
- [ ] KPI: total, billable, errors, cost
- [ ] Area chart requests over time with comparison dashed
- [ ] Breakdown tables: by endpoint, by key, by status donut
- [ ] Rate limit progress + reset timer
- [ ] Export CSV button
- [ ] Sentence above chart

**Exit Criteria:**
- 4 pages fully functional with mock data, filters URL state, dark/light, RTL, responsive, keyboard, skeletons, empty

---

## Phase 3: Differentiators — Webhooks, APIs, Errors (P1)

**Duration:** 5-7 days
**Goal:** Build differentiators that make template feel specialized

#### 3.1 Webhooks (`/app/webhooks.html`, `/app/webhook-detail.html`)
- [ ] List: endpoint URL, events badges, status, success rate, last delivery
- [ ] Create: URL, events checkboxes, secret generate, test
- [ ] Detail: overview + delivery log table + attempt detail with payload JSON tree + retry timeline visual + signature helper + actions retry/disable/rotate/delete/test

#### 3.2 APIs / Endpoints (`/app/apis.html`, `/app/api-detail.html`)
- [ ] Catalog: grouped by resource, endpoint list with method badge + path + description
- [ ] Detail: method+path header, description, auth, params table, request body schema, response example, code examples tabs with key injection, interactive tester form → response viewer
- [ ] Search filter
- [ ] Version switcher

#### 3.3 Errors & Rate Limits (`/app/errors.html`, `/app/rate-limits.html`)
- [ ] Errors: breakdown by code with count, last, %, docs link, detail explanation + fix
- [ ] Rate Limits: overview current plan limits, usage progress bars, reset timers, per endpoint table, 429 guide, upgrade CTA

#### 3.4 SDKs & Environments (`/app/sdks.html`)
- [ ] Environments explanation, banner, base URLs
- [ ] SDK cards per language with install command, version, GitHub, code example
- [ ] Postman, OpenAPI download

**Exit Criteria:**
- Webhook debugger feels Stripe-quality, API explorer with tester, errors actionable

---

## Phase 4: Management & Polish (P2)

**Duration:** 3-4 days
**Goal:** Team, Billing, Settings, Docs, Auth, plus polish

#### 4.1 Team (`/app/team.html`)
- Table, invite, roles explanation, audit log

#### 4.2 Billing (`/app/billing.html`)
- Current plan card, usage projection chart, invoices table, payment method, upgrade

#### 4.3 Settings (`/app/settings.html`)
- Profile, workspace, security 2FA, notifications, danger zone — tabs

#### 4.4 Docs In-App (`/app/docs.html`)
- Sidebar groups, main with code blocks, key injection, try-it

#### 4.5 Auth (`/auth/sign-in.html`, `/auth/sign-up.html`)
- Minimal, like Vercel, dark, with logo, form, OAuth buttons optional

#### 4.6 Polish
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

## Phase 5: Marketing + Final Launch

**Duration:** 2-3 days
**Goal:** Landing, Pricing, Changelog, Status, final docs, marketplace assets

#### 5.1 Landing (`/index.html`)
- Hero with code + dashboard screenshot, social proof, features (Logs, Webhooks, Keys, Explorer), code examples, pricing teaser, CTA
- Dark-first, tight tracking, product screenshots as hero (Linear principle)

#### 5.2 Pricing (`/pricing.html`)
- Plans, usage-based, FAQ, comparison

#### 5.3 Changelog (`/changelog.html`) + Status (`/status.html`)
- Timeline, uptime

#### 5.4 Documentation for Buyers
- README.md with setup, theming, RTL, adding endpoint, structure
- Style guide page
- Comments in SCSS tokens

#### 5.5 Marketplace Assets
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
- Phase 1: 3-5 days (foundation)
- Phase 2: 5-7 days (P0 core)
- Phase 3: 5-7 days (P1 differentiators)
- Phase 4: 3-4 days (P2 management + polish)
- Phase 5: 2-3 days (marketing + launch)
- **Total:** ~19-27 days for full premium template

---

## Next Immediate Steps (Phase 1 Day 1)

1. Initialize Vite + Bootstrap 5.3 + SCSS structure
2. Create tokens: colors dark/light CSS variables
3. Create base layout: sidebar + header + main with logical properties
4. Create style guide page showing tokens, typography, buttons, tables, code blocks
5. Setup theme toggle + no flash + RTL toggle
6. Test with Vazirmatn + LTR isolation

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
