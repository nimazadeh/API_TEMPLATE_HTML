#!/usr/bin/env node
// =============================================================
// APIForge X — Marketplace release assembler (v4 — final layout)
//
// Builds the customer-facing marketplace deliverables from a fresh
// production build:
//
//   release/
//   ├── APIForge-X-v<version>/          final marketplace structure
//   │   ├── index.html …                30 pages (flat, file://-ready)
//   │   ├── assets/{css,js,fonts}/
//   │   ├── documentation/              buyer guides (lowercase)
//   │   ├── README.md                   product README (Blue Studio)
//   │   └── LICENSE.md                  commercial license (Blue Studio)
//   ├── APIForge-X.zip                  marketplace upload = the tree above
//   └── APIForge-X-Developer.zip        clean Vite source package
//
// Every page's ES-module entry chunk is converted into a single
// self-contained classic <script defer> bundle (esbuild IIFE), so all
// pages open directly from file:// with no server, no npm and no
// CORS/module errors.
//
// A leak guard asserts that no internal engineering files (QA harness
// pages, test suites, build automation, verification reports,
// manifests, checksums, agent notes) end up in either package.
//
// Run:  node packaging/build-release.mjs
// QA:   node packaging/verify-release.mjs   (afterwards)
// =============================================================

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { build as esbuild } from 'esbuild';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pack = path.join(repo, 'packaging');
const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const version = pkg.version;
const releaseRoot = path.join(repo, 'release');
const release = path.join(releaseRoot, `APIForge-X-v${version}`);
const dist = path.join(repo, 'dist');

// ---------------------------------------------------------------
// Product boundary — what must never appear in a customer package
// ---------------------------------------------------------------
const INTERNAL_PAGES = new Set(['rtl-persian-test.html']);
const INTERNAL_FILENAMES = new Set([
  'VERIFICATION.md',
  'PACKAGE-MANIFEST.json',
  'playwright.config.js',
  'package-lock.json',
  '.gitignore',
]);
const INTERNAL_DIRS = new Set(['tests', 'scripts', 'tools', 'docs', 'release', '.git']);
const INTERNAL_CONTENT_RE = /rtl-persian-test|playwright|PACKAGE-MANIFEST|VERIFICATION\.md|Rastchin|RTL-Theme/i;
// Source files that belong to internal-only pages (excluded from src/ copies)
const INTERNAL_PAGES_NAME_SKIP = new Set(['rtl-persian-test.js']);

// ---------------------------------------------------------------
// helpers
// ---------------------------------------------------------------
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
function copyDir(src, dest, skipNames = new Set()) {
  mkdirp(dest);
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (ent.name === '.git' || ent.name === 'node_modules') continue;
    const from = path.join(src, ent.name);
    const to = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(from, to, skipNames);
    else if (!skipNames.has(ent.name)) copyFile(from, to);
  }
}
function writeText(dest, text) {
  mkdirp(path.dirname(dest));
  fs.writeFileSync(dest, text);
}

function assertLeakFree(rootDir, label) {
  const problems = [];
  const walk = (dir, rel) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const relPath = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        if (INTERNAL_DIRS.has(ent.name)) {
          problems.push(`${label}: internal directory "${relPath}/"`);
          continue;
        }
        walk(path.join(dir, ent.name), relPath);
      } else {
        if (INTERNAL_FILENAMES.has(ent.name) || INTERNAL_PAGES.has(ent.name)) {
          problems.push(`${label}: internal file "${relPath}"`);
          continue;
        }
        if (/\.(html|css|js|json|md|txt|xml|svg)$/.test(ent.name)) {
          const text = fs.readFileSync(path.join(dir, ent.name), 'utf8');
          if (INTERNAL_CONTENT_RE.test(text)) {
            problems.push(`${label}: internal reference inside "${relPath}"`);
          }
        }
      }
    }
  };
  walk(rootDir, '');
  if (problems.length) {
    throw new Error(`Leak guard failed:\n  ${problems.join('\n  ')}`);
  }
}

const pageEntryRe = /<script type="module"[^>]*src="\.\/assets\/([^"]+\.js)"[^>]*><\/script>/;
const cssLinkRe = /<link rel="stylesheet"[^>]*href="\.\/assets\/([^"]+\.css)"[^>]*>/;
const modulePreloadRe = /<link rel="modulepreload"[^>]*>\s*/g;

