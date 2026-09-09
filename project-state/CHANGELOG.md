# Changelog — APIForge X

All notable changes to the project will be documented in this file.

Format based on Keep a Changelog, but adapted for product phases.

---

## [Release QA hotfix] — 2026-09-09 — Chart hover crash in production build

### Fixed
- **Chart.js hover crash (`Uncaught TypeError: this._fn is not a function`)** —
  `src/js/components/charts.js` **replaced** the `Chart.defaults.animation`
  object with `{ duration: 400, easing: 'easeOutQuart' }`. Chart.js v4's
  `Animations.configure()` derives the per-property animation whitelist from
  the **keys** of `defaults.animation` (`delay/duration/easing/fn/from/loop/
  to/type`); replacing the object silently dropped `type` (and the
  `fn/from/to` fallbacks), so hover-driven element color transitions
  (`backgroundColor`/`borderColor`, e.g. `rgba(99, 102, 241, .1)` →
  `#3336FF19` under the tooltip/hover style resolution) fell back to
  `interpolators[typeof value]`, found no string interpolator, and every
  animator tick under the mouse threw `this._fn is not a function`. The fix
  **merges** into the defaults object instead of replacing it
  (`Object.assign(Chart.defaults.animation, { duration: 400, easing:
  'easeOutQuart' })`), restoring `type: 'color'` / `type: 'number'` on all
  per-property animation configs. Reduced-motion still disables the
  animation system entirely (`false`). No visual, layout or timing change:
  durations (400ms entry / 120ms hover), easing and theme re-render behavior
  are untouched; verified pixel-identical settled rendering.
- Root cause confirmed in a real Chromium against the built `dist/` on all
  four chart pages (`/metrics.html`, `/dashboard.html`, `/usage.html`,
  `/rate-limits.html`); crash reproduces only during hover, matching the QA
  report.

### Added
- `tests/chart-interaction.spec.js` — production-build regression spec:
  hovers every chart canvas on the four chart pages (grid sweep, hover-in →
  across → out) and asserts zero console/page errors plus hover/tooltip
  pixel feedback; additionally covers a range re-render under the mouse
  (chart destroy + recreate + hover). Fails 5/5 with the bug present,
  passes 5/5 with the fix.

### Security/CSP audit (no code change required)
- Audited our source and every bundled dependency (`chart.js`, `bootstrap`,
  `@popperjs/core`, `lucide`, fonts): **no `eval` / `new Function` anywhere**
  in the shipped bundle. Verified at runtime by serving `dist/` with an
  enforced `script-src 'self' 'unsafe-inline'` policy (no `unsafe-eval`)
  across all four chart pages with hover interaction: **zero CSP
  violations, zero JS errors**. The Chrome console warning
  "Content Security Policy of your site blocks the use of eval" therefore
  does not originate from this template's code or dependencies (external
  browser extension / host-injected CSP are the remaining suspects). CSP was
  not weakened and `unsafe-eval` was not added.

---

## [Phase 6 — marketplace release package] — 2026-09-08 — Vazirmatn-first typography + ZIP-ready commercial package

### Fixed
- **Persian typography:** `body`, `.display`, `.form-control`, `.form-select`
  and Bootstrap's `--bs-body-font-family` were pinned to `--font-latin-ui`,
  so Persian (the default locale) fell back to system fonts instead of
  Vazirmatn. Introduced the locale-resolved `--font-body` token
  (`[dir='rtl'],[lang='fa']` → Vazirmatn; otherwise Inter Variable) and
  pointed all UI text lanes at it. `--font-numeric` now resolves per locale
  as well.
- Vazirmatn weight 600 added (used 23× for headings/buttons) — previously
  the browser fell back to 700.

### Added
- `packaging/verify.mjs` — release QA audit: page inventory, per-page
  href/src reference resolution, CSS url() audit, Vazirmatn font-face/woff2
  audit (300–700 arabic subset), locale font-rule assertions, full JS import
  graph check, dev-file exclusion, live static-server smoke test
  (status + content-type for every page and asset). Writes
  `RELEASE-VERIFICATION.md`.
- `packaging/Marketplace/` — paste-ready listing copy (EN + FA), feature
  list with the 30-page inventory, screenshot capture guide.
- `PACKAGE-MANIFEST.json` generation in `packaging/assemble.mjs`
  (inventory + SHA-256 per file).

### Changed
- Release structure → `release/{APIForge-X-HTML, APIForge-X-Source,
  Documentation, marketplace, LICENSE.txt, PACKAGE-MANIFEST.json}`; the
  30-page HTML package excludes the `rtl-persian-test.html` QA harness
  (source-only) and strips its in-page links.
- Buyer docs rewritten for the new structure with Vazirmatn-first font
  documentation (`Installation`, `Customization`, `RTL-Guide`,
  `Theme-System`, `File-Structure`).
- `release/APIForge-X-v1.0.0.zip` replaced with the corrected package.

---

## [Responsive review] — 2026-09-08 — Scroll ownership, mobile layout and invite backdrop

### Fixed
- Removed viewport-height/overflow constraints from `.app-main`; the document
  now scrolls naturally. Shrinkable grid tracks prevent page-wide overflow.
- Fixed the mobile sidebar display cascade, constrained sticky desktop nav,
  retained reachable footer controls and reserved bottom-tab/safe-area space.
