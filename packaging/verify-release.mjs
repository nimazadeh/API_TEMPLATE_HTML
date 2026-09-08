#!/usr/bin/env node
// =============================================================
// APIForge X — Release QA audit (v2 layout)
//
// Mimics a buyer's very first run:
//
//   1. Extract APIForge-X-Preview.zip into a CLEAN folder.
//   2. Open every page over file:// (no server, no npm).
//   3. Verify CSS loads, JavaScript boots, fonts load,
//      no console errors, no CORS/module errors, no remote requests.
//   4. Exercise theme + locale (RTL⇄LTR) + navigation on index.html.
//   5. (Optional) Extract APIForge-X-Developer.zip and run
//      `npm ci && npm run build` to prove the source package builds.
//
// Run:   node packaging/verify-release.mjs
//
// Browser resolution:
//   - env AFX_CHROMIUM_EXEC  path to a chromium binary (this sandbox:
//     a headless shell binary), plus optional AFX_CHROMIUM_LIBS dir
//     prepended to LD_LIBRARY_PATH.
//   - otherwise the Playwright-registered Chromium is used.
//
// Set AFX_VERIFY_DEV=1 to also build the Developer package.
// =============================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const release = path.join(repo, 'release');
const previewZip = path.join(release, 'APIForge-X-Preview.zip');
const devZip = path.join(release, 'APIForge-X-Developer.zip');
const reportPath = path.join(release, 'VERIFICATION.md');

const rootPkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const version = rootPkg.version;

const results = []; // { ok, label, detail }
let failures = 0;
function check(ok, label, detail = '') {
  results.push({ ok: !!ok, label, detail });
  if (!ok) failures++;
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

// ------------------------------------------------------------------
// Browser setup
// ------------------------------------------------------------------
let chromium, browser;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.error('playwright-core is not installed — run `npm ci` first.');
  process.exit(2);
}
const execPath = process.env.AFX_CHROMIUM_EXEC;
const libDir = process.env.AFX_CHROMIUM_LIBS;
const launchEnv = { ...process.env };
if (execPath && libDir) {
  launchEnv.LD_LIBRARY_PATH = [libDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':');
}
const launchOptions = {
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
};
if (execPath) launchOptions.executablePath = execPath;
if (execPath && libDir) launchOptions.env = launchEnv;

const pageErrors = (page, bag) => {
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error' || FATAL_ERROR_RE.test(t)) bag.push(`console.${m.type()}: ${t}`);
  });
  page.on('pageerror', (e) => bag.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => bag.push(`requestfailed: ${r.url()} ${r.failure()?.errorText || ''}`));
  page.on('request', (r) => {
    const p = new URL(r.url());
    if (p.protocol !== 'file:' && p.protocol !== 'data:' && p.protocol !== 'about:')
      bag.push(`remote-request: ${r.url()}`);
  });
};
const FATAL_ERROR_RE = /CORS|origin 'null'|Access to .+ at 'file:|net::|ERR_|requestfailed|remote-request|pageerror/i;

// ------------------------------------------------------------------
// 1. Extract preview zip into a clean folder
// ------------------------------------------------------------------
console.log('\n== 1. Extract APIForge-X-Preview.zip into a clean folder ==');
for (const f of [previewZip]) {
  if (!fs.existsSync(f)) {
    console.error(`Missing ${f} — run ` + '`node packaging/build-release.mjs` first.');
    process.exit(2);
  }
}
const cleanDir = fs.mkdtempSync(path.join(os.tmpdir(), 'afx-preview-qa-'));
execSync(`unzip -q -o "${previewZip}" -d "${cleanDir}"`, { stdio: 'inherit' });
const previewDir = path.join(cleanDir, 'APIForge-X-Preview');
check(fs.existsSync(path.join(previewDir, 'index.html')), 'preview extracted to clean folder', previewDir);

// ------------------------------------------------------------------
// 2. Static integrity (no browser)
// ------------------------------------------------------------------
console.log('\n== 2. Static integrity ==');
const htmlFiles = fs.readdirSync(previewDir).filter((n) => n.endsWith('.html')).sort();
const htmlOk = fs.existsSync(path.join(previewDir, 'index.html')) && htmlFiles.length === 31;
check(htmlOk, `31 pages present in preview root (found ${htmlFiles.length})`);

