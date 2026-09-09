# The APIForge X design system

APIForge X is a dark-first, keyboard-first interface language in the spirit
of modern developer platforms — monochrome surfaces, one indigo accent,
status colors only where meaning demands them. This document explains the
system so your customizations feel native, not bolted on.

Open `style-guide.html` in the package to see every primitive live, and
`visual-showcase.html` for motion, overlays and toasts in both themes and
both directions.

---

## Surfaces, not backgrounds

The dark theme is built as a **ladder of surfaces** with distinct roles —
never one flat black:

| Token | Role |
|-------|------|
| `--surface-canvas` | Page background |
| `--surface-1` | Cards, panels, inputs |
| `--surface-2` | Elevated and hover states |
| `--surface-3` | Active / selected / pressed |
| `--surface-overlay` | Floating layers — dropdowns, modals, command palette |
| `--surface-code` | Code wells (deliberately dark in **both** themes) |

Borders are hairlines (`rgba` white at 4–16% in dark, black in light), and
resting surfaces carry **no shadows** — elevation is reserved for things
that actually float.

## One accent

`--accent` (indigo `#6366f1`) is the only brand color, and it is reserved
for **interactivity**: primary buttons, links, focus rings, active nav,
chart series. Everything else is monochrome. Status colors — success, error,
warning, info — appear only where they carry meaning (badges, toasts, log
levels, chart deltas). Keep that discipline when you re-theme: swap the
accent, keep the neutrals neutral.

## Typography — five lanes

Type is organized as five deliberate lanes rather than one family:

| Lane | Face | Territory |
|------|------|-----------|
| Persian UI | **Vazirmatn** | The signature face — all Persian interface text |
| Latin UI | Inter Variable | English interface |
| Technical terms | Inter Variable | "API", "SDK" inside Persian sentences stay Latin |
| Code | JetBrains Mono | Keys, endpoints, JSON, tabular IDs |
| Numeric data | Inter / Vazirmatn, `tnum` | KPIs and tables align on tabular figures |

UI text reads a single locale-resolved token, `--font-body`, which follows
the document language automatically. The type scale runs from `--fs-eyebrow`
(11px) to `--fs-display` (48px); headings track tightly and never exceed
weight 600 in Latin; Persian text uses line-height 1.7 and zero negative
tracking.

## Spacing and shape

- **Spacing** — a 4px grid, `--space-1` (4px) through `--space-8` (96px)
- **Radius** — four values only: 6px (controls), 12px (containers), pill
  (badges), 4px (data-dense elements like table hovers and progress fills)
- **Elevation** — hairline rings plus stacked shadows in three levels,
  used exclusively by floating layers

## Motion

Three speeds, and nothing else:

| Token | Duration | Territory |
|-------|----------|-----------|
| `--motion-fast` | 150ms | Hover, focus, tooltips |
| `--motion-normal` | 250ms | Buttons, dropdowns, toasts, modals |
| `--motion-slow` | 400ms | Entrances, drawers — the hard ceiling |

Only `transform` and `opacity` animate, always with the standard easing
`cubic-bezier(.2,.8,.2,1)`. Decorative motion respects
`prefers-reduced-motion`, and directional motion multiplies by `--dir-sign`
so it mirrors correctly in RTL.

## Iconography

Icons come from **Lucide**, tree-shaken through a local registry
(`src/js/components/icons.js`) — the package only ships the glyphs it uses.
Directional icons (chevrons, arrows) register both glyphs and flip with the
document direction; semantic icons never mirror.

## The backdrop

Marketing and auth pages carry an atmospheric backdrop — a fine developer
grid, a controlled accent glow and an infrastructure lattice
(`.backdrop`, variants `--quiet` and `--auth`). The workspace stays a clean,
distraction-free tool. Tune it via `--backdrop-*` tokens and
`src/scss/components/_backdrop.scss`.

## Where everything lives

| Layer | File |
|-------|------|
| Color & surfaces | `src/scss/tokens/_colors.scss` |
| Type lanes & scale | `src/scss/tokens/_typography.scss` |
| Spacing / radius / elevation | `tokens/_spacing.scss`, `_radius.scss`, `_elevation.scss` |
| Motion | `src/scss/tokens/_motion.scss` |
| Component patterns | `src/scss/components/` (one file per pattern) |
| App & marketing shells | `src/scss/layouts/` |

Change tokens, not components — that single rule is what keeps the system
coherent under customization.

---

© Blue Studio — APIForge X is designed and maintained by Blue Studio.
