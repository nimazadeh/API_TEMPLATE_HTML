# Listing copy — APIForge X

Two ready-to-paste descriptions. The ThemeForest one is English; the
**Rastchin / RTL-Theme one is Persian** (Rastchin is an Iranian marketplace —
list in Persian, or paste the English text as the secondary description).

APIForge X ships **Persian-first**: every page opens in Farsi with Vazirmatn,
`dir="rtl"`, Jalali dates and Persian digits — and flips to English (LTR) with
one click, live, with no reload.

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

**APIForge X** is not another admin theme. It is a purpose-built HTML template
for API platforms — AI APIs, infrastructure APIs, BaaS and SaaS developer
tools — in the spirit of Stripe, Resend, Vercel and Linear.

Every page is deep and interactive, backed by deterministic mock data, so your
demo works the moment you open it:

- **Overview** — KPI cards, request-volume and latency charts, activity feed
- **Request logs** — a dense inspector with headers, payload, timing and “copy as cURL”
- **Webhooks debugger** — delivery timelines, retries and a payload inspector with signatures
- **API keys** — masked, reveal-once, rotate and revoke with scoped creation
- **API explorer** — live request tester with key injection and JSON responses
- **Errors & rate limits** — issues with stack traces; limits with usage charts and rules
- **Usage & metrics** — attribution, percentiles and availability breakdowns
- **Billing, team, environments, notifications, settings, profile** — the full workspace
- **Documentation, SDKs, API reference** — a complete developer-docs surface (translated too)
- **Persian RTL, first-class** — see the section below

**Bilingual by design (fa ⇄ en)**

- Two complete translation catalogs — `src/locales/fa.json` and `src/locales/en.json` —
  ~1,260 keys covering navigation, buttons, forms, tables, empty states, modals,
  alerts, toasts, status labels, chart sentences, docs and marketing copy
- No hardcoded UI strings: every visible label is bound with `data-i18n` /
  `data-i18n-attr`, so swapping copy never means touching markup
- Live language switch in every header — no reload, no flash (the inline `<head>`
  script restores the saved locale before first paint)
- Long-form documentation is authored per locale (`docs-content.fa.js` /
  `docs-content.en.js`), not string-by-string

**RTL engineering, not an afterthought**

- Logical properties throughout (`margin-inline`, `padding-inline`,
  `inset-inline`, `border-inline`) — the layout mirrors itself
- Code, keys, endpoints, tokens, IPs, UUIDs and URLs stay LTR-isolated with
  `dir="rtl"` + `.ltr-isolate { direction: ltr; unicode-bidi: isolate; }`
- Persian digits for prose and counts, Latin digits for tabular data; Jalali
  dates via `Intl` in the Persian locale
- Directional glyphs (arrow / chevron) mirror automatically in RTL
- `rtl.html` — a full Persian app demo, and `rtl-persian-test.html` — a dedicated
  QA harness for mixed-script sentences, digits, isolation, code blocks, tables,
  forms, charts, dropdowns, modals, pagination, alerts and timelines

Built the way you would build it:

- HTML5 + Bootstrap 5.3 (as a toolkit, not the identity) + SCSS design tokens
- Dark, light and system themes with a no-flash inline script
- ES modules + Vite; Lucide icons tree-shaken; Chart.js registered tree-shaken
- Self-hosted fonts (Vazirmatn, Inter Variable, JetBrains Mono) — zero CDN
- Keyboard-first: `⌘K` palette, `?` shortcut help, `g` navigation, `/` search
- Responsive 360–1920 with intentional mobile patterns (drawer, bottom bar, scrollable tables)
- Deterministic mock data — regenerate any dataset from one script

**What you get:** 30 HTML pages, the full SCSS source with documented tokens,
the mock-data generator, a style guide, a Persian RTL demo plus a Persian RTL QA
page, buyer documentation and the screenshot capture script for your own listing.

**License:** Regular and Extended. Extended covers unlimited end-product sales.

---

## راست‌چین / Rastchin (فارسی)

### عنوان

