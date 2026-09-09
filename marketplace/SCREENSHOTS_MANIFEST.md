# Screenshot manifest — APIForge X

Rastchin / RTL-Theme listings require a fixed set of previews. Capture every
shot at **1440×900**, in the **dark** theme, in the default **Persian (fa /
RTL)** state.

| # | File | Page | What it must show |
|---|------|------|-------------------|
| 1 | `01-home.png` | `index.html` | Marketing landing — display hero, live product preview, feature grid. |
| 2 | `02-dashboard.png` | `dashboard.html` | KPI strip, request-volume + latency charts, activity feed. The primary listing preview. |
| 3 | `03-api-keys.png` | `api-keys.html` | Masked keys list, environment filter, reveal/rotate/revoke affordances. |
| 4 | `04-webhooks.png` | `webhooks.html` (delivery drawer open) | Webhook endpoints list + delivery detail with attempt timeline and payload inspector. |
| 5 | `05-metrics.png` | `metrics.html` | Observability KPIs, volume/latency/errors/status charts, environment comparison. |
| 6 | `06-docs.png` | `docs.html` | Three-pane documentation portal — sidebar, article, TOC, code samples. |
| 7 | `07-pricing.png` | `pricing.html` | Pricing tiers, feature comparison, FAQ. |
| 8 | `08-settings.png` | `settings.html` | Settings — workspace, developer preferences, security sections. |
| 9 | `09-auth.png` | `login.html` | Persian-first auth screen with the atmospheric backdrop. |
| 10 | `10-rtl-demo.png` | `rtl.html` | The RTL showcase — Persian typography, layout mirroring, LTR-isolated code. |

## Rules for the shots

- **Full-page off.** The listing previews are the viewport, not the whole page.
- **Wait for data.** Pages render skeleton → content in ~350ms; the capture
  script waits for fonts plus 2.2s before shooting.
- **Keep the accent.** Do not re-color the UI or add overlays/captions — the
  listing copy carries the messaging, the product carries the visuals.
- **No device frames.** Plain viewport captures read as honest and premium.

## Generate them

```bash
npm install
npm run build
node marketplace/capture-screenshots.mjs
```

The script reuses a preview server on `:4173` (or starts `npm run preview`),
drives a real Chromium through each page — opening the webhook delivery
drawer — and writes the PNGs to `marketplace/screenshots/`.

Browser resolution: the Playwright-registered Chromium by default
(`npx playwright install chromium`), or a custom binary via
`AFX_CHROMIUM_EXEC` (+ `AFX_CHROMIUM_LIBS` for its shared libraries).

## If the browser is unavailable

The capture script never fails the packaging process — it prints the table
above with manual instructions instead. Manually: build + preview, open each
page at 1440×900 (dark theme, Persian default state), open the required
drawer, screenshot the viewport, name the files exactly as in the table.
