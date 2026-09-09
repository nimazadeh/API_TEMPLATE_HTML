# APIForge X v1.0.0

**Premium Developer API Platform HTML Template.**

A production-ready SaaS/API dashboard template built for:

- **AI APIs**
- **Developer platforms**
- **Infrastructure products**
- **SaaS applications**

APIForge X is a dark-first, keyboard-first, **RTL first-class** HTML template in
the spirit of Stripe, Resend, Vercel and Linear — not a generic admin panel.
Every page ships Persian-first (`fa` / RTL) with a live switch to English
(`en` / LTR), two fully-designed themes, self-hosted fonts and deterministic
seeded demo data, so the template runs as a complete product with **no backend
dependency**.

---

## Main features

- **31 HTML pages** — workspace, developer docs, marketing and auth surfaces
- **RTL first-class support** — logical CSS properties everywhere, LTR isolation
  for code/keys/URLs, Persian digits and Jalali dates
- **Persian + English localization** — ~1,347 translation keys, live language
  and direction switch in every header
- **Dark / Light / System themes** — token-driven, no-flash boot, charts
  re-theme live
- **Keyboard-first UX** — command palette (`⌘K` / `Ctrl+K`), `g` page jumps,
  `?` shortcuts help, `/` search
- **Token-based SCSS architecture** — every color, radius, shadow, spacing and
  motion value is a design token
- **Self-hosted fonts** — Vazirmatn, Inter Variable and JetBrains Mono ship
  inside the package; no CDN, no external requests
- **No backend dependency** — deterministic mock data powers a fully working
  demo out of the box
- **Vite powered workflow** — instant dev server, fast production builds,
  relative asset paths (sub-folder / shared-hosting safe)

### Page inventory

| Group | Pages |
|-------|-------|
| Workspace | `dashboard`, `apis`, `endpoints`, `api-keys`, `logs`, `webhooks`, `errors`, `rate-limits`, `usage`, `metrics`, `environments` |
| Account | `team`, `billing`, `settings`, `profile`, `notifications` |
| Developer docs | `docs`, `sdk`, `api-reference` |
| Marketing | `index` (landing), `pricing`, `changelog`, `status`, `404` |
| Auth | `login`, `forgot-password`, `invite` |
| Design & QA | `style-guide`, `rtl`, `rtl-persian-test`, `visual-showcase` |

---

## Installation guide

The package ships in two flavors — pick the one that matches your goal:

| Package | Needs Node.js? | For |
|---------|----------------|-----|
| `APIForge-X-Preview.zip` | No | Instant preview + static hosting. Unzip, double-click `index.html`. |
| `APIForge-X-Developer.zip` | Yes (Node 20+) | Customization: colors, fonts, copy, pages, components. |

### Preview instructions (no tools required)

1. Unzip `APIForge-X-Preview.zip`.
2. Open the `APIForge-X-Preview/` folder.
3. **Double-click `index.html`.**

That is all. The preview package runs directly from the file system
(`file://`) — **no npm, no local server, no internet connection**. All 31
pages work, including fonts, themes, RTL and every demo interaction:

- JavaScript is bundled into one classic (non-module) script per page, so
  there are **no ES-module CORS errors** from `file://`.
- One standalone stylesheet (`assets/css/main.css`) styles every page —
  **no missing CSS**.
- All fonts are local (`assets/fonts/`) — **no missing fonts**.
- The preview package also uploads as-is to any static host (cPanel,
  Netlify, Vercel, Nginx, GitHub Pages).

### Developer setup

```bash
unzip APIForge-X-Developer.zip
cd APIForge-X-Developer

npm install     # install dependencies
npm run dev     # dev server → http://localhost:3000
npm run build   # production build → dist/ (plain HTML/CSS/JS)
npm run preview # serve the production build locally
```

Requirements: **Node.js 20+ and npm 10+**. The build output is a plain static
site — no backend, no database, no host-side build step.

---

## File structure

### Release package

```
APIForge-X-v1.0.0/
├── APIForge-X-Preview.zip      ← instant preview — double-click index.html
├── APIForge-X-Developer.zip    ← full Vite development source
├── Documentation/              ← buyer guides (installation, customization,
│                                  RTL, theme system, file structure)
├── README.md                   ← this file
├── VERIFICATION.md             ← automated release QA report
└── PACKAGE-MANIFEST.json       ← file inventory + SHA-256 checksums
```

### Preview package (static, server-less)

```
APIForge-X-Preview/
├── index.html                  ← open this (double-click)
├── *.html                      ← all 31 pages
├── assets/
│   ├── css/main.css            ← one standalone stylesheet for every page
│   ├── js/<page>.js            ← one classic bundle per page (no modules)
│   └── fonts/                  ← Vazirmatn, Inter Variable, JetBrains Mono
└── README.md
```

### Developer package (Vite source)

```
APIForge-X-Developer/
├── package.json                ← scripts: dev / build / preview / test
├── package-lock.json
├── vite.config.js              ← multi-page build config (31 page inputs)
├── playwright.config.js        ← QA suites
├── index.html, *.html          ← page markup (31 pages)
├── src/
│   ├── js/                     ← core, components, page entries, mock data
│   ├── locales/                ← fa.json + en.json (~1,347 keys each)
│   └── scss/                   ← token-driven SCSS (main.scss → one CSS)
├── scripts/                    ← mock-data generators
├── tests/                      ← Playwright QA suites
├── docs/                       ← product & localization documentation
└── README.md
```

---

## Customization guide