**APIForge X — قالب HTML پریمیوم برای پلتفرم‌های API (بوت‌استرپ ۵ + SCSS + Vite، فارسیِ راست‌به‌چپ و انگلیسیِ چپ‌به‌راست)**

### توضیح کوتاه

قالبی تخصصی برای پلتفرم‌های توسعه‌دهنده: داشبورد، لاگ درخواست‌ها، دیباگر وب‌هوک
در سطح Stripe، کلیدهای API با نمایش یک‌باره، صورت‌حساب و مستندات. **فارسی‌محور**
با تغییر زنده به انگلیسی، ۳۰ صفحهٔ دست‌ساز، بدون React، بدون Tailwind، بدون CDN.

### توضیح کامل

**APIForge X** یک قالب ادمین عمومی نیست. این یک قالب HTML تخصصی برای پلتفرم‌های
API است — APIهای هوش مصنوعی، زیرساخت‌ها، BaaS و ابزارهای توسعه‌دهنده — با الهام از
کیفیت محصولاتی مثل Stripe، Resend، Vercel و Linear.

هر صفحه عمیق و تعاملی طراحی شده و با دادهٔ نمایشی قطعی (Deterministic) تغذیه
می‌شود؛ دمو از همان لحظهٔ اول کار می‌کند:

- **نمای کلی** — کارت‌های شاخص، نمودار حجم درخواست و تاخیر پاسخ، فید فعالیت‌ها
- **لاگ درخواست‌ها** — بازرسی کامل با هدرها، بدنهٔ درخواست، زمان‌بندی و «کپی در قالب cURL»
- **دیباگر وب‌هوک** — خط زمانی تحویل، تلاش‌های مجدد و بازرس بدنه با امضای دیجیتال
- **کلیدهای API** — پوشیده، نمایش یک‌باره، چرخش و ابطال با ساختِ دارای سطح دسترسی
- **کاوشگر API** — تستر زندهٔ درخواست با تزریق کلید و پاسخ JSON
- **خطاها و محدودیت نرخ** — خطاها با ردیابی پشته؛ محدودیت‌ها با نمودار مصرف و قوانین هر API
- **مصرف و متریک‌ها** — انتساب درخواست‌ها، صدک‌های تاخیر و میزان در دسترس‌بودن
- **صورت‌حساب، تیم، محیط‌ها، اعلان‌ها، تنظیمات، نمایه** — فضای کاری کامل
- **مستندات، SDKها، مرجع API** — سطح کامل مستندات توسعه‌دهنده، ترجمه‌شده به فارسی

**دوزبانه از پایه (فارسی ⇄ انگلیسی)**

- دو فایل ترجمهٔ کامل — `src/locales/fa.json` و `src/locales/en.json` — با بیش از
  ۱٬۲۶۰ کلید برای ناوبری، دکمه‌ها، فرم‌ها، جدول‌ها، وضعیت‌های خالی، پنجره‌ها،
  هشدارها، پیام‌ها، برچسب‌های وضعیت، جملات نمودارها، مستندات و متون بازاریابی
- **هیچ متن ثابتی در نشانه‌گذاری نیست**: همهٔ برچسب‌ها با `data-i18n` و
  `data-i18n-attr` به فایل‌های ترجمه متصل‌اند؛ تغییر متن نیازی به دست‌زدن در HTML ندارد
- تغییر زبان از هدر هر صفحه، به‌صورت زنده و بدون بارگذاری مجدد — اسکریپت داخلی
  `<head>` زبان ذخیره‌شده را پیش از نخستین رندر اعمال می‌کند (بدون پرش تصویر)
- مستندات بلند به‌صورت فایل جداگانه برای هر زبان نوشته شده‌اند
  (`docs-content.fa.js` / `docs-content.en.js`)، نه کلیدبه‌کلید

**مهندسی راست‌به‌چپ، نه یک ویژگی الحاقی**

- استفاده از ویژگی‌های منطقی (Logical Properties) در سراسر قالب
  (`margin-inline`، `padding-inline`، `inset-inline`، `border-inline`)؛
  چیدمان خودبه‌خود آینه می‌شود
