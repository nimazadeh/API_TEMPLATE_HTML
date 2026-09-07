# Information Architecture — APIForge X

## Philosophy

Don't blindly include every item from generic admin templates. Determine best coherent structure for API platform.

**Principles:**
- Job-based, not data-model-based (Stripe principle)
- Progressive disclosure: summary → details
- 12 items max in sidebar, grouped
- Every item must pass JTBD test: does a developer need this weekly?
- Depth over breadth: fewer sections, more depth per section

---

## Proposed IA (Final)

We propose 3 layers: **Marketing (optional) + App Shell + App Sections**

### Layer 0: Marketing (1-2 pages, optional but recommended for demo continuity)

- **Landing** (`/index.html` or `/landing.html`): Hero with code + dashboard screenshot, social proof, features (API Explorer, Logs, Webhooks, Keys), code examples, pricing teaser, CTA to dashboard
- **Pricing** (`/pricing.html`): Plans, usage-based, FAQ, comparison
- **Changelog** (`/changelog.html`): Timeline of API versions
- **Status** (`/status.html`): Uptime, incidents (optional, but shows platform maturity)

These are not the core, but they show marketing-to-app continuity like Resend/Vercel. Keep minimal.

### Layer 1: App Shell (Global)

- **Sidebar:** Navigation groups
- **Header:** Search (Cmd+K), Env switcher (Test/Live), Help, User menu, Theme toggle
- **Command Palette:** Cmd+K overlay, not a page
- **Banners:** Test mode banner, rate limit warning, billing warning

### Layer 2: App Sections (Core — 12 sections max)

Grouped into 4 groups for sidebar:

#### Group A: Overview & Discovery

**1. Overview** (`/app/overview.html`) — P0
- Purpose: Is my integration healthy? How do I start? What's broken?
- Content:
  - Quickstart card: Env selector + key selector + code snippet (cURL/Node/Python) + Copy + "Run" mock
  - KPI strip: Requests 24h, Error rate, P95 latency, Active keys — with comparison vs previous period + sparkline
  - Recent errors: Top 3 errors with count, last occurred, link to logs
  - Recent requests: Mini table 5 rows, link to logs
  - Webhook health: Success rate 24h, failed count
  - Usage vs limit: Progress bar
- Empty state: "No requests yet. Send your first request: [code snippet with your test key]"

**2. APIs / API Catalog** (`/app/apis.html` and `/app/api-detail.html`) — P1
- Purpose: Browse and try APIs
- Content:
  - Catalog: Grouped by resource (e.g., Emails, Audiences, Webhooks) with method count, description
  - Endpoint list: Method badge + path + description
  - Detail: Method + path header, description, auth, params table (name, type, required, description, example), request body schema, response example, code examples (multi-lang tabs with key injection), interactive tester (form for params → response viewer with status, latency, headers, body), version switcher
  - Search: Filter endpoints
- URL: `/app/apis.html` catalog, `/app/endpoints.html?endpoint=send-email` or `/app/api-detail.html`

#### Group B: Integration & Auth

**3. API Keys** (`/app/keys.html` and `/app/keys-create.html`) — P0
- Purpose: Manage keys securely
- Content:
  - Table: Name, prefix (sk_live_abc...), scopes badges, last used (2h ago, IP), created, status (active/revoked), actions (reveal, copy, edit, revoke)
  - Create flow: Name input → Scopes checkboxes (e.g., emails:write, audiences:read) → Expiration select → Create → Reveal once modal with warning "Copy now, you won't see again" + copy + done
  - Detail drawer: Key details, usage chart per key, recent requests using this key, rotate, revoke
  - Empty: "No keys yet. Create your first key to start integrating."
- Security: Blur prefix until hover/click, copy with feedback

**4. SDKs & Environments** (`/app/sdks.html`) — P2
- Purpose: Help integrate across envs
- Content:
  - Environments: Test vs Live explanation, banner, how to switch, base URLs
  - SDKs: Cards per language (Node.js, Python, Go, Ruby, PHP) with install command (`npm install resend`), version, GitHub link, code example
  - Tools: Postman collection, OpenAPI spec download
  - Changelog link

#### Group C: Observability (Hero of API platform)

