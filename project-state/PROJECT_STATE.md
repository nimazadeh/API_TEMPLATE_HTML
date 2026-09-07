# Project State — APIForge X

## Project: APIForge X — Premium Developer API Platform HTML Template

**Branch:** arena/01a07cf6-api-template-html
**Phase:** PHASE 0 — PRODUCT INTELLIGENCE
**Date:** 2026-09-07
**Status:** Phase 0 Complete — Ready for Phase 1 Implementation

---

## Current Phase Status

### PHASE 0: PRODUCT INTELLIGENCE — COMPLETE ✅

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

## Next Phase: PHASE 1 — FOUNDATION & DESIGN SYSTEM

**Ready to start:** Yes, all Phase 0 artifacts exist and are coherent.

**Phase 1 Goals:**
- Setup Vite + Bootstrap 5.3 + SCSS project structure
- Design tokens: colors (dark/light), typography, spacing, radius, shadows
- Base layout: sidebar, header, main, command palette shell
- Core components: buttons, forms, tables, cards, badges, code blocks, empty states, skeletons
- RTL setup: logical properties, Vazirmatn, LTR isolation utilities
- Mock data JSON for logs, keys, webhooks

**Not yet:** No full pages, no marketing landing — just foundation.

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

**Phase 0 Status:** COMPLETE ✅ — Ready for Phase 1

---

## Filesystem Source of Truth

All decisions, plans, and product memory are in filesystem, not just chat. Future phases must read /docs/product/ and /project-state/ before coding.

---

## Author

Principal Product Strategist + Senior UX Architect + Developer Experience Architect — Autonomous research, no unnecessary questions.

Date: 2026-09-07
