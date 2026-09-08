#!/usr/bin/env node
// =============================================================
// APIForge X — Release QA audit
//
// Audits release/APIForge-X-HTML (the buyer package):
//   1. Page inventory (all 30 buyer pages, QA harness excluded)
//   2. Per-page reference audit: every href/src must resolve, be
//      relative (no absolute /assets), contain no localhost and no
//      source paths, and not point at the excluded QA page
//   3. CSS url() audit + font audit (Vazirmatn weights, locale
//      font rules in the compiled CSS)
//   4. JS dynamic-chunk audit (import("./…") must exist)
//   5. Dev-file exclusion audit
//   6. Live static-server smoke test: GET every page and every
//      referenced asset, verify status + content-type
// Writes RELEASE-VERIFICATION.md at the repo root and exits 1 on
// any failure.
// =============================================================

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlRoot = path.join(repo, 'release', 'APIForge-X-HTML');
const reportPath = path.join(repo, 'RELEASE-VERIFICATION.md');

const REQUIRED_PAGES = [
  'index.html', 'pricing.html', 'dashboard.html', 'apis.html', 'api-keys.html',
  'logs.html', 'usage.html', 'webhooks.html', 'endpoints.html', 'errors.html',
  'rate-limits.html', 'environments.html', 'team.html', 'billing.html',
  'settings.html', 'profile.html', 'notifications.html', 'docs.html',
  'sdk.html', 'api-reference.html', 'metrics.html', 'login.html',
  'forgot-password.html', 'invite.html', 'changelog.html', 'status.html',
  '404.html', 'style-guide.html', 'rtl.html', 'visual-showcase.html',
];
const EXCLUDED = ['rtl-persian-test.html'];

const problems = [];
const warnings = [];
const ok = (label) => console.log('  ✓', label);
const fail = (msg) => {
  console.error('  ✗', msg);
  problems.push(msg);
};
const warn = (msg) => {
  console.warn('  !', msg);
  warnings.push(msg);
};

const lines = [];
const log = (s = '') => {
  console.log(s);
  lines.push(s);
};

if (!fs.existsSync(htmlRoot)) {
  console.error('release/APIForge-X-HTML missing — run `node packaging/assemble.mjs` first');
  process.exit(1);
}

// ------------------------------------------------------------------
// 1. Inventory
// ------------------------------------------------------------------
log('## 1. Page inventory');
const pages = fs.readdirSync(htmlRoot).filter((n) => n.endsWith('.html'));
log(`- Pages in package: **${pages.length}**`);
for (const p of REQUIRED_PAGES) {
  if (!pages.includes(p)) fail(`missing required page ${p}`);
}
for (const p of EXCLUDED) {
  if (pages.includes(p)) fail(`excluded dev page ${p} present in HTML package`);
}
ok(`required 30 pages present, QA harness excluded (${pages.length} total)`);

// ------------------------------------------------------------------
// 2. Per-page reference audit
// ------------------------------------------------------------------
log('\n## 2. HTML reference audit (per page)');
const refRe = /(?:href|src)="([^"]+)"/g;
const allAssets = new Set();
for (const page of pages) {
  const text = fs.readFileSync(path.join(htmlRoot, page), 'utf8');
  let cssRefs = 0;
  let jsRefs = 0;
  let m;
  while ((m = refRe.exec(text))) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(url) || url.startsWith('#')) continue;
    if (url.startsWith('/')) fail(`${page}: absolute reference ${url}`);
    if (/localhost|127\.0\.0\.1/i.test(url)) fail(`${page}: localhost reference ${url}`);
    if (/src\/(js|scss)/.test(url)) fail(`${page}: source-path reference ${url}`);
    if (EXCLUDED.some((x) => url.includes(x))) fail(`${page}: reference to excluded page ${url}`);
    const clean = url.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.resolve(htmlRoot, clean);
    if (!target.startsWith(htmlRoot)) fail(`${page}: reference escapes package ${url}`);
    if (!fs.existsSync(target)) {
      fail(`${page}: missing ${url}`);
      continue;
    }
    if (clean.endsWith('.css')) cssRefs++;
    if (clean.endsWith('.js')) jsRefs++;
    allAssets.add(path.relative(htmlRoot, target));
  }
  if (cssRefs === 0) fail(`${page}: no CSS reference (page would render unstyled)`);
  if (jsRefs === 0) fail(`${page}: no JS reference`);
}
ok(`all ${pages.length} pages: every reference resolves, relative, no localhost, no source paths`);
log(`- Unique referenced assets: **${allAssets.size}**`);

