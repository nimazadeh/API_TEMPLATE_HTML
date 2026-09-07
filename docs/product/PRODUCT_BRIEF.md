# APIForge X — Product Brief

## Vision
APIForge X is the definitive premium HTML template for developer API platforms. It makes any API product look, feel, and behave like Stripe, Resend, Vercel, and Linear — from day one.

We are not building another generic admin dashboard with an "API Keys" page bolted on. We are building a specialized, opinionated developer experience layer that understands what API platforms actually are.

## Positioning Statement
**For** backend developers, API founders, and SaaS companies launching developer platforms,
**Who** need to present a credible, production-grade developer experience without building a dashboard from scratch,
**APIForge X** is a premium HTML template that provides a complete, cohesive API platform UI system,
**Unlike** generic admin templates (Sneat, MaterialDash, Concept) or incomplete UI kits,
**Our product** is purpose-built for API lifecycle: discovery → auth → integration → observability → monetization.

Tagline candidates:
- "The developer platform that looks shipped."
- "Stripe-grade DX in HTML."
- "Built for APIs, not dashboards."

## Problem

### Buyer Problems
1.  **Credibility gap:** An API with a generic Bootstrap admin looks like a side project. Developers judge reliability by dashboard quality.
2.  **Time to market:** Building a proper developer portal (API explorer, key management, usage charts, log viewer, webhook debugger) takes 3-9 months of senior frontend time.
3.  **Template mismatch:** Existing HTML templates are built for CRM, eCommerce, or generic SaaS. They lack code presentation, request logs, rate-limit visualization, idempotency UX, and other API-native patterns.
4.  **Documentation disconnect:** Docs and dashboard feel like two different products. Developers need seamless movement between reference and live data.
5.  **Persian market gap:** No premium API template exists with first-class RTL, Vazirmatn, and mixed LTR/RTL code handling.

### End-User (Developer) Problems the Template Solves
- "How do I make my first call in <2 minutes?"
- "Where is my API key? Is it exposed?"
- "Why did this request fail?"
- "Am I close to my rate limit?"
- "Did my webhook deliver? What was the payload?"
- "How much will this cost me this month?"

## Solution: APIForge X
A complete, production-grade frontend template system comprising:

**Marketing + App Shell:** Landing, pricing, docs, changelog, status — but all optional. The core is the app.

**Core App Experience:**
- Overview: health, usage, errors, and time-to-first-call
- API Catalog & Endpoint Explorer (interactive)
- Documentation that feels in-app, not external
- API Keys with prefix reveal, scopes, expiration, rotation UX
- Usage & Billing with cost attribution per key/endpoint
- Logs: request/response inspector (Stripe-level detail)
- Webhooks: endpoint management, delivery timeline, retry, payload viewer, signature verification helper
- Errors & Rate Limits: actionable diagnostics
- SDKs & Environments
- Team & Settings

**Design System:** Dark-first, light-second. Token-based. Vazirmatn + JetBrains Mono. Lucide only. Chart.js for metrics, but tables are primary.

## Target Use Cases (Ranked)

1.  **AI API Platform** (highest value): LLM, inference, embeddings, image generation. Needs usage by tokens, cost per model, playground.
2.  **Infrastructure / Communication API:** Email (Resend-like), SMS, storage, auth. Needs logs, webhooks, deliverability.
3.  **Data / Automation API:** Scraping, enrichment, workflows. Needs bulk job status, rate limit clarity.
4.  **Backend-as-a-Service:** Supabase-like. Needs environments, SDKs, team, billing.
5.  **Internal Developer Platform:** For larger orgs exposing internal APIs.

Out of scope: Generic CRM, eCommerce admin, project management (Linear already owns that).

## Core Value Propositions

1.  **Feels like a real developer platform** — not a skin. Every screen has API-specific empty states, skeletons, and error handling.
2.  **Time-to-first-call < 90s UX** — Code snippets with copy, env switcher, key injection, live tester built into docs.
3.  **Observability-first** — Logs, webhooks, usage are not afterthoughts; they are the hero.
4.  **Design pedigree** — Extracts principles from Resend (editorial + mono), Vercel (ink, hairlines, speed), Linear (density, keyboard-first), Stripe (table discipline, trust).
5.  **RTL-first premium** — Vazirmatn, logical properties, LTR isolation for code, Persian numbers option, professional Persian copy patterns.

## What This Template Is NOT
- Not a React/Next.js app (HTML + Vite, but structured for easy porting)
- Not a documentation generator (no MDX pipeline; docs are hand-crafted HTML with great code blocks)
- Not an admin theme with 200 pages. Depth over count. 25-35 exquisite pages > 100 mediocre.
- Not light-only. Dark is default.

## Success Metrics (for the template product itself)
- Buyer can launch a credible landing + dashboard in <1 day
- Lighthouse 95+ on performance, accessibility
- Zero layout shift between LTR/RTL
- All code blocks remain LTR and copyable in RTL mode
- Every interactive element works with keyboard (Cmd+K, Esc, etc.)
- Buyer NPS: "This saved me 2 months" / "Looks like we raised Series A"

## Constraints & Principles
- **HTML5 + Bootstrap 5.3.x + SCSS + Vite + ES Modules** — validated as appropriate (see DECISIONS.md)
- **Lucide Icons only** — no FontAwesome, no mixed sets
- **Chart.js** — but charts are secondary to tables
- **No jQuery**
- **Vazirmatn** for Persian, Inter/Geist for English, JetBrains Mono for code
- **Accessibility:** WCAG 2.1 AA, focus rings, `prefers-reduced-motion`
- **Performance:** No heavy illustration dependencies; use CSS and subtle gradients only

## Open Questions for Phase 1
- Do we include a mini landing or focus purely on app? Decision: Include 1 premium landing + pricing + docs layout to show marketing-to-app continuity (like Resend/Vercel), but keep app as hero.
- How many API groups? Decision: 2-3 sample APIs (e.g., Email, Inference, Storage) to show catalog pattern without bloating IA.
- Monetization model example? Decision: Usage-based with seats, like Stripe/Resend, not just seat-based.

## One-Line Test
If a backend founder screenshots the dashboard and posts it on X/Twitter, does it look like a $20M-funded developer tool? If yes, we succeeded.
