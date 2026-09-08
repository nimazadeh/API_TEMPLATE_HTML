# Screenshot guide — marketplace listing

Both Rastchin/RTL-Theme and ThemeForest require a fixed set of preview
images. Everything in this guide is sized **1440×900**, captured in the
**dark** theme unless a light variant is called out.

## The shot list

| # | File | Page | What it must show |
|---|------|------|-------------------|
| 1 | `01-overview-dark.png` | `dashboard.html` | KPI strip, request-volume + latency charts, activity feed. **Primary listing preview.** |
| 2 | `02-overview-light.png` | `dashboard.html` (light theme) | Same page in light — proves both themes are intentional |
| 3 | `03-logs.png` | `logs.html` | Dense request table with method/status/latency/request-id columns |
| 4 | `04-api-keys.png` | `api-keys.html` | Masked keys list, environment filter, reveal/rotate/revoke affordances |
| 5 | `05-webhooks.png` | `webhooks.html` (delivery drawer open) | Endpoints list + delivery detail: attempt timeline, payload inspector |
| 6 | `06-usage.png` | `usage.html` | Plan consumption, requests-over-time, consumption-by-API doughnut, attribution |
| 7 | `07-rtl-persian.png` | `rtl.html` | Persian RTL shell — sidebar on the right, **Vazirmatn typography**, LTR-isolated code block. **Required for Rastchin.** |
| 8 | `08-command-palette.png` | `dashboard.html` (⌘K open) | The grouped command palette with fuzzy search |
| 9 | `09-code-blocks.png` | `docs.html` | Tabbed code block (cURL/Node/Python) with copy affordance |
| 10 | `10-landing.png` | `index.html` | Marketing landing — display hero, live product preview, feature grid |
| 11 | `11-pricing.png` | `pricing.html` | Plan cards and comparison table |
| 12 | `12-login.png` | `login.html` | Auth card over the atmospheric backdrop |

Reference copies of all twelve shots ship with the developer repo under
`packaging/Assets/` (committed) and are regenerated locally under
`marketplace/screenshots/` (git-ignored) by the capture script.

## Capture with the script

From the **source** package (needs a local machine with a display-capable
Chromium — the sandbox has none):

```bash
npm install
npm run build
npm install --no-save puppeteer   # downloads a local Chromium
node marketplace/capture-screenshots.mjs
```

The script starts `vite preview` on port 4173, drives real Chromium through
each page (opening the delivery drawer on `webhooks.html`, the ⌘K palette on
`dashboard.html`, switching themes), waits for the skeleton → content settle
(`networkidle0` + 600ms), and writes the PNGs to `marketplace/screenshots/`
with the exact filenames from the table above.

## Capture manually

1. `npm run build && npm run preview` → http://localhost:4173
2. Open the page at **1440×900** (browser zoom 100%, device scale 1).
3. Perform the required interaction (drawer, palette, theme switch).
4. Screenshot the **viewport** — not the full page.
5. Name the file exactly as in the table.

## Rules

- **Full-page off.** Listing previews are the viewport, not the whole page.
- **Wait for data.** Pages render skeleton → content in ~350ms.
- **Keep the accent.** Do not re-color the UI or add overlays/captions — the
  listing copy carries the messaging; the product carries the visuals.
- **No device frames.** Plain viewport captures read as honest and premium.
- **Persian-first.** For Rastchin, upload the Persian state (the default) —
  the switcher being visible is itself a selling point.
- **Dark first.** Ship the dark variants as the main set; the light dashboard
  shot (`02`) is the theme proof.

## Upload order (suggested)

1. `01-overview-dark` — main preview / cover
2. `07-rtl-persian` — the differentiator on Rastchin
3. `10-landing`, `11-pricing`, `12-login` — the marketing surface
4. `03`–`06`, `08`, `09` — depth of the workspace
5. `02-overview-light` — theme proof
