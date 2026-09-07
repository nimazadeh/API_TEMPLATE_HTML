# Visual Reference Matrix — APIForge X

## Purpose
Analyze Resend, Vercel, Linear, Stripe — extract principles, not pixels. Define what to learn and what NOT to copy.

---

### Reference 1: Resend

**URL:** resend.com
**Archetype:** Developer Email API, modern, editorial

| Dimension | Observation | Principle Extracted | Apply to APIForge X | Do NOT Copy |
|-----------|-------------|---------------------|---------------------|-------------|
| **Typography philosophy** | Marketing: Domaine Display serif 96px with ss01/ss04/ss11 alternates. UI: Inter 14px, labels. Code: Geist Mono 13px. Strict lanes. | Three lanes: Display (marketing, confident serif or tight sans), UI (neutral sans), Code (mono). Never mix. | Marketing landing can use tight sans display (Inter/Geist) with negative tracking for confidence. App UI: Inter/Vazirmatn 14px. Code: JetBrains Mono 13px. Strict separation. | Don't use Domaine serif in app UI. Don't use serif for data tables. Don't mix mono for body. |
| **Spacing philosophy** | Generous section gaps 96-160px on marketing, 24px card padding, 8px element gaps. Dark canvas as whitespace. | Darkness as space. Generous outer, tight inner. | App: 24px content padding, 16px card padding, 8px between related, 24px between groups, 48px between sections. Use dark #0a0a0b as whitespace. | Don't use 96px gaps inside app (too much). |
| **Information density** | Low on marketing (one message per viewport), medium in dashboard (focused metrics, not dense). | Focus over density for landing, medium density for dashboard — avoid clutter, show only relevant. | Overview: 4 KPI cards max, not 8. Logs: high density table (36-40px rows). Docs: medium. | Don't do low-density dashboard (wastes space). |
| **Grid structure** | 12-col marketing, centered 1200px max, single column for product screenshots. | Centered, single column for storytelling, product screenshots as hero. | Landing: single column, centered, 12-col grid for features. App: sidebar 256px + main fluid, 12-col inside main. | Don't use marketing grid for app. |
| **Navigation behavior** | Top nav minimal (Product, Docs, Pricing, Changelog), CTA. No sidebar on marketing. | Minimal top nav, content-first. | Landing: top nav minimal. App: sidebar nav with collapsible groups, not top tabs. | Don't use top nav for app (doesn't scale). |
| **Surface treatment** | Canvas #000000, surfaces translucent white 4-6% with hairline, glows radial orange 22% opacity as atmosphere. | Elevation from hairlines + translucent, not shadows. Glows as atmosphere, never solid. | Dark: canvas #0a0a0a, surface #141415, border rgba(255,255,255,0.08). Glow: subtle indigo/orange radial 20% behind hero cards. | Don't use solid orange surfaces, don't use heavy drop shadows. |
| **Border usage** | 1px hairline rgba(255,255,255,0.08) for separation, no shadows. | Border = elevation. | Use 1px solid var(--border) for all card separation. No box-shadow for cards, only for floating (dropdown, modal). | Don't use 1px dashed purple for placeholders (Resend-specific). |
| **Radius philosophy** | Buttons/inputs 8px md, cards/code wells 12px lg, pills/full 9999px. | 2 radii for app: 8px interactive, 12px container, 9999px pill. | Same: 6-8px buttons/badges, 12px cards, 9999px pills/status. | Don't introduce 4px/16px/24px randomly. |
| **Color strategy** | Black canvas, white text, accent orange glow only for atmosphere, no brand blue. | Monochrome + one atmospheric accent, color only for status. | Dark: monochrome + indigo accent #6366f1 for interactive, not brand fill. Status: green #22c55e, red #ef4444, yellow #f59e0b, blue #3b82f6. | Don't use orange as primary CTA (Resend-specific). |
| **Dark-mode strategy** | Dark-only marketing, dark dashboard default. | Dark-first, not light-first. | Dark default, light as token-swapped variant. Build tokens dark-first. | Don't build light-first then invert. |
| **Content hierarchy** | Headline 96px, sub 18px, body 16px. Metrics large 32-40px. | Size + weight + tracking for hierarchy, not color. | Overview KPI: 32px number weight 600 tracking -0.6px, label 12px uppercase tracking 0.4px. | Don't use color for hierarchy. |
| **Interaction language** | Copy button with success, test mode toggle, live logs, keyboard. | Optimistic, forgiving, inline feedback. | Copy with "Copied!" inline, not toast only. Test mode banner. | Don't use spinners for fast actions. |
| **Motion philosophy** | Subtle, no autoplay >5s, compositor-friendly (transform, opacity). | Motion clarifies, not decorates. | 200ms ease-out for hover, 150ms for tooltip. Respect prefers-reduced-motion. | Don't animate width/height. |
| **Code presentation** | Dark wells #111113, language tabs, copy, line numbers, JetBrains Mono, syntax highlight subtle. | Code as designed component, not afterthought. | Code block: dark #0f0f10, border, header with language + copy, mono 13px, LTR isolated. | Don't use light code blocks in dark app. |
| **Data viz** | Minimal charts, tables primary. Analytics with straightforward bars. | Tables > charts. | Usage: area chart with 1 series, not 5 colors. Tables for breakdown. | Don't do pie with >5 slices. |
| **Product storytelling** | "Email for developers" + code snippet + live log — shows, not tells. | Show real product UI in marketing. | Landing shows actual dashboard screenshot (logs, keys) not illustration. | Don't use generic illustrations. |

