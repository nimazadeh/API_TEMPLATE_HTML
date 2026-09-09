# APIForge X — Marketplace packaging

Everything a seller needs to list **APIForge X** on the Iranian marketplaces
(Rastchin / RTL-Theme) and ThemeForest.

| File | Purpose |
|------|---------|
| `SCREENSHOTS_MANIFEST.md` | The exact screenshot set the listing requires, with per-shot guidance and naming |
| `DESCRIPTION.md` | Ready-to-paste listing copy — an English ThemeForest description + a Persian RTL-Theme description |
| `capture-screenshots.mjs` | Captures every screenshot against the production build (Playwright Chromium) |
| `screenshots/` | The captured listing PNGs (committed — they ship with the release) |

## Produce the screenshots

```bash
npm install
npm run build
node marketplace/capture-screenshots.mjs
```

The script reuses a preview server on `:4173` (or starts `npm run preview`
itself), drives a real browser through each page — opening the webhook
delivery drawer — and writes the PNGs to `marketplace/screenshots/`.

Browser resolution:

- default: the Playwright-registered Chromium (`npx playwright install chromium`), or
- `AFX_CHROMIUM_EXEC=/path/to/chromium` (+ optional
  `AFX_CHROMIUM_LIBS=/path/to/libs`) for a custom binary, e.g. in sandboxes
  where the Playwright CDN is unreachable.

If no browser can be launched, the script prints manual capture instructions
and exits cleanly — an unavailable browser never fails the packaging process.

## Suggested listing order

1. `01-home.png` — the marketing surface (hero of the listing)
2. `02-dashboard.png` — primary product preview
3. `04-webhooks.png` — the Stripe-grade differentiator
4. `10-rtl-demo.png` — the Iranian-market differentiator
5. `05-metrics.png` + `06-docs.png` — the developer depth
6. `07-pricing.png` — monetization surface