console.log(`APIForge X v${version} — marketplace release assembler`);

// ---------------------------------------------------------------
// 1. Fresh production build (always)
// ---------------------------------------------------------------
console.log('→ vite build (fresh, always)');
execSync('npm run build', { cwd: repo, stdio: 'inherit' });

const pages = fs.readdirSync(dist).filter((n) => n.endsWith('.html')).sort();
const customerPages = pages.filter((n) => !INTERNAL_PAGES.has(n));
const unknownPages = pages.filter((n) => !INTERNAL_PAGES.has(n) && !/\.html$/.test(n));
if (unknownPages.length) throw new Error(`Unexpected dist pages: ${unknownPages.join(', ')}`);

// ---------------------------------------------------------------
// 2. Clean release tree
// ---------------------------------------------------------------
rmrf(releaseRoot);
mkdirp(release);

// ---------------------------------------------------------------
// 3. APIForge-X-v<version>/ — final marketplace structure
// ---------------------------------------------------------------
console.log('→ assembling APIForge-X (customer package)');

// 3a. Styles: single shared stylesheet → assets/css/main.css, fonts → assets/fonts/
const cssAssetFiles = fs.readdirSync(path.join(dist, 'assets')).filter((n) => n.endsWith('.css'));
if (cssAssetFiles.length !== 1) throw new Error(`Expected exactly 1 dist css, got ${cssAssetFiles.length}`);
const cssSrc = path.join(dist, 'assets', cssAssetFiles[0]);
let cssText = fs.readFileSync(cssSrc, 'utf8');
const assetsDir = path.join(release, 'assets');
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