---

### Reference 2: Vercel

**URL:** vercel.com
**Archetype:** Deployment platform, stark, speed-obsessed

| Dimension | Observation | Principle | Apply | Do NOT Copy |
|-----------|-------------|-----------|-------|-------------|
| **Typography** | Geist 400/500/600 only, never 700+. Display -2.4px at 48px hero, -1.28px at 32px section. Mono Geist Mono 12-13px for terminal. Inter fallback with ss01 ss02. | Tracking carries voice, not weight. Weight ceiling 600. | Use Inter Tight or Geist for display at 600 weight, -1.2px tracking. Body 400/500. Mono JetBrains 13px. | Don't use 700+ bold for headlines. |
| **Spacing** | 4px base, tokens 4-192px, section gap 96-192px, card gap 16-24px. | 4px grid, deliberate alignment, optical ±1px. | 4px base, same scale: 4,8,12,16,24,32,48,96. | Don't use arbitrary 10px, 18px. |
| **Density** | High but airy: 256px sidebar, content max 1200, whitespace via gray #fafafa. | Sidebar + fluid main, whitespace via background, not padding inflation. | Sidebar 256px resizable, main padding 24px desktop 16px mobile. | Don't make sidebar 320px (too wide). |
| **Grid** | 12-col, align every element to grid, consistent gutters 16/24px. | Deliberate alignment, no accidental positioning. | 12-col inside main, gutters 24px. | Don't break grid without intention. |
| **Navigation** | Resizable sidebar, horizontal tabs moved to sidebar, projects as filters, floating bottom bar mobile, optimized for one-handed. | Sidebar is primary, tabs unified, projects as filter not nav item. | Sidebar with groups: Overview, APIs, Monitoring, Management. Collapsible. Mobile bottom bar with 4 items + more. | Don't use top tabs for >10 sections. |
| **Surface** | #fafafa body, #171717 ink type, 200-step gray scale for dividers/borders/disabled. Stacked shadows: inset hairline 1px #00000014 + 2-3 offsets 4-12% black. | Ink is brand, gray scale is system, shadows stacked not heavy. | Light: #fcfcfc body, #171717 text, gray 50-900. Dark: #0a0a0a body, #fafafa text. Shadows: layered with hairline. | Don't use brand blue as primary. |
| **Border** | Hairlines, semi-transparent borders improve edge clarity. | Crisp borders + shadows, not shadow only. | Border: 1px solid var(--border) where border is rgba(0,0,0,0.08) light / rgba(255,255,255,0.08) dark. | Don't use solid #e5e7eb only. |
| **Radius** | 0-2px sharp for data, 4-6px subtle for buttons/badges, 8-12px standard for cards, 100px pill marketing CTA, 6px nav CTA — two scales never mixed. | Radius signals type: data sharp, interactive subtle, container standard, marketing pill. | Data rows 0-4px, buttons 6-8px, cards 12px, pills 9999px. Keep marketing pill separate. | Don't mix 100px and 6px on same screen. |
| **Color** | Ink #171717 primary, link blue #0070f3 only inline, Develop #007cf0→#00dfd8, Preview #7928ca→#ff0080, Ship #ff4d4d→#f9cb28 as unified mesh at hero only. | No brand-blue, ink IS brand, mesh gradient at hero only, color = meaning. | Primary ink #111113 dark, accent indigo #6366f1 for interactive only. Gradients only for empty state glows. | Don't use mesh gradient as icon or small element. |
| **Dark/light** | Both first-class, tokens, not invert. | Design dark and light together via tokens. | Build CSS variables for both, dark default. | Don't invert with filter. |
| **Hierarchy** | Number top-left, size=importance, context below number, trend sparkline. | KPI hierarchy: primary large, secondary medium, tertiary small. | Overview KPI: 32px primary, 20px secondary, 13px label. | Don't make all KPIs same size. |
| **Interaction** | Keyboard works everywhere, clear focus :focus-visible, focus trap, match visual/hit target 24px min (44px mobile), loading buttons keep label, URL as state, optimistic updates, ellipsis for loading, confirm destructive, tooltip delay first then no delay, overscroll contain, deep-link everything, no dead zones, links are links. | Every micro-decision documented, speed over sparkle. | Implement: Cmd+K, focus rings, URL filters (?status=failed), optimistic copy, etc. | Don't block paste, don't disable zoom. |
| **Motion** | Honor prefers-reduced-motion, CSS > Web Animations > JS lib, compositor-friendly (transform, opacity), necessity check, easing fits subject, interruptible, input-driven, correct origin, never transition: all. | Motion earns place, clarifies cause/effect. | 200ms ease-out, transform+opacity only, reduced-motion variant. | Don't transition all. |
| **Code** | Terminal mockups, code blocks dark, mono 12-13px. | Code is product. | Same as Resend. | — |
| **Data viz** | Single metric trending with area fill, dashed target, horizontal bar for comparison, donut ≤5 slices, stacked bar for part-to-whole over time. Limit 5-6 colors max, shape+line style alongside color. | Chart discipline. | Usage area 1 color, breakdown bar horizontal, no pie >5. | Don't use rainbow series. |
| **Storytelling** | Speed over sparkle, simplifying complexity without hiding power, designing for users who live in terminal and GitHub. | Dev-first language. | Copy in second person, numerals for counts, specific error messages. | Don't use first person. |

