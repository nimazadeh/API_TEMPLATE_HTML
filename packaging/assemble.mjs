#!/usr/bin/env node
// =============================================================
// APIForge X — Marketplace release assembler
//
// Builds (if needed) and assembles the release/ tree:
//
//   release/
//   ├── APIForge-X-HTML/        30-page production site + assets/
//   ├── APIForge-X-Source/      full Vite development source
//   ├── Documentation/          buyer guides
//   ├── marketplace/            listing material
//   ├── LICENSE.txt
//   └── PACKAGE-MANIFEST.json   inventory + SHA-256 per file
//
// Run `node packaging/verify.mjs` afterwards for the release QA audit.
// =============================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const release = path.join(repo, 'release');
const pack = path.join(repo, 'packaging');

// QA harness used by the Playwright suites — ships in the source build,
// excluded from the buyer HTML package on purpose.
const EXCLUDED_HTML = ['rtl-persian-test.html'];

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

// ------------------------------------------------------------------
// 1. Fresh production build (always)
// ------------------------------------------------------------------
// dist/ is throwaway build output and must never be reused silently:
// if a leftover dist/ from an older source tree exists (e.g. the last
// `npm run build` ran before the latest SCSS/HTML/JS edits), packaging
// it as-is would ship a release that does not match the current source —
// and packaging/verify.mjs would still PASS because it audits the stale
// tree for internal consistency only. Always rebuild first so the
// release package is generated from the current source, every time.
const dist = path.join(repo, 'dist');
console.log('→ vite build (fresh, always)');
execSync('npm run build', { cwd: repo, stdio: 'inherit' });

// ------------------------------------------------------------------
// 2. Clean release/
// ------------------------------------------------------------------
rmrf(release);
mkdirp(release);

// ------------------------------------------------------------------
// 3. APIForge-X-HTML — production site (30 pages)
// ------------------------------------------------------------------
const htmlOut = path.join(release, 'APIForge-X-HTML');
copyDir(dist, htmlOut, { skip: EXCLUDED_HTML });
// Remove in-page links to the excluded QA harness so no buyer page 404s.
const linkRe = new RegExp(
  `<a\\b[^>]*href="(?:\\.{1,2}/)?${EXCLUDED_HTML.join('|').replace('.', '\\.')}"[^>]*>[\\s\\S]*?</a>\\s*\\n?`,
  'g',
);
let stripped = 0;
for (const f of fs.readdirSync(htmlOut).filter((n) => n.endsWith('.html'))) {
  const p = path.join(htmlOut, f);
  const before = fs.readFileSync(p, 'utf8');
  const after = before.replace(linkRe, '');
  if (after !== before) {
    fs.writeFileSync(p, after);
    stripped += (before.match(linkRe) || []).length;
  }
}

// ------------------------------------------------------------------
// 4. APIForge-X-Source — full development source
// ------------------------------------------------------------------
const srcOut = path.join(release, 'APIForge-X-Source');
mkdirp(srcOut);
const sourceTop = [
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'playwright.config.js',
  '.gitignore',
  'README.md',
];
for (const f of sourceTop) copyFile(path.join(repo, f), path.join(srcOut, f));
copyFile(path.join(pack, 'LICENSE.txt'), path.join(srcOut, 'LICENSE.txt'));
for (const f of fs.readdirSync(repo).filter((n) => n.endsWith('.html'))) {
  copyFile(path.join(repo, f), path.join(srcOut, f));
}
copyDir(path.join(repo, 'src'), path.join(srcOut, 'src'));
copyDir(path.join(repo, 'scripts'), path.join(srcOut, 'scripts'));
copyDir(path.join(repo, 'tests'), path.join(srcOut, 'tests'));
copyDir(path.join(repo, 'docs'), path.join(srcOut, 'docs'));

// ------------------------------------------------------------------
// 5. Documentation — buyer guides
// ------------------------------------------------------------------
const docOut = path.join(release, 'Documentation');
for (const f of [
  'Installation.md',
  'Customization.md',
  'RTL-Guide.md',
  'Theme-System.md',
  'File-Structure.md',
]) {
  copyFile(path.join(pack, 'Documentation', f), path.join(docOut, f));
}

