# Decisions Log — APIForge X

This file records all significant product, design, and technical decisions made during Phase 0 and beyond. Each decision includes context, options, decision, and rationale. This is persistent memory.

---

## Phase 0 Decisions

### D-001: Product Positioning — Specialized API Platform, Not Generic Admin

**Date:** 2026-09-07
**Context:** Generic admin templates compete on page count (100+ pages, 7 dashboards). Market saturated. No template truly feels like Stripe/Resend.
**Options:**
- A) Build generic admin with API theme (easy, but undifferentiated)
- B) Build specialized API platform template, depth over breadth (harder, but differentiated)
**Decision:** B) Specialized, depth over breadth. 20-25 deep pages, not 100 shallow.
**Rationale:** Buyer JTBD is credibility + time saved, not page count. Webhook debugger, log inspector, key reveal-once are differentiators no generic template has. For Iranian market, first true API platform template is moat.
**Consequences:** Must resist marketplace pressure for page-count inflation. Must educate buyer via README and screenshots showing depth.

---

### D-002: Visual References — Resend, Vercel, Linear, Stripe (Primary/Secondary)

**Date:** 2026-09-07
**Context:** Need design references that are developer-focused, not generic SaaS.
**Options:** Many: Tailwind UI, shadcn, Material, etc.
**Decision:** Primary: Resend, Vercel, Linear. Secondary: Stripe.
**Rationale:**
- Resend: Dark + editorial + code as component + onboarding speed
- Vercel: Ink + gray scale + keyboard + URL state + stacked shadows + tracking as voice
- Linear: Density + 4px + hairlines + speed + command palette
- Stripe: Table discipline + job-based nav + microcopy trust + color=status
These 4 cover all dimensions we need: mood, speed, density, trust.
**Consequences:** Extract principles, not pixels. Don't clone branding, layouts, proprietary graphics.

---

### D-003: Information Architecture — 12 Sections Max, Grouped, Job-Based

**Date:** 2026-09-07
**Context:** Initial list from brief had 16 items: Overview, APIs, Endpoints, API Explorer, Documentation, API Keys, Usage, Requests, Logs, Webhooks, Errors, Rate Limits, SDKs, Environments, Team, Billing, Settings. Too many, bloat.
**Options:**
- A) Include all 16 (comprehensive but bloated nav)
- B) Merge and prioritize to 12 max, grouped
**Decision:** B) 12 max, 4 groups: Overview, APIs (APIs, Keys, SDKs), Monitoring (Logs, Webhooks, Errors, Rate Limits, Usage), Management (Team, Billing, Settings) + Docs.
Merge Endpoints + API Explorer into API detail with tester. Merge Requests + Logs (same). Environments handled via global switcher + SDKs page, not dedicated page.
**Rationale:** Stripe principle: job-based nav, not data-model. 12 items max avoids bloat. Depth per section > breadth.
**Consequences:** Some items like Environments not dedicated page, but explained via switcher + SDKs.

---

### D-004: Design System — Dark-First, Monochrome + Indigo Accent, Color=Status

**Date:** 2026-09-07
**Context:** Need color strategy that feels premium, not generic Bootstrap blue.
**Options:**
- A) Bootstrap default blue primary, many colors
- B) Monochrome + one accent (indigo) + status colors only, dark-first
**Decision:** B) Dark-first, monochrome (canvas #0a0a0a, surfaces #141415 etc., border rgba(255,255,255,0.08)), accent indigo #6366f1 for interactive only, status green/red/yellow/blue, no rainbow.
**Rationale:** Vercel: ink is brand, color=meaning. Linear: single lavender accent. Resend: monochrome + atmospheric glow. Stripe: color reserved for status. This is premium: restraint.
**Consequences:** Must build token system dark-first, light as override. No gradients for UI, only atmospheric glows.

---

### D-005: Typography — Inter Tight/Geist + Vazirmatn + JetBrains Mono, Strict Lanes

**Date:** 2026-09-07
**Context:** Need typography that feels engineered, supports Persian, and code.
**Options:**
- A) Use Bootstrap default system font stack
- B) Custom: Display tight tracking sans, UI sans, mono for code, Vazirmatn for Persian, strict lanes
**Decision:** B) Display: Inter Tight or Geist 600 with -1.2px at 48px, -0.6px at 32px. Body: Inter 14px + Vazirmatn for Persian. Mono: JetBrains Mono 13px for code, IDs, key prefixes. Tabular numbers for metrics. 3 lanes strict: sans UI, mono code, never mix.
**Rationale:** Linear: tracking carries voice, weight 510 signature. Vercel: Geist tracking -2.4px at 48px. Resend: 3 lanes strict. Vazirmatn is best Persian font, used by GitHub/Telegram. JetBrains Mono highly legible.
**Consequences:** Need to load fonts woff2, need font-feature-settings cv01 ss03 for Inter, need Vazirmatn line-height 1.7 vs 1.5 English, need LTR isolation for code.