---

### Reference 3: Linear

**URL:** linear.app
**Archetype:** Issue tracking, dark-first, keyboard-first, high density

| Dimension | Observation | Principle | Apply | Do NOT Copy |
|-----------|-------------|-----------|-------|-------------|
| **Typography** | Inter Variable with cv01 ss03 on ALL text, weight 510 as default emphasis (signature between-weight). Display 72px weight 510 -1.584px, 64px -1.408px, 48px -1.056px, 32px -0.704px, body 16px -0.05px. Berkeley Mono 13-14px for issue IDs, shortcuts, metadata. Eyebrow 13px 500 tracking +0.4px uppercase. | Compression at scale: tight tracking at display, normal at body. Weight 510 as signature. cv01 ss03 non-negotiable. | Use Inter with similar tracking: 48px -1.2px, 32px -0.6px, 20px -0.2px. Weight 500/600. Mono JetBrains. | Don't use weight 700 for emphasis, don't forget font-feature-settings. |
| **Spacing** | Base 4px, tokens 4,8,12,16,24,32,48,96, section 96, section-lg 160. Gaps: 4px icon-text, 8px small elements, 12px button/input padding, 16px standard gap, 24px card padding, 32px major sections. | 4px scale strict, 8/12/24/96 rhythm. | Same scale. | Don't use 10px, 18px. |
| **Density** | 36px row height, almost no chrome, list/detail split, inverted-L layout, flush tiled grids. High density low clutter via alignment, not cramming. | Density without clutter, content over chrome. | Logs table 40px row, compact but readable. No card shadow, just hairline. | Don't add excessive padding to data rows. |
| **Grid** | Inverted-L: sidebar + top bar + main. 98 grid containers, 495 flex. | Sidebar + header + main, not just sidebar+main. | Sidebar 256px + header 56px + main. | — |
| **Navigation** | Sidebar collapsible, g+letter shortcuts (g+i issues, g+p projects), Cmd+K palette fuzzy context-aware, ? shortcuts. | Keyboard-first, mouse optional, navigation via shortcuts. | Implement g+o overview, g+l logs, g+k keys, g+w webhooks, g+a API, g+u usage. Cmd+K. | Don't use hamburger as primary. |
| **Surface** | Canvas #010102 or #08090a or #0f1011, surfaces #141516 #18191a #191a1b 4-step ladder. No shadows, 1px border #23252a or #2a2e33 or #383b3f for separation, subtle inset shadow. | Darkness as space, surface ladder over shadows. | Dark canvas #0a0a0a, surfaces #141415 #1a1a1c #202023. Borders rgba(255,255,255,0.08). | Don't use drop shadows for cards. |
| **Border** | 0.5px hairline or 1px solid #23252a. | Border hierarchy, elevation only for overlays. | 1px border for separation, 0.5px for subtle dividers. | — |
| **Radius** | 4px xs, 6px sm, 8px md, 12px lg, 16px xl, 24px xxl, 9999px pill/full. Entire vocabulary 3 radii: card 12px, button 6px, pill 9999px. | 3 radii is entire vocabulary. | Buttons 6px, cards 12px, pills 9999px. | Don't use 8 different radii. |
| **Color** | Brand lavender #5e6ad2 / #7170ff / #828fff only for interactive links/focus, never fills cards, never section bg. Near-monochrome, color only status/accent. LCH color space, 3 variables: base, accent, contrast. | Color restraint, single chromatic accent, status colors separate. | Accent indigo #6366f1 for interactive, status colors separate, monochrome rest. | Don't use accent as card fill. |
| **Dark/light** | Dark-only marketing, dark-first product, light variant exists but not in marketing DESIGN.md. | Dark-first. | Dark default, light variant token-based. | Don't ship light-only. |
| **Hierarchy** | Weight/size only, no color. Display compressed, expanded surroundings — tension between typographic density and spatial generosity. | Hierarchy via type, not color. | Same. | — |
| **Interaction** | 100ms target, optimistic updates no spinners, inline feedback next to action, undo-first (except irreversible), full keyboard, command palette, prediction cones for forgiving interactions. | Speed is feature, be gentle, no surprises. | Optimistic copy, inline validation, undo toast for delete key. | Don't use confirm for everything. |
| **Motion** | ~200ms ease-out, sharp edges no radius on data panels. | Minimal, functional. | 200ms ease-out, transform/opacity. | Don't animate data panels radius. |
| **Code** | Berkeley Mono 13px for issue IDs (ENG-2703), shortcuts, metadata. | Mono for IDs, not just code blocks. | Use mono for request IDs, key prefixes, status codes. | Don't use mono for body. |
| **Data viz** | Not chart-heavy, list-focused. | Tables > charts. | Same. | — |
| **Storytelling** | Product UI screenshots are protagonist, marketing chrome is dark frame for high-fidelity app captures. | Show app, not illustration. | Landing uses real dashboard screenshots. | Don't use illustrations as hero. |

