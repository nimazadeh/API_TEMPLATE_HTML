# Installation guide

## Option A — HTML production package (no Node)

Use `HTML-Version/` when you only need to publish or demo the template.

1. Copy every file inside `HTML-Version/` to your web root (or a sub-folder).
2. Confirm `index.html` and the `assets/` directory sit together.
3. Open the site over **http(s)**. Some browsers restrict ES modules on `file://`; a simple static server is safer.

### cPanel / shared hosting

Upload the contents of `HTML-Version/` (not the parent `APIForge-X` folder) into `public_html` or a sub-directory. Do not rename hashed files inside `assets/`.

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

`404.html` is a branded page. Point your host’s 404 document to it if the control panel allows it.

### Netlify / Vercel / GitHub Pages

Deploy the `HTML-Version` folder as a static site. The build already uses relative URLs (`./assets/...`), so project sites and sub-paths work.

---

## Option B — Developer source (Vite)

Use `Source-Version/` to change tokens, add pages, or regenerate mock data.

### Requirements

- Node.js **20 or newer**
- npm 10+ (ships with Node)

### Install and develop

```bash
cd Source-Version
npm install
npm run dev
```

Vite serves on `http://localhost:3000` (all interfaces). Edit HTML under the project root and styles/scripts under `src/`.

### Production build from source

```bash
npm run build
```

Output is `dist/`. Upload that folder the same way as `HTML-Version/` (they are equivalent after a clean build).

```bash
npm run preview
```

Serves the production output locally.

### Optional tests

```bash
npx playwright install chromium
npm test
```

Requires a local Chromium. Tests are not required to use or sell an end product.

---

## After install

- Language: header control, stored in `localStorage` (`afx-locale`). Default is Persian (`fa`, RTL).
- Theme: header control, stored as `afx-theme` (`dark` | `light` | `system`).
- Environment banner (Test / Live): `afx-env` in `localStorage`.

Clear site data in the browser if a previous demo left those keys behind.
