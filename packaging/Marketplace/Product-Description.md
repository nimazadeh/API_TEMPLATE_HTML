# Product description — paste-ready listing copy

Use the **Persian section** as the primary listing on Rastchin / RTL-Theme,
and the English text as the secondary description (or as the full ThemeForest
description).

---

## ThemeForest (English)

### Title

**APIForge X — Premium API Infrastructure HTML Template (Bootstrap 5 + SCSS + Vite, Persian RTL & LTR)**

### Short description

A specialized developer-platform template — dashboards, request logs, a
Stripe-grade webhook debugger, reveal-once API keys, billing and docs.
Persian-first with a live English/LTR switch, 30 hand-built pages, no React,
no Tailwind, no CDN.

### Long description

**APIForge X** is not another admin theme. It is a purpose-built HTML
template for API platforms — AI APIs, infrastructure APIs, BaaS and SaaS
developer tools — in the spirit of Stripe, Resend, Vercel and Linear.

Every page is deep and interactive, backed by deterministic mock data, so
your demo works the moment you open it:

- **Overview** — KPI cards, request-volume and latency charts, activity feed
- **Request logs** — a dense inspector with headers, payload, timing and
  “copy as cURL”
- **Webhooks debugger** — delivery timelines, retries and a payload inspector
  with signatures
- **API keys** — masked, reveal-once, rotate and revoke with scoped creation
- **API explorer** — live request tester with key injection and JSON
  responses
- **Errors & rate limits** — issues with stack traces; limits with usage
  charts and rules
- **Usage & metrics** — attribution, percentiles and availability breakdowns
- **Billing, team, environments, notifications, settings, profile** — the
  full workspace
- **Documentation, SDKs, API reference** — a complete developer-docs surface
  (translated to Persian too)
- **Persian RTL, first-class** — see below

**Bilingual by design (fa ⇄ en)**

- Two complete translation catalogs — `src/locales/fa.json` and
  `src/locales/en.json` — ~1,347 keys covering navigation, buttons, forms,
  tables, empty states, modals, alerts, toasts, status labels, chart
  sentences, docs and marketing copy
- No hardcoded UI strings: every visible label is bound with `data-i18n` /
  `data-i18n-attr`, so swapping copy never means touching markup
- Live language switch in every header — no reload, no flash (the inline
  `<head>` script restores the saved locale before first paint)
- Long-form documentation is authored per locale
  (`docs-content.fa.js` / `docs-content.en.js`), not string-by-string

**Persian typography, done properly**

- **Vazirmatn** — the professional Persian face — is self-hosted
  (woff2, weights 300–700) and applied to every Persian UI lane: body text,
  display headlines, forms, dropdowns and numerics
- Inter Variable for the English UI, JetBrains Mono for code — one
  locale-resolved font token (`--font-body`) switches the whole product
  between languages
- Persian digits and Jalali dates in prose; Latin digits in technical data;
  code and keys LTR-isolated

**Premium polish & motion**

- An atmospheric backdrop layer (fine developer grid, controlled accent glow
  and an API-infrastructure lattice) on the marketing and auth surfaces —
  the app workspace stays a clean, distraction-free tool
- A centralized motion system: `--motion-fast 150ms` · `--motion-normal
  250ms` · `--motion-slow 400ms` on one `cubic-bezier(.2,.8,.2,1)` curve
- Entrance choreography on the landing hero, card entrances, hover
  elevation, row hover with a directional accent rail, sliding tab
  indicators, smooth dropdown / modal / drawer / toast transitions and
  animated charts
- `transform` and `opacity` only — no layout shift, no looping motion — and
  every decorative animation is disabled under `prefers-reduced-motion`
- A rebuilt premium toast: icon · title + message · close, logical padding
  that mirrors in RTL, `role="status"` / `role="alert"` with `aria-live`,
  four token-coloured states and a 250ms enter / fade exit

**RTL engineering, not an afterthought**

- Logical properties throughout (`margin-inline`, `padding-inline`,
  `inset-inline`, `border-inline`) — the layout mirrors itself
- Code, keys, endpoints, tokens, IPs, UUIDs and URLs stay LTR-isolated
- Directional glyphs (arrow / chevron) mirror automatically in RTL
- `rtl.html` — a full Persian app demo inside the package

Built the way you would build it:

- HTML5 + Bootstrap 5.3 (as a toolkit, not the identity) + SCSS design
  tokens
- Dark, light and system themes with a no-flash inline script
- ES modules + Vite; Lucide icons tree-shaken; Chart.js registered
  tree-shaken
- Self-hosted fonts — zero CDN, zero runtime dependencies
- Keyboard-first: `⌘K` palette, `?` shortcut help, `g` navigation, `/`
  search