---

### Reference 4: Stripe (Secondary)

**URL:** stripe.com + dashboard.stripe.com
**Archetype:** Financial data, trust through clarity

| Dimension | Observation | Principle | Apply | Do NOT Copy |
|-----------|-------------|-----------|-------|-------------|
| **Typography** | Sohne-var with ss01, weight 300 signature headline light confident anti-convention, negative tracking -1.4px at 56px. SourceCodePro 12px 500 line-height 2.0 for code. 6 sizes hierarchy. Tabular numbers for financial data tnum. | Weight 300 as signature, light confident, negative tracking at display, tabular for numbers. | Use 300-400 for display if using custom font, but Inter 500-600 is ok. Tabular numbers for usage, latency, cost via font-variant-numeric: tabular-nums. | Don't use weight 300 for body (too light). |
| **Spacing** | Not documented but generous, whitespace signals professionalism. | Whitespace = trust. | Generous whitespace around KPI, not cramped. | — |
| **Density** | Home 5 numbers max, not configurable widget grid. Tables primary interface, impeccable column alignment, inline sparklines, drill-downs never lose place. | Opinionated home, tables primary, metric discipline (4 KPI above fold, full stop). | Overview 4 KPIs, tables for logs, not 6 charts. | Don't do customizable widget layout. |
| **Grid** | Clean, bold section titles, reduced visual noise, removal heavy shadows/rounded edges, layouts let charts shine. | Card-less system, section titles bold. | Use section titles 20px weight 600, not cards for every group. | Don't use cards for everything. |
| **Navigation** | Job-based labels: Payments, Payouts, Customers, Disputes — not Transactions, Charge Events. Filters map to questions users ask: by date, customer, status. | Name nav after user job, not data model. | Nav: Overview, APIs, Logs, Webhooks, Keys, Usage, Team — job-based. | Don't use "Transactions" or "Charge Events" style. |
| **Surface** | Multi-layer blue-tinted shadows rgba(50,50,93,0.25) for elevation, flat level 0 no shadow, ambient 0px 3px 6px 6%, standard 0px 15px 35px 8%, elevated 0px 30px 45px -30px 25% + 0px 18px 36px -18px 10%, deep for modals, ring 2px solid #533afd for focus. | Layered shadows with brand tint, elevation system. | Use layered shadows for floating only, not cards. | Don't use purple gradients everywhere. |
| **Border** | Dashed #362baa for placeholder, magenta #ffd7ef decorative, but mostly crisp borders + shadows. | Borders for structure. | Use solid hairlines. | — |
| **Radius** | Not strict but 6-12px. | Subtle. | 8px buttons, 12px cards. | — |
| **Color** | Stripe Purple #533afd CTA, Deep Navy #061b31 heading, White #ffffff bg, Label #273951, Body #64748d, Success #15be53 with alpha backgrounds. Color reserved for status: green succeeded, red failed, yellow pending. Narrow palette so red always means attention. | Color discipline: reserve for status, narrow palette. | Same: monochrome + status colors only. | Don't use rainbow categories. |
| **Dark/light** | Fully themable, extensible theming architecture, dark mode with accessible contrast via WCAG algorithm, darker mode for dev overlay. | Theming via tokens, accessible. | Token-based theming, accessible contrast, dark + light + maybe darker. | — |
| **Hierarchy** | Primary metric top-left F-pattern, size=importance, context below (previous period), trend sparkline monochrome. | Anchor primary top-left, comparison always present. | Overview: top-left primary KPI, comparison beneath, sparkline. | — |
| **Interaction** | Inline help first, tooltips last resort, stable skeletons mirror final content, no dead ends, all states designed (empty sparse dense error), locale-aware formats, shield verbatim from translation translate=no for code tokens. | Every state designed, inline help, skeletons not spinners. | Skeletons for tables, empty states with action, translate=no for code. | — |
| **Motion** | Not heavy, purposeful. | — | — | — |
| **Code** | SourceCodePro 12px 500 line-height 2.0 relaxed, code bold 700, code label uppercase. | Code relaxed line-height. | Mono 13px line-height 1.6-1.7. | — |
| **Data viz** | 5 numbers home, sparkline monochrome, date comparison contextual, reporting comprehensive but discontinuity noted. | Opinionated home > configurable. | Same: opinionated overview, not customizable. | Don't make reporting overly comprehensive without curation. |
| **Storytelling** | Trust through specificity: tells exactly what happened, why, what to do next. Reduces anxiety better than visual polish. | Microcopy carries trust. | Error messages specific with action. | Don't use vague "Something went wrong". |