// every internal *.html link must exist
const internalLinks = new Set();
for (const f of htmlFiles) {
  const text = fs.readFileSync(path.join(previewDir, f), 'utf8');
  for (const m of text.matchAll(/href="([^"#?]+\.html)"/g)) internalLinks.add(m[1]);
  for (const m of text.matchAll(/href="\.\/([^"#?]+\.html)"/g)) internalLinks.add(m[1]);
}
const missingLinks = [...internalLinks].filter((l) => !fs.existsSync(path.join(previewDir, l)));
check(missingLinks.length === 0, `every internal page link resolves (${internalLinks.size} unique checked)`, missingLinks.join(', '));

// every asset reference must exist on disk
const missingAssets = [];
for (const f of htmlFiles) {
  const text = fs.readFileSync(path.join(previewDir, f), 'utf8');
  for (const m of text.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)) {
    if (!fs.existsSync(path.join(previewDir, m[1]))) missingAssets.push(`${f} -> ${m[1]}`);
  }
}
check(missingAssets.length === 0, 'every ./assets/ reference in HTML exists', missingAssets.slice(0, 5).join(', '));

// fonts referenced by main.css exist in assets/fonts
const cssPath = path.join(previewDir, 'assets', 'css', 'main.css');
const cssText = fs.readFileSync(cssPath, 'utf8');
const cssFonts = [...cssText.matchAll(/url\(\.\.\/fonts\/([^)]+)\)/g)].map((m) => m[1]);
const missingFonts = cssFonts.filter((f) => !fs.existsSync(path.join(previewDir, 'assets', 'fonts', f)));
check(missingFonts.length === 0, `all ${cssFonts.length} fonts referenced by CSS exist in assets/fonts`, missingFonts.join(', '));

// no module / modulepreload / crossorigin leftovers, one css + one js per page
const moduleLeftovers = [];
for (const f of htmlFiles) {
  const text = fs.readFileSync(path.join(previewDir, f), 'utf8');
  if (/type="module"|modulepreload|crossorigin/i.test(text)) moduleLeftovers.push(f);
  const cssCount = (text.match(/<link rel="stylesheet"[^>]*>/g) || []).length;
  const jsCount = (text.match(/<script\s+defer\s+src="\.\/assets\/js\/[^"]+"[^>]*><\/script>/g) || []).length;
  if (cssCount !== 1 || jsCount !== 1) moduleLeftovers.push(`${f} (css=${cssCount} js=${jsCount})`);
}
check(moduleLeftovers.length === 0, 'no module/crossorigin leftovers; exactly 1 css + 1 js per page', moduleLeftovers.join(', '));

const jsFiles = fs.readdirSync(path.join(previewDir, 'assets', 'js'));
check(jsFiles.length === htmlFiles.length, `one JS bundle per page (${jsFiles.length})`);
const fontFiles = fs.readdirSync(path.join(previewDir, 'assets', 'fonts'));
check(fontFiles.length >= 20, `font assets present (${fontFiles.length} files)`);

// ------------------------------------------------------------------
// 3. Browser sweep — every page from file://
// ------------------------------------------------------------------
console.log('\n== 3. Browser sweep over file:// (CSS / JS / fonts / no CORS) ==');
browser = await chromium.launch(launchOptions);
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const pageRows = [];
let browserOk = true;

for (const f of htmlFiles) {
  const bag = [];
  pageErrors(page, bag);
  const url = 'file://' + path.join(previewDir, f);
  let cssRules = -1, cssSheets = -1, iconsReplaced = -1, svgLucide = -1, fontsLoaded = [], dirLang = '', maxCanvas = -1, bodyFont = '', bodyBg = '';
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 25000 });
    await page.waitForFunction(() => document.fonts && document.fonts.status !== 'loading', null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2200); // charts + entrance animations
    const state = await page.evaluate(() => {
      const sheets = [...document.styleSheets];
      let rules = 0;
      for (const s of sheets) {
        try { rules += (s.cssRules || []).length; } catch {}
      }
      const mainSheets = sheets.filter((s) => (s.href || '').includes('/assets/css/main.css')).length;
      const canvases = [...document.querySelectorAll('canvas')].map((c) => {
        try {
          const ctx = c.getContext('2d');
          const { width: w, height: h } = c;
          if (!ctx || !w || !h) return 0;
          const data = ctx.getImageData(0, 0, w, h).data;
          let painted = 0;
          for (let i = 3; i < data.length; i += 4) if (data[i] > 0) painted++;
          return painted;
        } catch { return 0; }
      });
      return {
        rules,
        mainSheets,
        remainingIconTags: document.querySelectorAll('i[data-lucide]').length,
        lucideSvg: document.querySelectorAll('svg.lucide').length,
        fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        maxCanvas: canvases.length ? Math.max(...canvases) : -1,
        bodyFont: getComputedStyle(document.body).fontFamily,
        bodyBg: getComputedStyle(document.body).backgroundColor,
      };
    });
    cssRules = state.rules;
    cssSheets = state.mainSheets;
    iconsReplaced = state.remainingIconTags;
    svgLucide = state.lucideSvg;
    fontsLoaded = state.fonts;
    dirLang = `${state.lang}/${state.dir}`;
    maxCanvas = state.maxCanvas;
    bodyFont = state.bodyFont;
    bodyBg = state.bodyBg;
  } catch (e) {
    bag.push('navigate-error: ' + e.message.split('\n')[0]);
  }
  const fatal = bag.filter((b) => FATAL_ERROR_RE.test(b));
  const htmlText = fs.readFileSync(path.join(previewDir, f), 'utf8');
  const hasIcons = htmlText.includes('data-lucide');
  const hasCanvas = htmlText.includes('<canvas');
  const dirState = dirLang.split('/');
  // CSS "loads" is proven by the stylesheet link being live and the computed
  // styles/fonts coming from it (cssRules is not readable cross-origin on
  // file://, so rule counts are informational only).
  const cssApplied = bodyBg !== 'rgba(0, 0, 0, 0)' && /vazirmatn|inter/i.test(bodyFont);
  const ok =
    fatal.length === 0 &&
    cssSheets === 1 &&
    cssApplied &&
    (!hasIcons || (iconsReplaced === 0 && svgLucide > 0)) &&
    (!hasCanvas || maxCanvas > 500) &&
    fontsLoaded.some((x) => /vazirmatn/i.test(x)) &&
    dirState.length === 2 && dirState[0] === 'fa' && dirState[1] === 'rtl';
  if (!ok) browserOk = false;
  pageRows.push({ f, ok, cssSheets, svgLucide, fonts: fontsLoaded.join('|'), dirLang, maxCanvas, errors: fatal });
  console.log(
    `${ok ? '  PASS' : '  FAIL'}  ${f.padEnd(26)} cssSheet=${String(cssSheets).padStart(3)} icons=${String(svgLucide).padStart(3)} fonts=${fontsLoaded.length} lang=${dirLang} canvasPx=${String(maxCanvas).padStart(6)}${fatal.length ? ' :: ' + fatal.join(' ;; ').slice(0, 140) : ''}`,
  );
}

