# Production Build Investigation & Fix — APIForge X

**Task:** make `npm run build` output work standalone (shared hosting, static
hosting, extracted local preview) — no Vite dev server dependency.
**Date:** 2026-09-08
**Branch:** `arena/01a0826c-api-template-html`

---

## Executive summary

The reported symptom (built HTML renders unstyled / unreadable, fonts missing,
"CSS is missing" after `npm run build`) **does not reproduce at current HEAD
in any supported environment**. The current source tree already carries the
architectural fixes for that bug class (`base: './'`, a single shared compiled
stylesheet, self-hosted fonts with relative `url()`s, a complete multi-page
input list), and this session proved it end-to-end in a real browser on four
different serving modes (plain static server, `vite preview`, nested
sub-directory hosting, and the extracted buyer ZIP).

Two genuine pipeline defects *were* found and fixed so this bug class cannot
come back silently:

1. **`packaging/assemble.mjs` reused a stale `dist/`** — it only rebuilt when
   `dist/index.html` was missing. After editing SCSS/HTML/JS, running the
   release assembler without a manual rebuild packaged *old* output, and
   `packaging/verify.mjs` still returned **PASS** because it audits the stale
   tree for internal consistency only. That is exactly the "dev works, release
   is broken, checks are green" failure mode the task describes. The assembler
   now always runs a fresh `npm run build`.
2. **No in-browser regression gate existed.** `packaging/verify.mjs` is
   HTTP/static-level (it cannot detect a `<link>` that exists but fails in the
   browser). Added `tests/production.spec.js` — a real-browser smoke suite that
   asserts, per page: CSS is *applied* (not merely referenced), JS modules
   execute, fonts load over HTTP, no console/page/network errors, relative-only
   asset references in the served HTML, plus fa→Vazirmatn / en→Inter Variable
   font checks and an app-page interaction smoke (Bootstrap dropdown + Chart.js
   paint).

Verification result: **all 31 built pages pass** on every serving mode, all
assets return HTTP 200, zero console errors, zero network 404s, fonts load,
and the repo's full Playwright suite (200 tests: catalogs 3, localization 43,
responsive 151, production 3) is green against the built artifact.

---

## Phase 1 — Reproduce

Environment rebuilt from zero:

```bash
rm -rf node_modules dist
npm ci
npm run build          # ✓ exit 0, no warnings (sass deprecations silenced by ID)
```

Output: `dist/` with **31 HTML pages** and **107 assets**
(1 CSS `bootstrap-*.css` ≈ 325 KB, 51 JS chunks, 30 woff2, 25 woff).

Inspected `dist/index.html`, `dist/dashboard.html`, `dist/pricing.html`,
`dist/login.html`, …:

- Every page emits `<script type="module" crossorigin src="./assets/….js">`
  plus `<link rel="stylesheet" crossorigin href="./assets/bootstrap-….css">`
  — **all references relative** (`./assets/…`, never `/assets/…`).
- CSS font references are relative and all resolve: 55 external `url()`s
  (`./vazirmatn-…woff2`, `./jetbrains-mono-…woff2`, `./inter-…woff2`, …),
  0 missing (static audit of all 82 HTML references and all CSS `url()`s).
- No external network dependency anywhere in `dist/` (only the inert
  `http://www.w3.org/2000/svg` namespace string and `api.apiforge.dev` demo
  URLs that live inside code samples/data as text and are never fetched).
- Font files are valid (browser-loaded, see Phase 2).

**In short:** dist is complete and self-contained. Files referenced exist;
there is no "link present but target missing" case.

---

## Phase 2 — Test like a buyer

No `npm run dev` involved. Real browser (Chromium 152, headless) against four
serving modes:

| Serving mode | Pages | Result |
|---|---|---|
| `python3 -m http.server` on `dist/` (plain static host) | 31/31 | ✅ styled, zero console/page errors, zero failed requests, zero HTTP ≥ 400 |
| Nested sub-directory `…/public_html/api/*.html` (shared hosting sub-path) | 31/31 | ✅ same, `./assets` resolves at any depth |
| `npm run preview` (task-recommended check) | 31/31 | ✅ same |
| Extracted `release/APIForge-X-v1.0.0.zip` (buyer package, 30 pages — QA harness excluded by design) | 30/30 | ✅ same |