**5. Logs / Requests** (`/app/logs.html` and `/app/log-detail.html`) — P0 (Most important table)
- Purpose: Debug failed requests
- Content:
  - Filters: Search by request ID, endpoint, key prefix, status, method, date range — all URL state (?status=failed&method=POST)
  - Stats: Requests in range, error rate, P95 latency
  - Table: Timestamp (relative + absolute on hover), Method badge, Endpoint (path), Status badge (200,400,429,500) with dot, Latency (color: green <300ms, yellow <1s, red >1s), Request ID (mono with copy), Key prefix, User agent truncated
  - Row click → Detail drawer or page:
    - Header: Method + endpoint + status + latency + timestamp + request ID copy + "Copy as cURL"
    - Timeline: Request → Processing (duration) → Response
    - Request: Headers (auth redacted), query params, body pretty JSON with copy
    - Response: Status, headers, body, error explanation if failed: "What happened, why, what to do next" + link to docs
    - Context: Key used, IP, environment, idempotency key if present
  - Pagination: Prev/next, URL state
  - Empty: "No requests match filters" + clear filters
  - Skeleton: Shimmer rows mirroring layout

**6. Webhooks** (`/app/webhooks.html`, `/app/webhook-detail.html`, `/app/webhook-logs.html`) — P1 (Differentiator)
- Purpose: Make webhooks reliable
- Content:
  - List: Endpoint URL, description, events subscribed (badges), status (enabled/disabled), success rate 24h, last delivery, created
  - Create: URL input, events checkboxes (e.g., email.sent, email.bounced), secret generate, test
  - Detail:
    - Overview: URL, status, secret (reveal), events, success rate chart, recent deliveries
    - Delivery log: Table of attempts: Event type, attempt #, status code, latency, timestamp
    - Click attempt → Detail: Request payload (JSON tree with copy), response body, headers, retry timeline visual (Attempt 1 failed 500 → 2m retry → Attempt 2 success 200)
    - Actions: Retry, disable, rotate secret, delete, send test event
  - Empty: "No webhook endpoints. Add your first to receive real-time events."

**7. Errors & Rate Limits** (`/app/errors.html`, `/app/rate-limits.html`) — P1/P2
- Purpose: Understand failures and limits
- Errors:
  - Breakdown by error code (e.g., invalid_api_key, rate_limit_exceeded) with count, last occurred, % of requests
  - Table: Error code, message, count, last, docs link
  - Detail: Explanation, how to fix, example
- Rate Limits:
  - Overview: Current plan limits (e.g., 100 req/s, 10k req/day), usage progress bars, reset timers
  - Per endpoint limits table: Endpoint, limit, used, remaining, reset
  - 429 handling guide
  - Upgrade CTA when 80%+

**8. Usage** (`/app/usage.html`) — P0
- Purpose: Predict bill, optimize
- Content:
  - Time range selector (24h, 7d, 30d)
  - KPI: Total requests, billable requests, errors, cost (if AI API: tokens)
  - Chart: Area chart requests over time, granularity (1h/1d), with comparison
  - Breakdowns:
    - By endpoint: Table endpoint, requests, % errors, P95 latency, cost
    - By key: Key name, prefix, requests, cost
    - By status: 2xx, 4xx, 5xx distribution (donut ≤5)
    - For AI: By model, tokens, cost per model
  - Export CSV
  - Empty: "No usage yet"

#### Group D: Management

**9. Team** (`/app/team.html`) — P2
- Purpose: Scale safely
- Content:
  - Table: Avatar, name, email, role (Admin, Developer, Viewer), last active, status
  - Invite: Email + role select + send
  - Roles: Explanation table: Role, permissions list
  - Audit log: Who did what when (created key, deleted webhook) — maybe separate tab

**10. Billing** (`/app/billing.html`) — P2
- Purpose: Unblock when hitting limits
- Content:
  - Current plan card: Name, price, limits, usage vs limit progress, next billing date
  - Usage projection: Chart projected cost this month
  - Invoices: Table date, amount, status, download
  - Payment method
  - Upgrade/downgrade

**11. Settings** (`/app/settings.html`) — P2
- Purpose: Configure account
- Content:
  - Profile: Name, email, avatar
  - Workspace: Name, logo, URL
  - Security: 2FA, sessions, audit log
  - Notifications: Email for errors, webhook failures, usage alerts
  - Danger zone: Delete workspace
  - Tabs for organization

**12. Documentation (In-App)** (`/app/docs.html`) — P1
- Purpose: Stay in flow, not external
- Content:
  - Sidebar: API groups, guides
  - Main: Markdown-like content but with our code block system, with key injection, with try-it
  - Could be separate from marketing docs, but in-app version focused on quick reference
  - Alternatively, link to external docs but with same design system

---

## Sidebar Structure (Final)

