# APIForge X v1.0.0 — Release verification

- **Date (UTC):** 2026-09-08T20:53:23.810Z
- **Method:** buyer simulation — clean extraction of `APIForge-X-Preview.zip`, every page opened over `file://` (no server, no npm), console/CORS audited, then interactions on `index.html`.
- **Result:** ✅ PASS

## Static checks
- ✅ preview extracted to clean folder — `/tmp/afx-preview-qa-JXxvNi/APIForge-X-Preview`
- ✅ 31 pages present in preview root (found 31)
- ✅ every internal page link resolves (60 unique checked)
- ✅ every ./assets/ reference in HTML exists
- ✅ all 55 fonts referenced by CSS exist in assets/fonts
- ✅ no module/crossorigin leftovers; exactly 1 css + 1 js per page
- ✅ one JS bundle per page (31)
- ✅ font assets present (55 files)
- ✅ index opens Persian RTL by default — `fa/rtl`
- ✅ locale toggle flips to English LTR live — `en/ltr`
- ✅ locale toggle returns to Persian RTL — `fa/rtl`
- ✅ theme toggle switches theme — `light → dark`
- ✅ theme toggle restores previous theme — `light`
- ✅ in-page navigation to dashboard.html works from file:// — `نمای کلی — APIForge X`
- ✅ no console/CORS errors during interactions
- ✅ developer zip extracts with package.json + vite.config.js
- ✅ developer zip contains src/ + index.html
- ✅ npm ci succeeds from clean extraction (lockfile reproducible)
- ✅ npm run build succeeds (31 pages emitted)

## Per-page browser sweep (file://)

| Page | OK | CSS sheets | lucide icons | loaded fonts | lang/dir | canvas painted px | console/CORS errors |
|---|---|---|---|---|---|---|---|
| 404.html | ✅ | 1 | 4 | JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| api-keys.html | ✅ | 1 | 95 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| api-reference.html | ✅ | 1 | 77 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| apis.html | ✅ | 1 | 80 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| billing.html | ✅ | 1 | 103 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| changelog.html | ✅ | 1 | 13 | JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| dashboard.html | ✅ | 1 | 85 | JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | 81267 | — |
| docs.html | ✅ | 1 | 76 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| endpoints.html | ✅ | 1 | 72 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| environments.html | ✅ | 1 | 94 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| errors.html | ✅ | 1 | 70 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| forgot-password.html | ✅ | 1 | 6 | JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| index.html | ✅ | 1 | 72 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | 35201 | — |
| invite.html | ✅ | 1 | 6 | JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| login.html | ✅ | 1 | 6 | JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| logs.html | ✅ | 1 | 152 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| metrics.html | ✅ | 1 | 68 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Inter Variable | fa/rtl | 65831 | — |
| notifications.html | ✅ | 1 | 98 | JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| pricing.html | ✅ | 1 | 37 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| profile.html | ✅ | 1 | 68 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| rate-limits.html | ✅ | 1 | 76 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | 69763 | — |
| rtl-persian-test.html | ✅ | 1 | 24 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Inter Variable | fa/rtl | 130757 | — |
| rtl.html | ✅ | 1 | 73 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| sdk.html | ✅ | 1 | 114 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| settings.html | ✅ | 1 | 74 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| status.html | ✅ | 1 | 19 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| style-guide.html | ✅ | 1 | 115 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| team.html | ✅ | 1 | 128 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| usage.html | ✅ | 1 | 70 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | 140626 | — |
| visual-showcase.html | ✅ | 1 | 21 | JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |
| webhooks.html | ✅ | 1 | 71 | JetBrains Mono|JetBrains Mono|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn|Vazirmatn | fa/rtl | -1 | — |

> CSS sheets = live stylesheet link objects pointing at assets/css/main.css (1 = loaded; cssRules objects are not readable across file:// origins, so loading is also asserted via computed styles).
> canvas painted px = maximum count of painted (non-transparent) pixels across the page's canvases.
> icons = the number of lucide SVG icons present after the page script booted.

## Checks: 19/19 passed