Per-page probes asserted: compiled stylesheet **applied** (2 050 CSS rules
readable per page, theme background/variables resolved, no transparent body),
page JS **executed** (lucide `<i data-lucide>` markers replaced with inline
SVGs; on `dashboard.html` a Bootstrap dropdown opens and Chart.js pixels are
painted), fonts reachable over HTTP 200 with `font/woff2` content type,
`document.fonts.status === 'loaded'`.

Locale matrix on the built artifact: fa default → `lang=fa dir=rtl`, body
resolves to **Vazirmatn** (glyph metrics confirm the real face renders);
switching to EN → `lang=en dir=ltr`, body resolves to **Inter Variable**
(`inter-latin-….woff2` fetched 200). All 30 pages carry Persian content and
flip live with zero errors.

**Console/network:** 0 console errors, 0 page errors, 0 request failures, 0
non-200 asset responses across every page × every mode (auth pages included —
they intentionally have no header element, which was the only heuristic flag;
individually verified fully styled and functional).

---

## Phase 3 — Vite configuration audit

`vite.config.js` (unchanged this session — verified correct):

- `base: './'` — **the** standalone-distribution requirement. All emitted
  asset URLs become relative, so the package works at domain root, in any
  sub-directory, and from the extracted package.
- `build.rollupOptions.input` lists **all 31 pages** (the 27 task pages +
  `style-guide`, `rtl`, `visual-showcase`, `rtl-persian-test`), so every page
  becomes a real HTML entry with emitted assets.
- CSS is a **single shared bundle**: every page entry imports
  `src/scss/main.scss` (via `src/js/main.js` / `src/js/site.js`), so Vite emits
  one hashed stylesheet referenced by all pages.
- Fonts come from `@fontsource*` imports in SCSS; Vite rewrites the
  `url()`s to hashed local files in `assets/` with relative paths.

No change needed here. If `base: './'` were removed (or `/assets`-style
references ever returned), Phase 4 checks and the new spec would fail loudly.

---

## Phase 4 — Asset path check

- HTML: all asset refs `./assets/…` ✅ (raw-attribute text-level check, all
  31 pages).
- CSS `url()`s: all relative (`./…`), all 55 resolve to real files ✅.
- No `href="/`/`src="/` (root-absolute), no `localhost`, no `src/`-source
  paths in any built HTML ✅.
- JS chunks: every static `import … "./x.js"` target exists in `assets/`
  (full import graph intact) ✅.
- No CDN references — zero runtime network dependency ✅.

---

## Phase 5 — Multi-page verification

Task list (27 pages) + 4 extra built pages — all verified in-browser per the
Phase 2 matrix: CSS loads and applies, JS executes, fonts load, no missing
assets, no console errors.

`index · pricing · dashboard · apis · api-keys · logs · usage · webhooks ·
endpoints · errors · rate-limits · environments · team · billing · settings ·
profile · notifications · docs · sdk · api-reference · metrics · login ·
forgot-password · invite · changelog · status · 404` (plus `style-guide · rtl ·
visual-showcase · rtl-persian-test`) — **31/31 PASS**.

Full repo suite against the production artifact (via `vite preview`):
`catalogs` 3/3, `localization` 43/43, `responsive` 151/151, `production` 3/3 —
**200/200 PASS**.

---

## Phase 6 — Root cause

### Why the reported bug class is structurally prevented at HEAD

The classic MPA failure "dev fine, build unstyled" happens when built HTML
points at assets the packaged artifact cannot serve — e.g. missing `base`
(default `/` → root-absolute `/assets/…`), fonts not copied, CSS split across
files a page never references, or HTML edited to contain `<link>` tags whose
targets do not exist. In this codebase:

