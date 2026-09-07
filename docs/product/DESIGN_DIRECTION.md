# Design Direction — APIForge X

## Overall Mood

**"Midnight lab — calm, focused, precise, slightly technical, not playful."**

Imagine a developer at 11pm debugging webhooks. The room is dark, the screen is dark, the data is sharp, the code is readable, nothing screams. The UI feels like a well-organized lab bench: tools where you expect, labels precise, no clutter, no marketing noise inside the app.

Not: cheerful SaaS, colorful illustration-heavy, bubbly.

But also not: cold, brutalist, hacker terminal.

Balance: **Professional warmth via typography and spacing, not via color.**

---

## Visual Personality

- **Confident, not loud:** Tight tracking headlines, large numbers, but monochrome.
- **Engineered, not designed:** Feels built by engineers who care about details (like Linear), not by marketing team.
- **Trustworthy, not corporate:** Specific microcopy, tabular numbers aligned, error explanations — like Stripe.
- **Fast, not flashy:** 100ms interactions, keyboard, URL state — like Vercel.
- **Considered, not minimal for minimal's sake:** Every empty state, skeleton, error state designed — like Resend.

Adjectives: precise, calm, dense-but-readable, dark-first, keyboard-friendly, code-respectful.

---

## Typography Direction

### Primary Stack

**English:**
- **Display / Headings:** Inter Tight or Geist Sans, weights 500-600 only, tracking tight.
  - Fallback: Inter, -apple-system, BlinkMacSystemFont, Segoe UI
  - Feature settings: "cv01", "ss03" for Inter if available
- **Body / UI:** Inter 14-16px 400/500
- **Mono:** JetBrains Mono 13px 400, fallback Geist Mono, ui-monospace, SFMono, Menlo
  - Use for: code blocks, request IDs (req_...), key prefixes (sk_live_...), shortcuts (⌘K), status codes, JSON keys

**Persian:**
- **Primary:** Vazirmatn, weights 400, 500, 700
  - Vazirmatn is open-source, highly legible, used by GitHub/Telegram for Persian, variable, good x-height
  - Must load 400,500,700 + maybe 300 for display light
- **Mono for Persian context:** Still JetBrains Mono for code, but Vazirmatn for Persian UI
- **Mixed:** Persian sentence with English code — ensure Vazirmatn for Persian, JetBrains for code, no fallback break

### Type Scale (App)

| Token | Size | Weight | Line Height | Tracking | Use |
|-------|------|--------|-------------|----------|-----|
| display | 48px | 600 | 1.0 | -1.2px | Marketing hero, empty state headline |
| h1 | 32px | 600 | 1.1 | -0.6px | Page title (Overview, Logs) |
| h2 | 24px | 600 | 1.2 | -0.3px | Section title |
| h3 | 20px | 500 | 1.3 | -0.2px | Card title, group title |
| h4 | 16px | 500 | 1.4 | -0.1px | Subsection |
| body-lg | 16px | 400 | 1.6 | -0.05px | Lead, intro |
| body | 14px | 400 | 1.5 | 0 | Default UI, table cells |
| body-sm | 13px | 400 | 1.5 | 0 | Secondary, descriptions |
| caption | 12px | 400 | 1.4 | 0 | Meta, timestamps |
| eyebrow | 11px | 500 | 1.3 | 0.6px uppercase | Labels, KPI label |
| mono | 13px | 400 | 1.6 | 0 | Code, IDs |
| mono-sm | 12px | 400 | 1.5 | 0 | Inline code, badges |

**Rules:**
- Never use weight 700 for headings (except Persian bold where needed, but prefer 600)
- Display tracking tight, body tracking normal
- Uppercase only for eyebrow labels with increased tracking, never for body
- Tabular numbers for all metrics: `font-variant-numeric: tabular-nums` or `font-feature-settings: "tnum"`

### Persian Typography Specifics