---

### D-006: Spacing & Radius — 4px Base, 3 Radii Vocabulary

**Date:** 2026-09-07
**Context:** Generic templates use arbitrary spacing and 8 radii.
**Options:**
- A) Bootstrap defaults (many spacings, many radii)
- B) Strict 4px base, scale 4,8,12,16,24,32,48,96, and 3 radii: 6px interactive, 12px container, 9999px pill
**Decision:** B) Strict system, like Linear (4px base, 3 radii: card 12px, button 6px, pill 9999px).
**Rationale:** Linear: 4px scale strict, 3 radii entire vocabulary. Vercel: 4px grid, deliberate alignment. Premium = restraint + system, not randomness.
**Consequences:** Must enforce via SCSS tokens, not allow arbitrary values.

---

### D-007: Surface Treatment — Hairlines Over Shadows

**Date:** 2026-09-07
**Context:** Bootstrap cards use shadows. Modern dev tools use hairlines.
**Options:**
- A) Shadows for cards (Bootstrap default)
- B) Hairlines (1px solid border) for cards, stacked shadows only for floating (dropdown, modal, command palette)
**Decision:** B) Hairlines for cards, stacked shadows for floating only.
**Rationale:** Linear: no drop shadows, 1px border #23252a for separation. Resend: translucent white hairlines, not shadows. Vercel: stacked shadows with inset hairline ring for elevated cards. Premium dev tools feel sharp, not soft.
**Consequences:** Cards will have border 1px solid var(--border), no box-shadow. Floating elements have layered shadow + hairline.

---

### D-008: Tables Primary, Charts Secondary

**Date:** 2026-09-07
**Context:** Generic dashboards lead with 6 chart widgets.
**Options:**
- A) Chart-heavy dashboard (common)
- B) Table-first, 4 KPIs max above fold, charts secondary with 1 series
**Decision:** B) Tables primary, charts secondary. Overview 4 KPIs max, not 8. Logs table is hero. Usage area chart 1 series with comparison, not pie with 5 colors.
**Rationale:** Stripe: tables as primary interface, impeccable column alignment, inline sparklines. Vercel/Resend: minimal metrics, not widget grid. Data tables reclaim throne in 2026 (per research). Charts only where trend needs shape.
**Consequences:** Must design tables with utmost care: 40px rows, method/status badges, latency color, tabular numbers, skeletons, empty states.

---

### D-009: Code Presentation — Dark Wells, LTR Isolated, Copy + Tabs + Injection

**Date:** 2026-09-07
**Context:** Code blocks often afterthought, break in RTL.
**Options:**
- A) Simple <pre><code> light theme, no copy
- B) Designed component: dark well #0f0f10 always, header with language + copy + tabs, mono 13px, LTR isolated, injection of user's key
**Decision:** B) Designed component, like Resend/Vercel.
**Rationale:** Code is product for API platform. Must be dark even in light theme, must stay LTR in RTL, must have copy with feedback, must have multi-lang tabs, must inject key.
**Consequences:** Need JS for copy, tabs, injection. Need CSS for LTR isolation. Need syntax highlight subtle.

---

### D-010: Command Palette — Vanilla JS, Cmd+K, Fuzzy Search

**Date:** 2026-09-07
**Context:** No HTML template has command palette. Power users expect Cmd+K (Linear, Vercel, Notion).
**Options:**
- A) No command palette (simpler)
- B) Command palette with Cmd+K, fuzzy search, groups, keyboard nav, vanilla JS
**Decision:** B) Include command palette, vanilla JS, no heavy lib.
**Rationale:** Linear: keyboard-first, Cmd+K fuzzy context-aware. Vercel: deep-link everything, keyboard works everywhere. This is differentiator and shows speed is feature.
**Consequences:** Need to build fuzzy search (simple includes + score), groups (Navigation, Recent, Endpoints, Actions), keyboard handling, overlay modal.

---

### D-011: Persian RTL — First-Class, Vazirmatn, Logical Properties, LTR Isolation

**Date:** 2026-09-07
**Context:** Iranian marketplace requires RTL, but most templates do RTL as afterthought (dir flip, broken code).
**Options:**
- A) RTL as checkbox: dir="rtl" flipped, no Vazirmatn, code breaks
- B) RTL first-class: Vazirmatn, logical properties, LTR isolation, professional copy, full Persian demo
**Decision:** B) First-class RTL.
**Rationale:** No premium API template exists with true RTL. This is moat. Vazirmatn is expected. Logical properties (margin-inline etc.) auto mirror sidebar. LTR isolation prevents code mirroring. Professional Persian copy builds trust.
**Consequences:** Must use logical properties throughout SCSS, must create .ltr-isolate utility, must load Vazirmatn woff2, must have Persian demo with dir="rtl" lang="fa", must test mixed content.