- کدها، کلیدها، مسیرها، توکن‌ها، آی‌پی‌ها، UUIDها و نشانی‌ها با
  `dir="ltr"` و کلاس `ltr-isolate` (`direction: ltr; unicode-bidi: isolate;`)
  ایزوله می‌شوند و هرگز به هم نمی‌ریزند
- ارقام فارسی برای متن و شمارش‌ها، ارقام لاتین برای داده‌های جدولی و
  تاریخ شمسی (جلالی) برای زبان فارسی
- آیکون‌های جهت‌دار (فلش، شِورون) در راست‌به‌چپ خودکار آینه می‌شوند
- `rtl.html` — نمونهٔ کامل فارسی برنامه، و `rtl-persian-test.html` — صفحهٔ
  تضمین کیفیت اختصاصی برای جملات ترکیبی، ارقام، ایزوله‌سازی، بلوک کد، جدول،
  فرم، نمودار، منوی کشویی، پنجره، صفحه‌بندی، هشدار و خط زمانی

ساخته‌شده همان‌طور که خودتان می‌ساختید:

- HTML5 + بوت‌استرپ ۵.۳ (به‌عنوان ابزار، نه هویت بصری) + توکن‌های طراحی SCSS
- پوستهٔ تیره، روشن و سیستمی با اسکریپت بدون فلش (No-Flash)
- ماژول‌های ES + Vite؛ آیکون‌های Lucide و Chart.js به‌صورت Tree-Shaken
- فونت‌های محلی (وزیرمتن، Inter Variable، JetBrains Mono) — بدون هیچ CDN
- کیبوردمحور: پالت فرمان `⌘K`، راهنمای میان‌برها `?`، ناوبری با `g`، جستجو با `/`
- واکنش‌گرا از ۳۶۰ تا ۱۹۲۰ پیکسل با الگوهای هدفمند موبایل (کشو، نوار پایین، جدول اسکرول‌پذیر)
- دادهٔ نمایشی قطعی — هر مجموعه‌داده با یک اسکریپت بازتولید می‌شود

**آنچه دریافت می‌کنید:** ۳۰ صفحهٔ HTML، سورس کامل SCSS با توکن‌های مستند،
مولد دادهٔ نمایشی، راهنمای استایل، دموی فارسی و صفحهٔ تضمین کیفیت راست‌به‌چپ،
مستندات خریدار و اسکریپت تولید تصاویر اسکرین‌شات برای لیست‌کردن خودتان.

**لایسنس:** نسخهٔ عادی و توسعه‌یافته (Extended). نسخهٔ توسعه‌یافته فروش به
کاربر نهایی نامحدود را پوشش می‌دهد.

### نکات کلیدی برای فروش در راست‌چین

| نیاز بازار ایران | پاسخ APIForge X |
|---|---|
| متن رابط کاملاً فارسی و تخصصی | ترجمهٔ تخصصی SaaS به فارسی برای ناوبری، فرم‌ها، جدول‌ها، خطاها و مستندات — نه ترجمهٔ ماشینی |
| راست‌به‌چپ واقعی، بدون درهم‌ریختگی | ویژگی‌های منطقی در سراسر قالب + ایزوله‌سازی کدها، توکن‌ها و نشانی‌ها |
| فونت فارسی حرفه‌ای بدون CDN | وزیرمتن (Vazirmatn) به‌صورت محلی، همراه Inter Variable و JetBrains Mono |
| تاریخ و اعداد فارسی | تاریخ شمسی و ارقام فارسی در متن، ارقام لاتین در داده‌های فنی |
| دادهٔ نمایشی ایرانی | کاربران و پروژه‌های فارسی (علی رضایی، سارا احمدی، درگاه پرداخت، سامانهٔ تحلیل کاربران) در کنار مقادیر فنی لاتین |
| امکان ارائه به مشتری خارجی | تغییر زنده به انگلیسیِ چپ‌به‌راست با یک کلیک — همان محصول، دو زبان |
