# Adding new pages (source package)

The site is a Vite **multi-page app**: each screen is a root HTML file plus a JS entry.

## App page (sidebar shell)

1. Create `src/js/pages/your-page.js`:

```js
import { boot } from '../main.js';
boot();
```

2. Duplicate an existing app HTML file (for example `logs.html`).
3. Set a unique `<title>`, main landmark, and:

```html
<script type="module" src="./src/js/pages/your-page.js"></script>
```

4. Register the file in `vite.config.js` → `pageInputs`.
5. Add the item to **every** app page sidebar and to `src/js/data/commands.js`.
6. Add locale keys for the nav label in `fa.json` / `en.json`.
7. If you need a new Lucide glyph, add it to `src/js/components/icons.js`.

## Marketing page (site header/footer)

```js
import { bootSite } from '../site.js';
bootSite();
```

Copy `pricing.html` or `changelog.html` as the shell. Set `data-page` on `<body>` if you follow existing marketing pages.

## Data

Add fixtures in `scripts/generate-mock-data.mjs` and regenerate:

```bash
node scripts/generate-mock-data.mjs
```

## HTML-only buyers

The production package has no Vite graph. To add a page there you would duplicate an HTML file and its hashed JS — that is fragile. Customize in **Source-Version** and rebuild, then replace `HTML-Version` with the new `dist/`.