---

### D-012: Technology Stack — Bootstrap 5.3.x + SCSS + Vite + ES Modules + Chart.js + Lucide + Vazirmatn Validated

**Date:** 2026-09-07
**Context:** Brief suggests HTML5, Bootstrap 5.3.x, SCSS, Vite, ES Modules, Chart.js, Lucide, Vazirmatn. Need to validate if appropriate or change.
**Options:**
- A) Keep suggested stack
- B) Change to Tailwind, or other chart lib, or other icons
**Decision:** A) Keep stack, with minor additions.
**Rationale:**
- Bootstrap 5.3.x: Still dominant in Iranian marketplace, RTL buyers prefer Bootstrap, good grid, utilities, no jQuery. Can be customized to not look like Bootstrap (Concept template proves). Vite 7.3 + Bootstrap 5.3.8 is modern (Concept uses same).
- SCSS: Needed for token system, theming
- Vite: Modern, fast HMR, code-splitting, ES modules, same as Concept
- Chart.js: Lightweight, good for area/bar/donut, canvas LTR always, easy theming via CSS vars. ApexCharts heavier, ECharts heavier. Chart.js sufficient for chart discipline (1-2 series).
- Lucide: Single icon system, consistent stroke, modern, used by Vercel/shadcn, better than FontAwesome mix
- Vazirmatn: Best Persian font, open-source, GitHub/Telegram use
- JetBrains Mono: Best for code
Additions: Vanilla JS fuzzy search for command palette, not heavy lib.
**Consequences:** No stack change, only additions.

---

### D-013: Page Count — 20-25 Deep Pages, Not 100 Shallow

**Date:** 2026-09-07
**Context:** Marketplace pressure for page count.
**Options:**
- A) 100+ pages (generic admin strategy)
- B) 20-25 deep pages with states (empty, skeleton, error, mobile, keyboard)
**Decision:** B) 20-25 deep.
**Rationale:** Buyer JTBD is credibility + time saved, not page count. Depth (webhook debugger timeline, log inspector with cURL copy, key reveal-once) is more valuable than 10 dashboard variants. Can educate buyer via README and screenshots.
**Consequences:** Must show depth in screenshots and description: "Webhook debugger like Stripe" not "100 pages".

---

### D-014: Landing — Include Minimal Marketing for Continuity

**Date:** 2026-09-07
**Context:** Should we include landing or focus purely on app?
**Options:**
- A) App only (20 pages)
- B) App + minimal marketing (landing, pricing, changelog/status) for continuity like Resend/Vercel
**Decision:** B) Include 1 premium landing + pricing + changelog/status (3 pages).
**Rationale:** Shows marketing-to-app continuity, like Resend/Vercel. Buyer can see how landing leads to dashboard. Also useful for template demo.
**Consequences:** Landing must use same design system, dark-first, product screenshots as hero, not illustrations.

---

### D-015: Mock Data — JSON Files, URL as State, LocalStorage

**Date:** 2026-09-07
**Context:** HTML template has no backend, but needs to feel real.
**Options:**
- A) Static HTML tables with hardcoded data
- B) JSON files + vanilla JS rendering + URL query for filters + localStorage for theme/env
**Decision:** B) JSON + JS + URL state + localStorage.
**Rationale:** Vercel principle: URL as state, deep-link everything, shareable. Makes template feel real, not static. Filters (?status=failed) shareable. Theme/env persisted.
**Consequences:** Need /src/js/data/*.json and rendering logic.

---

## Future Decisions (To Be Made in Phase 1+)

- D-016: Sidebar resizable? Decision pending Phase 1 — start fixed 256px, add resizable later if easy.
- D-017: Chart.js vs ApexCharts for usage? Decision: Chart.js for now, but allow Apex if needed for more complex.
- D-018: Separate /fa/ folder for Persian or ?lang=fa toggle? Decision pending — start with ?lang=fa JS toggle for demo, but provide both options in docs.
- D-019: Auth pages minimal or with OAuth? Decision: Minimal like Vercel, with optional OAuth buttons.
- D-020: Documentation in-app vs external? Decision: In-app minimal reference + link to external, but same design system.

---

## Decision Template for Future

```
### D-XXX: Title
**Date:**
**Context:**
**Options:**
**Decision:**
**Rationale:**
**Consequences:**
```

All decisions must be recorded here.

---

## Author

Principal Product Strategist
Date: 2026-09-07
