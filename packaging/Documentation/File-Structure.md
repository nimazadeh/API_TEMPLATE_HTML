# File structure

## Package root

```
APIForge-X/
├── APIForge-X-HTML/          ← production site (upload this folder)
├── APIForge-X-Source/        ← full Vite development source
├── Documentation/            ← buyer guides (this folder)
│   ├── Installation.md
│   ├── Customization.md
│   ├── RTL-Guide.md
│   ├── Theme-System.md
│   └── File-Structure.md
├── marketplace/              ← listing material
│   ├── Product-Description.md
│   ├── Features.md
│   ├── Changelog.md
│   └── Screenshot-Guide.md
├── LICENSE.txt
└── PACKAGE-MANIFEST.json     ← machine-readable inventory + SHA-256
```

---

## APIForge-X-HTML (production)

Flat multi-page site — 30 pages + `assets/`. No Node, no backend.

```
APIForge-X-HTML/
├── index.html … 404.html     30 pages, flat, cross-linked
└── assets/
    ├── *.css                 one compiled design system (tokens + Bootstrap + components)
    ├── *.js                  per-page chunks + shared vendors (Bootstrap, Chart.js)
    └── *.{woff,woff2}        Vazirmatn, Inter Variable, JetBrains Mono
```

- All script/style URLs are **relative** (`./assets/...`) — sub-folder safe.
- Do not edit hashed filenames. To change design, use the source and rebuild.

The 30th-vs-31st page: the source build also emits
`rtl-persian-test.html` — a QA harness used by the test suites. It is
**excluded from the HTML package on purpose**; everything a buyer needs to
see RTL behavior is on `rtl.html`.

## APIForge-X-Source (developers)

```
APIForge-X-Source/
├── *.html                    one file per page (Vite MPA inputs, 31)
├── package.json
├── package-lock.json
├── vite.config.js            multi-page inputs, relative base './'
├── playwright.config.js
├── README.md                 development README
├── tests/                    localization + responsive Playwright suites
├── scripts/generate-mock-data.mjs
├── docs/
│   ├── localization.md
│   └── product/              IA, design direction (context, not runtime)
├── LICENSE.txt
└── src/
    ├── locales/              fa.json, en.json
    ├── scss/
    │   ├── tokens/           colors, typography, spacing, radius, motion, z…
    │   ├── vendor/           Bootstrap import
    │   ├── base/             reset, typography, fonts, utilities, BS bridge
    │   ├── components/       one file per pattern (buttons, tables, modal…)
    │   ├── layouts/          app shell, header, sidebar, mobile nav, site
    │   ├── pages/            page-specific rules
    │   └── main.scss
    └── js/
        ├── core/             bootstrap.js (ESM imports), i18n.js
        ├── components/       shell, theme, palette, charts, toast, motion…
        ├── data/             mock JSON + per-locale docs content
        ├── pages/            per-page entries
        ├── utils/format.js   dates, digits, numbers (Intl)
        ├── main.js           boot() — app pages
        └── site.js           bootSite() — marketing pages
```

### What to edit vs what to regenerate

| Task | Location |
|------|----------|
| Colors / type / motion / theme | `src/scss/tokens/` |
| Component look | `src/scss/components/` |
| Shell / navigation look | `src/scss/layouts/` |
| Copy (fa/en) | `src/locales/*.json` |
| Long-form docs | `src/js/data/docs-content.{fa,en}.js` |
| Sidebar links | each page's `<nav class="sidebar-nav">` + `src/js/data/commands.js` |
| Mock datasets | `scripts/generate-mock-data.mjs` → run it (never hand-edit `mock-*.json`) |
| Icons | `src/js/components/icons.js` (tree-shaken registry) |
| Production files | `npm run build` → replace `APIForge-X-HTML/` with `dist/` (minus the QA harness) |

## Marketplace folder

- `Product-Description.md` — paste-ready listing copy (English + Persian),
  requirements, technologies, FAQ
- `Features.md` — feature list and the full page inventory
- `Changelog.md` — buyer-facing release notes
- `Screenshot-Guide.md` — how the listing screenshots are captured and what
  each shot must show
