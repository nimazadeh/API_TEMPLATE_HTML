# Ideal Customer Profile — APIForge X

## Summary
The ideal buyer is not a generic "webmaster" or "small business owner" who buys $19 ThemeForest templates. Our buyer is a technical founder or senior frontend/backend developer building an API product who values design quality as a trust signal and is willing to pay premium for time saved and credibility gained.

We have 3 primary ICPs, ranked.

---

### ICP-1: API-First Founder (Primary, 50%)

**Persona:** Amir, 28, Tehran / Berlin / Dubai — or Alex, 30, SF. Solo or 2-3 person team building an AI API, email API, data enrichment API.

**Demographics:**
- Age 24-36
- Backend or full-stack engineer, 3-8 years experience
- Building as indie hacker or VC-backed seed
- English-proficient, reads Stripe/Resend/Linear blogs
- Lives in GitHub, Vercel, Supabase

**Firmographics:**
- Company: 1-15 people, pre-seed to Series A
- Revenue: $0 - $50k MRR, aiming for $100k
- Stack: Next.js / Node / Python, hosted on Vercel / Fly / Railway
- Already has working API, no dashboard

**Technographics:**
- Uses Tailwind, shadcn, but wants Bootstrap for quick HTML delivery to Iranian market (RTL marketplace buyers still prefer Bootstrap)
- Knows what OpenAPI, webhooks, idempotency, rate limiting are
- Has tried Stripe Dashboard, Vercel Dashboard, Resend Dashboard — expects that level

**Pain Points:**
- "My API works but my dashboard looks like a student project"
- No time to design logs viewer, webhook debugger, usage charts
- Investors/users ask "where is your dashboard?"
- Iranian buyers need RTL but no template does it well

**Goals:**
- Launch a dashboard that looks Series A in 1 week
- Reduce support: let developers self-serve keys, logs, webhooks
- Charge money: show usage and billing clearly

**Buying Motivations:**
- Time saved > $500
- Credibility with developers (looks like Resend)
- Persian RTL for local market or dual-language for diaspora
- Wants HTML (not React) to integrate quickly or hand to junior dev

**Where They Buy:**
- RTL Theme (Iranian marketplace), ThemeForest, Gumroad, personal site
- Evaluates by: demo quality, code cleanliness, docs, RTL demo, code blocks in RTL

**Quote:** "I don't want another admin template with 100 pages. I want Stripe's developer dashboard in HTML."

---

### ICP-2: SaaS Team Adding Developer Platform (Secondary, 30%)

**Persona:** Sara, Product Manager + Reza, Senior Frontend Lead at a 20-80 person SaaS company in Tehran or MENA. Their product now needs public API.

**Demographics:**
- Team: Product + 2-5 frontend/backend
- Age 27-40
- Decision maker: Tech Lead or CTO

**Firmographics:**
- Company: 20-200 people, $100k-$5M ARR
- Existing product: CRM, accounting, logistics, AI tool
- Need: Expose API to partners, build ecosystem

**Pain Points:**
- Existing admin template (e.g., Sneat) doesn't fit API use case
- Need to show API reference + dashboard in same UI
- Need team permissions, audit logs, billing for API
- Internal design team overloaded

**Goals:**
- Ship developer portal in one sprint, not one quarter
- Consistent design system (dark/light, Vazirmatn, Lucide)
- Easy handoff to junior devs (HTML/Bootstrap, not custom design system)

**Buying Motivations:**
- Completeness: API Keys, Usage, Logs, Webhooks in one package
- Professional Persian copy and RTL
- Well-documented SCSS variables for theming to their brand

**Quote:** "We need to look like we have a platform team, even if we don't yet."

---

### ICP-3: Freelance / Agency Developer for API Clients (Tertiary, 20%)

**Persona:** Mohammad, 26, freelance full-stack developer building MVPs for clients (often startups needing API dashboards).

**Demographics:**
- Freelancer or 2-5 person agency
- Builds 3-6 projects/year
- Client budget $2k-$10k per project

**Pain Points:**
- Rebuilding same screens (keys, logs, webhooks) for every client
- Clients show Resend/Stripe as reference, but he delivers generic admin
- RTL bugs take days

**Goals:**
- Reusable starter that wins deals: "I can give you Resend-quality dashboard"
- Fast customization via SCSS tokens
- Persian + English demo to show clients

**Buying Motivations:**
- ROI: One template used for 3+ client projects
- Code quality: Vite, ES modules, no jQuery
- Good docs + implementation plan

**Quote:** "Give me a template where I change colors and logo and it already looks premium."

---

## Anti-ICP (Who We Do NOT Serve)

- Non-technical small business owners wanting a shop template
- Buyers looking for 200+ pages, 10 dashboards, chat/email/kanban apps bundled (we will not compete on page count)
- Teams wanting WordPress, React-only, or Tailwind-only (we are Bootstrap HTML)
- Buyers who think "premium" = lots of colors, gradients, illustrations, shadows

## Iranian Market Specifics

**Why Iran is Primary:**

1.  RTL-Theme and similar marketplaces lack a true API platform template. Existing templates are eCommerce or generic admin. Opportunity to be first premium API platform in Persian market.
2.  Many Iranian SaaS startups (accounting, logistics, AI wrappers) now need developer APIs for partners. Local template market is underserved.
3.  Iranian developers are highly design-aware (follow Linear, Vercel). They will pay premium for something that doesn't look like 2018 admin.

**Persian Buyer Behaviors:**
- Very sensitive to Persian typography: Vazirmatn is expected, not optional. Bad Persian font = instant distrust.
- Expects RTL demo link, not just "RTL supported" badge.
- Checks code blocks: do they stay LTR inside RTL? If code flips, template is broken.
- Checks numbers: Persian numbers (۰۱۲۳) vs English? Provide toggle/utility.
- Wants professional Persian copy, not Google Translated Lorem. Example: "کلیدهای API" not "کلیدهای ای پی آی" inconsistently.
- Price sensitivity higher than US, but willing to pay 2-3x for truly premium, well-documented template that saves weeks.

**Language Strategy:**
- Primary demo: English LTR (for global credibility)
- Secondary demo: Persian RTL (full translation, not just dir flip)
- Code, endpoints, keys, JSON always LTR, isolated with `dir="ltr"` and `translate="no"`
- Mixed content: "برای ارسال ایمیل از `resend.emails.send()` استفاده کنید" — Persian sentence, English code inline, must render correctly.

## Buyer Journey

1.  **Discovery:** Sees demo on RTL-Theme or X/Twitter. First impression: dark mode, code block, logs table. "This is not a generic admin."
2.  **Evaluation:** Opens 3 pages: Overview, Logs, API Keys. Checks responsiveness, RTL toggle, keyboard (Cmd+K). Views source: clean HTML, SCSS variables, Vite.
3.  **Decision:** Compares to Sneat, Concept. Realizes those have no webhook debugger, no request inspector, no usage attribution. Chooses depth over breadth.
4.  **Post-purchase:** Expects docs on how to change brand color, how to add new endpoint, how to handle RTL code blocks.

## Willingness to Pay

- Iranian marketplace: 1.5M - 4M Toman (premium tier)
- Global (Gumroad/Lemon): $69-$129 (HTML template premium)
- Justification: Saves 80-120 hours senior frontend time ($5k-$10k value)

## Key Insight

Our buyer doesn't buy a template. They buy **time + credibility**. Every design decision should answer: "Does this make the buyer's API look funded and trustworthy in 5 seconds?"
