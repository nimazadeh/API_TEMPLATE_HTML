# APIForge X v1.0.0 — Premium Developer API Platform HTML Template

Dark-first, keyboard-first, **RTL first-class** HTML template for API
platforms (AI APIs, infra APIs, BaaS, SaaS dev tools). Persian-first and
bilingual (fa ⇄ en), with **31 pages**, 22+ seeded datasets,
two themes (dark/light/system), token-driven SCSS and self-hosted fonts
(Vazirmatn, Inter Variable, JetBrains Mono) — no CDN, no backend.

## What is inside

| Item | Description |
|------|-------------|
| `APIForge-X-Preview/` (+ `.zip`) | **Instant preview** — unzip, double-click `index.html`. Runs from `file://` with no npm and no server. Bundled classic JS, one standalone CSS, local fonts. |
| `APIForge-X-Developer/` (+ `.zip`) | **Original Vite source** — `src/`, `package.json`, `vite.config.js`, `docs/`, tests. `npm install && npm run dev`. |
| `Documentation/` | Buyer guides — Installation, File structure, Preview getting-started, Customization, RTL, Theme system. |
| `PACKAGE-MANIFEST.json` | Inventory of every shipped file with SHA-256 checksums. |

## Preview in 10 seconds

1. Unzip `APIForge-X-Preview.zip`.
2. Double-click `index.html`.

Done — no tools, no server, no CORS/module errors (all scripts are classic
bundles, all assets relative and local).

## Customize

```bash
unzip APIForge-X-Developer.zip
cd APIForge-X-Developer
npm install
npm run dev        # http://localhost:3000
npm run build      # → dist/ (static site)
```

Node.js 20+, npm 10+. No backend, database or host-side build step.

## Browser support

Modern evergreen browsers (Chrome/Edge, Firefox, Safari). RTL, themes and
animations respect `prefers-reduced-motion` and system settings.

## QA

`VERIFICATION.md` (when present) records the automated release audit: every
page opened from a clean unzip over `file://`, CSS/JS/fonts verified,
console free of errors and CORS warnings.
