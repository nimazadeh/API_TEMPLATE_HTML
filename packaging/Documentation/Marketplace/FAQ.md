# FAQ

**Does it need a backend?**  
No. All data is mock JSON bundled in the JavaScript build. Auth buttons show toasts only.

**Can I upload it to cPanel?**  
Yes. Upload `HTML-Version/` (HTML + `assets/`).

**Can I change colors without touching every page?**  
Yes, in the source package: `src/scss/tokens/_colors.scss`, then `npm run build`.

**Is RTL a plugin?**  
No. Layout uses logical CSS properties. Persian is the default locale.

**How do I add a page?**  
See `Documentation/Adding-Pages.md` (source package).

**React or Tailwind?**  
Neither. HTML + Bootstrap 5 + SCSS + Vite.

**Are fonts loaded from Google?**  
No. Woff2 files ship in `assets/`.

**file:// does not run scripts.**  
Serve the folder over HTTP. Python’s `http.server` is enough locally.

**Regular vs Extended license?**  
Regular: one end product. Extended: end product sold to many customers. You still cannot resell the template itself. See `LICENSE.txt`.

**31 or 30 pages?**  
The zip contains 31 HTML files including QA/demo surfaces (`style-guide`, `rtl`, `rtl-persian-test`, `visual-showcase`).

**Tests?**  
`npm test` in Source-Version. Not required for hosting.

**IE11?**  
Not supported.
