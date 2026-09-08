# Changelog — APIForge X

All notable releases of the commercial template.

## 1.0.0 — 2026-09-08

First public marketplace release.

### Product
- 31 production HTML pages (workspace, docs, marketing, auth, QA surfaces)
- Persian-first bilingual UI (fa ⇄ en) with live language and direction switch
- Dark, light, and system themes with a no-flash boot script
- RTL as a first-class layout (logical CSS properties, LTR isolation for code/keys/URLs)
- Self-hosted fonts: Vazirmatn, Inter Variable, JetBrains Mono — no CDN
- Keyboard-first workspace: command palette (⌘K / Ctrl+K), `g` jumps, `?` help, `/` search
- Deterministic mock data for a working demo without a backend

### Workspace
- Overview dashboard with KPIs, charts, and activity
- API explorer with request tester
- Endpoint management, API keys (reveal-once / rotate / revoke)
- Request logs with inspector and copy-as-cURL
- Webhook debugger with delivery timeline
- Errors, rate limits, usage, metrics, environments
- Team, billing, settings, profile, notifications

### Marketing & auth
- Landing, pricing, changelog, status, 404
- Login, forgot password, invite (simulated)

### Developer package
- Vite 7 + Bootstrap 5.3 + SCSS token system
- Tree-shaken Lucide and Chart.js
- HTML production build with relative asset paths (`base: './'`)

### Quality
- 197 Playwright tests covering localization, interaction, and responsive layout
  (Chromium, 320–1920px). Safari / Firefox / physical devices are not certified.