---

## Synthesized Principles for APIForge X

### Typography
- **Display:** Inter Tight / Geist 48px 600 -1.2px, 32px 600 -0.6px, 24px 500 -0.3px. Tight tracking = confidence.
- **Body:** Inter / Vazirmatn 14-16px 400, line-height 1.5-1.6, -0.05px tracking.
- **Mono:** JetBrains Mono 13px 400 for code, request IDs, key prefixes, shortcuts. Tabular numbers for metrics via `font-variant-numeric: tabular-nums`.
- **Lanes strict:** Sans for UI, Mono for code/IDs, never mix.
- **Hierarchy via size/weight/tracking, not color.**

### Spacing
- **Base 4px**, scale 4,8,12,16,24,32,48,96.
- **Gaps:** 4px icon-text, 8px small, 12px button padding, 16px standard, 24px card padding, 32px section gap.
- **Content padding:** 24px desktop, 16px mobile.
- **Darkness as space:** Dark canvas IS whitespace.

### Density
- **High density low clutter:** 40px row height for tables, 36px for compact, no excessive chrome.
- **Tables primary, charts secondary:** 4 KPI max above fold, tables for logs, area chart for usage (1 series).
- **Progressive disclosure:** Summary up top, details one click deep (drawer).

### Grid
- **Sidebar 256px resizable** (like Vercel), main fluid max 1400px, 12-col inside main, gutters 24px.
- **Inverted-L:** Sidebar + header (56px) + main.
- **Align every element to grid, deliberate alignment, optical ±1px.**

