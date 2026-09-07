# Jobs-To-Be-Done — APIForge X

## Framework
We use JTBD: When [situation], I want to [motivation], so I can [outcome].

For APIForge X, there are two layers:
1.  **Buyer JTBD** — Why someone buys the template
2.  **End-User JTBD** — What the developers using the built product need to do (the template must support these jobs)

The template must satisfy end-user jobs to satisfy buyer jobs.

---

## Buyer JTBD (Template Purchaser)

### JTBD-B1: Launch Credible Developer Platform Fast
**When** I have a working API but no dashboard,
**I want to** launch a dashboard that looks like Resend/Stripe in under a week,
**So I can** start charging, reduce support, and look fundable.

**Acceptance:**
- Overview page with real metrics (requests, latency, errors) not fake charts
- API Keys page with create/reveal/rotate UX
- Can theme to my brand in <1 hour via SCSS tokens

### JTBD-B2: Win Client / Stakeholder Trust
**When** my client/stakeholder shows me Stripe dashboard as reference,
**I want to** deliver something with same density, code blocks, and log viewer,
**So I can** win the project / get approval without custom design.

**Acceptance:**
- Request log table with method, status, latency, id
- Webhook delivery timeline with retries
- Code examples that stay LTR in RTL

### JTBD-B3: Support Persian Market Without Rework
**When** I sell to Iranian market or need Persian dashboard,
**I want to** have RTL that actually works (Vazirmatn, logical properties, LTR code isolation),
**So I can** avoid 2 weeks of RTL bug fixing.

**Acceptance:**
- Full Persian translation demo
- No mirrored code blocks
- Persian numbers utility

---

## End-User JTBD (Developer Using the API Platform)

These are the jobs the template's UI must make effortless. Prioritized by frequency and criticality.

### Tier 1: Critical Path (Must be flawless)

#### JTBD-1: Time to First Call (TTFC) < 2 min
**When** I land on a new API platform,
**I want to** copy a working cURL example with my live key injected and see 200 OK,
**So I can** verify it works before reading docs.

**Template needs:**
- Overview with "Quickstart" card: key selector + code snippet (Node, Python, cURL) + Run button mock
- Copy button with success state, not just icon
- Environment switcher (Test/Live) visible globally
- Endpoint explorer where you can try live with your key (like Stripe)

**Anti-pattern to avoid:** Docs separate from dashboard, key hidden in different page.

#### JTBD-2: Manage API Keys Securely
**When** I need to integrate,
**I want to** create a key with scopes, see prefix (sk_live_...), copy once, set expiration, and rotate,
**So I can** ship without leaking secrets.

**Template needs:**
- Keys table: name, prefix, scopes, last used, created, status
- Create flow: name → scopes (checkboxes) → expiration → reveal once with warning
- Reveal pattern: blur + click to reveal, not plain text always
- Scopes as badges, not free text
- Audit: "Last used 2h ago from 185.23.x.x"

**Inspiration:** Stripe's restricted keys, Resend's key creation.

#### JTBD-3: Debug Failed Request
**When** my request returns 4xx/5xx,
**I want to** find it in logs, see request/response, headers, latency, and error code explanation,
**So I can** fix it without contacting support.

**Template needs:**
- Logs table: timestamp, method, endpoint, status (color + text), latency, request ID, key prefix
- Filters: status, endpoint, key, date, request ID search
- Detail drawer/page: request headers (redacted auth), body (pretty JSON), response, error explanation with link to docs, timeline (request → processing → response)
- Copy as cURL

**Critical detail:** Error messages must be specific, not "Invalid API key". Template must show how to display: "Your API key sk_test_... is expired. Generate a new key in /keys"

#### JTBD-4: Understand Usage & Cost
**When** I use the API daily,
**I want to** see requests, errors, latency trend, and cost attribution by key/endpoint/model,
**So I can** predict bill and optimize.

**Template needs:**
- Overview KPI strip: Requests (24h), Error rate, P95 latency, Active keys — with comparison to previous period
- Usage chart: area chart with granularity switch (1h/1d/7d), not pie
- Breakdown table: by endpoint, by key, by status
- For AI API: tokens, cost per model, with tabular numbers
- Rate limit visualization: progress bar + reset time

### Tier 2: High Value (Differentiators)

#### JTBD-5: Make Webhooks Reliable
**When** I rely on webhooks,
**I want to** see delivery attempts, status codes, latency, payload, and retry manually,
**So I can** ensure my system receives events.

**Template needs:**
- Webhooks list: endpoint URL, events subscribed, status (enabled/disabled), success rate
- Delivery log: event type, attempt #, status code, latency, timestamp
- Detail: request payload (JSON tree), response body, headers, retry timeline (visual)
- Actions: Retry, disable, rotate secret, test webhook (send sample)