- Responsive 360–1920 with intentional mobile patterns (drawer, bottom bar,
  scrollable tables)
- Deterministic mock data — regenerate any dataset from one script

**What you get:** a 30-page production HTML package (upload anywhere), the
full Vite source (31 pages including the RTL QA harness), a documented SCSS
token system, the mock-data generator, style guide, Persian RTL demo and
visual & motion showcase, buyer documentation, and the screenshot capture
script for your own listing.

**License:** Regular and Extended. Extended covers unlimited end-product
sales. See `LICENSE.txt`.

---

## Rastchin / RTL-Theme (فارسی)

### عنوان

**APIForge X — قالب HTML پریمیوم برای پلتفرم‌های API (بوت‌استرپ ۵ + SCSS + Vite، فارسیِ راست‌به‌چپ و انگلیسیِ چپ‌به‌راست)**

### توضیح کوتاه

قالبی تخصصی برای پلتفرم‌های توسعه‌دهنده: داشبورد، لاگ درخواست‌ها، دیباگر
وب‌هوک در سطح Stripe، کلیدهای API با نمایش یک‌باره، صورت‌حساب و مستندات.
**فارسی‌محور** با تغییر زنده به انگلیسی، ۳۰ صفحهٔ دست‌ساز، بدون React، بدون
Tailwind، بدون CDN.

### توضیح کامل

**APIForge X** یک قالب ادمین عمومی نیست. این یک قالب HTML تخصصی برای
پلتفرم‌های API است — APIهای هوش مصنوعی، زیرساخت‌ها، BaaS و ابزارهای
توسعه‌دهنده — با الهام از کیفیت محصولاتی مثل Stripe، Resend، Vercel و
Linear.

هر صفحه عمیق و تعاملی طراحی شده و با دادهٔ نمایشی قطعی (Deterministic)
تغذیه می‌شود؛ دمو از همان لحظهٔ اول کار می‌کند:

- **نمای کلی** — کارت‌های شاخص، نمودار حجم درخواست و تاخیر پاسخ، فید
  فعالیت‌ها
- **لاگ درخواست‌ها** — بازرسی کامل با هدرها، بدنهٔ درخواست، زمان‌بندی و
  «کپی در قالب cURL»
- **دیباگر وب‌هوک** — خط زمانی تحویل، تلاش‌های مجدد و بازرس بدنه با
  امضای دیجیتال
- **کلیدهای API** — پوشیده، نمایش یک‌باره، چرخش و ابطال با ساختِ دارای سطح
  دسترسی
- **کاوشگر API** — تستر زندهٔ درخواست با تزریق کلید و پاسخ JSON
- **خطاها و محدودیت نرخ** — خطاها با ردیابی پشته؛ محدودیت‌ها با نمودار
  مصرف و قوانین هر API
- **مصرف و متریک‌ها** — انتساب درخواست‌ها، صدک‌های تاخیر و میزان
  در دسترس‌بودن
- **صورت‌حساب، تیم، محیط‌ها، اعلان‌ها، تنظیمات، نمایه** — فضای کاری کامل
- **مستندات، SDKها، مرجع API** — سطح کامل مستندات توسعه‌دهنده،
  ترجمه‌شده به فارسی
- **راست‌به‌چپِ فارسی، کلاس یک** — در ادامه

**دوزبانه از پایه (فارسی ⇄ انگلیسی)**

- دو فایل ترجمهٔ کامل — `src/locales/fa.json` و `src/locales/en.json` — با
  بیش از ۱٬۳۴۷ کلید برای ناوبری، دکمه‌ها، فرم‌ها، جدول‌ها، وضعیت‌های خالی،
  پنجره‌ها، هشدارها، پیام‌ها، برچسب‌های وضعیت، جملات نمودارها، مستندات و
  متون بازاریابی
- **هیچ متن ثابتی در نشانه‌گذاری نیست**: همهٔ برچسب‌ها با `data-i18n` و
  `data-i18n-attr` به فایل‌های ترجمه متصل‌اند؛ تغییر متن نیازی به دست‌زدن
  در HTML ندارد
- تغییر زبان از هدر هر صفحه، به‌صورت زنده و بدون بارگذاری مجدد — اسکریپت
  داخلی `<head>` زبان ذخیره‌شده را پیش از نخستین رندر اعمال می‌کند (بدون
  پرش تصویر)
- مستندات بلند به‌صورت فایل جداگانه برای هر زبان نوشته شده‌اند
  (`docs-content.fa.js` / `docs-content.en.js`)، نه کلیدبه‌کلید

**تایپوگرافی فارسی، درست از پایه**

