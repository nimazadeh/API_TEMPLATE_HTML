#!/usr/bin/env node
// =============================================================
// APIForge X — Marketplace release assembler (v2 layout)
//
// Builds the buyer-ready release/ tree:
//
//   release/
//   ├── APIForge-X-Developer/         full Vite source package
//   ├── APIForge-X-Developer.zip      (marketplace download)
//   ├── APIForge-X-Preview/           standalone, double-click file:// package
//   ├── APIForge-X-Preview.zip        (marketplace download)
//   ├── Documentation/                buyer guides
//   ├── README.md                     package overview
//   ├── LICENSE.txt
//   └── PACKAGE-MANIFEST.json         inventory + SHA-256 per file
//
// The Preview package is produced from the production build (dist/)
// by converting every page's ES-module entry chunk into a single
// self-contained classic <script> bundle (esbuild IIFE), so pages run
// from file:// with no server, no npm and no CORS/module errors.
//
// Run:  node packaging/build-release.mjs
// QA:   node packaging/verify-release.mjs   (afterwards)
// =============================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { build as esbuild } from 'esbuild';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pack = path.join(repo, 'packaging');
const release = path.join(repo, 'release');
const dist = path.join(repo, 'dist');

const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const version = pkg.version;

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------
function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}
function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}
function copyFile(src, dest) {
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
}
function copyDir(src, dest, { skip = [] } = {}) {
  mkdirp(dest);
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (ent.name === '.git' || ent.name === 'node_modules') continue;
    if (skip.includes(ent.name)) continue;
    const from = path.join(src, ent.name);
    const to = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(from, to, { skip });
    else copyFile(from, to);
  }
}
function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}
function sizeOfDir(p) {
  return fs
    .readdirSync(p, { withFileTypes: true })
    .reduce(
      (sum, e) =>
        sum + (e.isDirectory() ? sizeOfDir(path.join(p, e.name)) : fs.statSync(path.join(p, e.name)).size),
      0,
    );
}

const pages = fs.readdirSync(dist).filter((n) => n.endsWith('.html')).sort();
const pageEntryRe = /<script type="module"[^>]*src="\.\/assets\/([^"]+\.js)"[^>]*><\/script>/;
const cssLinkRe = /<link rel="stylesheet"[^>]*href="\.\/assets\/([^"]+\.css)"[^>]*>/;
const modulePreloadRe = /<link rel="modulepreload"[^>]*>\s*/g;

console.log(`APIForge X v${version} — marketplace release assembler`);

// ------------------------------------------------------------------
// 1. Fresh production build (always)
// ------------------------------------------------------------------
console.log('→ vite build (fresh, always)');
execSync('npm run build', { cwd: repo, stdio: 'inherit' });

// ------------------------------------------------------------------
// 2. Clean release/
// ------------------------------------------------------------------
rmrf(release);
mkdirp(release);
const previewOut = path.join(release, 'APIForge-X-Preview');
const devOut = path.join(release, 'APIForge-X-Developer');
mkdirp(previewOut);
mkdirp(devOut);

// ------------------------------------------------------------------
// 3. APIForge-X-Developer — original Vite source package (unchanged)
// ------------------------------------------------------------------
console.log('→ assembling APIForge-X-Developer');
const sourceTop = [
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'playwright.config.js',
  '.gitignore',
  'README.md',
];
for (const f of sourceTop) copyFile(path.join(repo, f), path.join(devOut, f));
copyFile(path.join(pack, 'LICENSE.txt'), path.join(devOut, 'LICENSE.txt'));
for (const f of fs.readdirSync(repo).filter((n) => n.endsWith('.html'))) {
  copyFile(path.join(repo, f), path.join(devOut, f));
}
copyDir(path.join(repo, 'src'), path.join(devOut, 'src'));
copyDir(path.join(repo, 'scripts'), path.join(devOut, 'scripts'));
copyDir(path.join(repo, 'tests'), path.join(devOut, 'tests'));
copyDir(path.join(repo, 'docs'), path.join(devOut, 'docs'));