- Compact header controls; mobile environment selector; localized tablet rail
  labels; mobile offcanvas/backdrop cleanup when resizing to desktop.
- KPI/card/filter wrapping, inline IDs/URLs, landing preview/headings/header and
  mobile language access; auth spacing and invite grid/glow parity with login.
- Docs/reference document-scroll navigation and sticky offsets; scrollable
  short-screen docs menus; Bootstrap physical-coordinate override specificity
  for correctly mirrored end drawers.
- Command search width/height on narrow/short screens, touch close/outside click,
  keyboard Tab/Escape handling and focus return.

### Added / verified
- `tests/responsive.spec.js`, `npm test`, `npm run test:responsive`, and a scoped
  `npm run test:i18n`; Persian findings in `RESPONSIVE_REVIEW.md`.
- Production build passes; **197/197 tests pass**, including **1,116 layout
  checks** across 31 pages × 2 locales × 2 themes × 9 widths in real Chromium.
- Safari/Firefox and physical-device QA remain explicit limitations.

---

## [Phase 5.5] — 2026-09-08 — PREMIUM VISUAL POLISH & MOTION SYSTEM ✅

### Added
- `src/scss/tokens/_motion.scss` — the centralized motion ladder:
  `--motion-fast 150ms` · `--motion-normal 250ms` · `--motion-slow 400ms` (hard
  ceiling), `--ease-standard cubic-bezier(.2,.8,.2,1)`, plus `--motion-stagger`,
  `--motion-shift` and `--dir-sign` (1 in LTR, -1 in RTL). The old
  `--duration-*` tokens are kept as aliases
- `src/scss/tokens/_mixins.scss` — `motion($duration, $props)`, `motion-reduce`
  and `motion-enter($delay, $duration, $shift)`; every entrance funnels through them
- `src/scss/components/_backdrop.scss` — the reusable atmospheric layer:
  `.backdrop__grid` (44px technical grid), `.backdrop__glow` (radial accent) and
  `.backdrop__mesh` (API-infrastructure lattice), with `.backdrop--quiet`
  (docs/SDK/reference) and `.backdrop--auth` variants. Applied to index,
  pricing, changelog, status, docs, sdk, api-reference, login and forgot-password
- `src/scss/components/_motion.scss` — `afx-rise` / `afx-fade` / `afx-pop` /
  `afx-drop-in` keyframes, the `[data-motion]` reveal contract and the
  `[data-motion-group]` / `.motion-stagger` nth-child stagger
- `src/js/components/motion.js` — one IntersectionObserver for the whole product.
  Nothing is hidden until JS arms it, overlay content (modal / offcanvas /
  collapse / inactive tab) is never armed, and `prefers-reduced-motion` skips the
  observer entirely
- `visual-showcase.html` + `src/js/pages/visual-showcase.js` +
  `src/scss/pages/_visual-showcase.scss` — the visual & motion QA page (hero
  replay, backdrop tiles with a hide toggle, a three-speed motion playground,
  cards, buttons, modal, drawer, dropdown, tabs and every toast state), live in
  dark/light/system × RTL/LTR

### Changed
- Toast rebuilt as a premium component: `[icon] [ title / message ] [close]`,
  16px inline / 12px block padding, 14px message at `--lh-toast: 1.6`,
  logical properties throughout, four token-coloured states (success / error /
  warning / info), a 2px accent rail that mirrors in RTL, a 250ms
  enter (opacity 0→1, translateY 8px→0) and a fade exit. `role="status"` /
  `role="alert"` with matching `aria-live`, `aria-atomic`, and a catalog-labelled
  close button (`aria.close`). The stack moved to the top inline-end corner
- Landing hero choreography: backdrop 0ms → eyebrow 100 → title 150 →
  description 250 → CTA 350 → hint 400 → preview 450 → KPI stagger 520+60n →
  panels 560/620 — opacity and transform only, no layout shift
