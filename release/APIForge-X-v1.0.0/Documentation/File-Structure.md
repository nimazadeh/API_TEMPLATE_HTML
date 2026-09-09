# File structure

## Release package root

```
APIForge-X-v1.0.0/
├── APIForge-X-Preview.zip      ← standalone preview — unzip, double-click index.html
├── APIForge-X-Developer.zip    ← full Vite development source (edit here)
├── Documentation/              ← buyer guides (this folder)
├── README.md                   ← package overview
├── VERIFICATION.md             ← automated release QA report
└── PACKAGE-MANIFEST.json       ← file inventory + SHA-256 checksums
```

Unzipping `APIForge-X-Preview.zip` creates one `APIForge-X-Preview/` folder;
unzipping `APIForge-X-Developer.zip` creates one `APIForge-X-Developer/`
folder. `LICENSE.txt` ships inside both zip packages.

## APIForge-X-Preview (static, server-less)

```
APIForge-X-Preview/
├── index.html                ← open this (double-click)
├── *.html                    ← 31 pages in total, Persian-first
├── assets/
│   ├── css/main.css          ← one standalone stylesheet for every page
│   ├── js/<page>.js          ← one classic bundle per page (no modules)
│   └── fonts/                ← Vazirmatn, Inter Variable, JetBrains Mono
├── LICENSE.txt
└── README.md
```

All references inside HTML, CSS and JS are relative. Opening `index.html`
from the file system (`file://`) requires no server and triggers no module
or CORS restrictions.

## APIForge-X-Developer (Vite source)

```
APIForge-X-Developer/
├── package.json              ← scripts: dev / build / preview / test
├── package-lock.json
├── vite.config.js            ← multi-page build config (31 page inputs)
├── playwright.config.js      ← QA suites
├── index.html, *.html        ← page markup (31 pages incl. QA harnesses)
├── src/
│   ├── js/                   ← core, components, page entries, mock data
│   ├── locales/              ← fa.json + en.json (≈1,347 keys each)
│   └── scss/                 ← token-driven SCSS (main.scss → one CSS)
├── scripts/                  ← mock-data generators
├── tests/                    ← Playwright suites
├── docs/                     ← product & localization documentation
├── LICENSE.txt
└── README.md
```

To rebuild the preview-style static output: `npm install && npm run build`,
then serve `dist/` on any static host.
