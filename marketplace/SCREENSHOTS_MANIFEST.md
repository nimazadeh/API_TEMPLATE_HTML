# Screenshot manifest — APIForge X

Rastchin / RTL-Theme and ThemeForest listings both require a fixed set of
previews. Capture every shot at **1440×900** unless noted, in the **dark**
theme unless a light variant is called out.

| # | File | Page | What it must show |
|---|------|------|-------------------|
| 1 | `01-overview-dark.png` | `dashboard.html` | KPI strip, request-volume + latency charts, activity feed. The primary listing preview. |
| 2 | `02-overview-light.png` | `dashboard.html` (light) | The same page in the light theme — proves both themes are intentional. |
| 3 | `03-logs.png` | `logs.html` | Dense request table with method/status/latency/request-id columns. |
| 4 | `04-api-keys.png` | `api-keys.html` | Masked keys list, environment filter, reveal/rotate/revoke affordances. |
| 5 | `05-webhooks.png` | `webhooks.html` (delivery drawer open) | Webhook endpoints list + delivery detail with attempt timeline and payload inspector. |
| 6 | `06-usage.png` | `usage.html` | Plan consumption, requests-over-time, consumption-by-API doughnut, attribution. |
| 7 | `07-rtl-persian.png` | `rtl.html` | Persian RTL shell — sidebar on the right, Vazirmatn, LTR-isolated code block. |
| 8 | `08-command-palette.png` | `dashboard.html` (⌘K open) | The grouped command palette with fuzzy search. |
| 9 | `09-code-blocks.png` | `docs.html` | A tabbed code block (cURL/Node/Python) with copy affordance. |
| 10 | `10-landing.png` | `index.html` | The marketing landing — display hero, live product preview, feature grid. |

## Rules for the shots

- **Full-page off.** The listing previews are the viewport, not the whole page.
- **Wait for data.** Pages render skeleton → content in ~350ms; the capture
  script already waits (`networkidle0` + 600ms).
- **Keep the accent.** Do not re-color the UI or add overlays/captions — the
  listing copy carries the messaging, the product carries the visuals.
- **No device frames.** The template is not an app-store screenshot; plain
  viewport captures read as honest and premium.

## If you capture manually

The script does it for you, but manually: build + preview, open each page at
1440×900, open the required drawer/palette, and screenshot the viewport.
Name the files exactly as in the table above.
