# File structure

Your download contains two independent packages. They describe the same
product from two angles: finished files, and the source that produces them.

```
APIForge-X-v1.0.0/                 ← in APIForge-X.zip — ready to run
├── index.html                     ← landing page — start here
├── *.html                         ← 30 pages in total (flat, cross-linked)
├── assets/
│   ├── css/main.css               ← one compiled stylesheet for every page
│   ├── js/<page>.js               ← one classic (deferred) bundle per page
│   └── fonts/                     ← Vazirmatn, Inter Variable, JetBrains Mono
├── documentation/                 ← the guides you are reading
├── README.md
└── LICENSE.md
```

The page set covers four surfaces:

- **Marketing** — landing, pricing, changelog, status, 404
- **Workspace** — dashboard, APIs, API keys, endpoints, logs, errors,
  webhooks, usage, metrics, rate limits, environments, team, billing,
  settings, profile, notifications
- **Developer docs** — docs, SDK, API reference
- **Reference & auth** — style guide, RTL demo, visual showcase,
  login, forgot password, invite

Everything is flat and cross-linked with relative URLs (`./dashboard.html`),
so the folder works from `file://`, from any sub-directory, and behind any
static host.

```
APIForge-X-Developer/              ← in APIForge-X-Developer.zip — source
├── *.html                         ← the same 30 pages, Vite MPA inputs
├── package.json                   ← scripts: dev / build / preview
├── vite.config.js                 ← multi-page config, relative base
├── src/
│   ├── js/
│   │   ├── core/                  ← bootstrap.js (app entry), i18n.js
│   │   ├── components/            ← shell, theme, charts, palette, toast…
│   │   ├── data/                  ← seeded demo fixtures (mock-*.json)
│   │   ├── pages/                 ← one entry per page
│   │   ├── utils/                 ← dates, digits, number formatting
│   │   ├── main.js                ← boot() for workspace pages
│   │   └── site.js                ← bootSite() for marketing pages
│   ├── locales/                   ← fa.json + en.json translation catalogs
│   └── scss/
│       ├── tokens/                ← colors, typography, spacing, radius…
│       ├── vendor/                ← Bootstrap import layer
│       ├── base/                  ← reset, typography, fonts, BS bridge
│       ├── components/            ← one partial per UI pattern
│       ├── layouts/               ← app shell, sidebar, header, mobile nav
│       ├── pages/                 ← page-specific rules
│       └── main.scss              ← single entry → assets/css/main.css
├── documentation/                 ← same guides as the main package
├── README.md
└── LICENSE.md
```

## What to edit vs what to regenerate

| Goal | Touch |
|------|-------|
| Copy, links, page content | The `.html` files (either package) |
| Colors, type, spacing, motion | `src/scss/tokens/` (developer package) |
| Components and layout | `src/scss/components/`, `src/scss/layouts/` |
| Behavior, charts, data wiring | `src/js/` |
| UI text, both languages | `src/locales/fa.json` + `src/locales/en.json` |
| Demo data | `src/js/data/mock-*.json` (+ `.en.json` counterparts) |

Changes made in the developer package become a ready-to-run site via
`npm run build` (output in `dist/`). Never hand-edit the hashed files inside
`assets/` — they are regenerated on every build.

---

© Blue Studio — APIForge X is designed and maintained by Blue Studio.