// ------------------------------------------------------------------
// 6. marketplace — listing material
// ------------------------------------------------------------------
const mktOut = path.join(release, 'marketplace');
for (const f of ['Product-Description.md', 'Features.md', 'Screenshot-Guide.md']) {
  copyFile(path.join(pack, 'Marketplace', f), path.join(mktOut, f));
}
copyFile(path.join(pack, 'CHANGELOG.md'), path.join(mktOut, 'Changelog.md'));

// ------------------------------------------------------------------
// 7. LICENSE.txt
// ------------------------------------------------------------------
copyFile(path.join(pack, 'LICENSE.txt'), path.join(release, 'LICENSE.txt'));

// ------------------------------------------------------------------
// 8. PACKAGE-MANIFEST.json
// ------------------------------------------------------------------
const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const htmlFiles = fs.readdirSync(htmlOut).filter((n) => n.endsWith('.html'));
const assetsDir = path.join(htmlOut, 'assets');
const assetFiles = fs.readdirSync(assetsDir);
const countByExt = (ext) => assetFiles.filter((n) => n.endsWith(ext)).length;
const sizeOf = (p) =>
  fs
    .readdirSync(p, { withFileTypes: true })
    .reduce((sum, e) => sum + (e.isDirectory() ? sizeOf(path.join(p, e.name)) : fs.statSync(path.join(p, e.name)).size), 0);

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

const manifest = {
  product: 'APIForge X',
  slug: 'apiforge-x',
  version: pkg.version,
  type: 'premium-html-template',
  created: new Date().toISOString(),
  defaultLocale: 'fa',
  locales: ['fa', 'en'],
  themes: ['dark', 'light', 'system'],
  fonts: {
    persian: { family: 'Vazirmatn', weights: [300, 400, 500, 600, 700], delivery: 'self-hosted woff2/woff in assets/' },
    latin: { family: 'Inter Variable', delivery: 'self-hosted woff2 in assets/' },
    code: { family: 'JetBrains Mono', weights: [400, 500], delivery: 'self-hosted woff2/woff in assets/' },
  },
  structure: {
    htmlPackage: 'APIForge-X-HTML',
    sourcePackage: 'APIForge-X-Source',
    documentation: 'Documentation',
    marketplace: 'marketplace',
    license: 'LICENSE.txt',
    manifest: 'PACKAGE-MANIFEST.json',
  },
  htmlPackage: {
    pages: htmlFiles.sort(),
    pageCount: htmlFiles.length,
    excluded: EXCLUDED_HTML.map((p) => `${p} (source-only QA harness, kept in APIForge-X-Source and dist)`),
    assets: {
      css: countByExt('.css'),
      js: countByExt('.js'),
      woff2: countByExt('.woff2'),
      woff: countByExt('.woff'),
      total: assetFiles.length,
      sizeBytes: sizeOf(assetsDir),
    },
  },
  sourcePackage: {
    htmlInputs: fs.readdirSync(srcOut).filter((n) => n.endsWith('.html')).length,
    build: 'npm install && npm run build (dist/ → APIForge-X-HTML)',
  },
  requirements: {
    html: 'Any static host (Apache, Nginx, cPanel, Netlify, Vercel). Modern evergreen browsers. No Node, no PHP, no database.',
    source: 'Node.js 20+, npm 10+. Optional: Chromium for Playwright.',
  },
  files: { sha256: sha },
};
fs.writeFileSync(
  path.join(release, 'PACKAGE-MANIFEST.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);

// ------------------------------------------------------------------
// 9. Summary
// ------------------------------------------------------------------
console.log('ASSEMBLE OK');
console.log('  pages', htmlFiles.length, '(stripped', stripped, 'QA-harness links)');
console.log('  assets', assetFiles.length);
console.log('  source html inputs', manifest.sourcePackage.htmlInputs);
console.log('  manifest entries', Object.keys(sha).length);
console.log('  out', release);