- Micro-interactions: hover elevation on solid buttons, `.card--interactive`,
  `.feature-card` and `.pricing-card`; a 150ms table row hover with a
  directional accent rail on clickable rows; a `scale`-based sliding tab
  indicator; 150ms dropdown entrance and tooltip fade (both use the independent
  `translate` / `scale` properties so Popper's inline transform is untouched);
  250ms modal fade + 12px travel; 400ms drawer slide
- Dashboard polish only — no decorative background: card entrances, a
  skeleton→content settle (`dashboard.js` swaps `.skeleton-kpi` for `.is-loaded`)
  and animated charts (400ms `easeOutQuart`, disabled under reduced motion)
- `src/scss/pages/_auth.scss` — the hardcoded glow gradient and the undefined
  `--radius-lg` were replaced by the shared backdrop layer and `--radius-md`
- `src/scss/pages/_marketing.scss` — the hero and CTA-band gradients now read
  `--backdrop-glow*` tokens instead of literal `rgba()`
- 86 new `vs.*` translation keys in **both** `src/locales/fa.json` and
  `src/locales/en.json` (1,347 keys each)

### Fixed
- `dashboard.html` carried two `data-i18n-attr` attributes on one button
  (parse5 `duplicate-attribute`), so the tooltip title was never translated
- `arrow-up-left` was used on `dashboard.html` and `settings.html` but missing
  from the Lucide registry — the glyph never rendered; `ArrowUpLeft` added

---

## [Phase 5] — 2026-09-08 — PERSIAN RTL LOCALIZATION & MARKETPLACE READINESS ✅

### Added
- `src/locales/fa.json` + `src/locales/en.json` — the full translation catalogs (1,260 keys)
- `src/js/core/i18n.js` — locale resolution, `t()` with `{var}` interpolation, the
  `[data-i18n]` / `[data-i18n-attr]` painter, live `setLocale()`, `onLocaleChange()`
  and `<html lang|dir>` syncing (no-flash restore moved into the inline `<head>` script)
- Language control on every page: a locale menu in the app shell, a toggle on the
  marketing and auth pages
- `src/js/data/docs-content.en.js` + `docs-content.fa.js` behind a locale dispatcher —
  the 18-article documentation portal is authored per language, not key-by-key
- `rtl-persian-test.html` — the Persian RTL QA harness (replaces `rtl-test.html`):
  mixed-script sentences, Persian/Latin digits, LTR isolation, code blocks, tables,
  forms, charts, dropdowns, modals, pagination, alerts, timelines + live fa/en & theme switching
- `PHASE_5_REPORT.md` — the phase report and quality-gate scorecard

### Changed
- All 30 pages now open in Persian (`<html lang="fa" dir="rtl">`) with 2,536 `data-i18n`
  and 413 `data-i18n-attr` bindings — no hardcoded UI strings remain
- `src/js/utils/format.js` is locale-aware: numbers, compact numbers, dates (Jalali in
  Persian), relative time and percentages switch on `afx:localechange`
- Page modules re-render charts, tables, drawers and empty states on locale change
- `scripts/generate-mock-data.mjs` now emits Persian content (people, projects, key
  names, API names, activity, notifications, plans, environments, SDK features,
  endpoint summaries/descriptions and parameter help) while keeping every technical
  value (ids, paths, prefixes, IPs, emails, packages, status codes) Latin/LTR
- `src/scss/base/_utilities.scss` — directional glyphs mirror in RTL; `.no-dir-flip`
  opts explicit back/next controls out of the mirror
- `src/scss/components/_dropdown.scss` — `.locale-check` alongside `.theme-check`
- `README.md` + `marketplace/DESCRIPTION.md` — Phase 5 status, a localization section,
  and rewritten Rastchin/RTL-Theme listing copy with an Iranian-market requirements table
- `vite.config.js` — `rtl-test` page input renamed to `rtl-persian-test`

### Fixed
- Attribute injection no longer corrupts self-closing tags (`<input … />`): i18n
  attributes are inserted before the trailing solidus

---

## [Phase 3C] — 2026-09-07 — COMPLETE SAAS PRODUCT EXPERIENCE ✅

### Added
- Twelve new pages: `team.html`, `billing.html`, `settings.html`, `profile.html`, `notifications.html`, `docs.html`, `sdk.html`, `api-reference.html`, `metrics.html`, plus Persian-first auth `login.html`, `forgot-password.html`, `invite.html` (+ `src/js/pages/*.js` modules)
- `src/js/components/confirm.js` — reusable destructive-confirm primitive (`ask()` promise + `initConfirm()`), one Bootstrap modal per page
- `src/js/data/docs-content.js` — authored docs portal content (5 groups, 23 articles, block engine: h2/h3/p/ul/code/json/table/callout)
- Seven deterministic Phase 3C datasets (separate `randC` PRNG seeded `20260907 ^ 0xc3c3c3`): `mock-team`, `mock-invitations`, `mock-plans`, `mock-invoices`, `mock-notifications`, `mock-sdks`, `mock-observability` (ranges/series/hourly/minutes/byEndpoint/byStatus/byEnvironment/byMethod)
- `src/scss/pages/_workspace.scss` (plan grid, notification center, settings rows, member cells, SDK monograms), `_docs.scss` (3-pane portal + 3-col xl grid), `_auth.scss` (centered auth card) — registered in `main.scss`
- Icons added to the Lucide registry: `User`, `BookMarked`, `Mail`, `UserPlus`, `ShieldAlert`, `Smartphone`, `LogIn`, `Inbox`, `CheckCheck`, `Receipt`, `BadgeCheck`, `Link`, `ListChecks`, `FileCode2`, `Send`, `Monitor`, `List`
- Mobile section offcanvas nav for `docs.html` and `api-reference.html` (desktop `.docs-side` previously disappeared below lg with no alternative)

### Changed
- `vite.config.js` — `pageInputs` 14 → 26
- Sidebar + mobile drawer nav regenerated across all app pages into a consistent 5-group structure (Overview / Developer / Analytics / Workspace / Account); all previously `is-disabled` Phase 3C items enabled; correct active state per page
- `src/js/data/commands.js` — added Metrics/Team/Billing/Settings/Profile/Notifications to Navigate and a new "Developer resources" group (Documentation / SDKs / API Reference)
- `index.html` hub — retagged Phase 3C and gained 12 new page cards

### Fixed
- `src/js/pages/team.js` — suspended members now remain visible in the members table (previously only active members rendered); seats count = active members
- `src/js/pages/billing.js` — plan CTA now correctly says "Downgrade" when a cheaper plan is selected from Scale (was "Upgrade to Pro")
- `src/js/pages/notifications.js` — wired the search field that was previously a dead input
- `src/js/pages/api-reference.js` — service selector now actually filters the endpoint nav (was only switching the active endpoint)
- `src/js/pages/docs.js` / `api-reference.js` — bare `history`/`location` globals replaced with `window.history`/`window.location`
- `src/js/pages/settings.js` — 2FA "Manage" was a dead button; now opens a demo confirmation
- `src/js/pages/profile.js` — theme-preference segment + email-notification toggle now functional
- `settings.html` — `2fa-toggle` id renamed `fa-toggle` (id starting with a digit breaks `querySelector`); session-timeout select gained an `aria-label`

### Verified (executed)
- `vite build` green — 26 page inputs, 0 Sass/JS warnings
- Headless runtime QA (jsdom, built `dist/` chunks): **92/92 interaction scenario steps PASS** across 22 pages, 0 jsdom/console/module-eval errors (10 regression pages + 12 new)
- Structural a11y audit (25 pages): 0 unlabelled controls/icon-buttons, 0 tables outside `.table-responsive`, 0 missing `scope`, 0 duplicate ids
- Static design audit: breakpoints + `[dir=rtl]` + logical props + `.ltr-isolate` + reduced-motion (38) + `:focus-visible` ring + five typography lanes (no Inter Tight/Geist/CDN); page SCSS has 0 hex literals (tokens only)
- 3A/3B datasets re-verified byte-identical (generator re-run + `git checkout` on the 8 drift-prone JSONs)

### Remaining limitations (recorded honestly — NOT executed)
- Real-browser visual/responsive QA (360–1920) — no browser/preview in the sandbox (E2B preview token-gated); nothing marked PASS without execution
- Chart.js pixel rendering, keyboard focus traversal, in-situ contrast — code present, not browser-verified
- Full WCAG 2.x claim — NOT made (static checks only)

---

## [Phase 3 Visual QA & Design Review] — 2026-09-07 — VERIFICATION GATE PASS ✅

### Fixed
- `src/js/pages/apis.js` — endpoint search now matches the HTTP method (typing "POST" previously returned an empty list); method/path/summary/group all matched
- 11 HTML files — added `scope="col"` to every table header `<th>` (api-keys, apis, endpoints, environments, errors, logs, rate-limits, rtl-test, rtl, style-guide, webhooks)

### Verified (executed)
- Headless runtime QA (jsdom, built `dist/` chunks in a real DOM): **37/37 interaction scenario steps PASS** across all 10 product pages with **0 jsdom errors, 0 console errors, 0 module eval errors** (dashboard 3, apis 3, api-keys 2, logs 3, usage 2, webhooks 5, endpoints 4, errors 4, rate-limits 4, environments 7)
- Static design audits against `DESIGN_DIRECTION.md`: breakpoints (576/768/992/1200/1400 + max-widths), `[dir=rtl]` rules + logical properties, `.ltr-isolate`, code/chart LTR forcing, five typography lanes, local fonts (no Inter Tight/Geist/CDN), reduced-motion (35), `:focus-visible` ring, `color-scheme`
- Structural a11y audit (13 pages): 0 unlabelled controls/icon-buttons, 0 tables outside `.table-responsive`, 0 missing alt, 0 duplicate ids — after the `scope="col"` fix
- Contrast computed from tokens (dark primary 17.6–19.0:1, secondary 7.2–7.7:1; light primary 17.3–17.7:1)

### Remaining limitations (recorded honestly — NOT executed)
- Real-browser visual/responsive QA — no browser/preview available in the sandbox (E2B preview token-gated); nothing marked PASS without execution
- Chart.js pixel rendering, keyboard focus traversal, in-situ contrast — code present, not browser-verified
- Full WCAG 2.x claim — NOT made (static checks only)

---

## [Phase 3B] — 2026-09-07 — ADVANCED DEVELOPER WORKFLOWS COMPLETE ✅

### Added
- Five advanced pages: `webhooks.html`, `endpoints.html`, `errors.html`, `rate-limits.html`, `environments.html` + page modules in `src/js/pages/`
- `src/js/components/webhook-detail.js` — delivery drawer: attempt timeline (created → sent → delivered/failed/retrying) + Payload/Headers/Response/Signature inspector with syntax-highlighted JSON + retry/replay/copy-payload
- `src/js/components/error-detail.js` — issue drawer: message/type, simulated stack trace (faulting frame highlighted), request info, user context, environment, mark-resolved + assign
- `highlightJson()` in `src/js/components/code-block.js` — 4-color JSON syntax highlighter (keys/strings/numbers/keywords), escaped, reused by the webhook and endpoint drawers
- Icons: `Bug`, `FileText`, `Pencil` added to the Lucide registry (now 70 registered)
- `src/scss/pages/_errors.scss`, `src/scss/pages/_rate-limits.scss` (registered in `main.scss`); `.timeline__node` gained `is-info`/`is-neutral` states
- Deterministic mock data (seed `20260907`, separate `randB` PRNG keeps Phase 3A byte-identical apart from `Date.now()` timestamps): `mock-webhooks.json` (6), `mock-webhook-deliveries.json` (26 with attempt timelines + payload/headers/response/signature), `mock-errors.json` (12 with stack traces), `mock-rate-limits.json` (3 current + 14-day history + 6 rules), `mock-variables.json` (16); `mock-environments.json` → Production/Staging/Development (3), `mock-keys.json` → +2 staging keys
- Navigation: sidebar + mobile drawer enabled for Webhooks/Endpoints/Errors/Rate Limits/Environments across all app pages; Metrics retagged to Phase 3C; `commands.js` + `index.html` hub updated

### Changed
- `vite.config.js` — `pageInputs` 9 → 14 pages
- `index.html` hub — eyebrow retagged Phase 3B and 5 new product cards added

### Fixed
- `src/js/pages/endpoints.js` — the service filter select (`#endpoint-service`) had no options (only the modal's select was populated); now both are filled from `mock-apis.json`
- `src/js/pages/dashboard.js` + `src/js/pages/errors.js` — replaced the dead `.kpi-foot` class (never styled in the design system) with the canonical `.stat-foot`

### Verified (executed)
- `vite build` green — 14 page inputs; per-page chunks emitted; `dist/*.html` asset refs resolve
- Runtime HTTP QA — all 14 pages + new page/component modules serve 200 with no transform errors
- Static wiring QA — every `getElementById` target in the 5 new page modules resolves; `data-copy-target` ids resolve; drawers exist on their pages
- Icon registry audit — 70 registered / 58 literal `data-lucide` usages / 0 missing
- Link audit — no broken `./*.html` links
- Import audit — no unused imports in the 7 new JS files
- Nav audit — no leftover `Phase 3B` tooltips; Metrics retagged Phase 3C

### Remaining limitations (recorded honestly)
- Interaction / visual / responsive QA NOT executed — no headless browser in the sandbox; run manually on the live preview
- Chart.js runtime rendering + theme re-render not observed in a browser (build + module transform only)
- Full WCAG audit deferred

---

## [Phase 3A — Verification] — 2026-09-07 — POST-IMPLEMENTATION VERIFICATION PASS ✅

### Fixed
- `src/js/components/icons.js` — added `RefreshCw` (Logs "Refresh" button icon was unregistered and would not render)
- `api-keys.html` — reveal-once modal "Done" button now dismisses the modal (`data-bs-dismiss="modal"`)
- `usage.html` + `src/js/pages/usage.js` — "Export" button wired to a daily-usage CSV export (was a dead button)
- `src/js/pages/logs.js` — removed unused `escapeHtml` import
- `src/js/pages/dashboard.js` — removed unused `absoluteTime` import

### Verified (executed)
- `vite build` green — 9 page inputs; per-page chunks for all 5 product pages; `dist/*.html` asset refs all resolve
- Runtime HTTP QA — all pages + modules serve 200 with no transform errors; dev-server asset refs resolve
- Static wiring QA — every `getElementById` target in the 5 page modules resolves to a real DOM id; no duplicate ids
- Icon registry audit — 67 registered / 53 used / 0 missing
- Import audit — all 24 JS files' relative imports resolve; no unused imports remain
- RTL/LTR static checks — code blocks LTR, `.ltr-isolate` on technical terms, logical table alignment, directional icons registered; `rtl.html`/`rtl-test.html` serve 200
- Accessibility static checks — labelled icon buttons, labelled dialogs/offcanvas, labelled checkboxes, `aria-pressed` segments, keyboard-activated rows

### Remaining limitations (recorded honestly)
- Interaction / visual / responsive QA NOT executed — no headless browser in the sandbox; run manually on the live preview
- Chart.js runtime rendering + theme re-render not observed in a browser (build + module transform only)
- Full WCAG audit deferred

---

## [Phase 3A] — 2026-09-07 — CORE PRODUCT EXPERIENCE IMPLEMENTATION COMPLETE ✅

### Added
- Five product pages: `dashboard.html`, `apis.html`, `api-keys.html`, `logs.html`, `usage.html` + page modules in `src/js/pages/`
- `src/js/components/charts.js` — tree-shaken Chart.js registration (Line/Bar/Doughnut + Category/Linear + Filler/Tooltip/Legend), CSS-variable theming, `makeChart`/`refreshCharts`/`initCharts`, `axis`/`tooltips` shared options
- `src/js/components/log-detail.js` — deterministic request inspector (`buildLogDetail`, `cURLFor`, `openLogDrawer` → Bootstrap offcanvas)
- SCSS partials: `_segmented`, `_toolbar`, `_split`, `_inspector`, `_explorer`, `pages/_usage` (registered in `main.scss`)
- Icon registry extended (GitBranch, LogOut, Globe, ExternalLink, Play, Braces, FileJson, FolderOpen, Server, Box, Lock, ShieldCheck, Ban, SlidersHorizontal, Filter, Calendar, Database, Download, PieChart, Timer, ArrowUpRight, Check)
- `format.js` helpers: `compactNumber`, `formatDate`, `percent`

### Changed
- `scripts/generate-mock-data.mjs` rewritten (seed `20260907`) — 5 APIs, 15 endpoints, 6 keys (env/permission/prefix/scopes/status), 80 enriched logs, 30-day usage, 2 environments, plan, attribution (byEndpoint + byEnvironment), 8 activity events, metrics (24h/7d/30d KPIs + 24h hourly)
- `table.js` rewritten — `logRow`/`logRowFull`/`keyRow` + `renderLogs`/`renderLogsFull`/`renderKeys` with copy binding
- `theme.js` rewritten — dark/light/system with 3-option `[data-theme-menu]` (retains `data-theme-toggle`)
- `code-block.js` — `initCodeBlock(block)` exported for dynamically rendered docs/tester code
- `_tables.scss` — `.is-selected` row state (API explorer endpoint list)
- `_toolbar.scss` — `.filter-bar__select` fixed width
- `vite.config.js` pageInputs += dashboard/apis/api-keys/logs/usage
- `index.html` hub now links the five product pages (label → Phase 3A)

### QA
- `vite build` green — 9 HTML pages; per-page JS chunks (`dashboard`, `apis`, `api-keys`, `logs`, `usage`)
- Dev server serves all pages + module transforms (200); no transform errors
- Static QA clean (class refs reconciled to `.filter-bar`/`.seg`/`.card--dense`+`.chart`)
- Interaction / responsive / visual QA NOT executed (no browser in sandbox) — recorded honestly in TEST_STATUS.md

---

## [Phase 2] — 2026-09-07 — FOUNDATION & DESIGN SYSTEM (PRODUCTION HARDENING) COMPLETE ✅

### Added
- Semantic token layer under `src/scss/tokens/`: colors (surface ladder, status foregrounds, violet/orange families, focus-ring, code-border, shimmer, RGB triplets), borders, elevation, motion, layout, typography — dark + `[data-theme="light"]`
- `src/scss/base/_fonts.scss` — single source of truth for local font loading (Inter Variable, JetBrains Mono, Vazirmatn); documents the five typography lanes
- `src/js/core/bootstrap.js` — Bootstrap ESM data-API imports (Dropdown, Modal, Offcanvas, Collapse, Tab, Toast, Tooltip)
- New primitives: `_tabs.scss`, `_alert.scss`, `_breadcrumb.scss`, `_avatar.scss`, `_stat.scss`, `_chart.scss`, `_loading.scss`; `.error-state` added to `_empty.scss`
- `rtl-test.html` + `src/js/pages/rtl-test.js` + `src/scss/pages/_rtl-test.scss` — mixed RTL/LTR scenarios with theme (dark/light/system) and direction switching
- `src/js/components/toast.js` rewritten on Bootstrap `Toast.getOrCreateInstance` (`afxToast`)
- `@popperjs/core@2.11.8` explicit dependency
- Directional icons (ArrowRight/Left, ChevronRight/Left) in the Lucide registry

### Changed
- Curated Bootstrap import (`src/scss/vendor/_bootstrap.scss`): variable overrides + component subset + utilities API; Bootstrap as toolkit, not identity
- Bootstrap `--bs-*` bridge (`src/scss/base/_bootstrap-overrides.scss`) now maps to semantic tokens (no literal light-theme block)
- Overlays migrated from custom modules to Bootstrap data-APIs: `data-bs-toggle`/`data-bs-target`/`data-bs-dismiss`/`data-bs-title`
- Offcanvas re-themed + logical RTL mirroring (`offcanvas-start/end`); `.sidebar-drawer` is now `offcanvas offcanvas-start sidebar-drawer`
- Sidebar chrome hoisted to top level (`_sidebar.scss`) so the mobile drawer reuses it
- Shell metrics (256/64/56/1440/24) tokenized into `--sidebar-width`, `--sidebar-rail-width`, `--header-height`, `--bottom-bar-height`, `--content-max-width`, `--content-pad`
- Legacy font aliases (`--font-sans`, `--font-display`, `--font-mono`, `--font-fa`) removed; canonical five-lane tokens only
- `style-guide.html` hardened as the living component contract (all primitives + states)
- RTL heading tracking loosened for Arabic script; focus ring tokenized; scrollbars theme-aware

### Removed
- `src/js/components/dropdown.js`, `tooltip.js`, `modal.js` (superseded by Bootstrap data-APIs)
- Legacy `--bg-*` / `--shadow-*` token references

### Decisions
- D-021…D-027 logged in DECISIONS.md (Bootstrap data-APIs, Inter Variable, five-lane tokens, semantic surface ladder, offcanvas drawers, rtl-test harness, offcanvas-first detail views)

### QA
- `vite build` green (CSS 268.70 kB / 51.62 kB gzip; main JS 104.79 kB / 33.11 kB gzip)
- Static + runtime QA clean; interaction/responsive/visual not executed (no browser in sandbox) — recorded honestly in TEST_STATUS.md

### Next
- Phase 3 (Core App Pages) — NOT yet authorized; wait for separate authorization

---

## [Phase 0] — 2026-09-07 — PRODUCT INTELLIGENCE COMPLETE ✅

### Added
- Created /docs/product/PRODUCT_BRIEF.md — Vision, positioning, problem/solution, target use cases, value props, success metrics
- Created /docs/product/ICP.md — 3 ICPs (API-First Founder primary, SaaS Team secondary, Freelance tertiary), anti-ICP, Iranian market specifics, buyer journey, willingness to pay
- Created /docs/product/JTBD.md — Buyer JTBD (3) + End-User JTBD Tier 1-3 (10 jobs), prioritization matrix, design implications, Persian additions
- Created /docs/product/COMPETITIVE_ANALYSIS.md — Real platforms (Stripe, Resend, Vercel, Linear, Supabase, Clerk, Unkey) + HTML template competitors (Concept, Sneat, Admindek etc.), gap analysis, positioning map
- Created /docs/product/VISUAL_REFERENCE_MATRIX.md — Detailed analysis of Resend, Vercel, Linear, Stripe across 16 dimensions (typography, spacing, density, grid, nav, surface, border, radius, color, dark-mode, hierarchy, interaction, motion, code, data viz, storytelling) + synthesized principles
- Created /docs/product/DESIGN_DIRECTION.md — Mood (midnight lab), personality, typography direction (Inter Tight/Geist + Vazirmatn + JetBrains Mono, strict lanes, type scale, Persian specifics), density, whitespace, grid (sidebar 256px + header 56px + main fluid), color (dark-first monochrome + indigo #6366f1 + status), dark/light themes, surfaces, borders, cards, radius (6px,12px,9999px), buttons, forms, tables (most important), charts (Chart.js discipline), code blocks (dark wells LTR isolated), navigation, motion (200ms transform/opacity), Lucide only, Persian RTL (Vazirmatn, logical props, LTR isolation, professional copy), measurable premium principles
- Created /docs/product/INFORMATION_ARCHITECTURE.md — IA philosophy (job-based, 12 max, depth over breadth), proposed IA (marketing 3 + app 12 grouped into 4 groups), sidebar structure, page count plan (20-25 deep), URL structure, state management (JSON + URL + localStorage), Persian IA, decision log
- Created /docs/product/DIFFERENTIATORS.md — 10 strongest differentiators (webhook debugger, log inspector, key lifecycle, code presentation LTR isolation, command palette Cmd+K, usage attribution, empty/error states, env switcher, keyboard-first, Persian RTL first-class) + micro-differentiators + anti-differentiators + validation test
- Created /project-state/PROJECT_STATE.md — Phase 0 status complete, product positioning summary, visual direction summary, IA summary, Persian summary, tech validation, next phase goals, risks, QA gate checklist
- Created /project-state/IMPLEMENTATION_PLAN.md — Phase 0-5 plan, Phase 1 detailed tasks (setup, tokens, layout, components, mock data, RTL), Phase 2-5 tasks, technical details (Vite config, SCSS arch, JS arch, RTL impl, performance), timeline 19-27 days, next immediate steps
- Created /project-state/DECISIONS.md — 15 decisions recorded (positioning specialized, visual refs, IA 12 max, dark-first monochrome+indigo, typography strict lanes, spacing 4px + 3 radii, hairlines over shadows, tables primary, code dark wells LTR isolated, command palette vanilla JS, Persian RTL first-class, tech stack validated, page count 20-25 deep, landing minimal, mock data JSON+URL+localStorage)
- Created /project-state/CHANGELOG.md (this file)
- Created /project-state/TEST_STATUS.md

### Research Conducted
- Web search: Resend dashboard UI, Vercel design principles, Linear design system, Stripe dashboard, developer API platform patterns, Vazirmatn Persian RTL, Bootstrap 5.3 dashboard, API platform must-have features, command palette pattern
- Fetch: resend.com, vercel.com/design/guidelines, resend.com/philosophy
- Analysis: Extracted principles from 4 references across 16 dimensions

### Validated
- Technology stack: HTML5 + Bootstrap 5.3.x + SCSS + Vite + ES Modules + Chart.js + Lucide + Vazirmatn + JetBrains Mono is appropriate, no change needed

### Decisions
- 15 decisions logged in DECISIONS.md

### QA Gate
- All 12 QA gate items passed (ICP clear, positioning clear, JTBD clear, use cases clear, IA coherent, visual refs analyzed, design principles extracted, differentiation defined, Persian/RTL defined, tech validated, impl plan exists, project state persisted)

### Next
- Phase 1: Foundation & Design System — Setup Vite + Bootstrap + SCSS + tokens + base layout + core components + RTL system + mock data

---

## [Phase 1] — 2026-09-07 — FOUNDATION & DESIGN SYSTEM COMPLETE ✅

### Added
- **Project setup:** `package.json` (Vite 7.3.6, Bootstrap 5.3.8, Sass, Lucide, Chart.js, Fontsource fonts), `vite.config.js` (multi-page inputs, `@` alias, relative base, 0.0.0.0 host + `allowedHosts` for the preview proxy), `.gitignore`
- **Design tokens** (`src/scss/tokens/`): colors (dark-first + light override, monochrome + indigo `#6366f1` + status), typography (Inter Variable / JetBrains Mono / Vazirmatn + type scale + tracking + line-heights), spacing (4px scale), radius (6/12/pill/4), z-index ladder, mixins (breakpoints, focus ring, motion, visually-hidden)
- **Vendor layer** (`src/scss/vendor/_bootstrap.scss`): curated Bootstrap subset (functions/variables/maps/mixins/utilities/root/reboot/type/images/containers/grid/helpers + utilities API) with variable overrides (dark body, hairline borders, 6/12/pill radius, no shadows, 24px gutters, `$enable-dark-mode: false`)
- **Base layer** (`src/scss/base/`): reset/polish, typography utilities (`.display`, `.eyebrow`, `.mono`, `.tabular-nums`, `.ltr-isolate`, `.num-fa`/`.num-en`), custom utilities (`.hairline`, `.floating`, `.sr-only`), Bootstrap `--bs-*` variable bridge
- **Core components** (`src/scss/components/` + JS): buttons (5 types, 3 sizes, icon, loading), forms (input/select/textarea/check/radio/search+⌘K/key reveal), badges (method + status + scope), tables (40px rows, hover, latency color, pagination), cards (default/interactive/KPI), code blocks (always-dark wells, 40px header, language tabs, copy, key injection), skeletons, empty states, tooltip, modal, drawer, progress, timeline, toast, dropdown, command palette (⌘K, fuzzy search, groups, keyboard nav)
- **Layouts** (`src/scss/layouts/` + `main.scss`): app shell (sidebar 256px + header 56px + fluid main, logical grid areas), sidebar (grouped nav, active state, foot cluster, 64px icon rail on tablet), header (breadcrumb, search field, env switcher, theme toggle, help, user), mobile nav (bottom tab bar + sidebar drawer)
- **JS architecture** (`src/js/`): `main.js` boot(), per-page entries, components (theme, env-switcher, command-palette, code-block, copy, dropdown, tooltip, modal, toast, reveal, table), formatting utils (relative time, latency class, status/method badges, Persian digits), deterministic mock-data generator
- **Mock data** (`src/js/data/` + `scripts/generate-mock-data.mjs`): 50 logs, 5 keys, 3 webhooks, 30-day usage, 10 endpoints — seeded & regenerable
- **Foundation pages:** `/` (temporary hub), `/style-guide.html` (full component showcase), `/rtl.html` (Persian RTL demo with LTR-isolated code + Persian labels)
- **README.md** — quick start, structure, theming, RTL notes

### Decisions
- Bootstrap imported as a curated `@import`-based subset (Bootstrap 5.3.8 partials share one scope; variable overrides must precede the import stack)
- Sass deprecation warnings (Bootstrap's legacy `color-functions`/`import`) silenced by ID via `silenceDeprecations` in Vite
- Lucide icons registered in a tree-shaken `icons.js` map instead of the full 1800-icon object (main JS bundle 370 KB → 26 KB)
- Single JS-managed global modal/drawer backdrop (fixed-position children inside transformed containers break against the viewport)
- RTL demo ships as a separate `rtl.html` with `dir="rtl" lang="fa"` (D-018: `?lang=fa` toggle deferred)
- Sidebar fixed 256px; resizable deferred (D-016)

### Validated
- `npm run build` clean (no warnings); CSS 170 KB → 37.2 KB gzip; main JS 26 KB → 9.3 KB gzip
- Dark/light toggle, env switcher, ⌘K palette, copy-with-feedback, code tabs + key injection all wired
- Mock logs render in the table; RTL page mirrors the shell with code LTR

### Next
- Phase 2: Core App Pages — Overview, Logs, Keys, Usage (observability first)

---

## Phase 4 (Re-scoped) — Marketplace Excellence & Commercial Polish — 2026-09-08

### Added
- **Marketing layer (4A):** `layouts/_site.scss` + `pages/_marketing.scss`; premium landing `index.html` (live product preview from real components + seeded data), `pricing.html` (plans from `mock-plans.json` + comparison + FAQ), `changelog.html`, `status.html` (90 deterministic uptime bars, components, incidents), `404.html`; `src/js/site.js` (`bootSite()`), page JS for all five
- **Keyboard shortcuts (4B):** `components/shortcuts.js` — `?` help modal, `g`+letter navigation (16 destinations), `/` focus search, Esc; `data-search-target` on 7 search inputs
- **Marketplace packaging (4C):** `marketplace/` — `README.md`, `SCREENSHOTS_MANIFEST.md`, `DESCRIPTION.md` (ThemeForest EN + RTL-Theme FA), `capture-screenshots.mjs` (Playwright, buyer-runnable)

### Changed
- `README.md` — buyer-facing: marketing pages, "Adding a page" guide, keyboard shortcuts
- `style-guide.html` — new Marketing section; nav refreshed (was stale Phase 3)
- `rtl.html` — stale Phase 2 `#`/tooltip nav replaced with the full real nav (Persian)
- `vite.config.js` — pageInputs 26 → 30
- `_radius.scss` — stale "3 radii" header corrected to 4

### Validated
- `vite build` green (30 inputs, 0 warnings)
- Runtime QA **114/114** across 30 pages (0 jsdom/console/module-eval errors)
- Structural a11y audit clean (30 pages); static audit clean

### Next
- Marketplace screenshots via `node marketplace/capture-screenshots.mjs` on a machine with Chromium
- Optional: preview video, ThemeForest/RTL-Theme submission

---

## Final Release Audit — 2026-09-08

### Fixed
- **P1** `site.js` — marketing `bootSite()` now initializes code blocks; the landing's code showcase (language tabs + copy) was dead and now works
- **P2** `index.html` / `index.js` — pricing teaser renders the product plans from `mock-plans.json` (was template-license pricing, inconsistent with `pricing.html`); "26 pages" → "30 pages"; stat label clarified to "3 themes — dark · light · system"
- **P2** `billing.js` — removed unused `formatNumber` import
- **P2** `rtl-test.html` — added the missing `<h1>`
- **P2** `README.md` — "Customization reference" (colors/fonts/nav/icons) + "Deploying" sections
- **P2** `commands.js` — "Marketing" command-palette group (app → marketing continuity)

### Validated
- `vite build` clean (30 inputs, 0 warnings)
- Runtime QA **116/116** across 30 pages (0 jsdom/console/module-eval errors)
- Structural a11y audit clean (30 pages); static audit clean; link integrity + secrets + CDN scans clean
- Real browser UNAVAILABLE (visual/responsive/Lighthouse stay LIMITATION)

### Next
- Marketplace screenshots + submission (Rastchin / ThemeForest) on a machine with Chromium

---

## Template for Future Phases

```
## [Phase X] — YYYY-MM-DD — Title
### Added
### Changed
### Fixed
### Removed
### Research
### Decisions
### Next
```

---

## Author

Product Intelligence Phase — Autonomous
Date: 2026-09-07