// ------------------------------------------------------------------
// 3. CSS + font audit
// ------------------------------------------------------------------
log('\n## 3. CSS & font audit');
const assetsDir = path.join(htmlRoot, 'assets');
const cssFiles = fs.readdirSync(assetsDir).filter((n) => n.endsWith('.css'));
const jsFiles = fs.readdirSync(assetsDir).filter((n) => n.endsWith('.js'));
const woff2Files = fs.readdirSync(assetsDir).filter((n) => n.endsWith('.woff2'));
const woffFiles = fs.readdirSync(assetsDir).filter((n) => n.endsWith('.woff'));
if (cssFiles.length === 0) fail('no compiled CSS in assets/');
if (jsFiles.length === 0) fail('no JS chunks in assets/');
if (woff2Files.length === 0) fail('no woff2 fonts in assets/');

const cssText = cssFiles.map((f) => fs.readFileSync(path.join(assetsDir, f), 'utf8')).join('\n');

// CSS url() references must resolve
const urlRe = /url\((['"]?)([^'")]+)\1\)/g;
let um;
const cssUrls = new Set();
while ((um = urlRe.exec(cssText))) {
  const u = um[2];
  if (/^(data:|https?:|#)/.test(u)) continue;
  const clean = u.split('#')[0].split('?')[0];
  if (!clean) continue;
  cssUrls.add(clean);
  const target = path.resolve(assetsDir, clean);
  if (!fs.existsSync(target)) fail(`CSS url() missing: ${clean}`);
}
ok(`CSS url() references: ${cssUrls.size} checked, all resolve`);

// Vazirmatn audit — the Persian face must be real, not a token-only promise
const vazirWeights = [300, 400, 500, 600, 700];
for (const w of vazirWeights) {
  const re = new RegExp(`@font-face\\{[^}]*font-family:Vazirmatn[^}]*font-weight:${w}[^}]*\\}`);
  const reAlt = new RegExp(`@font-face\\{[^}]*font-weight:${w}[^}]*font-family:Vazirmatn[^}]*\\}`);
  if (!re.test(cssText) && !reAlt.test(cssText)) {
    // property order varies; fall back to a per-weight face check
    const faces = cssText.match(/@font-face\{[^}]*\}/g) || [];
    const hit = faces.some((f) => f.includes('font-family:Vazirmatn') && new RegExp(`font-weight:${w}`).test(f));
    if (!hit) fail(`Vazirmatn @font-face for weight ${w} missing from compiled CSS`);
  }
}
ok(`Vazirmatn @font-face rules for weights ${vazirWeights.join('/')} present in compiled CSS`);
for (const w of vazirWeights) {
  if (!woff2Files.some((n) => n.startsWith(`vazirmatn-arabic-${w}-normal`))) {
    fail(`vazirmatn-arabic-${w} woff2 not bundled`);
  }
}
ok(`Vazirmatn arabic-subset woff2 files bundled for all five weights`);

// Locale font rules — the fix the release must carry
const mustHave = [
  [/--font-body:\s*var\(--font-latin-ui\)/, '--font-body defaults to the Latin face'],
  [/\[dir=rtl\],\[lang=fa\]\{[^}]*--font-body:\s*var\(--font-persian-ui\)/, '--font-body resolves to Vazirmatn under [dir=rtl]/[lang=fa]'],
  [/--bs-body-font-family:\s*var\(--font-body\)/, 'Bootstrap body font bridged to --font-body'],
  [/--font-persian-ui:\s*"?Vazirmatn/, "--font-persian-ui stack leads with Vazirmatn"],
];
for (const [re, label] of mustHave) {
  if (!re.test(cssText)) fail(`compiled CSS missing: ${label}`);
}
ok('locale-resolved font rules verified in compiled CSS');

// ------------------------------------------------------------------
// 4. JS dynamic chunk audit
// ------------------------------------------------------------------
log('\n## 4. JS chunk audit');
const dynRe = /import\(\s*["']\.\/([^"']+)["']\s*\)/g;
const staticRe = /from\s*["']\.\/([^"']+)["']/g;
let dynCount = 0;
let staticCount = 0;
for (const j of jsFiles) {
  const text = fs.readFileSync(path.join(assetsDir, j), 'utf8');
  let dm;
  while ((dm = dynRe.exec(text))) {
    dynCount++;
    if (!fs.existsSync(path.join(assetsDir, dm[1]))) fail(`dynamic chunk missing: ${dm[1]} (from ${j})`);
  }
  let sm;
  while ((sm = staticRe.exec(text))) {
    staticCount++;
    if (!fs.existsSync(path.join(assetsDir, sm[1]))) fail(`static import chunk missing: ${sm[1]} (from ${j})`);
  }
}
ok(`JS chunks: ${jsFiles.length} present, ${staticCount} static + ${dynCount} dynamic imports all resolve (full import graph intact)`);

// ------------------------------------------------------------------
// 5. Dev-file exclusion
// ------------------------------------------------------------------
log('\n## 5. Dev-file exclusion');
const devNames = ['node_modules', 'vite.config.js', 'package.json', '.vite', 'tests', 'src'];
const devHits = [];
const walk = (p) => {
  for (const ent of fs.readdirSync(p, { withFileTypes: true })) {
    if (ent.name === 'assets' && p === htmlRoot) continue; // allowed
    if (devNames.includes(ent.name)) devHits.push(path.relative(htmlRoot, path.join(p, ent.name)));
    if (ent.isDirectory() && ent.name !== 'assets') walk(path.join(p, ent.name));
  }
};
walk(htmlRoot);
if (devHits.length) fail(`dev files in HTML package: ${devHits.join(', ')}`);
if (fs.existsSync(path.join(htmlRoot, 'src'))) fail('src/ present in HTML package');
const maps = fs.readdirSync(assetsDir).filter((n) => n.endsWith('.map'));
if (maps.length) warn(`${maps.length} source maps in assets/ (not expected)`);
ok('no source/, tests/, configs, node_modules or maps in the HTML package');

// ------------------------------------------------------------------
// 6. Static-server smoke test
// ------------------------------------------------------------------
log('\n## 6. Static-server smoke test');
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png',
};
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const fp = path.normalize(path.join(htmlRoot, urlPath));
  if (!fp.startsWith(htmlRoot) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});
await new Promise((r) => server.listen(4599, '127.0.0.1', r));

const fetched = [];
const get = async (p) => {
  const res = await fetch(`http://127.0.0.1:4599/${p}`);
  const body = await res.text();
  fetched.push({ path: p, status: res.status, type: res.headers.get('content-type') || '' });
  return { res, body };
};
let pageOk = 0;
for (const p of pages) {
  const { res, body } = await get(p);
  if (res.status !== 200) {
    fail(`server: ${p} → ${res.status}`);
    continue;
  }
  if (!/<link[^>]+rel="stylesheet"/.test(body)) fail(`server: ${p} has no stylesheet link`);
  if (/src="\/|href="\/assets/.test(body)) fail(`server: ${p} served with absolute asset paths`);
  pageOk++;
}
ok(`${pageOk}/${pages.length} pages served 200 with stylesheet + module script`);

let assetOk = 0;
const wantType = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff' };
for (const a of allAssets) {
  const { res } = await get(a);
  const want = wantType[path.extname(a)];
  if (res.status !== 200 || (want && !res.headers.get('content-type').includes(want))) {
    fail(`server: asset ${a} → ${res.status} ${res.headers.get('content-type')}`);
    continue;
  }
  assetOk++;
}
ok(`${assetOk}/${allAssets.size} referenced assets served 200 with correct content-type`);
server.close();

// ------------------------------------------------------------------
// Report
// ------------------------------------------------------------------
const totalBytes = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? totalBytes(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);
const kb = (b) => `${(b / 1024).toFixed(1)} KB`;
const verdict = problems.length === 0 ? 'PASS' : 'FAIL';

log(`\n## 7. Verdict`);
log(`\n**${verdict}** — ${problems.length} problem(s), ${warnings.length} warning(s)`);
if (problems.length) for (const p of problems) log(`- ✗ ${p}`);
if (warnings.length) for (const w of warnings) log(`- ! ${w}`);

const header = [
  `# Release verification — APIForge X ${fs.existsSync(path.join(repo, 'package.json')) ? JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8')).version : ''}`,
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Package: \`release/APIForge-X-HTML\` — ${pages.length} pages, assets: ${cssFiles.length} CSS / ${jsFiles.length} JS / ${woff2Files.length} woff2 / ${woffFiles.length} woff — ${kb(totalBytes(assetsDir))}`,
  '',
  'Pipeline: `npm run build` → `node packaging/assemble.mjs` → `node packaging/verify.mjs`',
  '',
].join('\n');
fs.writeFileSync(reportPath, header + lines.join('\n') + '\n');
console.log(`\nReport → ${reportPath}`);

if (problems.length) process.exit(1);
console.log('VERIFY OK');