```
Group: Overview
- Overview (icon: LayoutDashboard)

Group: APIs
- APIs / Endpoints (icon: Code2)
- API Keys (icon: Key)
- SDKs (icon: Package)

Group: Monitoring
- Logs (icon: ScrollText)
- Webhooks (icon: Webhook)
- Errors (icon: AlertTriangle)
- Rate Limits (icon: Gauge)
- Usage (icon: BarChart3)

Group: Management
- Team (icon: Users)
- Billing (icon: CreditCard)
- Settings (icon: Settings)

Bottom:
- Docs (icon: BookOpen) external
- Status (icon: Activity)
- User menu
```

Icons: Lucide only.

Order prioritized by JTBD frequency: Overview first, then APIs/Keys (integration), then Logs/Webhooks/Usage (daily debugging), then Team/Billing/Settings (monthly).

We intentionally do NOT include:
- Chat, Email, Calendar, Kanban (generic admin bloat)
- Ecommerce, CRM
- 7 dashboards (we have 1 overview + usage as second)
- File manager, etc.

We keep 12 max.

---

## Page Count Plan (Depth over Count)

- Marketing: 3 pages (Landing, Pricing, Changelog/Status combined)
- App: 12 main + 6 detail/drawer variants + 2 empty/error states showcase
- Auth: 2 pages (Sign in, Sign up) — minimal, like Vercel
- Total: ~20-25 HTML files, but each deep with states, not 100 shallow

Each page must have:
- LTR and RTL version (or same file with dir toggle via JS for demo)
- Dark and light (via CSS variables, not duplicate files)
- Empty state
- Loading skeleton
- Error state
- Mobile responsive
- Keyboard accessible

---

## URL Structure

```
/index.html (landing)
/pricing.html
/changelog.html
/status.html

/app/overview.html
/app/apis.html
/app/api-detail.html?endpoint=send-email
/app/keys.html
/app/keys-create.html (or modal)
/app/sdks.html
/app/logs.html
/app/log-detail.html?id=req_123
/app/webhooks.html
/app/webhook-detail.html?id=wh_123
/app/usage.html
/app/errors.html
/app/rate-limits.html
/app/team.html
/app/billing.html
/app/settings.html
/app/docs.html

/auth/sign-in.html
/auth/sign-up.html

/404.html
```

Use relative paths, not absolute, for easy hosting.

---

## State Management (HTML Template Perspective)

Since HTML template (no backend), we need to simulate states via:

- **URL query params for filters:** `logs.html?status=failed&method=POST` — JS reads and applies filters, so shareable (Vercel principle)
- **LocalStorage for theme, env, sidebar collapsed**
- **Mock data:** JSON files in `/data/` folder with sample logs, keys, webhooks — JS renders tables from JSON to show realistic data without backend
- **Command palette:** Vanilla JS with fuzzy search over static index of pages/endpoints
- **Code injection:** JS replaces `YOUR_API_KEY` with mock key from localStorage

This makes template feel real, not static.

---

## Persian IA Considerations

- Same IA, but labels Persian
- Sidebar on right in RTL (logical properties handle)
- Breadcrumb mirrored
- Search placeholder Persian: "جستجو... (⌘K)"
- Command palette groups in Persian, but endpoints/keys remain English LTR

---

## Decision Log for IA

- **Why not include API Explorer as separate from APIs?** Merge into API detail with tester — reduces nav items, keeps discovery + try in one place.
- **Why separate Errors and Rate Limits?** Could merge into Logs/Usage, but rate limits deserve dedicated page for upgrade CTA. We'll have Errors as tab inside Logs? Decision: Start with separate but allow merging later. Keep Errors and Rate Limits as separate for depth, but they can be tabs in final implementation if nav bloat.
- **Why SDKs separate from Docs?** SDKs are about install, Docs about reference — different jobs. Keep separate but small.
- **Why Billing separate from Usage?** Usage is operational (daily), Billing is financial (monthly) — different audiences (dev vs finance). Keep separate.
- **Why no Environments page?** Environments handled via global switcher + SDKs page explanation, not dedicated page — reduces bloat.

---

## Final IA Validation Checklist

- [x] Covers TTFC (Overview quickstart + APIs tester)
- [x] Covers Keys (manage, create, reveal)
- [x] Covers Logs (debug)
- [x] Covers Webhooks (differentiator)
- [x] Covers Usage (cost)
- [x] Covers Team/Billing/Settings (management)
- [x] 12 items max, grouped
- [x] Job-based labels
- [x] Depth over breadth
- [x] Persian RTL feasible
- [x] URL as state for filters
- [x] Command palette fits
