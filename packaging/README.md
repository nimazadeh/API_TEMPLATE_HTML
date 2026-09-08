# Release assembly (maintainers)

```bash
npm install
npm run build               # → dist/
node packaging/assemble.mjs # → release/ tree + PACKAGE-MANIFEST.json
node packaging/verify.mjs   # release QA audit → RELEASE-VERIFICATION.md
```

Package zip (run from the repo root):

```bash
rm -f release/APIForge-X-v1.0.0.zip
cd release && zip -r -X ../APIForge-X-v1.0.0.zip APIForge-X-HTML APIForge-X-Source Documentation marketplace LICENSE.txt PACKAGE-MANIFEST.json
```

Rules:

- The HTML package is `dist/` **minus** `rtl-persian-test.html` (QA harness,
  source-only). The assembler also strips in-page links to it.
- `release/APIForge-X-*/`, `release/Documentation/`, `release/marketplace/`
  and `release/LICENSE.txt` are git-ignored build outputs — commit the zip,
  the manifest, the docs and the changelog instead (they are small and are
  the source of truth for the release).
- Listing screenshots live in `packaging/Assets/` (committed references) and
  are regenerated locally via `marketplace/capture-screenshots.mjs` into
  `marketplace/screenshots/` (git-ignored) — see
  `packaging/Marketplace/Screenshot-Guide.md`.
- Version bumps: `package.json`, `packaging/CHANGELOG.md`, and the zip name.
