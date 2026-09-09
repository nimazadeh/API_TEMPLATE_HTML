# Preview package — getting started

`APIForge-X-Preview/` exists so you can inspect the full product in seconds,
exactly as it will look to end users — without installing anything.

## Open

- **Windows / macOS / Linux:** unzip `APIForge-X-Preview.zip`, open the
  `APIForge-X-Preview` folder and double-click `index.html`.
- It opens in your default browser from the local file system
  (`file://`). No server, no Node.js, no npm, no internet.

## What to try

1. The landing page hero shows a **live** product preview (charts, KPIs,
   activity feed) — these are real components running on seeded data.
2. Open `dashboard.html`, `logs.html`, `webhooks.html`, `api-keys.html`,
   `usage.html` — the whole app surface.
3. Click the **language toggle** (EN / فارسی) — the entire UI flips between
   Persian RTL and English LTR live.
4. Click the **theme toggle** — dark ⇄ light.
5. `style-guide.html`, `visual-showcase.html` and `rtl-persian-test.html`
   document the component system, motion and RTL behavior.
6. Press `Ctrl/⌘ K` inside the dashboard shell for the command palette.

## Technical notes

- Each page loads exactly one classic (non-module) `<script defer>` bundle
  from `assets/js/` — there is no ES-module graph, so browsers apply no
  CORS origin checks.
- One stylesheet (`assets/css/main.css`) styles every page; fonts are
  self-hosted in `assets/fonts/`.
- Persian (fa/RTL) is the default locale; English (en/LTR) is one click away.
- This package is for preview and static hosting. To customize anything,
  use `APIForge-X-Developer/` and follow `Documentation/Installation.md`.