// ------------------------------------------------------------------
// 4. Interactions on index.html
// ------------------------------------------------------------------
console.log('\n== 4. Interaction smoke on index.html (file://) ==');
{
  const bag = [];
  pageErrors(page, bag);
  await page.goto('file://' + path.join(previewDir, 'index.html'), { waitUntil: 'load' });
  await page.waitForTimeout(1800);

  // locale toggle: fa/rtl ⇄ en/ltr
  const before = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
  check(before.lang === 'fa' && before.dir === 'rtl', 'index opens Persian RTL by default', `${before.lang}/${before.dir}`);
  await page.click('[data-locale-toggle]');
  await page.waitForTimeout(700);
  const en = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
  check(en.lang === 'en' && en.dir === 'ltr', 'locale toggle flips to English LTR live', `${en.lang}/${en.dir}`);
  await page.click('[data-locale-toggle]');
  await page.waitForTimeout(700);
  const fa2 = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
  check(fa2.lang === 'fa' && fa2.dir === 'rtl', 'locale toggle returns to Persian RTL', `${fa2.lang}/${fa2.dir}`);

  // theme toggle: initial mode ⇄ other mode (2-state dark ⇄ light)
  const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark');
  await page.click('[data-theme-toggle]');
  await page.waitForTimeout(400);
  const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check(themeAfter !== themeBefore, 'theme toggle switches theme', `${themeBefore} → ${themeAfter}`);
  await page.click('[data-theme-toggle]');
  await page.waitForTimeout(400);
  const themeBack = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check(themeBack === themeBefore, 'theme toggle restores previous theme', themeBack);

  // navigation: follow the header CTA into the dashboard
  await page.click('.site-header a[href="./dashboard.html"]');
  await page.waitForURL(/dashboard\.html$/, { timeout: 15000 });
  await page.waitForLoadState('load');
  await page.waitForTimeout(1600);
  const dash = await page.evaluate(() => ({
    icons: document.querySelectorAll('svg.lucide').length,
    kpis: document.querySelectorAll('.kpi, [class*="kpi"]').length,
    title: document.title.slice(0, 60),
  }));
  check(dash.icons > 0 && dash.kpis > 0, 'in-page navigation to dashboard.html works from file://', dash.title);

  const fatal = bag.filter((b) => FATAL_ERROR_RE.test(b));
  check(fatal.length === 0, 'no console/CORS errors during interactions', fatal.join(' ;; ').slice(0, 200));
}

