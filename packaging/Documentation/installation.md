# Installation

APIForge X needs no database, no backend and no build step to run — it is a
static HTML template. How far you go depends on what you want to change.

---

## Path A — Run the template (no tools needed)

### Locally

1. Unzip `APIForge-X.zip`.
2. Open the extracted folder and double-click `index.html`.

The site opens over the local file system (`file://`) with full styling,
fonts, charts, themes and both languages. Scripts are shipped as regular
(classic) deferred bundles — not ES modules — so browsers apply no
cross-origin restrictions and no console errors appear.

### On a host

Upload **the contents of** the extracted folder (the HTML files and the
`assets/` folder together) to your web space:

**cPanel / shared hosting** — copy everything into `public_html`, or into a
sub-directory such as `public_html/api/`. If your control panel allows a
custom 404 document, point it at the included branded `404.html`.

**Nginx**

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

**Netlify / Vercel / GitHub Pages / object storage** — deploy the folder as a
static site. All asset URLs are relative (`./assets/…`), so sub-paths and
project pages work with zero configuration.

> Always upload the HTML files and `assets/` from the same package together.
> The files inside `assets/` use content-hashed names; never mix or rename
> them.

## Path B — Customize from source (Vite)

Use `APIForge-X-Developer.zip` when you want to change design tokens,
components, translations or add pages.

### Requirements

- Node.js **20 or newer** (npm 10+ ships with it)
- No other services — no database, no backend

### Set up

```bash
# unzip APIForge-X-Developer.zip, then:
cd APIForge-X-Developer
npm install
npm run dev        # dev server → http://localhost:3000
```

### Everyday commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Live-reload dev server at `localhost:3000` |
| `npm run build` | Production build → `dist/` (plain HTML/CSS/JS) |
| `npm run preview` | Serve the production build at `localhost:4173` |

The output of `npm run build` in `dist/` is the same kind of static site as
the ready-to-run package — upload it to any host, or replace the contents of
your existing deployment with it.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Page loads without styles | The `assets/` folder is missing or not next to the HTML files — move them together |
| Fonts render as system fallback | `assets/fonts/` is incomplete — re-upload the full `assets/` folder |
| 404s on deep links (Nginx) | Add the `try_files` rule shown above |
| Charts or icons missing locally | Make sure you opened the page from the unzipped folder, not from inside the archive |

---

© Blue Studio — APIForge X is designed and maintained by Blue Studio.