### Navigation
- **Sidebar primary**, collapsible groups, not top tabs.
- **Job-based labels:** Overview, APIs, Logs, Webhooks, Keys, Usage, Team — not "Transactions".
- **Projects as filters** if multiple APIs.
- **Mobile:** Floating bottom bar 4 items + more, like Vercel.
- **Keyboard:** Cmd+K palette, g+letter shortcuts, ? help, Esc close.

### Surface Treatment
- **Dark default:** Canvas #0a0a0a, surface #141415 / #1a1a1c / #202023 ladder.
- **Light:** #fcfcfc body, #ffffff surface.
- **Elevation:** Hairlines rgba(255,255,255,0.08) dark / rgba(0,0,0,0.08) light for cards, stacked shadows only for floating (dropdown, modal, command palette).
- **No heavy shadows for cards.**

### Border Usage
- **1px solid var(--border)** for all separation.
- **0.5px hairline** for subtle dividers.
- **Focus ring:** 2px solid accent.

### Radius Philosophy
- **3 radii vocabulary:** 6-8px interactive (buttons, badges, inputs), 12px container (cards, code wells, panels), 9999px pill (status, tags).
- **Data:** 0-4px sharp for table rows, progress fill.
- **Never mix 100px marketing pill with 6px app on same screen.**

### Color Strategy
- **Monochrome + one accent:** Accent indigo #6366f1 for interactive (links, focus, primary button), never for decoration.
- **Status only:** Green #22c55e success, Red #ef4444 error, Yellow #f59e0b warning, Blue #3b82f6 info, Gray neutral.
- **No rainbow categories.**
- **Color = meaning:** Red always attention, not "red category".

### Dark-Mode Strategy
- **Dark-first, tokens, not invert.** Build CSS variables dark-first, light as override.
- **Accessible contrast via WCAG, not just invert.**
- **Surfaces ladder, not single surface.**

### Content Hierarchy
- **Number top-left, size=importance, context below, trend sparkline.**
- **Primary KPI 32px 600, secondary 20px 500, label 12px uppercase 0.4px tracking.**
- **Comparison always present: current vs previous period.**