// 3b. JavaScript: per page, esbuild-bundle the entry chunk into one classic IIFE
// (all shared chunks merged) → assets/js/<page>.js
const jsOutDir = path.join(assetsDir, 'js');
mkdirp(jsOutDir);
const pageToBundle = new Map(); // page slug -> dist entry chunk basename
for (const page of customerPages) {
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

// 3c. HTML: copy dist pages, swap module loading for classic deferred scripts
let cssHref = null;
for (const page of customerPages) {
  const slug = page.slice(0, -5);
  const html = fs.readFileSync(path.join(dist, page), 'utf8');
  const cssLink = cssLinkRe.exec(html);
  if (!cssLink) throw new Error(`No stylesheet link found in dist/${page}`);
  if (!cssHref) cssHref = cssLink[1];
  else if (cssHref !== cssLink[1])
    throw new Error(`Multiple dist css files referenced (${cssHref}, ${cssLink[1]}) — rebase needed`);
  const entry = pageEntryRe.exec(html);
  if (!entry) throw new Error(`No module entry script found in dist/${page}`);

  const out = html
    // drop modulepreload hints — no module graph anymore
    .replace(modulePreloadRe, '')
    // classic stylesheet (no crossorigin → no CORS on file://)
    .replace(cssLinkRe, '<link rel="stylesheet" href="./assets/css/main.css">')
    // classic script, deferred — same timing as the module it replaces
    .replace(pageEntryRe, `<script defer src="./assets/js/${slug}.js"></script>`);

  for (const bad of ['type="module"', 'modulepreload', 'crossorigin']) {
    if (out.includes(bad)) throw new Error(`dist/${page} still contains "${bad}" after conversion`);
  }
  fs.writeFileSync(path.join(release, page), out);
}

// 3d. Documentation, README, LICENSE
copyDir(path.join(pack, 'Documentation'), path.join(release, 'documentation'));
copyFile(path.join(repo, 'README.md'), path.join(release, 'README.md'));
copyFile(path.join(pack, 'LICENSE.md'), path.join(release, 'LICENSE.md'));

assertLeakFree(release, 'customer package');

// ---------------------------------------------------------------
// 4. APIForge-X.zip — the marketplace upload
// ---------------------------------------------------------------
console.log('→ zipping APIForge-X.zip');
execSync(`cd "${releaseRoot}" && zip -qrX "APIForge-X.zip" "APIForge-X-v${version}"`, {
  shell: '/bin/bash',
});

// ---------------------------------------------------------------
// 5. APIForge-X-Developer.zip — clean Vite source package
//    (source for customization, not our internal factory)
// ---------------------------------------------------------------
console.log('→ assembling APIForge-X-Developer');
const staging = path.join(releaseRoot, '.staging');
const devOut = path.join(staging, 'APIForge-X-Developer');
mkdirp(devOut);

for (const page of customerPages) {
  copyFile(path.join(repo, page), path.join(devOut, page));
}
// src/ without the private QA harness entry (see INTERNAL_PAGES)
copyDir(path.join(repo, 'src'), path.join(devOut, 'src'), INTERNAL_PAGES_NAME_SKIP);

// Locale catalogs for buyers: drop the keys of internal-only pages.
for (const localeFile of ['fa.json', 'en.json']) {
  const localePath = path.join(devOut, 'src', 'locales', localeFile);
  const catalog = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  for (const key of Object.keys(catalog)) {
    if (key.startsWith('qa.')) delete catalog[key];
  }
  fs.writeFileSync(localePath, JSON.stringify(catalog, null, 2) + '\n');
}
copyDir(path.join(pack, 'Documentation'), path.join(devOut, 'documentation'));
copyFile(path.join(repo, 'README.md'), path.join(devOut, 'README.md'));
copyFile(path.join(pack, 'LICENSE.md'), path.join(devOut, 'LICENSE.md'));

// package.json — buyer-facing variant: build workflow only, no QA tooling.
writeText(
  path.join(devOut, 'package.json'),
  JSON.stringify(
    {
      name: 'apiforge-x',
      version,
      description: 'APIForge X — Premium developer API platform HTML template by Blue Studio.',
      author: 'Blue Studio',
      license: 'SEE LICENSE IN LICENSE.md',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: pkg.dependencies,
      devDependencies: {
        sass: pkg.devDependencies.sass,
        vite: pkg.devDependencies.vite,
      },
    },
    null,
    2,
  ) + '\n',
);

// vite.config.js — same build config, without internal-only page inputs.
{
  const repoConfig = fs.readFileSync(path.join(repo, 'vite.config.js'), 'utf8');
  const cleaned = repoConfig
    .replace(/^\s*'rtl-persian-test':.*\n/m, '')
    .replace(
      /\/\/ Phase 1 ships the foundation pages; Phase 3A adds the app pages;\n\/\/ Phase 3B adds the advanced developer pages\./,
      '// Every top-level HTML page the template ships.',
    );
  if (/rtl-persian-test/.test(cleaned)) throw new Error('vite.config.js cleanup failed');
  writeText(path.join(devOut, 'vite.config.js'), cleaned);
}

assertLeakFree(devOut, 'developer package');

console.log('→ zipping APIForge-X-Developer.zip');
execSync(`cd "${staging}" && zip -qrX "${path.join(releaseRoot, 'APIForge-X-Developer.zip')}" "APIForge-X-Developer"`, {
  shell: '/bin/bash',
});
rmrf(staging);

// ---------------------------------------------------------------
// 6. Summary
// ---------------------------------------------------------------
const sizeOfDir = (p) =>
  fs
    .readdirSync(p, { withFileTypes: true })
    .reduce(
      (sum, e) =>
        sum + (e.isDirectory() ? sizeOfDir(path.join(p, e.name)) : fs.statSync(path.join(p, e.name)).size),
      0,
    );
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
const zipSize = (name) => mb(fs.statSync(path.join(releaseRoot, name)).size);

console.log('ASSEMBLE OK');
console.log(`  customer pages      ${customerPages.length}`);
console.log(`  css                 assets/css/main.css (${mb(fs.statSync(path.join(cssOutDir, 'main.css')).size)})`);
console.log(`  js bundles          ${fs.readdirSync(jsOutDir).length} (${mb(sizeOfDir(jsOutDir))})`);
console.log(`  fonts               ${fs.readdirSync(fontsOutDir).length} files (${mb(sizeOfDir(fontsOutDir))})`);
console.log(`  documentation       ${fs.readdirSync(path.join(release, 'documentation')).length} guides`);
console.log(`  APIForge-X.zip      ${zipSize('APIForge-X.zip')}`);
console.log(`  Developer.zip       ${zipSize('APIForge-X-Developer.zip')}`);
console.log(`  out                 ${release}`);