- **وزیرمتن (Vazirmatn)** — فونت حرفه‌ای فارسی — به‌صورت محلی (woff2،
  ضخامت ۳۰۰ تا ۷۰۰) همراه است و روی **همهٔ مسیرهای رابط فارسی** اعمال
  شده: متن بدنه، تیترهای درشت، فرم‌ها، منوهای کشویی و داده‌های عددی
- Inter Variable برای رابط انگلیسی و JetBrains Mono برای کد — با یک توکن
  فونتِ وابسته به زبان (`--font-body`) کل محصول بین دو زبان جابه‌جا می‌شود
- ارقام فارسی و تاریخ شمسی در متن، ارقام لاتین در داده‌های فنی، و کد و
  کلیدها ایزولهٔ LTR

**پرداخت بصری پریمیوم و سیستم حرکت**

- لایهٔ پس‌زمینهٔ جوی (شبکهٔ ظریف توسعه‌دهنده، درخشش کنترل‌شدهٔ تأکیدی و
  الگوی زیرساخت API) روی صفحات بازاریابی و احراز هویت — فضای کاری برنامه
  همچنان پاکیزه و بدون عامل پرت‌کنندهٔ حواس باقی می‌ماند
- سیستم حرکت یکپارچه: ۱۵۰ms سریع، ۲۵۰ms عادی، ۴۰۰ms آرام، همه با یک
  منحنی `cubic-bezier(.2,.8,.2,1)`
- طراحی ورودِ مرحله‌به‌مرحله در صفحهٔ فرود، ورود کارت‌ها، اِلِویشن در
  هاورِ دکمه و کارت، هاورِ ردیف جدول با نوار تأکیدی جهت‌دار، نشانگر لغزان
  تب‌ها، انتقال‌های نرم در منو، پنجره، کشو و اعلان و نمودارهای متحرک
- فقط `transform` و `opacity` — بدون جابه‌جایی چیدمان و بدون حرکت مداوم —
  و خاموش‌شدن کامل انیمیشن‌های تزئینی در صورت فعال‌بودن
  `prefers-reduced-motion`
- اعلان (Toast) بازطراحی‌شده: آیکون · عنوان و پیام · دکمهٔ بستن،
  فاصله‌گذاری منطقی که در راست‌به‌چپ آینه می‌شود، `role="status"` /
  `role="alert"` همراه `aria-live`، چهار وضعیت با رنگ‌های توکن‌محور و
  ورود ۲۵۰ میلی‌ثانیه‌ای

**مهندسی راست‌به‌چپ، نه یک ویژگی الحاقی**

- استفاده از ویژگی‌های منطقی (Logical Properties) در سراسر قالب
  (`margin-inline`، `padding-inline`، `inset-inline`، `border-inline`)؛
  چیدمان خودبه‌خود آینه می‌شود
- کدها، کلیدها، مسیرها، توکن‌ها، آی‌پی‌ها، UUIDها و نشانی‌ها با
  `dir="ltr"` و کلاس `ltr-isolate` ایزوله می‌شوند و هرگز به هم نمی‌ریزند
- آیکون‌های جهت‌دار (فلش، شِورون) در راست‌به‌چپ خودکار آینه می‌شوند
- `rtl.html` — نمونهٔ کامل فارسی برنامه، همراه با بسته

ساخته‌شده همان‌طور که خودتان می‌ساختید:

- HTML5 + بوت‌استرپ ۵.۳ (به‌عنوان ابزار، نه هویت بصری) + توکن‌های طراحی
  SCSS
- پوستهٔ تیره، روشن و سیستمی با اسکریپت بدون فلش (No-Flash)
- ماژول‌های ES + Vite؛ آیکون‌های Lucide و Chart.js به‌صورت Tree-Shaken
- فونت‌های محلی (وزیرمتن، Inter Variable، JetBrains Mono) — بدون هیچ CDN
- کیبوردمحور: پالت فرمان `⌘K`، راهنمای میان‌برها `?`، ناوبری با `g`،
  جستجو با `/`
- واکنش‌گرا از ۳۶۰ تا ۱۹۲۰ پیکسل با الگوهای هدفمند موبایل (کشو، نوار
  پایین، جدول اسکرول‌پذیر)
- دادهٔ نمایشی قطعی — هر مجموعه‌داده با یک اسکریپت بازتولید می‌شود

**آنچه دریافت می‌کنید:** بستهٔ HTML آمادهٔ ۳۰ صفحهٔ تولیدی (آپلود در
هرجا)، سورس کامل Vite (۳۱ صفحه شامل صفحهٔ تضمین کیفیت راست‌به‌چپ)،
سیستم توکن SCSS مستند، مولد دادهٔ نمایشی، راهنمای استایل، دموی فارسی و
صفحهٔ نمایش بصری و حرکت، مستندات خریدار و اسکریپت تولید تصاویر
اسکرین‌شات برای لیست‌کردن خودتان.

