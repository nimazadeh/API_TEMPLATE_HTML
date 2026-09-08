# Installation guide

Two paths, pick the one that matches your goal:

| Path | Folder | Needs Node? | For |
|------|--------|-------------|-----|
| A — publish / demo | `APIForge-X-HTML/` | No | cPanel, shared hosting, Nginx, Netlify, Vercel, any static host |
| B — customize | `APIForge-X-Source/` | Yes (Node 20+) | Changing colors, fonts, copy, pages, components |

---

## Path A — HTML production package (no Node)

`APIForge-X-HTML/` is a flat, self-contained static site: 30 HTML pages plus
one `assets/` folder with the compiled CSS, per-page JS chunks and all fonts
(Vazirmatn, Inter Variable, JetBrains Mono). No backend, no database, no
build step — the demo data is bundled into the JS.

### Any host (cPanel / shared hosting)

1. Upload **the contents of** `APIForge-X-HTML/` (the HTML files and the
   `assets/` folder together) into `public_html` or a sub-directory such as
   `public_html/api/`.
2. Do **not** rename the hashed files inside `assets/` and do not mix files
   from different builds.
3. Open the site over **http(s)**.

Optionally point your host's 404 document at `404.html` (it is a branded
page) if the control panel allows it.

### Sub-folders and project pages

The build uses **relative** asset URLs (`./assets/...`), so the site works
in a sub-directory, on GitHub Pages project sites, or behind any path prefix
without configuration changes.

### Nginx example

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/apiforge-x;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Netlify / Vercel / GitHub Pages / object storage

Deploy the `APIForge-X-HTML` folder as a static site. Nothing to configure —
relative paths make sub-paths work as-is.

### Running it locally (fastest check)

ES modules are loaded from relative URLs; modern browsers require a real
origin, so serve the folder instead of double-clicking `index.html`:

```bash
# Python 3
cd APIForge-X-HTML
python3 -m http.server 8080
# → http://localhost:8080/

# or Node
npx serve APIForge-X-HTML
```

> **Note on `file://`:** Chrome and Safari block ES module scripts from
> `file://`; Firefox generally allows them. For a reliable local preview, use
> the one-line static servers above.

---

## Path B — Developer source (Vite)

Use `APIForge-X-Source/` to change tokens, add pages, edit copy or
components, then rebuild the production files.

### Requirements

- Node.js **20 or newer**
- npm 10+ (ships with Node)
- Optional: Chromium for the Playwright test suites

### Install, develop, build

```bash
cd APIForge-X-Source
npm install
npm run dev        # dev server → http://localhost:3000
npm run build      # production output → dist/
npm run preview    # serve dist/ → http://localhost:4173
```

Useful extras:

| Command | Purpose |
|---------|---------|
| `npm test` | Full Playwright suite (needs Chromium) |
| `npm run test:i18n` | Localization + translation-catalog tests |
| `npm run test:responsive` | Responsive layout matrix |
| `node scripts/generate-mock-data.mjs` | Regenerate deterministic mock data |

### Shipping changes back to the HTML package

```bash
npm run build
# replace the contents of APIForge-X-HTML/ with the contents of dist/
# (and delete dist/rtl-persian-test.html — it is a QA harness, source-only)
```

Never hand-edit hashed files inside `assets/` — rebuild instead.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Page loads without styles | `assets/` is missing or next to the HTML in a different folder — upload the whole folder contents together |
| Fonts render as system fallback | `assets/*.woff2` missing — re-upload the complete `assets/` folder |
| 404 on deep links (Nginx) | Use the `try_files` rule above |
| Mixed assets (old + new) | Clear your host's cache and re-upload the full `assets/` folder from one build |
