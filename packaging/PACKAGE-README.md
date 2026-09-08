# APIForge X v1.0.0

Premium HTML template for API platforms (AI APIs, infrastructure APIs, BaaS, developer SaaS). Dark-first, keyboard-first, **Persian RTL first-class**, bilingual fa ⇄ en.

این بسته برای فروش در **راست‌چین** آماده است: نسخه HTML آمادهٔ آپلود و نسخه سورس Vite.

---

## What is in this package

```
APIForge-X/
├── Documentation/     Buyer guides + marketplace listing copy
├── HTML-Version/      Production static site (upload this folder)
├── Source-Version/    Full Vite / SCSS / JS source
├── Assets/            Listing screenshots (1440×900)
├── CHANGELOG.md
├── LICENSE.txt
└── README.md          This file
```

| Folder | Who it is for | Needs Node? |
|--------|----------------|-------------|
| `HTML-Version/` | Hosting, cPanel, Nginx, Netlify, any static host | No |
| `Source-Version/` | Designers and developers who will customize tokens, pages, or copy | Yes (`npm`) |

---

## HTML Version (fastest path)

1. Open `HTML-Version/index.html` in a browser, **or** upload the **entire** `HTML-Version` folder to your host.
2. Keep the `assets/` folder next to the HTML files. Paths are relative (`./assets/...`) and work from a sub-directory.
3. There is no PHP, database, or environment file.

Local preview without Node:

```bash
cd HTML-Version
python3 -m http.server 8080
# open http://127.0.0.1:8080/
```

---

## Source Version

```bash
cd Source-Version
npm install
npm run dev       # http://localhost:3000
npm run build     # writes dist/
npm run preview   # serve the production build
```

Requires **Node.js 20+**. See `Documentation/Source-Version.md` and `Documentation/Installation.md`.

---

## Documentation index

| File | Topic |
|------|--------|
| `Documentation/Installation.md` | Hosting the HTML build and running the source |
| `Documentation/File-Structure.md` | Map of both packages |
| `Documentation/Customization.md` | Colors, fonts, copy, nav |
| `Documentation/Theme.md` | Dark / light / system |
| `Documentation/RTL.md` | Persian RTL and LTR isolation |
| `Documentation/Adding-Pages.md` | New pages in the Vite source |
| `Documentation/HTML-Version.md` | Production package notes |
| `Documentation/Source-Version.md` | Developer workflow |
| `Documentation/Marketplace/` | Listing description, features, pages, FAQ |

---

## Pages (31)

Workspace: dashboard, apis, endpoints, api-keys, logs, webhooks, errors, rate-limits, usage, environments, metrics, team, billing, settings, profile, notifications.

Docs: docs, sdk, api-reference.

Marketing: index, pricing, changelog, status, 404.

Auth: login, forgot-password, invite.

Foundation / QA: style-guide, rtl, rtl-persian-test, visual-showcase.

Full table: `Documentation/Marketplace/Pages.md`.

---

## Stack

HTML5 · Bootstrap 5.3 · SCSS tokens · Vite 7 · Lucide · Chart.js · Popper · Vazirmatn · Inter Variable · JetBrains Mono.

No React, no Tailwind, no CDN fonts.

---

## License

See `LICENSE.txt`. Regular and Extended terms. Open-source third-party libraries keep their own licenses.

This template uses **mock data and simulated auth**. It is not a live API, billing, or identity backend.

---

## Version

**1.0.0** — 8 September 2026
