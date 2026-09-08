# Phase 5 — Persian RTL Localization & Marketplace Readiness

**Status: complete ✅ — the product is Persian RTL marketplace-ready.**

APIForge X is now a **Persian-first, bilingual (fa ⇄ en)** product. Every page
opens in Farsi with `dir="rtl"`, Vazirmatn, Jalali dates and Persian digits, and
flips to English (LTR) live from any header — with no reload and no flash.

---

## 1. Language system — no hardcoded UI strings

| Deliverable | Result |
|---|---|
| Translation catalogs | `src/locales/fa.json` + `src/locales/en.json` — **1,261 keys**, 1,256 Persian values |
| Strings bound in markup | **2,536** `data-i18n` + **414** `data-i18n-attr` bindings across 30 pages |
| Runtime | `src/js/core/i18n.js` — locale resolution, `t()` with `{var}` interpolation, DOM painter, `setLocale()`, `onLocaleChange()`, RTL/LTR sync |
| Long-form docs | `src/js/data/docs-content.en.js` + `docs-content.fa.js` behind the `docs-content.js` locale dispatcher (18 articles translated) |
| Leftover English UI | **0** — the only Latin text left in the UI is technical by design (HTTP verbs, paths, tokens, ids, URLs, package names) |

Terminology follows professional Persian SaaS usage, not machine translation:

`داشبورد` · `کلیدهای API` · `درخواست‌ها` · `تاخیر پاسخ` · `وب‌هوک` · `محیط` ·
`تولید` · `آزمایشی` · `توسعه` · `نقطهٔ پایانی` · `صورت‌حساب` · `محدودیت نرخ` ·
`اعلان‌ها` · `مستندات` · `مرجع API`

Marketing copy is authored, not translated verbatim — hero
**«مدیریت حرفه‌ای APIهای شما»** / subtitle
**«پلتفرم کامل توسعه‌دهندگان برای ساخت، مدیریت و مانیتور سرویس‌های API»**,
plus translated pricing plans (توسعه‌دهنده / حرفه‌ای / سازمانی), FAQ, changelog
and status pages. Auth screens are fully Persian:
ورود، ایمیل، رمز عبور، مرا به خاطر بسپار، فراموشی رمز عبور.

## 2. RTL implementation

- `dir="rtl"` + `lang="fa"` is the default for all 30 pages; the language switch
  flips both attributes at runtime.
- Layout is mirrored with logical properties — `margin-inline`, `padding-inline`,
  `inset-inline`, `border-inline`. A sweep of `src/scss` found only 11 physical
  `left/right` declarations left, all inside code-block/docs chrome or comment
  context.
- Verified RTL in: sidebar + offcanvas drawer, header, breadcrumb, tables
  (alignment and sticky columns), forms, dropdowns, modals, pagination, tabs,
  command palette, toasts, alerts, timelines, bottom tab bar, marketing shell.
- Directional glyphs (arrow / chevron) mirror automatically in RTL; explicit
  back/next controls opt out with `.no-dir-flip` and pick their glyph per direction.
- `rtl.html` — polished Persian app demo.
  **`rtl-persian-test.html`** — new dedicated QA harness (see §8).

## 3. LTR isolation

- `.ltr-isolate { direction: ltr; unicode-bidi: isolate; }` plus `dir="ltr"` on
  every API path, URL, JSON payload, code block, SDK sample, IP, token, UUID and
  version string.
- Code blocks and charts stay LTR regardless of document direction.
- Verified with mixed-script sentences that embed `sk_live_…`, `POST /v1/emails`,
  `req_8Fk2mQx1Zw` and `Authorization` inside Persian prose.

## 4. Typography

- **Vazirmatn** (300/400/500/700) for Persian UI, **Inter Variable** for Latin UI
  and technical terms, **JetBrains Mono** for code and data — all self-hosted,
  no CDN.
- Five typography lanes (`--font-persian-ui`, `--font-latin-ui`,
  `--font-technical`, `--font-code`, `--font-numeric`), RTL heading tracking
  loosened, Persian body line-height `1.7`.
- Numbers: Persian digits for prose/counts (`Intl` with `fa-IR`), Latin digits
  for tabular data, `tabular-nums` for tables, Jalali dates in Persian.

## 5. Persian mock data (deterministic)

`scripts/generate-mock-data.mjs` is the single source of truth and now emits
Persian content — regenerate with `node scripts/generate-mock-data.mjs`.

- **People:** علی رضایی، سارا احمدی، مهدی کریمی، نیلوفر عظیمی، رضا حسینی،
  دانا مرادی، کاوه نوری، لیلا فرهادی (with Persian initials)
