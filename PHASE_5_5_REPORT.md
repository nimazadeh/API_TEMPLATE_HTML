# Phase 5.5 — Premium Visual Polish & Motion System

**Goal.** Take APIForge X from a technically complete SaaS template to a
premium, marketplace-ready product — in the atmosphere of Vercel, Linear,
Stripe and Raycast — **without** redesigning it, changing the architecture or
adding features.

**Result.** ✅ Complete. 31 pages build, every animation is `transform` /
`opacity` only, every decorative animation respects
`prefers-reduced-motion`, and the Toast is a premium component again.

**Hard rules honoured**

| Rule | How |
|------|-----|
| Do not redesign | No layout, colour, type or component was re-architected — only motion, elevation and the ambient layer |
| Preserve the design system | Every new value is a token (`--motion-*`, `--backdrop-*`, `--elevation-*`) |
| Preserve RTL | Directional travel multiplies by `--dir-sign`; all spacing is logical |
| Preserve Persian localization | 86 new `vs.*` keys added to **both** catalogs; the new page is fully bilingual |
| Preserve accessibility | `role` / `aria-live` on toasts, focus motion on the shared focus ring, no motion-only information |
| Token compliance | Zero colour literals outside `tokens/`; zero duration literals outside `tokens/_motion.scss` |

---

## 1. Premium visual language

Direction kept deliberately quiet: dark-first, minimal, technical, spacious.
No glassmorphism, no gradients on content, no heavy shadows — the only new
elevation is `--elevation-1` on hover for solid buttons, interactive cards,
feature cards and pricing cards.

## 2. Marketing background system

`src/scss/components/_backdrop.scss` — one reusable layer, three token-driven
children:

| Layer | What it is |
|-------|-----------|
| `.backdrop__grid` | Fine 44px technical grid (`--backdrop-grid-size` / `--backdrop-grid-line`), masked to fade out downward |
| `.backdrop__glow` | Large radial accent glow at top center (`--backdrop-glow`, `--backdrop-glow-soft`) — always behind content |
| `.backdrop__mesh` | API-infrastructure lattice: nodes + connectors + a 114° link overlay, masked to the top |

Applied to exactly the surfaces the brief allows:

| Page | Variant |
|------|---------|
| `index`, `pricing`, `changelog`, `status` | `.backdrop` (full) |
| `docs`, `sdk`, `api-reference` | `.backdrop--quiet` (55% strength, no mesh — they live in the app shell) |
| `login`, `forgot-password` | `.backdrop--auth` (glow tuned to sit behind the card) |

**Never** applied to the dashboard, logs, API keys, tables or any other
workspace page — those keep a flat, distraction-free canvas.

Two stray colour literals were removed as part of this (`.hero::before` and
`.auth::before` gradients, plus `.cta-band::before`), so the only place with a
raw `rgba()` left in the stylesheet is `tokens/_colors.scss` and
`tokens/_elevation.scss`, which *are* the token layer.

## 3. Hero experience upgrade

`src/scss/pages/_marketing.scss` now owns one entrance schedule per hero
(transform + opacity only, `both` fill so nothing pops out of order and no
layout ever shifts):

| t | Element |
|---|---------|
| 0ms | `.backdrop` fade |
| 100ms | eyebrow |
| 150ms | title |
| 250ms | description |
| 350ms | CTA row |
| 400ms | hero hint |
| 450ms | product preview frame |
| 520ms + 60ms·n | KPI cards (staggered by `--motion-i`) |
| 560 / 620ms | the two preview panels |

The same choreography is reused verbatim by `visual-showcase.html`.

## 4. Motion design system

`src/scss/tokens/_motion.scss` is the single source of speed:

