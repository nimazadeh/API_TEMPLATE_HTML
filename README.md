# APIForge X

**A premium developer-platform HTML template — by [Blue Studio](https://blue-studio.design).**

APIForge X is a production-ready HTML template for API products, developer
platforms, infrastructure tools and SaaS dashboards. It is dark-first,
keyboard-first and **RTL first-class** — the polish of a modern developer
brand, in a package that runs anywhere: unzip it, double-click `index.html`,
and the whole product is live.

Persian (`fa` / RTL) is the default locale with a live switch to English
(`en` / LTR). Two fully-designed themes, self-hosted fonts and deterministic
seeded demo data mean the template runs as a complete product with **no
backend and no external requests**.

---

## Highlights

- **30 HTML pages** — marketing site, full API workspace, developer docs and auth
- **RTL first-class** — logical CSS properties everywhere, LTR isolation for
  code, keys and URLs, Persian digits and Jalali dates
- **Bilingual by design** — Persian and English catalogs with a live language
  and direction switch in every header
- **Dark / Light / System themes** — token-driven, no flash on load, charts
  re-theme live
- **Working product demo** — charts, tables, logs, webhooks, billing and
  settings wired to seeded demo data, with zero backend dependency
- **Keyboard-first workspace** — command palette (⌘/Ctrl K), `g` jumps,
  `/` search, `?` shortcuts help
- **Self-hosted fonts** — Vazirmatn, Inter Variable and JetBrains Mono, fully
  offline-capable
- **Runs from `file://`** — classic deferred script bundles, relative paths,
  no server required for a faithful preview

## What's inside

```
APIForge-X-v1.0.0/
├── index.html               ← open this first
├── *.html                   ← 30 cross-linked pages (flat structure)
├── assets/
│   ├── css/main.css         ← one compiled stylesheet for every page
│   ├── js/                  ← one classic bundle per page
│   └── fonts/               ← self-hosted woff2/woff
├── documentation/           ← getting started, customization, design system…
├── README.md
└── LICENSE.md
```

A separate `APIForge-X-Developer.zip` ships the complete Vite + SCSS source
for deep customization — same product, same design system, editable
end-to-end.

## Quick start

**Preview** — unzip and double-click `index.html`. No server, no npm, no
internet needed.

**Deploy** — upload the folder contents to any static host (cPanel, Nginx,
Netlify, Vercel, object storage). Relative paths make sub-directories and
project pages work untouched.

**Customize** — unzip `APIForge-X-Developer.zip`, then:

```bash
npm install
npm run dev       # live dev server → http://localhost:3000
npm run build     # production build → dist/
```

Start with `documentation/getting-started.md`, then follow
`documentation/customization.md` — every color, font, spacing step and
motion duration is a design token in `src/scss/tokens/`.

## Browser support

Modern evergreen browsers — **Chrome / Edge, Firefox and Safari** (latest
two major versions). The template is built and checked from 320 px to
1920 px, in both themes and both languages. Animations respect
`prefers-reduced-motion`; the system theme follows the OS color scheme.

## Documentation

The `documentation/` folder covers everything you need to make the template
yours:

| Guide | Topic |
|-------|-------|
| `getting-started.md` | First look, hosting, choosing your workflow |
| `installation.md` | Local preview, static hosting, dev environment |
| `file-structure.md` | What every file and folder is for |
| `customization.md` | Tokens, fonts, translations, components, new pages |
| `design-system.md` | Surfaces, typography, spacing, motion — the design language |
| `theme-system.md` | Dark / light / system theming and re-palettes |
| `rtl-guide.md` | The RTL architecture and Persian typography |
| `localization.md` | Working with the fa/en catalogs |

## Credits

| Library / asset | Role |
|-----------------|------|
| [Bootstrap 5.3](https://getbootstrap.com/) | Grid, utilities, forms, interactive components |
| [Chart.js 4](https://www.chartjs.org/) | Dashboard, usage, metrics and rate-limit charts |
| [Lucide](https://lucide.dev/) | Icon system (tree-shaken) |
| [Vazirmatn](https://github.com/rastikerdar/vazirmatn) · [Inter](https://rsms.me/inter/) · [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Self-hosted fonts via [Fontsource](https://fontsource.org/) |
| [Vite](https://vite.dev/) + [Sass](https://sass-lang.com/) | Build toolchain (developer package) |

APIForge X is designed, built and maintained by **Blue Studio**.

## Changelog

### 1.0.0

First public release.

- 30 production HTML pages — marketing, workspace, developer docs and auth
- Persian-first bilingual interface (fa ⇄ en) with live language and
  direction switching, Jalali dates and Persian digits
- Dark / light / system themes with no-flash boot and live chart re-theming
- Self-hosted fonts — zero external requests
- Keyboard-first workspace with command palette
- Deterministic seeded demo data — a complete working demo with no backend

## License

APIForge X is a commercial template. See `LICENSE.md` for the license terms
that came with your purchase. Questions about the template? Use the support
channel of the marketplace where you bought it — the Blue Studio team
monitors it.

---

© 2026 Blue Studio. All rights reserved.
