# Project State — APIForge X

## Project: APIForge X — Premium Developer API Platform HTML Template

**Branch:** arena/01a07d58-api-template-html
**Phase:** PHASE 2 — FOUNDATION & DESIGN SYSTEM (PRODUCTION HARDENING)
**Date:** 2026-09-07
**Status:** Phase 2 Complete — Phase 3 (Core App Pages) NOT yet authorized

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

## Next Phase: PHASE 3 — CORE APP PAGES (OBSERVABILITY FIRST)

**Ready to start:** NOT YET AUTHORIZED — wait for separate authorization.

**Phase 3 Goals (P0):**
- `/app/overview.html` — quickstart card, 4-KPI strip, recent errors/requests, webhook health, usage progress
- `/app/logs.html` + log detail drawer — filters with URL state, full table, cURL copy, timeline, JSON viewer
- `/app/keys.html` — key table, create flow with reveal-once, detail drawer, rotate/revoke
- `/app/usage.html` — time-range selector, area chart (Chart.js), breakdown tables, CSV export
- URL as state (?status=failed), skeletons, empty states, keyboard, dark/light, RTL

**Reuse from Phases 1–2:** `boot()`, semantic tokens, five-lane typography, tables, badges, code blocks, copy, Bootstrap modal/offcanvas, command palette (extend its index), env switcher, mock data.

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
