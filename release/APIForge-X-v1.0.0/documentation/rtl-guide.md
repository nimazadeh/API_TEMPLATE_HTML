# RTL guide — how right-to-left works here

The template is **Persian-first**: every page opens with `lang="fa"` and
`dir="rtl"`, Vazirmatn typography, Persian digits and Jalali dates — and
flips to English (LTR) live, without a reload.

---

## The three moving parts

### 1. `<html lang dir>` is the single switch

Everything RTL is keyed off the document element:

```scss
[dir='rtl'], [lang='fa'] {
  --font-body: var(--font-persian-ui);   // → Vazirmatn
  --font-numeric: var(--font-persian-ui);
  /* plus line-height 1.7 and zero letter-spacing for Arabic script */
}
```

- A no-flash inline script in each page's `<head>` restores the saved
  language (`localStorage['afx-locale']`) **before first paint**.
- The header language control then re-sets `lang`/`dir`, re-paints every
  `[data-i18n]` / `[data-i18n-attr]` node and re-renders data-driven UI —
  tables, charts, drawers, the command palette — via the `afx:localechange`
  event. No page reload, no flash.
- Persisted under `afx-locale` (`fa` | `en`).

### 2. Layout mirrors itself with logical properties

Spacing and positioning use **logical CSS properties** throughout:

- `margin-inline*`, `padding-inline*`, `text-align: start/end`
- `inset-inline-start/end`, `border-inline-*`

So a sidebar that sits on the right in Persian is automatically on the left
in English. Directional motion (drawer slide, row hover rail) is multiplied
by `--dir-sign` (1 in LTR, −1 in RTL) from `src/scss/tokens/_motion.scss`.

**Rule when you add CSS:** prefer logical properties. Physical `left`/`right`
will break the mirror.

### 3. LTR isolation for technical content

Code, API keys, endpoints, tokens, IPs, UUIDs, JSON and URLs must never
mirror. Wrap them:

```html
<span class="ltr-isolate">sk_live_9f3K…</span>
```

`.ltr-isolate` sets `direction: ltr; unicode-bidi: isolate; text-align: left`.
Code blocks, charts and `<code>` force LTR in SCSS. Latin technical terms
inside Persian sentences use `.tech`, which keeps the Latin face (Inter)
while the surrounding text is Vazirmatn — deliberate, so "API" and "SDK"
don't re-style mid-sentence.

## Persian typography (Vazirmatn)

Vazirmatn is the primary Persian face and the product's signature. It is
self-hosted (weights 300–700, arabic + latin subsets) and applied through
the locale-resolved `--font-body` lane — body text, display headlines, form
controls and numeric data all resolve to Vazirmatn when the document is
`fa`/`rtl`:

```scss
--font-persian-ui: 'Vazirmatn', 'Inter Variable', Tahoma, sans-serif;
```

Persian-specific adjustments already in place:

- `--lh-body-fa: 1.7` — taller line-height for Arabic ascenders
- `letter-spacing: 0` under `[dir='rtl']` — negative tracking breaks joining
  letters; heading tracking is loosened instead
- Tabular numerics keep working (`.num` / `font-feature-settings: 'tnum'`)

Digits and dates (helpers in `src/js/utils/format.js`):

| Context | Rule |
|---------|------|
| Prose, counts, toasts | Persian digits (`Intl`, `fa-IR`) |
| Tables, IDs, technical data | Latin digits, LTR-isolated |
| Dates (Persian locale) | Jalali calendar through `Intl` |

## Directional icons

Chevrons and arrows that mean "back/next" register both glyphs in
`src/js/components/icons.js`; controls with `data-dir-icon="back|next"` pick
the correct glyph per direction. Non-directional icons (search, settings,
check) are never flipped.

## Where to see it

| Page | Role |
|------|------|
| `rtl.html` | Full Persian app demo — sidebar on the right, mixed-script content |
| Any workspace page | Switch language from the header and watch the mirror |
| `style-guide.html` | Typography, code blocks and forms in both directions |

## Adding a translated string

1. Add the same key to `src/locales/fa.json` **and** `src/locales/en.json`.
2. Bind it with `data-i18n` / `data-i18n-attr` in markup or `t()` in JS.
3. Never leave a user-visible label without a key — untranslated strings
   survive a language switch and break the illusion.

---

© Blue Studio — APIForge X is designed and maintained by Blue Studio.
