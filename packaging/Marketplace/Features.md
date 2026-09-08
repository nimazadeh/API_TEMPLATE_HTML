# Features — APIForge X

## Highlights

- 30 production HTML pages — depth over breadth (the source build adds one
  RTL QA harness, excluded from the HTML package)
- Persian-first UI with live English / LTR switch (no reload, no flash)
- **Vazirmatn** as the primary Persian face — self-hosted woff2
  (300–700), applied to every Persian UI lane via a locale-resolved font
  token; Inter Variable for English, JetBrains Mono for code
- Dark, light, and system themes with a no-flash boot script
- First-class RTL: logical CSS properties, LTR isolation for code/keys/URLs,
  directional icons, Persian digits and Jalali dates
- Bootstrap 5.3 toolkit under a custom SCSS token identity (no default
  Bootstrap look)
- Vite 7 source + hashed static build with relative paths (`./assets/...`)
- Keyboard-first workspace: command palette (⌘K / Ctrl+K), `g` jumps, `?`
  help, `/` search
- Chart.js metrics (tree-shaken registration), Lucide icons (tree-shaken
  registry)
- Reveal-once API keys with rotate / revoke and scoped creation
- Request log inspector + copy as cURL
- Webhook delivery debugger (attempts, signatures, payload inspector)
- API explorer with a live request tester
- Billing, team, environments, notifications — the full workspace
- Docs portal, SDK catalog, API reference (translated)
- Marketing landing, pricing, changelog, status, 404
- Auth screens (demo only — toasts, no real login)
- Premium toast, centralized motion system, atmospheric marketing backdrop
- Deterministic mock data generator (seeded, one script)
- Style guide, Persian RTL demo, visual & motion showcase pages
- Works in a sub-folder (relative asset paths) — zero runtime CDN

## Page inventory (HTML package — 30 pages)

### Workspace (16)

| File | Purpose |
|------|---------|
| `dashboard.html` | Overview, KPIs, charts, activity feed |
| `apis.html` | API catalog, docs pane, request tester |
| `endpoints.html` | Endpoint table, drawer, create/edit |
| `api-keys.html` | Keys, reveal-once, rotate/revoke |
| `logs.html` | Request logs and inspector |
| `webhooks.html` | Endpoints, deliveries, payload debugger |
| `errors.html` | Issues, stack drawer, resolve/assign |
| `rate-limits.html` | Limit cards, charts, rules |
| `usage.html` | Plan usage, attribution |
| `environments.html` | Prod/staging/dev variables and keys |
| `metrics.html` | Observability KPIs and breakdowns |
| `team.html` | Members, invites, roles |
| `billing.html` | Plan, invoices, payment method |
| `settings.html` | Workspace, security, sessions |
| `profile.html` | Personal profile and preferences |
| `notifications.html` | Notification center |

### Developer docs (3)

| File | Purpose |
|------|---------|
| `docs.html` | Guides, TOC, code samples |
| `sdk.html` | SDK catalog |
| `api-reference.html` | Endpoint reference |

### Marketing (5)

| File | Purpose |
|------|---------|
| `index.html` | Landing — hero, live product preview, feature grid |
| `pricing.html` | Plans, comparison, FAQ |
| `changelog.html` | Product changelog |
| `status.html` | Service status page |
| `404.html` | Branded not-found page |

### Auth (3)

| File | Purpose |
|------|---------|
| `login.html` | Sign-in (simulated) |
| `forgot-password.html` | Password recovery (simulated) |
| `invite.html` | Team invite accept (simulated) |

### Showcase & guide (3)

| File | Purpose |
|------|---------|
| `style-guide.html` | Design-system reference: colors, type, components in both themes |
| `visual-showcase.html` | Motion system, toasts, backdrop — dark/light × RTL/LTR |
| `rtl.html` | Full Persian RTL demo (sidebar on the right, mixed-script content) |

### Source package only (1)

| File | Purpose |
|------|---------|
| `rtl-persian-test.html` | RTL QA harness: mixed-script sentences, digits, isolation, forms, charts, overlays — used by the Playwright suites; excluded from the HTML package |