await browser.close();

// ------------------------------------------------------------------
// 5. (Optional) Developer package builds from a clean extraction
// ------------------------------------------------------------------
if (process.env.AFX_VERIFY_DEV === '1') {
  console.log('\n== 5. Developer package — clean install + build ==');
  const devDir = fs.mkdtempSync(path.join(os.tmpdir(), 'afx-dev-qa-'));
  execSync(`unzip -q -o "${devZip}" -d "${devDir}"`, { stdio: 'inherit' });
  const srcDir = path.join(devDir, 'APIForge-X-Developer');
  check(fs.existsSync(path.join(srcDir, 'package.json')) && fs.existsSync(path.join(srcDir, 'vite.config.js')), 'developer zip extracts with package.json + vite.config.js');
  check(fs.existsSync(path.join(srcDir, 'src')) && fs.existsSync(path.join(srcDir, 'index.html')), 'developer zip contains src/ + index.html');
  try {
    execSync('npm ci --no-audit --no-fund', { cwd: srcDir, stdio: 'pipe', timeout: 900000 });
    check(true, 'npm ci succeeds from clean extraction (lockfile reproducible)');
  } catch {
    check(false, 'npm ci succeeds from clean extraction');
  }
  try {
    execSync('npm run build', { cwd: srcDir, stdio: 'pipe', timeout: 900000 });
    const built = fs.readdirSync(path.join(srcDir, 'dist')).filter((n) => n.endsWith('.html'));
    check(built.length >= 30, `npm run build succeeds (${built.length} pages emitted)`);
  } catch (e) {
    check(false, 'npm run build succeeds — ' + String(e.message).split('\n')[0]);
  }
}

// ------------------------------------------------------------------
// 6. Report
// ------------------------------------------------------------------
const passCount = results.filter((r) => r.ok).length;
const now = new Date().toISOString();
const rows = pageRows
  .map(
    (r) =>
      `| ${r.f} | ${r.ok ? '✅' : '❌'} | ${r.cssSheets} | ${r.svgLucide} | ${r.fonts} | ${r.dirLang} | ${r.maxCanvas} | ${r.errors.length ? r.errors.join('<br>') : '—'} |`,
  )
  .join('\n');
const md = `# APIForge X v${version} — Release verification

- **Date (UTC):** ${now}
- **Method:** buyer simulation — clean extraction of \`APIForge-X-Preview.zip\`, every page opened over \`file://\` (no server, no npm), console/CORS audited, then interactions on \`index.html\`.
- **Result:** ${failures === 0 ? '✅ PASS' : `❌ FAIL (${failures} failing check${failures > 1 ? 's' : ''})`}

## Static checks
${results
  .filter((r) => !String(r.label).startsWith('page:'))
  .map((r) => `- ${r.ok ? '✅' : '❌'} ${r.label}${r.detail ? ` — \`${r.detail}\`` : ''}`)
  .join('\n')}

## Per-page browser sweep (file://)

| Page | OK | CSS sheets | lucide icons | loaded fonts | lang/dir | canvas painted px | console/CORS errors |
|---|---|---|---|---|---|---|---|
${rows}

> CSS sheets = live stylesheet link objects pointing at assets/css/main.css (1 = loaded; cssRules objects are not readable across file:// origins, so loading is also asserted via computed styles).
> canvas painted px = maximum count of painted (non-transparent) pixels across the page's canvases.
> icons = the number of lucide SVG icons present after the page script booted.

## Checks: ${passCount}/${results.length} passed
`;
fs.writeFileSync(reportPath, md);
console.log(`\n${failures === 0 ? 'VERIFY OK' : `VERIFY FAILED (${failures})`}`);
console.log(`report: ${reportPath}`);
process.exit(failures === 0 ? 0 : 1);