### Interaction Language
- **Keyboard everywhere, clear focus :focus-visible, focus trap, 24px hit target min (44px mobile).**
- **URL as state: filters in query (?status=failed&key=sk_...), shareable.**
- **Optimistic updates, loading buttons keep label, min loading duration 150-300ms to avoid flicker.**
- **Inline help first, tooltips last resort.**
- **No dead zones, links are links (<a>), deep-link everything.**
- **Copy with inline "Copied!" not just toast.**
- **Undo-first, not confirm, except irreversible.**

### Motion Philosophy
- **200ms ease-out, transform + opacity only, never transition: all.**
- **Honor prefers-reduced-motion.**
- **Necessity check: motion clarifies cause/effect or deliberate delight, not decoration.**
- **Interruptible, input-driven, correct transform origin.**

### Code Presentation
- **Dark wells #0f0f10 or #111113, border, header with language label + copy button, mono 13px, line-height 1.6, LTR isolated with dir="ltr" and translate="no".**
- **Language tabs, not just one snippet.**
- **Syntax highlight subtle, not rainbow.**
- **Injection of user's key (masked) where relevant.**

### Data Visualization
- **Tables primary:** Impeccable column alignment, tabular numbers, method badges, status badges, inline sparklines where trend needed.
- **Charts secondary:** Area for usage (1 series), horizontal bar for comparison, donut ≤5 slices, never pie >5.
- **Limit 5-6 colors max per chart, shape+line style alongside color for a11y.**
- **Pair chart + sentence: one declarative sentence improves comprehension.**
- **Make anomalies obvious, color with meaning (red=bad, green=good, gray=neutral).**

### Product Storytelling
- **Show real product UI, not illustrations.**
- **Second person, numerals for counts, specific microcopy.**
- **Empty states teach: "No requests yet. Send your first: [code]"**
- **Error states actionable: what happened, why, what to do next + link.**

---

## What We Learn vs What We Should NOT Copy — Summary Table

| Reference | What We Learn | What We Should NOT Copy |
|-----------|---------------|-------------------------|
| **Resend** | Dark canvas + hairlines + glows, 3 typography lanes strict, onboarding <2min, docs is product, code as component, minimal metrics | Serif overload in app, orange solid surfaces, email-specific flows |
| **Vercel** | Ink is brand, gray scale system, stacked shadows, 4px grid, URL as state, keyboard everywhere, deep-link, progressive disclosure, tracking as voice | 100px pill mixed with 6px, mesh gradient miniaturized, monochrome coldness without warmth |
| **Linear** | Dark-first #0f1011, 4px scale, 3 radii vocabulary, hairlines over shadows, 36px rows, density without clutter, keyboard-first Cmd+K + g+letter, 100ms speed, optimistic, undo | Dark-only marketing, overly dense for novices, weight 700 emphasis |
| **Stripe** | Table as primary, metric discipline 4 KPIs, job-based nav, color=status only, tabular numbers, specific microcopy builds trust, empty states designed, theming tokens | Navigation bloat with many products, reporting discontinuity, purple gradients everywhere |

---

## APIForge X Visual Principles ( distilled )

1.  **Dark is default, light is token-swapped, not inverted.**
2.  **Ink + gray scale + one accent (indigo). Color = status only.**
3.  **Typography: tight tracking at display (-1.2px at 48px), normal at body, mono for code/IDs, tabular numbers for metrics.**
4.  **Spacing 4px strict, 3 radii (6px, 12px, 9999px), hairlines over shadows.**
5.  **Tables primary, charts secondary, 4 KPIs max, opinionated not configurable.**
6.  **Sidebar 256px, header 56px, main fluid, 12-col, gutters 24px.**
7.  **Keyboard everywhere: Cmd+K, g+letter, ?, Esc, focus-visible, URL as state.**
8.  **Code dark wells, LTR isolated, copy + language tabs, injection.**
9.  **Empty states teach, error states actionable, skeletons not spinners.**
10. **Motion 200ms ease-out transform/opacity only, reduced-motion respected.**
