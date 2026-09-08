# Developer source package

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server, port 3000 |
| `npm run build` | Production `dist/` |
| `npm run preview` | Serve `dist/` on port 4173 |
| `npm test` | Playwright (needs Chromium) |
| `npm run test:i18n` | Catalog + localization |
| `npm run test:responsive` | Layout matrix |

## Architecture notes

- `boot()` (`src/js/main.js`) — app pages: i18n, shell, theme, env, palette, shortcuts, motion.
- `bootSite()` (`src/js/site.js`) — marketing: no env switcher / command palette extras beyond what the site header needs.
- Bootstrap 5.3 is imported as ESM in `src/js/core/bootstrap.js` (dropdown, modal, offcanvas, collapse, tab, toast, tooltip).
- Sass deprecations from Bootstrap are silenced in `vite.config.js` by ID.

## Product docs (optional reading)

`docs/product/` holds ICP, JTBD, information architecture, and design direction used to build the template. They are not required at runtime.