**Why this differentiates:** Most admin templates have no webhook UX. This is where APIForge X feels specialized.

#### JTBD-6: Explore API Without Leaving Dashboard
**When** I need to integrate a new endpoint,
**I want to** browse API catalog, see params, try it with my key, and copy code,
**So I can** stay in flow.

**Template needs:**
- API Catalog: grouped by resource (e.g., Emails, Audiences, Webhooks)
- Endpoint detail: method + path, description, params table (name, type, required, description), code examples (multi-lang), response example, interactive tester (params form + response viewer)
- Version switcher
- Search (Cmd+K)

#### JTBD-7: Onboard Team & Control Access
**When** my team grows,
**I want to** invite members, assign roles (Admin, Developer, Viewer), and audit who did what,
**So I can** scale safely.

**Template needs:**
- Team table: avatar, email, role, last active
- Invite flow
- Roles explained with permissions list
- Audit log: who created key, who deleted webhook, etc.

### Tier 3: Important but Secondary

#### JTBD-8: Track SDK & Environment
**When** I build across environments,
**I want to** switch between Test/Live, see SDKs, and check changelog,
**So I can** avoid breaking prod.

**Template needs:**
- Global env switcher (like Stripe)
- SDKs page: language cards with install command, version, link to GitHub
- Environments page: explain test vs live, with banner "You are in test mode"

#### JTBD-9: Handle Billing & Limits
**When** I hit limits,
**I want to** see current plan, quota, overage, and upgrade CTA,
**So I can** unblock myself.

**Template needs:**
- Billing overview: plan, usage vs limit, projected cost
- Rate limits page: per endpoint limits, current usage, reset timer
- Upgrade prompt when 80%+

#### JTBD-10: Search & Command
**When** I know what I want,
**I want to** press Cmd+K and jump to logs, keys, endpoint, or docs,
**So I can** move fast.

**Template needs:**
- Command palette (Cmd+K) with groups: Navigation, Recent requests, Endpoints, Actions (Create key, etc.)
- Keyboard shortcuts: ? to show help, g+l for logs, etc. (Linear-inspired)

---

## JTBD Prioritization Matrix

| Job | Frequency | Pain if Missing | Differentiation | Priority |
|-----|-----------|----------------|-----------------|----------|
| TTFC | Every new dev | High — abandonment | Medium | P0 |
| API Keys | Daily | High — security risk | Medium | P0 |
| Debug Request | Daily for active | Very High — support ticket | High | P0 |
| Usage & Cost | Daily/Weekly | High — churn | High | P0 |
| Webhooks | Weekly | Very High — broken integrations | Very High | P1 |
| API Explorer | Weekly | Medium | Very High | P1 |
| Team | Monthly | Medium | Low | P2 |
| SDKs/Env | Weekly | Medium | Medium | P2 |
| Billing/Limits | Monthly | High | Medium | P2 |
| Command Palette | Daily power users | Medium | High | P1 |

## Design Implications from JTBD

1.  **Overview is not a generic KPI dashboard.** It must answer: "Is my integration healthy?" + "How do I make first call?" + "What's broken?". Not "Revenue chart".
2.  **Logs is the most important table in the product.** It needs method badges (GET=blue, POST=green, DELETE=red), status codes with meaning (200, 400, 429, 500), latency with color (green <300ms, yellow <1s, red >1s), request ID copy.
3.  **Code is a first-class UI element, not decoration.** Every code block needs: language label, copy button, line numbers option, LTR isolation, dark theme (like Vercel), and injection of user's key (masked).
4.  **Empty states must teach.** No "No data". Instead: "No requests yet. Send your first request: [code snippet]".
5.  **Error states must be actionable.** Every error row links to explanation.

## Persian JTBD Additions

- **When** I use Persian dashboard,
- **I want to** read Persian labels but see code/endpoints/keys in English LTR without broken alignment,
- **So I can** work naturally as Iranian developer who thinks in mixed language.

Implementation: `dir="rtl"` on html, but `dir="ltr"` + `class="code-isolate"` on all code, keys, URLs, JSON. Use CSS logical properties (inline-start/end, not left/right).

- **When** I read numbers,
- **I want to** optionally see Persian digits (۰۱۲۳) for financial, but English for technical IDs,
- **So I can** match local expectations.

Provide utility: `.num-fa` vs `.num-en` with `font-variant-numeric`.

## Summary: What Buyer Gets

If we nail JTBD Tier 1 + Webhooks + Explorer + Command Palette, the buyer can say:
"My template does what Stripe does: keys, logs, webhooks, usage, explorer, in one cohesive UI."

That is the bar. Not "has 50 widgets".
