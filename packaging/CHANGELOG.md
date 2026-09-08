# Changelog — APIForge X

All notable releases of the commercial template.

## 1.0.0 — 2026-09-08

First public marketplace release.

### Typography (Persian-first)

- **Vazirmatn is the primary Persian face across every UI lane.** A
  locale-resolved `--font-body` token (Vazirmatn in `fa`/`rtl`, Inter
  Variable in `en`/`ltr`) now drives body text, display headlines, form
  controls, dropdowns and Bootstrap's body font — previously several lanes
  (body, hero display, numerics, inputs, selects) were pinned to the Latin
  face and fell back to system fonts for Persian glyphs.
- Vazirmatn self-hosted at weights **300 / 400 / 500 / 600 / 700** (arabic,
  latin, latin-ext subsets); weight 600 added for Persian headings and
  buttons.
- Persian adjustments kept: `line-height 1.7`, zero negative letter-spacing
  under `[dir='rtl']`, LTR isolation for code/keys/URLs, Persian digits and
  Jalali dates.

### Product

- 30 production HTML pages in the HTML package (workspace, developer docs,
  marketing, auth, showcase); the RTL QA harness
  (`rtl-persian-test.html`) ships in the source build only, for the test
  suites.
- Persian-first bilingual UI (fa ⇄ en) with live language and direction
  switch, ~1,347 translation keys
- Dark, light, and system themes with a no-flash boot script
- RTL as a first-class layout (logical CSS properties, LTR isolation for
  code/keys/URLs)
- Self-hosted fonts: Vazirmatn, Inter Variable, JetBrains Mono — no CDN
- Keyboard-first workspace: command palette (⌘K / Ctrl+K), `g` jumps, `?`
  help, `/` search
- Deterministic mock data for a working demo without a backend

### Workspace

- Overview dashboard with KPIs, charts, and activity
- API explorer with request tester
- Endpoint management, API keys (reveal-once / rotate / revoke)
- Request logs with inspector and copy-as-cURL
- Webhook debugger with delivery timeline
- Errors, rate limits, usage, metrics, environments
- Team, billing, settings, profile, notifications

### Marketing & auth

- Landing, pricing, changelog, status, 404
- Login, forgot password, invite (simulated)

### Package structure

```
APIForge-X/
├── APIForge-X-HTML/          30-page production site + assets/
├── APIForge-X-Source/        full Vite development source
├── Documentation/            Installation, Customization, RTL-Guide,
│                             Theme-System, File-Structure
├── marketplace/              Product-Description, Features, Changelog,
│                             Screenshot-Guide
├── LICENSE.txt
└── PACKAGE-MANIFEST.json     inventory + SHA-256 per file
```

- Production build uses relative asset paths (`base: './'`) — sub-folder and
  shared-hosting safe; verified page-by-page (all HTML/CSS/JS/font
  references resolve, no 404s, no absolute paths, no localhost URLs).

### Developer package

- Vite 7 + Bootstrap 5.3 + SCSS token system
- Tree-shaken Lucide and Chart.js
- HTML production build with relative asset paths (`base: './'`)

### Quality

- 197 Playwright tests covering localization, interaction, and responsive
  layout (Chromium, 320–1920px). Safari / Firefox / physical devices are not
  certified.
- Release QA: per-page asset-reference audit, CSS/JS/font integrity,
  static-server smoke test of all 30 pages, dev-file exclusion check — see
  `RELEASE-VERIFICATION.md` (generated each release).