- Vazirmatn line-height needs +0.1 vs English due to ascenders: body 1.7 not 1.5
- Persian headings: weight 700 can be used, but tracking less negative (Persian doesn't compress same as Latin)
- Avoid justified Persian (creates rivers) — use right-aligned, ragged left
- Persian numbers: Provide utility classes
  - `.num-en` → 0123456789 (for technical)
  - `.num-fa` → ۰۱۲۳۴۵۶۷۸۹ (for financial, optional)
  - Default: English numbers even in RTL, because code/IDs are English — but allow toggle
- Mixed LTR inside RTL: Always wrap code/endpoint/key in `<span dir="ltr" class="code-isolate">` with `unicode-bidi: isolate`

---

## Density & Whitespace

### Philosophy: High Density, Low Clutter (Linear-inspired)

- **Density via alignment, not cramming:** Use grid, consistent gutters, not reduced padding everywhere.
- **Whitespace via background, not padding inflation:** Dark canvas #0a0a0a IS whitespace. Don't need 48px padding to feel spacious if background is dark and borders are hairlines.
- **Row heights:**
  - Table rows: 40px default, 36px compact option (for logs)
  - List items: 48px for team, 40px for keys
  - Cards: 16px inner padding, not 24px for dense areas
- **Section gaps:**
  - Between related elements: 8px
  - Between groups: 24px
  - Between sections: 32-48px
  - Page top to first section: 24px

### Content Padding

- Desktop: 24px (main content)
- Tablet: 20px
- Mobile: 16px
- Sidebar: 16px
- Card: 16px (dense) / 20px (default) / 24px (marketing)
- Table cell: 12px vertical, 16px horizontal

---

## Grid

- **App shell:** Sidebar 256px (collapsible to 64px icon rail on <1024px, or hidden with overlay on mobile) + Header 56px + Main fluid
- **Main:** Max-width 1440px, centered, padding 24px
- **Inside main:** 12-column grid, gutter 24px, using Bootstrap 5.3 grid but with custom gutters
- **Breakpoints:** Bootstrap defaults: xs 0, sm 576, md 768, lg 992, xl 1200, xxl 1400
- **Sidebar behavior:**
  - Desktop >=1200: 256px fixed, resizable (optional)
  - Tablet 768-1199: 64px icon rail, hover expands or click
  - Mobile <768: hidden, hamburger opens overlay drawer, plus bottom tab bar for 4 primary items (Overview, Logs, Keys, Usage) like Vercel

---

## Color Approach

### Strategy: Monochrome + One Accent + Status

**No rainbow. Color = meaning.**

#### Dark Theme (Default)

- **Canvas:** #0a0a0a (near black, slightly warm)
- **Surface 0:** #0a0a0a (canvas)
- **Surface 1:** #141415 (cards, sidebar)
- **Surface 2:** #1a1a1c (hover, elevated)
- **Surface 3:** #202023 (active, input)
- **Border:** rgba(255,255,255,0.08) default, rgba(255,255,255,0.12) hover, rgba(255,255,255,0.16) active
- **Border subtle:** rgba(255,255,255,0.04) for dividers
- **Text primary:** #fafafa (near white)
- **Text secondary:** #a1a1aa (zinc 400)
- **Text tertiary:** #71717a (zinc 500)
- **Text disabled:** #52525b

- **Accent (interactive):** Indigo #6366f1 (primary button, link, focus ring), hover #818cf8, active #4f46e5
- **Accent subtle:** rgba(99,102,241,0.12) bg, rgba(99,102,241,0.24) border

- **Status:**
  - Success: #22c55e text, rgba(34,197,94,0.12) bg, rgba(34,197,94,0.24) border
  - Error: #ef4444 text, rgba(239,68,68,0.12) bg, rgba(239,68,68,0.24) border
  - Warning: #f59e0b text, rgba(245,158,11,0.12) bg
  - Info: #3b82f6 text, rgba(59,130,246,0.12) bg
  - Neutral: #a1a1aa text, rgba(161,161,170,0.12) bg

- **Code:** #0f0f10 bg, #e4e4e7 text

#### Light Theme

- **Canvas:** #fcfcfc (near white, not pure #fff to reduce glare, but cards pure white)
- **Surface 0:** #fcfcfc
- **Surface 1:** #ffffff (cards)
- **Surface 2:** #f4f4f5 (hover, zinc 100)
- **Surface 3:** #e4e4e7 (active, zinc 200)
- **Border:** rgba(0,0,0,0.08) default, rgba(0,0,0,0.12) hover
- **Text primary:** #18181b (zinc 900)
- **Text secondary:** #71717a (zinc 500)
- **Text tertiary:** #a1a1aa
- **Accent same:** #6366f1
- **Status same hues, adjusted bg for light**

#### Accent Choice Rationale

- Indigo #6366f1 is modern, technical, not Stripe purple clone (#533afd), not Linear lavender (#5e6ad2) exactly, but in same family — familiar to devs, not corporate blue.
- Works in both dark and light, accessible contrast 4.5:1 for white text.
- Not used for decoration, only interactive.

#### Gradients

- **No gradients for UI.** Only for atmospheric glows behind empty states or hero cards: radial indigo 20% opacity, 400px blur, behind card.
- Never for buttons, never for text, never for charts.

---

## Dark / Light Themes

- **Dark-first:** Design in dark, then create light tokens.
- **Token-based:** CSS variables `--bg-canvas`, `--bg-surface-1`, `--text-primary`, `--border`, etc.
- **Implementation:** `data-theme="dark"` on html, `data-theme="light"` toggled. Use `color-scheme: dark light`.
- **System preference:** Respect `prefers-color-scheme`, but allow manual override stored in localStorage.
- **No flash:** Inline script to set theme before paint.
- **Charts:** Chart.js colors use CSS variables, update on theme change.
- **Code blocks:** Always dark, even in light theme (like Vercel/Stripe) — code is dark well regardless.

---

## Surfaces, Borders, Cards

### Surfaces

- **Flat:** No shadow, only border. For cards, tables, panels.
- **Floating:** Dropdown, popover, command palette, modal — use stacked shadows:
  - `box-shadow: 0 0 0 1px var(--border), 0 4px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)` (light)
  - Dark: `0 0 0 1px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.5)`

### Borders

- **Default:** 1px solid var(--border)
- **Subtle divider:** 1px solid var(--border-subtle) or 0.5px
- **Focus:** 2px solid var(--accent) with offset 2px
- **No dashed for structure**, only for drop zones (e.g., "Drop OpenAPI file").

### Cards

- **Default card:** bg surface-1, border 1px solid border, radius 12px, padding 16-20px, no shadow
- **Interactive card (hover):** border hover, bg surface-2
- **No card for every group:** Use section title + border-top for some groups (Stripe-style card-less)
- **Code card:** bg #0f0f10, border, radius 12px, header with language + copy

### Radius

- **Interactive:** 6-8px (buttons, inputs, badges, select)
- **Container:** 12px (cards, panels, code wells, dropdowns)
- **Pill:** 9999px (status badges, tags, small pills)
- **Data:** 0-4px (table rows, progress bar fill, dividers)
- **Modal:** 12-16px

Keep vocabulary to 3-4 values, not 8.

---

## Buttons

### Types

- **Primary:** bg accent #6366f1, text white, 6-8px radius, 32px height (default), 36px large, 28px small. Hover #818cf8, active #4f46e5. Focus ring.
- **Secondary:** bg surface-2, border, text primary. Hover surface-3.
- **Ghost:** transparent, text secondary, hover surface-2.
- **Destructive:** bg red #ef4444, text white, or ghost red text #ef4444 hover rgba(239,68,68,0.12).
- **Link:** text accent, no bg, underline on hover.

### Rules

- **Height:** 32px default, 28px sm, 36px lg, 44px mobile min touch target (but visual 32px with 44px hit area)
- **Padding:** 12px horizontal default, 16px lg
- **Icon:** 16px Lucide, gap 8px
- **Loading:** Keep label, add spinner 16px before label, disable
- **Disabled:** opacity 0.5, not just color change
- **No dead zones:** Whole button interactive, not just text

### Icon Buttons

- 32x32, radius 6-8px, ghost, Lucide 16px
- Must have aria-label

---

## Forms

- **Input:** 32px height, bg surface-1, border 1px border, radius 6-8px, padding 12px, text 14px, placeholder secondary. Focus border accent + ring 2px rgba(99,102,241,0.2). Error border red.
- **Textarea:** min 80px, same
- **Select:** same as input, chevron icon
- **Checkbox/Radio:** 16px, accent checked, focus ring
- **Label:** 13px 500, margin bottom 6px, secondary or primary
- **Help text:** 12px secondary, margin top 6px
- **Error text:** 12px red, margin top 6px
- **Form group gap:** 16px
- **Inline help first, tooltips last resort** (Vercel principle)

### Specific Patterns

- **API Key input:** monospace, reveal toggle (eye), copy button inside
- **Search input:** with Cmd+K hint on right, Lucide search icon left
- **Code input:** dark well, mono

---

## Tables

**Tables are the most important component. Treat with utmost care.**

- **Header:** 12px uppercase 0.6px tracking 500, text tertiary, bg transparent or surface-1, border-bottom 1px border, padding 8px 16px, sticky if needed
- **Row:** 40px height, border-bottom 1px border-subtle, hover bg surface-2, padding 12px 16px, text 14px
- **Cell:** left-aligned default, right-aligned for numbers (latency, cost) with tabular-nums
- **Method badges:** GET blue, POST green, PUT yellow, DELETE red, PATCH purple — small pill 20px height, 10px font, mono
- **Status badges:** 200 green, 201 green, 400 yellow, 401 yellow, 403 yellow, 404 yellow, 429 orange, 500 red — pill with dot
- **Empty:** Not blank — illustration + "No requests yet. Send your first: [code]"
- **Skeleton:** Rows with shimmer, mirror final layout, not spinner
- **Pagination:** Simple, prev/next + page numbers, URL state (?page=2)
- **Filters:** Above table, as pills + dropdowns, URL state
- **Sort:** Click header, arrow indicator

**No:**
- No striped rows (use hover only)
- No heavy borders between cells
- No centered text for data

---

## Charts (Chart.js)

- **Usage:** Area chart for requests over time, 1 series, accent color with 12% fill, no grid or subtle grid (border-subtle), tooltip dark
- **Bar:** Horizontal for endpoint comparison, 1 color, sorted descending
- **Donut:** ≤5 slices, for status distribution, muted colors
- **No:** Pie >5, rainbow series, 3D, heavy gradients
- **Colors:** Use CSS variables, 1-2 colors max per chart
- **Accessibility:** Shape + color, not color alone, tabular numbers in tooltip
- **Pair with sentence:** Above chart, one declarative sentence: "Requests up 12% vs last week, driven by /v1/emails endpoint."

---

## Code Blocks

- **Container:** bg #0f0f10 (always dark), border 1px rgba(255,255,255,0.08), radius 12px, overflow hidden
- **Header:** 40px height, bg #141415, border-bottom, left: language label (e.g., "Node.js" with icon), right: copy button + maybe tabs
- **Body:** padding 16px, mono 13px line-height 1.6, overflow-x auto, LTR forced
- **Tabs:** For multi-language (cURL, Node, Python, Go) — pill tabs, active bg surface-2, not underline
- **Copy:** Button with "Copy" → "Copied!" 2s, with check icon, optimistic
- **Line numbers:** Optional, muted tertiary
- **Syntax:** Subtle, not rainbow — use 4 colors max: keyword accent, string green, number blue, comment tertiary
- **Inline code:** bg surface-2, border, radius 4px, padding 2px 6px, mono 12px, LTR isolate
- **Key injection:** Show `sk_live_...` masked with reveal, or placeholder `YOUR_API_KEY` with note "Uses your live key"

**RTL handling:** `dir="ltr"` on pre, `unicode-bidi: isolate` on inline, `text-align: left` forced.

---

## Navigation

### Sidebar

- **Width:** 256px, collapsible to 64px icon rail
- **Sections:** Groups with title eyebrow 11px uppercase tracking 0.6px tertiary, gap 16px between groups, 4px between items
- **Item:** 32px height, radius 6px, padding 8px 12px, icon 16px Lucide, text 14px 400, gap 8px. Active bg surface-2 text primary, hover surface-2. Focus ring.
- **Badge:** Right-aligned, small pill with count or "New"
- **Bottom:** User menu, environment switcher, theme toggle

### Header (Top)

- **Height:** 56px, border-bottom, bg surface-1 (or transparent)
- **Left:** Breadcrumb or page title (on mobile when sidebar hidden)
- **Center:** Search with Cmd+K hint (desktop)
- **Right:** Env switcher (Test/Live), help, notifications, user

### Environment Switcher

- **Like Stripe:** Pill toggle Test/Live, Test has yellow dot + "Test mode" banner below header when active
- **Banner:** 32px height, yellow bg rgba(245,158,11,0.12), text 13px, with "You are viewing test data"

### Mobile

- **Bottom tab bar:** 4 primary + More, 56px height, icons + labels, active accent
- **Drawer:** Sidebar as overlay drawer from left, backdrop

---

## Motion

- **Duration:** 200ms for hover/focus, 150ms for tooltip, 250ms for drawer/modal
- **Easing:** ease-out (cubic-bezier 0.16,1,0.3,1) for enter, ease-in for exit
- **Properties:** transform, opacity only
- **Never:** width, height, top, left, all
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` → 0ms or minimal
- **Skeletons:** Shimmer 1.5s ease-in-out infinite, but static if reduced-motion
- **Focus:** Visible ring, not animated

---

## Icon System — Lucide Only

- **Library:** Lucide Icons (https://lucide.dev) — consistent stroke 1.5-2px, 24px viewBox
- **Sizes:** 16px default UI, 20px for empty states, 14px for inline, 12px for badges
- **Stroke:** 1.5px for 16px, 2px for larger
- **No:** FontAwesome, Tabler, Feather, Boxicons mixed. Only Lucide.
- **Usage:** Always with aria-hidden if decorative, with label if meaningful

---

## Persian / RTL Direction

### Vazirmatn

- **Load:** Vazirmatn 300,400,500,700 via Google Fonts or self-hosted woff2
- **Apply:** `:lang(fa)` or `[dir="rtl"]` → font-family Vazirmatn, sans-serif
- **Line-height:** 1.7 for Persian body vs 1.5 English
- **Letter-spacing:** Less negative for Persian headings

### RTL Layout

- **Use logical properties:** `margin-inline-start` not `margin-left`, `padding-inline`, `inset-inline-start`, `border-inline-start`, etc.
- **Dir attribute:** `<html dir="rtl" lang="fa">` for Persian demo, `<html dir="ltr" lang="en">` for English
- **Isolation:** All code, keys, endpoints, JSON, URLs, numbers (when technical) must have `dir="ltr"` and `class="ltr-isolate"` with CSS `direction: ltr; unicode-bidi: isolate; text-align: left;`
- **Mirroring:** Sidebar on right in RTL, not left. Use logical properties so it auto-mirrors.
- **Icons:** Some icons need mirroring (arrow-right → arrow-left in RTL). Use `rtl:flip` utility or logical.
- **Charts:** Canvas LTR always, even in RTL, to avoid mirrored axes.

### Professional Persian Copy (Examples)

- API Keys → کلیدهای API (not کلیدهای ای‌پی‌آی)
- Webhooks → وب‌هوک‌ها
- Logs → لاگ‌ها / گزارش‌ها (choose لاگ‌ها for dev familiarity)
- Usage → میزان استفاده
- Rate Limits → محدودیت نرخ
- Overview → نمای کلی
- Create API Key → ساخت کلید API
- Copy → کپی
- Copied! → کپی شد!
- Last used → آخرین استفاده
- No requests yet → هنوز درخواستی ثبت نشده

Avoid Google Translate. Use developer-familiar Persian with English terms where standard (API, SDK, Webhook).

---

## Measurable "Premium" Principles

Turn "premium" into measurable:

1.  **Type:** Tracking -1.2px at 48px, tabular numbers, mono for IDs, 3 lanes strict
2.  **Spacing:** 4px base, 3 radii only, 40px table rows, 24px content padding
3.  **Color:** Monochrome + 1 accent + status, no rainbow, color=meaning
4.  **Surface:** Hairlines not shadows for cards, stacked shadows only for floating
5.  **Density:** 4 KPIs max, tables primary, progressive disclosure
6.  **Interaction:** Keyboard everywhere, URL state, optimistic, skeletons, copy inline feedback
7.  **Code:** Dark wells, LTR isolated, copy, tabs, injection
8.  **Empty/Error:** Designed, teaching, actionable, not blank
9.  **Motion:** 200ms transform/opacity only, reduced-motion respected
10. **RTL:** Logical properties, Vazirmatn, LTR isolation, professional copy

If a screen violates 2+ of these, it's not premium.

---

## What Premium is NOT

- Not lots of gradients, shadows, illustrations
- Not 10 colors, 8 radii, 6 fonts
- Not 100 pages
- Not light-only with dark as invert
- Not generic admin with API label

Premium = restraint + density + keyboard + code respect + table discipline.