- `base: './'` makes every built reference relative (verified text-level).
- The single compiled CSS is imported from every page entry (no page can
  reference a CSS file that wasn't built for it).
- Fonts are imported through `@fontsource*` so Vite both copies them into
  `assets/` *and* rewrites `@font-face` `url()`s to the copied files
  (relative), which is why font paths can never drift.
- Dev mode hides none of this; the difference is purely that dev serves from
  source with the dev server, while the build emits the flat relative package.

### Defects found and fixed this session

1. **Stale-release hazard in `packaging/assemble.mjs`** (the "broken release
   copying process" candidate): dist was reused when present, and the QA audit
   validates whatever tree was copied — so an outdated dist could ship with a
   PASS verdict. **Fix:** the assembler now always rebuilds first.
2. **No browser-level production gate**: `packaging/verify.mjs` proves files
   exist and respond, not that the browser renders them. **Fix:** added
   `tests/production.spec.js` (styled-in-browser assertions per page, network
   failure capture, font resolution per locale, relative-ref contract on raw
   HTML, interaction smoke).

### Documented limitations (by design, no code change)

- **`file://` double-click preview** — Chrome blocks ES-module scripts (and
  the stylesheet fetch) from `file://`; this is standard for module-based
  builds and documented in `packaging/Documentation/Installation.md`, which
  instructs a one-line static server. Buyers previewing an extracted package
  must serve it (any of: python http.server / npx serve / double-click inside
  an IDE preview). Not a build defect — verified that under a real origin all
  assets load.
- **Custom 404 page at deep paths** — on hosts that serve a root `404.html`
  for arbitrary missing URLs without rewriting the URL (Netlify-style), a
  deeply-nested miss like `/deep/missing/page` resolves `./assets/…` relative
  to the request path. This is the inherent semantic of the relative-path
  contract every page follows (the template's QA gate rejects absolute refs
  deliberately, to keep sub-directory installs working). One-level misses
  (`/missing`) render fully styled; hosts that rewrite to the document (GitHub
  Pages/cPanel root error docs) are unaffected. Recommended host config
  (root error document) is already in the installation guide.

---

## Phase 7 — Record

### Files changed

| File | Change |
|---|---|
| `packaging/assemble.mjs` | Always run a fresh `npm run build` before assembling `release/` (never silently reuse stale `dist/`); explanatory comment added. |
| `tests/production.spec.js` | **New.** 3-test Playwright suite running against the built `dist/` via `npm run preview`: (1) every required page ships with a stylesheet link and relative-only asset refs; (2) every page is styled in-browser with zero console/page/network errors, modules boot, fonts load, and dashboard Bootstrap/Chart.js interactions work; (3) locale fonts resolve on fa (Vazirmatn/RTL) and en (Inter Variable/LTR). |

No HTML/SCSS/JS application files, no design, UI, components or features were
touched. No ZIP/marketplace package was created.

### Fix applied

1. Production packaging can no longer ship a stale build: the assembler always
   rebuilds from current source.
2. The exact reported symptom is now covered by an automated, in-browser
   regression suite that fails on: unstyled output, unapplied CSS, dead JS
   modules, missing/failed assets, absolute asset refs, or locale fonts not
   loading — in the packaged artifact, with no dev server.

### Verification result

| Check | Result |
|---|---|
| `npm ci && npm run build` (clean) | ✅ exit 0, no warnings, deterministic hashes |
| dist HTML reference audit (82 refs) | ✅ all resolve, all relative |
| CSS `url()` audit (55 external refs) | ✅ all resolve |
| Browser matrix — static root server | ✅ 31/31 styled, 0 errors, fonts HTTP 200 |
| Browser matrix — nested sub-directory | ✅ 31/31 |
| Browser matrix — `npm run preview` | ✅ 31/31 |
| Browser matrix — extracted buyer ZIP (30 pages) | ✅ 30/30 |
| fa fonts (Vazirmatn, RTL) | ✅ loaded + applied |
| en fonts (Inter Variable, LTR) | ✅ loaded + applied |
| Console/page/network errors (all modes) | ✅ none |
| Repo Playwright suite vs built artifact | ✅ 200/200 (3 catalogs + 43 localization + 151 responsive + 3 production) |

### Reproduce the verification

```bash
npm ci
npm run build
npm run preview            # http://localhost:4173  (production artifact)

# browser-level production gate (needs Chromium, like the other suites):
npx playwright test tests/production.spec.js

# release packaging is rebuilt from current source, every time:
node packaging/assemble.mjs && node packaging/verify.mjs
```