// ------------------------------------------------------------------
// 4. APIForge-X-Preview — standalone double-click package
//    (built from dist/, converted to classic non-module scripts)
// ------------------------------------------------------------------
console.log('→ assembling APIForge-X-Preview');

// 4a. Styles: single shared stylesheet → assets/css/main.css, fonts → assets/fonts/
const cssAssetFiles = fs.readdirSync(path.join(dist, 'assets')).filter((n) => n.endsWith('.css'));
if (cssAssetFiles.length !== 1) throw new Error(`Expected exactly 1 dist css, got ${cssAssetFiles.length}`);
const cssSrc = path.join(dist, 'assets', cssAssetFiles[0]);
let cssText = fs.readFileSync(cssSrc, 'utf8');
const assetsDir = path.join(previewOut, 'assets');
const cssOutDir = path.join(assetsDir, 'css');
const fontsOutDir = path.join(assetsDir, 'fonts');
mkdirp(cssOutDir);
mkdirp(fontsOutDir);

// Rewrite every relative font url(./name.woff2|woff) → url(../fonts/name.*)
const fontFileRe = /url\(\s*["']?\.\/([A-Za-z0-9._-]+\.(?:woff2|woff))["']?\s*\)/g;
const fontFiles = new Set();
let m;
while ((m = fontFileRe.exec(cssText))) fontFiles.add(m[1]);
for (const name of fontFiles) {
  const src = path.join(dist, 'assets', name);
  if (!fs.existsSync(src)) throw new Error(`CSS references missing font asset: ${name}`);
  copyFile(src, path.join(fontsOutDir, name));
}
cssText = cssText.replace(fontFileRe, (_, name) => `url(../fonts/${name})`);
// No other relative url() may exist (all other assets are inline data: URIs)
const leftover = [...cssText.matchAll(/url\(\s*["']?\.\//g)].length;
if (leftover > 0) throw new Error(`${leftover} non-font relative url() left in css`);
fs.writeFileSync(path.join(cssOutDir, 'main.css'), cssText);

// 4b. JavaScript: per page, esbuild-bundle the entry chunk into one classic IIFE
// (all shared chunks merged) → assets/js/<page>.js
const jsOutDir = path.join(assetsDir, 'js');
mkdirp(jsOutDir);
const pageToBundle = new Map(); // page slug -> dist entry chunk basename
for (const page of pages) {
  const html = fs.readFileSync(path.join(dist, page), 'utf8');
  const entry = pageEntryRe.exec(html);
  if (!entry) throw new Error(`No module entry script found in dist/${page}`);
  pageToBundle.set(page.slice(0, -5), entry[1]);
}
for (const [slug, chunk] of pageToBundle) {
  const result = await esbuild({
    entryPoints: [path.join(dist, 'assets', chunk)],
    bundle: true,
    format: 'iife',
    minify: true,
    write: false,
    logLevel: 'error',
  });
  if (result.outputFiles.length !== 1) throw new Error(`Unexpected output for ${slug}`);
  const outText = result.outputFiles[0].text;
  // esbuild's IIFE output cannot contain top-level module syntax; guard the
  // only syntax that would survive a classic-script parse but break at runtime.
  if (/\bimport\s*\(|import\.meta/.test(outText)) {
    throw new Error(`Bundle ${slug} still contains module-only syntax`);
  }
  fs.writeFileSync(path.join(jsOutDir, `${slug}.js`), outText);
}

// 4c. HTML: copy dist pages, swap module loading for classic deferred scripts
let cssHref = null;
for (const page of pages) {
  const slug = page.slice(0, -5);
  const html = fs.readFileSync(path.join(dist, page), 'utf8');
  const cssLink = cssLinkRe.exec(html);
  if (!cssLink) throw new Error(`No stylesheet link found in dist/${page}`);
  const cssName = cssLink[1];
  if (!cssHref) cssHref = cssName;
  else if (cssHref !== cssName)
    throw new Error(`Multiple dist css files referenced (${cssHref}, ${cssName}) — rebase needed`);
  const entry = pageEntryRe.exec(html);
  if (!entry) throw new Error(`No module entry script found in dist/${page}`);

  let out = html
    // drop modulepreload hints — no module graph anymore
    .replace(modulePreloadRe, '')
    // classic stylesheet (no crossorigin → no CORS on file://)
    .replace(cssLinkRe, '<link rel="stylesheet" href="./assets/css/main.css">')
    // classic script, deferred — same timing as the module it replaces
    .replace(pageEntryRe, `<script defer src="./assets/js/${slug}.js"></script>`);

  for (const bad of ['type="module"', 'modulepreload', 'crossorigin']) {
    if (out.includes(bad)) throw new Error(`dist/${page} still contains "${bad}" after conversion`);
  }
  fs.writeFileSync(path.join(previewOut, page), out);
}

// 4d. Preview package read-me + license
copyFile(path.join(pack, 'LICENSE.txt'), path.join(previewOut, 'LICENSE.txt'));
fs.writeFileSync(
  path.join(previewOut, 'README.md'),
  `# APIForge X — Preview package (v${version})

This folder is the **instant, standalone preview** of APIForge X.

## How to open it

1. Unzip the package (if you are reading this inside an archive).
2. Double-click \`index.html\`.

That is all — no npm, no Node.js, no web server, no internet connection
needed. Every one of the **${pages.length} pages** opens directly from the
file system (\`file://\`), fonts and assets are included locally, and the
Persian RTL layout, themes (dark / light / system) and all animations work
as designed.

## Pages

${pages.map((p) => `- \`${p}\``).join('\n')}

## Notes

- All assets live under \`assets/\`: \`css/main.css\` (one stylesheet for all
  pages), \`js/*.js\` (one classic script per page) and \`fonts/\`
  (self-hosted woff2/woff). Relative paths only.
- For customization, use the **APIForge-X-Developer** package (Vite source)
  that ships with this release.
- \`LICENSE.txt\` applies.
`
);

// ------------------------------------------------------------------
// 5. Documentation — buyer guides
// ------------------------------------------------------------------
console.log('→ assembling Documentation');
const docOut = path.join(release, 'Documentation');
mkdirp(docOut);

// Copied guides: rename legacy folder names to the v2 package names.
const renamedGuides = ['Customization.md', 'RTL-Guide.md', 'Theme-System.md'];
for (const f of renamedGuides) {
  const text = fs
    .readFileSync(path.join(pack, 'Documentation', f), 'utf8')
    .replaceAll('APIForge-X-Source', 'APIForge-X-Developer')
    .replaceAll('APIForge-X-HTML', 'APIForge-X-Preview');
  fs.writeFileSync(path.join(docOut, f), text);
}

const docFiles = {
  'Installation.md': `# Installation guide

APIForge X ships two packages — pick the one that matches your goal:

| Path | Folder | Needs Node? | For |
|------|--------|-------------|-----|
| A — instant preview | \`APIForge-X-Preview/\` | No | Seeing the template now: unzip, double-click \`index.html\`. Works from \`file://\` — no server, no npm. Also uploadable to any static host (cPanel, Netlify, Vercel, Nginx). |
| B — customize | \`APIForge-X-Developer/\` | Yes (Node 20+) | Changing colors, fonts, copy, pages, components. |

## A. Instant preview (no tools)

1. Unzip \`APIForge-X-Preview.zip\`.
2. Double-click \`index.html\` inside \`APIForge-X-Preview/\`.
3. Browse the ${'${pages}'} pages; switch language (فارسی / EN) and theme from
   any page header.

The preview package is fully self-contained: bundled classic JavaScript,
one standalone CSS file, and all fonts stored locally under \`assets/\`.
No console CORS or module errors can occur because nothing is loaded as a
module and no remote resources are used.

## B. Development workflow (Vite source)

1. Unzip \`APIForge-X-Developer.zip\`.
2. Open a terminal in \`APIForge-X-Developer/\`:

\`\`\`bash
npm install
npm run dev       # http://localhost:3000 — live preview
npm run build     # production build → dist/ (static site)
npm run preview   # serve the built dist/
\`\`\`

Requirements: Node.js 20+ and npm 10+. The template needs no backend, no
database and no build step on the hosting side — \`npm run build\` output is
plain HTML/CSS/JS that any static host can serve.

See \`Customization.md\`, \`RTL-Guide.md\`, \`Theme-System.md\` and
\`File-Structure.md\` for the rest.
`,
  'File-Structure.md': `# File structure

## Release package root

\`\`\`
APIForge-X/
├── APIForge-X-Developer/     ← full Vite development source (edit here)
├── APIForge-X-Developer.zip
├── APIForge-X-Preview/       ← standalone preview — double-click index.html
├── APIForge-X-Preview.zip
├── Documentation/            ← buyer guides (this folder)
├── README.md                 ← package overview
├── LICENSE.txt
└── PACKAGE-MANIFEST.json     ← file inventory + SHA-256 checksums
\`\`\`

## APIForge-X-Preview (static, server-less)

\`\`\`
APIForge-X-Preview/
├── index.html                ← open this (double-click)
├── *.html                    ← ${'${pages}'} pages in total, Persian-first
├── assets/
│   ├── css/main.css          ← one standalone stylesheet for every page
│   ├── js/<page>.js          ← one classic bundle per page (no modules)
│   └── fonts/                ← Vazirmatn, Inter Variable, JetBrains Mono
└── README.md
\`\`\`

All references inside HTML, CSS and JS are relative. Opening \`index.html\`
from the file system (\`file://\`) requires no server and triggers no module
or CORS restrictions.

## APIForge-X-Developer (Vite source)

\`\`\`
APIForge-X-Developer/
├── package.json              ← scripts: dev / build / preview / test
├── package-lock.json
├── vite.config.js            ← multi-page build config (31 page inputs)
├── playwright.config.js      ← QA suites
├── index.html, *.html        ← page markup (31 pages incl. QA harnesses)
├── src/
│   ├── js/                   ← core, components, page entries, mock data
│   ├── locales/              ← fa.json + en.json (≈1,347 keys each)
│   └── scss/                 ← token-driven SCSS (main.scss → one CSS)
├── scripts/                  ← mock-data generators
├── tests/                    ← Playwright suites
├── docs/                     ← product & localization documentation
└── README.md
\`\`\`

To rebuild the preview-style static output: \`npm install && npm run build\`,
then serve \`dist/\` on any static host.
`,
  'Preview-Getting-Started.md': `# Preview package — getting started

\`APIForge-X-Preview/\` exists so you can inspect the full product in seconds,
exactly as it will look to end users — without installing anything.

## Open

- **Windows / macOS / Linux:** unzip \`APIForge-X-Preview.zip\`, open the
  \`APIForge-X-Preview\` folder and double-click \`index.html\`.
- It opens in your default browser from the local file system
  (\`file://\`). No server, no Node.js, no npm, no internet.

## What to try

1. The landing page hero shows a **live** product preview (charts, KPIs,
   activity feed) — these are real components running on seeded data.
2. Open \`dashboard.html\`, \`logs.html\`, \`webhooks.html\`, \`api-keys.html\`,
   \`usage.html\` — the whole app surface.
3. Click the **language toggle** (EN / فارسی) — the entire UI flips between
   Persian RTL and English LTR live.
4. Click the **theme toggle** — dark ⇄ light.
5. \`style-guide.html\`, \`visual-showcase.html\` and \`rtl-persian-test.html\`
   document the component system, motion and RTL behavior.
6. Press \`Ctrl/⌘ K\` inside the dashboard shell for the command palette.

## Technical notes

- Each page loads exactly one classic (non-module) \`<script defer>\` bundle
  from \`assets/js/\` — there is no ES-module graph, so browsers apply no
  CORS origin checks.
- One stylesheet (\`assets/css/main.css\`) styles every page; fonts are
  self-hosted in \`assets/fonts/\`.
- Persian (fa/RTL) is the default locale; English (en/LTR) is one click away.
- This package is for preview and static hosting. To customize anything,
  use \`APIForge-X-Developer/\` and follow \`Documentation/Installation.md\`.
`,
};
for (const [name, text] of Object.entries(docFiles)) {
  fs.writeFileSync(path.join(docOut, name), text.replaceAll('${pages}', String(pages.length)));
}

// ------------------------------------------------------------------
// 6. Release root — README.md + LICENSE.txt
// ------------------------------------------------------------------
fs.writeFileSync(
  path.join(release, 'README.md'),
  `# APIForge X v${version} — Premium Developer API Platform HTML Template

Dark-first, keyboard-first, **RTL first-class** HTML template for API
platforms (AI APIs, infra APIs, BaaS, SaaS dev tools). Persian-first and
bilingual (fa ⇄ en), with **${pages.length} pages**, 22+ seeded datasets,
two themes (dark/light/system), token-driven SCSS and self-hosted fonts
(Vazirmatn, Inter Variable, JetBrains Mono) — no CDN, no backend.

## What is inside

| Item | Description |
|------|-------------|
| \`APIForge-X-Preview/\` (+ \`.zip\`) | **Instant preview** — unzip, double-click \`index.html\`. Runs from \`file://\` with no npm and no server. Bundled classic JS, one standalone CSS, local fonts. |
| \`APIForge-X-Developer/\` (+ \`.zip\`) | **Original Vite source** — \`src/\`, \`package.json\`, \`vite.config.js\`, \`docs/\`, tests. \`npm install && npm run dev\`. |
| \`Documentation/\` | Buyer guides — Installation, File structure, Preview getting-started, Customization, RTL, Theme system. |
| \`PACKAGE-MANIFEST.json\` | Inventory of every shipped file with SHA-256 checksums. |

## Preview in 10 seconds

1. Unzip \`APIForge-X-Preview.zip\`.
2. Double-click \`index.html\`.

Done — no tools, no server, no CORS/module errors (all scripts are classic
bundles, all assets relative and local).

## Customize

\`\`\`bash
unzip APIForge-X-Developer.zip
cd APIForge-X-Developer
npm install
npm run dev        # http://localhost:3000
npm run build      # → dist/ (static site)
\`\`\`

Node.js 20+, npm 10+. No backend, database or host-side build step.

## Browser support

Modern evergreen browsers (Chrome/Edge, Firefox, Safari). RTL, themes and
animations respect \`prefers-reduced-motion\` and system settings.

## QA

\`VERIFICATION.md\` (when present) records the automated release audit: every
page opened from a clean unzip over \`file://\`, CSS/JS/fonts verified,
console free of errors and CORS warnings.
`,
);
copyFile(path.join(pack, 'LICENSE.txt'), path.join(release, 'LICENSE.txt'));

// ------------------------------------------------------------------
// 7. ZIP packages (folder roots included, so extraction creates one folder)
// ------------------------------------------------------------------
console.log('→ zipping packages');
const zips = [];
for (const folder of ['APIForge-X-Developer', 'APIForge-X-Preview']) {
  const zipPath = path.join(release, `${folder}.zip`);
  execSync(`cd "${release}" && zip -qrX "${path.join(release, folder + '.zip')}" "${folder}"`, {
    shell: '/bin/bash',
  });
  zips.push(zipPath);
}

// ------------------------------------------------------------------
// 8. PACKAGE-MANIFEST.json
// ------------------------------------------------------------------
const sha = {};
{
  const walk = (p, rel) => {
    for (const ent of fs.readdirSync(p, { withFileTypes: true })) {
      const fp = path.join(p, ent.name);
      const fr = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) walk(fp, fr);
      else if (ent.name !== 'PACKAGE-MANIFEST.json') sha[fr] = sha256File(fp);
    }
  };
  walk(release, '');
}
const htmlFiles = fs.readdirSync(previewOut).filter((n) => n.endsWith('.html')).sort();
const previewAssets = path.join(previewOut, 'assets');
const manifest = {
  product: 'APIForge X',
  slug: 'apiforge-x',
  version,
  type: 'premium-html-template',
  created: new Date().toISOString(),
  defaultLocale: 'fa',
  locales: ['fa', 'en'],
  themes: ['dark', 'light', 'system'],
  structure: {
    developerPackage: 'APIForge-X-Developer',
    developerZip: 'APIForge-X-Developer.zip',
    previewPackage: 'APIForge-X-Preview',
    previewZip: 'APIForge-X-Preview.zip',
    documentation: 'Documentation',
    readme: 'README.md',
    license: 'LICENSE.txt',
    manifest: 'PACKAGE-MANIFEST.json',
  },
  previewPackage: {
    entry: 'index.html (open by double-click — file://, no server, no npm)',
    pages: htmlFiles,
    pageCount: htmlFiles.length,
    assets: {
      css: ['assets/css/main.css'],
      js: fs.readdirSync(path.join(previewAssets, 'js')).sort(),
      fonts: fs.readdirSync(path.join(previewAssets, 'fonts')).sort(),
      totalSizeBytes: sizeOfDir(previewAssets),
    },
    moduleLoading: 'converted to classic deferred scripts (no ES modules — no CORS)',
  },
  developerPackage: {
    entry: 'npm install && npm run dev (Vite)',
    htmlInputs: fs.readdirSync(devOut).filter((n) => n.endsWith('.html')).length,
    sourceBytes: sizeOfDir(devOut),
  },
  zips: {
    developer: fs.statSync(path.join(release, 'APIForge-X-Developer.zip')).size,
    preview: fs.statSync(path.join(release, 'APIForge-X-Preview.zip')).size,
  },
  requirements: {
    preview: 'Any modern browser. Double-click index.html. No Node, no server, no internet.',
    developer: 'Node.js 20+, npm 10+. Optional: Chromium for Playwright.',
  },
  files: { sha256: sha },
};
fs.writeFileSync(path.join(release, 'PACKAGE-MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');

// ------------------------------------------------------------------
// 9. Summary
// ------------------------------------------------------------------
console.log('ASSEMBLE OK');
console.log(`  pages              ${htmlFiles.length}`);
console.log(`  preview css        assets/css/main.css (${(fs.statSync(path.join(cssOutDir, 'main.css')).size / 1024).toFixed(0)} KB)`);
console.log(`  preview js bundles ${fs.readdirSync(jsOutDir).length} (${(sizeOfDir(jsOutDir) / 1024 / 1024).toFixed(2)} MB)`);
console.log(`  preview fonts      ${fontFiles.size} files (${(sizeOfDir(fontsOutDir) / 1024 / 1024).toFixed(2)} MB)`);
console.log(`  developer source   ${manifest.developerPackage.htmlInputs} html inputs (${(manifest.developerPackage.sourceBytes / 1024 / 1024).toFixed(2)} MB)`);
console.log(`  zips               ${zips.map((z) => `${path.basename(z)} (${(fs.statSync(z).size / 1024 / 1024).toFixed(2)} MB)`).join(', ')}`);
console.log(`  manifest entries   ${Object.keys(sha).length}`);
console.log(`  out                ${release}`);