```css
--motion-fast: 150ms;    /* 120-180ms band: hover, focus, tooltips */
--motion-normal: 250ms;  /* 200-300ms band: buttons, cards, dropdowns, modal, toast */
--motion-slow: 400ms;    /* hard ceiling: entrances, drawers, chart reveal */
--ease-standard: cubic-bezier(.2,.8,.2,1);
--motion-stagger: 60ms;
--motion-shift: 8px;
--dir-sign: 1;           /* -1 under [dir='rtl'] */
```

The pre-5.5 `--duration-*` tokens are kept as aliases so no component had to
be rewritten. `src/scss/tokens/_mixins.scss` gained `motion($duration, $props)`,
`motion-reduce` and `motion-enter($delay, $duration, $shift)`; every entrance in
the product funnels through them.

## 5. Component micro-interactions

| Component | Change |
|-----------|--------|
| Buttons | Solid variants lift 1px + `--elevation-1` on hover, settle on press; the shared `:focus-visible` ring now animates its `outline-offset` over 150ms |
| Cards | Shared border/background/shadow transition; `.card--interactive`, `.feature-card` and `.pricing-card` lift 1px with `--elevation-1` |
| Tables | Row background transition at 150ms; clickable rows get a 2px accent rail on the **inline-start** edge (`calc(var(--dir-sign) * 2px)`) |
| Tabs | Active indicator is a `scale`d 2px bar (no width/position animation); hover shows it at 45% |
| Dropdowns | `afx-drop-in` (150ms) — uses the independent `translate`/`scale` properties so Popper's inline `transform` is untouched |
| Modals | 250ms backdrop fade + 12px travel; Bootstrap's 300ms/ease-out override replaced |
| Drawers | `--bs-offcanvas-transition: transform var(--motion-slow) var(--ease-standard)`; side + slide direction already mirrored for RTL |
| Tooltips | 150ms fade + hair of scale (also Popper-safe) |
| Toasts | See §7 |
| Charts | 400ms `easeOutQuart` reveal, 120ms hover feedback, disabled entirely under reduced motion |

## 6. Dashboard polish

No decorative background — the workspace stays a clean tool. It only gained:

- **Card entrance** — the four KPI cards and every top-level card in the app
  pages reveal on load/scroll (`data-motion`, staggered by `data-motion-group`)
- **Skeleton transition** — `dashboard.js` swaps `.skeleton-kpi` for
  `.is-loaded`, and the card settles into place over 400ms instead of snapping
- **Chart animation** — the shared chart defaults animate once at the system
  ceiling
- **Smoother interactions** — inherited from §5 (cards, tables, buttons, tabs)

## 7. Toast (the premium notification component)

`src/js/components/toast.js` + `src/scss/components/_toast.scss` were rebuilt
against the brief:

| Requirement | Implementation |
|-------------|----------------|
| Structure | `[icon] [ title / message ] [close]` with an 8px+ gap between icon and text |
| Spacing | `padding-block: 12px` · `padding-inline: 16px` — text never touches an edge; mobile adds inline margins |
| Typography | Title `600`, message 14px, `--lh-toast: 1.6` (Persian friendly), `overflow-wrap: anywhere` for long URLs and paths |
| RTL | Logical properties only (`padding-inline`, `margin-inline`, `inset-inline-end`, `gap`); the accent rail mirrors via `--dir-sign`; LTR content inside stays LTR |
| Visual | Token border per state, `--elevation-2`, `--radius-md`, 2px accent rail on the inline-start edge |
| States | success / error / warning / info — each mapped to `--success*`, `--error*`, `--warning*`, `--info*` tokens; zero colour literals |
| Responsive | Top inline-end corner on desktop (380px max), full-width with safe margins under 576px |
| Animation | Enter 250ms (`opacity 0→1`, `translateY 8px→0`), exit fade; reduced motion keeps only the opacity change |
| Accessibility | `role="status"` + `aria-live="polite"` for success/info, `role="alert"` + `aria-live="assertive"` for error/warning, `aria-atomic`, close button labelled from the catalog (`aria.close`) |