**لایسنس:** نسخهٔ عادی و توسعه‌یافته (Extended). نسخهٔ توسعه‌یافته فروش به
کاربر نهایی نامحدود را پوشش می‌دهد. فایل `LICENSE.txt` را ببینید.

### نکات کلیدی برای فروش در راست‌چین

| نیاز بازار ایران | پاسخ APIForge X |
|---|---|
| متن رابط کاملاً فارسی و تخصصی | ترجمهٔ تخصصی SaaS به فارسی برای ناوبری، فرم‌ها، جدول‌ها، خطاها و مستندات — نه ترجمهٔ ماشینی |
| راست‌به‌چپ واقعی، بدون درهم‌ریختگی | ویژگی‌های منطقی در سراسر قالب + ایزوله‌سازی کدها، توکن‌ها و نشانی‌ها |
| فونت فارسی حرفه‌ای بدون CDN | وزیرمتن (Vazirmatn) به‌صورت محلی روی همهٔ مسیرهای رابط فارسی، همراه Inter Variable و JetBrains Mono |
| تاریخ و اعداد فارسی | تاریخ شمسی و ارقام فارسی در متن، ارقام لاتین در داده‌های فنی |
| دادهٔ نمایشی ایرانی | کاربران و پروژه‌های فارسی (علی رضایی، سارا احمدی، درگاه پرداخت، سامانهٔ تحلیل کاربران) در کنار مقادیر فنی لاتین |
| امکان ارائه به مشتری خارجی | تغییر زنده به انگلیسیِ چپ‌به‌راست با یک کلیک — همان محصول، دو زبان |

---

## Requirements

**HTML package:** any static web server or host (Apache, Nginx, cPanel,
Netlify, Vercel, object storage with web hosting). Modern evergreen
browsers (current Chrome, Edge, Firefox, Safari). No Node.js, no database,
no PHP.

**Source package:** Node.js 20+, npm 10+, optional Chromium for Playwright.

**Browser support (product):** automated regression in this release runs on
Chromium across 320–1920px, fa/en, dark/light. Safari, Firefox and
physical devices are not separately certified.

**What this is not:** not a live API gateway, not real authentication or
billing, not a WordPress/Laravel theme. Static front-end with simulated
auth (toasts only).

## Technologies

| Layer | Choice | Version |
|-------|--------|---------|
| Markup | HTML5 | — |
| Toolkit | Bootstrap | 5.3.x |
| Overlay positioning | @popperjs/core | 2.11.x |
| Styles | SCSS + design tokens | Sass 1.x |
| Bundler | Vite | 7.x |
| Language | ES modules (no jQuery, no React) | — |
| Icons | Lucide (tree-shaken) | 0.54x |
| Charts | Chart.js (tree-shaken) | 4.5.x |
| Persian UI font | Vazirmatn (Fontsource, self-hosted) | 5.x |
| Latin UI font | Inter Variable (Fontsource, self-hosted) | 5.x |
| Code font | JetBrains Mono (Fontsource, self-hosted) | 5.x |
| Tests (source only) | Playwright | 1.x |

**Not used:** Tailwind, React, Vue, Angular, jQuery, remote font/CSS CDNs,
PHP, databases.

## FAQ

**Does it need a backend?**
No. All data is mock JSON bundled in the JavaScript build. Auth buttons show
toasts only.

**Can I upload it to cPanel?**
Yes. Upload the contents of `APIForge-X-HTML/` (HTML + `assets/`).

**Can I change colors without touching every page?**
Yes — in the source package: `src/scss/tokens/_colors.scss`, then
`npm run build`.

**Is RTL a plugin?**
No. The layout uses logical CSS properties; Persian is the default locale
and English is a live switch, not a second template.

**Which font does Persian use?**
Vazirmatn, self-hosted (woff2, weights 300–700), applied to every Persian UI
lane through the locale-resolved `--font-body` token. Inter Variable is the
English face, JetBrains Mono is code.

**How do I add a page?**
`Documentation/Customization.md` → “Adding new pages” (source package).

**React or Tailwind?**
Neither. HTML + Bootstrap 5 + SCSS + Vite.

**Are fonts loaded from Google?**
No. Woff2 files ship inside `assets/`.

**`file://` does not run scripts.**
Serve the folder over HTTP. Python's `http.server` is enough locally.

**How many pages?**
The HTML package has 30 production pages (workspace, docs, marketing, auth,
showcase). The source build additionally emits `rtl-persian-test.html`, a
QA harness used by the test suites — deliberately not shipped in the HTML
package.

**Regular vs Extended license?**
Regular: one end product. Extended: end product sold to many customers. You
still cannot resell the template itself. See `LICENSE.txt`.

**Tests?**
`npm test` in `APIForge-X-Source/`. Not required for hosting.
