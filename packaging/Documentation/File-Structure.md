# File structure

## Package root

```
APIForge-X/
├── Documentation/
├── HTML-Version/
├── Source-Version/
├── Assets/
├── CHANGELOG.md
├── LICENSE.txt
└── README.md
```

---

## HTML-Version (production)

Flat multi-page site. Hashed CSS/JS/fonts live in `assets/`.

```
HTML-Version/
├── index.html
├── dashboard.html
├── … (all 31 pages)
└── assets/
    ├── *.css          compiled design system (Bootstrap + tokens)
    ├── *.js           per-page chunks + shared vendors
    └── *.{woff,woff2} Vazirmatn, Inter, JetBrains Mono
```

Do not edit hashed filenames. To change design, use **Source-Version** and rebuild.

---

## Source-Version (developers)

```
Source-Version/
├── *.html                 one file per page (Vite MPA inputs)
├── package.json
├── package-lock.json
├── vite.config.js         multi-page inputs, relative base `./`
├── playwright.config.js
├── tests/                 localization + responsive suites
├── scripts/generate-mock-data.mjs
├── docs/
│   ├── localization.md
│   └── product/           product intelligence (IA, design direction)
└── src/
    ├── locales/           fa.json, en.json
    ├── scss/
    │   ├── tokens/        colors, type, space, motion, elevation
    │   ├── vendor/        Bootstrap import
    │   ├── base/
    │   ├── components/
    │   ├── layouts/
    │   ├── pages/
    │   └── main.scss
    └── js/
        ├── core/          bootstrap.js, i18n.js
        ├── components/    shell, theme, palette, charts, toast, …
        ├── data/          mock JSON + docs content
        ├── pages/         per-page entries
        ├── utils/format.js
        ├── main.js        boot() for app pages
        └── site.js        bootSite() for marketing pages
```

### What to edit vs what to regenerate

| Task | Location |
|------|----------|
| Colors / type / motion | `src/scss/tokens/` |
| Component look | `src/scss/components/` |
| Copy (fa/en) | `src/locales/*.json` |
| Sidebar links | each page’s `<nav class="sidebar-nav">` + `src/js/data/commands.js` |
| Mock datasets | `scripts/generate-mock-data.mjs` then run the script — do not hand-edit `mock-*.json` |
| Icons | `src/js/components/icons.js` (tree-shaken registry) |
