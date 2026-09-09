# Installation guide

APIForge X ships two packages — pick the one that matches your goal:

| Path | Folder | Needs Node? | For |
|------|--------|-------------|-----|
| A — instant preview | `APIForge-X-Preview/` | No | Seeing the template now: unzip, double-click `index.html`. Works from `file://` — no server, no npm. Also uploadable to any static host (cPanel, Netlify, Vercel, Nginx). |
| B — customize | `APIForge-X-Developer/` | Yes (Node 20+) | Changing colors, fonts, copy, pages, components. |

## A. Instant preview (no tools)

1. Unzip `APIForge-X-Preview.zip`.
2. Double-click `index.html` inside `APIForge-X-Preview/`.
3. Browse the 31 pages; switch language (فارسی / EN) and theme from
   any page header.

The preview package is fully self-contained: bundled classic JavaScript,
one standalone CSS file, and all fonts stored locally under `assets/`.
No console CORS or module errors can occur because nothing is loaded as a
module and no remote resources are used.

## B. Development workflow (Vite source)

1. Unzip `APIForge-X-Developer.zip`.
2. Open a terminal in `APIForge-X-Developer/`:

```bash
npm install
npm run dev       # http://localhost:3000 — live preview
npm run build     # production build → dist/ (static site)
npm run preview   # serve the built dist/
```

Requirements: Node.js 20+ and npm 10+. The template needs no backend, no
database and no build step on the hosting side — `npm run build` output is
plain HTML/CSS/JS that any static host can serve.

See `Customization.md`, `RTL-Guide.md`, `Theme-System.md` and
`File-Structure.md` for the rest.