All visual decisions live in **SCSS design tokens** — never scatter hex colors
in page CSS. Change the token, rebuild, done. Highlights (see
`Documentation/Customization.md` for the full guide):

| What | Where |
|------|-------|
| Colors (dark) | `src/scss/tokens/_colors.scss` → `:root` |
| Colors (light) | `src/scss/tokens/_colors.scss` → `[data-theme="light"]` |
| Accent | `--accent` + `--accent-rgb` — buttons, focus rings, charts and the marketing glow all follow |
| Type scale & fonts | `src/scss/tokens/_typography.scss` |
| Radius, borders, elevation | `src/scss/tokens/_radius.scss`, `_borders.scss`, `_elevation.scss` |
| Motion | `src/scss/tokens/_motion.scss` (`--motion-fast/normal/slow`) |
| Translations | `src/locales/fa.json`, `src/locales/en.json` |
| Demo data | `src/js/data/mock-*.json` (+ `.en.json` variants) |

Bootstrap 5 utilities are bridged to the token system
(`src/scss/base/_bootstrap-overrides.scss`), so `.bg-body`, `.text-primary`
and friends stay theme-aware automatically.

---

## RTL support

RTL is a first-class layout, not an afterthought:

- Persian (`fa`) with `dir="rtl"` is the **default locale**; English flips to
  LTR live from any header.
- All layout CSS uses **logical properties** (`margin-inline`, `padding-block`,
  `inset-inline-start`, …) — the sidebar, drawers, chevrons and progress
  indicators mirror automatically.
- **LTR isolation** for code blocks, API keys, URLs, HTTP methods and JSON —
  mixed-direction content never breaks.
- Persian digits and **Jalali dates** in the fa locale; Latin digits in en.
- `rtl.html` and `rtl-persian-test.html` ship as dedicated RTL QA harnesses.

## Theme system

Three modes — **dark**, **light** and **system** — selectable from every
header:

- A no-flash inline boot script resolves the theme before first paint
  (respects the OS `prefers-color-scheme` when mode = system).
- Both themes are fully designed (not a filter): surfaces, charts, code
  blocks, syntax highlighting and the marketing backdrop all re-map.
- Charts re-theme live via a `afx:theme` event — no reload needed.
- The choice persists across pages and sessions (`localStorage`).

## Fonts

All fonts are **self-hosted** inside the package (Fontsource, no CDN, no
external requests — the template works fully offline):

| Font | Used for |
|------|----------|
| **Vazirmatn** (300–700) | Persian UI — body, headings, controls (fa/RTL) |
| **Inter Variable** | Latin UI (en/LTR) |
| **JetBrains Mono** (400/500) | Code, API keys, IDs, tabular data |

The `--font-body` token resolves per locale automatically.

---

## Browser support

Modern evergreen browsers: **Chrome / Edge, Firefox and Safari** (latest two
major versions). The template is verified at 320–1920px, in both themes and
both locales. Animations respect `prefers-reduced-motion`; themes respect the
OS color scheme. Internet Explorer is not supported.

## Credits

| Library / asset | Role |
|-----------------|------|
| [Bootstrap 5.3](https://getbootstrap.com/) | Grid, utilities, forms, interactive components |
| [Chart.js 4](https://www.chartjs.org/) | Dashboard, usage, metrics and rate-limit charts |
| [Lucide](https://lucide.dev/) | Icon system (tree-shaken) |
| [Vazirmatn](https://github.com/rastikerdar/vazirmatn) · [Inter](https://rsms.me/inter/) · [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Self-hosted fonts via Fontsource |
| [Vite 7](https://vite.dev/) + [Sass](https://sass-lang.com/) | Build toolchain |
| [Playwright](https://playwright.dev/) | Release QA test suites |

## Changelog

### 1.0.0 — 2026-09-09

First public marketplace release.

- 31 production HTML pages (workspace, developer docs, marketing, auth,
  design/QA harnesses).
- Persian-first bilingual UI (fa ⇄ en, ~1,347 keys) with live language and
  direction switching, Jalali dates and Persian digits.
- Dark / light / system themes with no-flash boot and live chart re-theming.
- Self-hosted Vazirmatn / Inter Variable / JetBrains Mono — zero external
  requests.
- Keyboard-first workspace: command palette, `g` jumps, `?` help, `/` search.
- Deterministic seeded mock data — a complete working demo with no backend.
- **Hotfixes included:** Chart.js hover crash (`this._fn is not a function`)
  fixed by merging — not replacing — animation defaults; preview package
  build fixes (classic script bundles, no ES-module CORS from `file://`);
  CSS loading fixes (single standalone stylesheet, relative font URLs);
  font loading fixes (locale-resolved `--font-body`, Vazirmatn weight 600).
- Release QA: 205 automated Playwright checks + per-page `file://` sweep of
  the preview package (see `VERIFICATION.md`).

## Support information

- **Documentation** — the `Documentation/` folder covers installation,
  customization, RTL, the theme system and file structure. Start with
  `Documentation/Installation.md`.
- **Questions / bug reports** — use the comments/questions section of the
  marketplace listing where you purchased APIForge X (Rastchin / RTL-Theme).
  Include the package version (see `PACKAGE-MANIFEST.json`) and your browser.
- **Customization services** — minor color/copy tweaks are covered by the
  docs; larger integrations are available from the author via the marketplace
  author page.

---

© 2026 APIForge X. Commercial template — see `LICENSE.txt` (inside both zip
packages) for the license terms that came with your purchase.