The stack moved from the bottom-end to the **top** inline-end corner (per the
brief) — Bootstrap still owns delay, autohide and the hide lifecycle.

## 8. RTL compatibility

- Every directional value is logical or multiplied by `--dir-sign`
  (`--dir-sign: -1` under `[dir='rtl']`).
- Drawers already open from the reading edge (`.offcanvas-start/end` are
  re-mapped with logical insets + mirrored transforms) — now with the new
  400ms curve.
- Entrances travel on **Y only**, so they need no mirroring at all.
- `.ltr-isolate`, code blocks and API paths are untouched; no new rule touches
  `direction`.

## 9. Performance

- Only `transform`, `translate`, `scale` and `opacity` animate.
- One `IntersectionObserver` for the whole product (`components/motion.js`),
  unobserving each element after it reveals and dropping `will-change` on
  `animationend`.
- The backdrop is a static, `contain: paint`, `pointer-events: none` layer.
- Nothing loops, drifts or animates continuously.
- `prefers-reduced-motion` is honoured in the tokens, in the mixins, and in
  every component that declares its own keyframes.

## 10. `visual-showcase.html`

A live QA page (31st page, wired into `vite.config.js`, linked from the
marketing footers, the landing page directory and the RTL QA bar):

1. Hero example with a **replay entrance** button
2. Backdrop tiles — grid / glow / mesh, plus a **hide the backdrop** toggle
3. Motion playground — three dots at 150 / 250 / 400ms, run side by side
4. Cards — staggered entrance + hover elevation
5. Buttons — every variant with hover, focus and press
6. Overlays — modal, drawer, dropdown, tabs
7. Toasts — success, error, warning, info, long message, with an action (Undo)
8. A note describing the reduced-motion behaviour

Live dark / light / system and RTL / LTR switching from its control bar.

## 11. Final verification

| Gate | Result |
|------|--------|
| `npm run build` | ✅ green — **31 pages** (30 + `visual-showcase`), per-page chunks, no broken imports |
| HTML validity | ✅ 31/31 files parse cleanly (parse5, 0 errors) |
| Missing translations | ✅ **0** — every `data-i18n` / `data-i18n-attr` / `t()` key resolves in both `fa.json` and `en.json` (1,347 keys each) |
| Icon registry | ✅ 88/88 `data-lucide` names resolve in the tree-shaken registry |
| Colour literals | ✅ none outside `tokens/` (verified by grep across `src/scss`) |
| Dev server | ✅ all **31** pages return 200 with modules + SCSS transformed |
| Runtime tests | ✅ 30/30 jsdom assertions (toast structure/roles/escaping, motion fallbacks, i18n) |
| RTL | ✅ static + structural verification — **no browser in the sandbox**; confirm visually through the live preview (`npm run dev`) |

### Defects found and fixed along the way

| Defect | Fix |
|--------|-----|
| `dashboard.html` had two `data-i18n-attr` attributes on one button (parse5 `duplicate-attribute`); the tooltip title was never translated | Merged into `data-i18n-attr="aria-label:aria.help,data-bs-title:dashboard.help"` |
| `arrow-up-left` was used on `dashboard.html` and `settings.html` but not in the Lucide registry — the glyph never rendered | Added `ArrowUpLeft` to `src/js/components/icons.js` |
| `.auth__card` used an undefined `--radius-lg` (invalid at computed-value time → square corners) | Switched to `--radius-md` |

### How to verify in one minute

```bash
npm run dev
# 1. /                        hero entrance + backdrop
# 2. /visual-showcase.html    every layer, every state — flip theme + language
# 3. /dashboard.html          card entrance, skeleton settle, animated charts
# 4. /pricing.html            grid + glow behind the plans, hover elevation
# 5. any app page             open a drawer/modal, trigger a toast
```

Then switch your OS to “reduce motion” and reload — everything appears
instantly, with no movement.
