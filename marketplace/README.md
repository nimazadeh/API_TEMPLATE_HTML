# APIForge X — Marketplace packaging

Everything a seller needs to list **APIForge X** on the Iranian marketplaces
(Rastchin / RTL-Theme) and ThemeForest.

| File | Purpose |
|------|---------|
| `SCREENSHOTS_MANIFEST.md` | The exact screenshot set the listing requires, with per-shot guidance and naming |
| `DESCRIPTION.md` | Ready-to-paste listing copy — an English ThemeForest description + a Persian RTL-Theme description |
| `capture-screenshots.mjs` | Captures every screenshot against the production build (local Chromium required) |
| `screenshots/` | Output directory for the captured PNGs (git-ignored) |

## Produce the screenshots

```bash
npm install
npm run build
npm install --no-save puppeteer       # one-time, downloads a local Chromium
node marketplace/capture-screenshots.mjs
```

The script starts `vite preview` on `:4173`, drives a real browser through each
page (opening the log/webhook detail drawers, the command palette, switching
dark/light), and writes the PNGs to `marketplace/screenshots/`.

> **Note:** the capture script runs on a developer's machine — this sandbox has
> no browser, so the screenshots cannot be generated here. The hero on the
> landing page (`index.html`) uses a *live product preview* built from real
> components and seeded data, so the demo never depends on a static image.

## Suggested listing order

1. `01-overview-dark.png` — primary preview (hero of the listing)
2. `03-logs.png` — the "deep, not generic" proof point
3. `05-webhooks.png` — the Stripe-grade differentiator
4. `07-rtl-persian.png` — the Iranian-market differentiator
5. `08-command-palette.png` + `09-code-blocks.png` — the developer polish
6. `10-landing.png` — the marketing surface