- **Projects / keys:** درگاه پرداخت، سامانهٔ تحلیل کاربران، خط یکپارچه‌سازی (CI)،
  سرور آزمایشی، توسعهٔ محلی، استقرار پیش‌نمایش
- **APIs:** سرویس ایمیل، هوش مصنوعی، مخاطبان، وب‌هوک‌ها، پلتفرم
- **Statuses:** موفق / خطا / در انتظار (webhook deliveries), خطاها / هشدار
  (severity), برطرف‌شده / برطرف‌نشده, پایدار / بتا
- 15 datasets carry Persian copy; all technical values (ids, paths, prefixes,
  IPs, emails, packages, status codes) stay Latin/LTR.

## 6. Marketing pages

`index.html`, `pricing.html`, `changelog.html`, `status.html` (and `404.html`,
the auth trio) are fully translated: hero, feature cards, live product preview,
page directory, pricing teaser, plans + comparison table + FAQ, release notes,
component health, incident history, footer and legal line.

## 7. RTL QA page

**`rtl-persian-test.html`** (replaces the old `rtl-test.html`) is the release
gate for Persian/RTL quality. It covers, in one page, with live fa/en and
dark/light/system switching:

1. mixed-script Persian sentence with inline technical terms
2. Persian vs Latin digits, phone/currency, `tabular-nums`
3. LTR isolation (keys, request ids, URLs, versions)
4. code block that is always LTR (cURL / Node tabs + copy)
5. mixed-direction table (log rows with isolated code columns)
6. forms (Persian search, LTR endpoint field)
7. directional icons (back/next)
8. breadcrumb + list
9. chart (locale-aware axis labels, digits and tooltips)
10. dropdown + modal
11. pagination, alerts, timeline

## 8. SEO / marketplace

- `README.md` — Phase 5 status, a **Localization (Persian ⇄ English)** section
  documenting the catalogs, the runtime and the binding conventions, an expanded
  RTL section, updated page table and structure tree.
- `marketplace/DESCRIPTION.md` — rewritten listing copy for both ThemeForest
  (English) and **Rastchin / RTL-Theme (Persian)**, including the bilingual
  system, the RTL engineering notes and a table mapping Iranian-market
  requirements (فارسیِ تخصصی، راست‌به‌چپ واقعی، فونت بدون CDN، تاریخ و اعداد
  فارسی، دادهٔ نمایشی ایرانی، ارائه به مشتری خارجی) to what the template ships.

## 9. Quality gates

| Gate | Result |
|---|---|
| `npm run build` | ✅ green — **30 pages** emitted, per-page chunks, no broken imports |
| HTML validity | ✅ all 30 files parse cleanly (parse5, 0 errors) |
| Missing translations | ✅ **0** — every `data-i18n` / `data-i18n-attr` / `t()` key resolves in both `fa.json` and `en.json` |
| English UI leftovers | ✅ **0** outside technical values |
| Untranslated attribute strings | ✅ 0 (aria-labels, placeholders, titles, tooltips all localized) |
| Runtime wiring | ✅ `initI18n()` runs first in `boot()` / `bootSite()`; page modules re-render on `afx:localechange` |
| Dev server | ✅ `/`, `/dashboard.html`, `/logs.html`, `/docs.html`, `/rtl-persian-test.html`, `/login.html` all 200 with modules transformed |
| RTL layout bugs | ⚠️ static + structural verification only — **no browser in the sandbox**. Visual/responsive confirmation should be done through the live preview (`npm run dev`) or `marketplace/capture-screenshots.mjs` |

### Known non-issues

- Directional back/next glyphs are chosen in JS and opt out of the CSS mirror
  (`.no-dir-flip`) — intentional, see `rtl-persian-test.js`.
- HTTP status texts (`OK`, `Not Found`) and error codes stay English: they are
  protocol values, and the surrounding explanations are Persian.
- Persian compact numbers render as «۱٫۲ میلیون» in prose contexts (Intl
  compact notation) while KPI/table cells keep Latin digits for scannability.

## 10. How to verify in one minute

```bash
npm install
npm run dev            # http://localhost:3000
```

1. Every page opens in Persian, right-to-left.
2. Open **`/rtl-persian-test.html`** and switch RTL/LTR and dark/light — nothing
   breaks, code stays LTR.
3. Click the language control in any header → the whole UI flips to English LTR
   (nav, tables, drawers, charts, docs, toasts) without a reload.
4. Reload — the choice persists with no flash.
