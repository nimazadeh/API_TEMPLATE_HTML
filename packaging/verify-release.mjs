#!/usr/bin/env node
// =============================================================
// APIForge X — Release QA audit (v4 — final marketplace layout)
//
// Mimics a buyer's very first run:
//
//   1. Extract APIForge-X.zip into a CLEAN folder.
//   2. Verify the final marketplace structure and leak-guard it.
//   3. Open every page over file:// (no server, no npm): CSS loads,
//      JS boots, fonts load, icons render, charts paint, Persian
//      RTL default — no console errors, no CORS/module errors, no
//      remote requests.
//   4. Exercise theme + locale (RTL⇄LTR) + navigation on index.html,
//      and a Chart.js hover sweep on the chart pages.
//   5. (Optional, AFX_VERIFY_DEV=1) Extract APIForge-X-Developer.zip
//      and prove `npm install && npm run build` works from scratch.
//
// Browser resolution:
//   - env AFX_CHROMIUM_EXEC  path to a chromium binary, plus
//     optional AFX_CHROMIUM_LIBS dir prepended to LD_LIBRARY_PATH.
//   - otherwise the @sparticuz/chromium binary is used if present
//     (its bundled AL2023 compatibility libraries are extracted and
//     added to LD_LIBRARY_PATH automatically).
//   - otherwise the Playwright-registered Chromium.
//
// Run:   node packaging/verify-release.mjs
// =============================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const version = rootPkg.version;
const releaseRoot = path.join(repo, 'release');
const customerZip = path.join(releaseRoot, 'APIForge-X.zip');
const devZip = path.join(releaseRoot, 'APIForge-X-Developer.zip');

const results = []; // { ok, label, detail }
let failures = 0;
function check(ok, label, detail = '') {
  results.push({ ok: !!ok, label, detail });
  if (!ok) failures++;
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

// ------------------------------------------------------------------
// Leak guard — internal engineering must never reach a customer
// ------------------------------------------------------------------
const INTERNAL_PAGES = new Set(['rtl-persian-test.html']);
const INTERNAL_FILENAMES = new Set([
  'VERIFICATION.md', 'PACKAGE-MANIFEST.json', 'playwright.config.js',
  'package-lock.json', '.gitignore',
]);
const INTERNAL_DIRS = new Set(['tests', 'scripts', 'tools', 'docs', '.git']);
const INTERNAL_CONTENT_RE = /rtl-persian-test|playwright|PACKAGE-MANIFEST|VERIFICATION\.md|Rastchin|RTL-Theme/i;

function leakScan(rootDir, label) {
  const problems = [];
  const walk = (dir, rel) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const relPath = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        if (INTERNAL_DIRS.has(ent.name)) problems.push(`${relPath}/`);
        else walk(path.join(dir, ent.name), relPath);
      } else if (INTERNAL_FILENAMES.has(ent.name) || INTERNAL_PAGES.has(ent.name)) {
        problems.push(relPath);
      } else if (/\.(html|css|js|json|md|txt|xml|svg)$/.test(ent.name)) {
        if (INTERNAL_CONTENT_RE.test(fs.readFileSync(path.join(dir, ent.name), 'utf8'))) {
          problems.push(`${relPath} (content)`);
        }
      }
    }
  };
  walk(rootDir, '');
  check(problems.length === 0, `${label}: no internal files or references leaked`, problems.join(', ').slice(0, 160));
}

// ------------------------------------------------------------------
// Browser setup
// ------------------------------------------------------------------
let chromium, browser;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.error('playwright-core is not installed — run `npm install` first.');
  process.exit(2);
}

const execPath = process.env.AFX_CHROMIUM_EXEC;
const libDir = process.env.AFX_CHROMIUM_LIBS;
if (!execPath && !libDir) {
  // Fall back to the self-contained @sparticuz/chromium binary (npm).
  try {
    const sparticuz = (await import('@sparticuz/chromium')).default;
    const libsDir = path.join(os.tmpdir(), 'afx-verify-nss-libs');
    if (!fs.existsSync(path.join(libsDir, 'lib', 'libnss3.so'))) {
      const zlib = await import('node:zlib');
      const tarBr = fs.readFileSync(
        path.join(repo, 'node_modules', '@sparticuz', 'chromium', 'bin', 'al2023.tar.br'),
      );
      const tar = zlib.brotliDecompressSync(tarBr);
      const tarPath = path.join(os.tmpdir(), 'afx-verify-nss.tar');
      fs.writeFileSync(tarPath, tar);
      fs.mkdirSync(libsDir, { recursive: true });
      execSync(`tar -xf "${tarPath}" -C "${libsDir}"`);
      fs.rmSync(tarPath, { force: true });
    }
    process.env.LD_LIBRARY_PATH = [path.join(libsDir, 'lib'), process.env.LD_LIBRARY_PATH]
      .filter(Boolean)
      .join(':');
    process.env.AFX_CHROMIUM_EXEC = await sparticuz.executablePath();
  } catch {
    // neither env vars nor @sparticuz present — rely on Playwright's own Chromium
  }
}
const launchOptions = {
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
};
if (process.env.AFX_CHROMIUM_EXEC) launchOptions.executablePath = process.env.AFX_CHROMIUM_EXEC;

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
// 1. Extract APIForge-X.zip into a clean folder
// ------------------------------------------------------------------
console.log('\n== 1. Extract APIForge-X.zip into a clean folder ==');
if (!fs.existsSync(customerZip)) {
  console.error(`Missing ${customerZip} — run ` + '`node packaging/build-release.mjs` first.');
  process.exit(2);
}
const cleanDir = fs.mkdtempSync(path.join(os.tmpdir(), 'afx-preview-qa-'));
execSync(`unzip -q -o "${customerZip}" -d "${cleanDir}"`, { stdio: 'inherit' });
const previewDir = path.join(cleanDir, `APIForge-X-v${version}`);
check(fs.existsSync(path.join(previewDir, 'index.html')), `APIForge-X-v${version}/ extracted with index.html`, previewDir);

// ------------------------------------------------------------------
// 2. Static integrity (no browser)
// ------------------------------------------------------------------
console.log('\n== 2. Static integrity ==');
const htmlFiles = fs.readdirSync(previewDir).filter((n) => n.endsWith('.html')).sort();
check(fs.existsSync(path.join(previewDir, 'index.html')) && htmlFiles.length === 30,
  `30 pages present in package root (found ${htmlFiles.length})`);

const internalLinks = new Set();
for (const f of htmlFiles) {
  const text = fs.readFileSync(path.join(previewDir, f), 'utf8');
  for (const m of text.matchAll(/href="([^"#?]+\.html)"/g)) internalLinks.add(m[1]);
}
const missingLinks = [...internalLinks].filter((l) => !fs.existsSync(path.join(previewDir, l)));
check(missingLinks.length === 0, `every internal page link resolves (${internalLinks.size} unique checked)`, missingLinks.join(', '));

const missingAssets = [];
for (const f of htmlFiles) {
  const text = fs.readFileSync(path.join(previewDir, f), 'utf8');
  for (const m of text.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)) {
    if (!fs.existsSync(path.join(previewDir, m[1]))) missingAssets.push(`${f} -> ${m[1]}`);
  }
}
check(missingAssets.length === 0, 'every ./assets/ reference in HTML exists', missingAssets.slice(0, 5).join(', '));

const cssPath = path.join(previewDir, 'assets', 'css', 'main.css');
const cssText = fs.readFileSync(cssPath, 'utf8');
const cssFonts = [...cssText.matchAll(/url\(\.\.\/fonts\/([^)]+)\)/g)].map((m) => m[1]);
const missingFonts = cssFonts.filter((f) => !fs.existsSync(path.join(previewDir, 'assets', 'fonts', f)));
check(missingFonts.length === 0, `all ${cssFonts.length} fonts referenced by CSS exist in assets/fonts`, missingFonts.join(', '));

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

for (const required of ['README.md', 'LICENSE.md', 'documentation/getting-started.md',
  'documentation/installation.md', 'documentation/customization.md', 'documentation/design-system.md',
  'documentation/file-structure.md', 'documentation/theme-system.md', 'documentation/rtl-guide.md',
  'documentation/localization.md']) {
  check(fs.existsSync(path.join(previewDir, required)), `${required} present`);
}

leakScan(previewDir, 'customer package');

// ------------------------------------------------------------------
// 3. Browser sweep — every page from file://
// ------------------------------------------------------------------
console.log('\n== 3. Browser sweep over file:// (CSS / JS / fonts / charts / no CORS) ==');
browser = await chromium.launch(launchOptions);
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const CHART_PAGES = new Set(['dashboard.html', 'metrics.html', 'usage.html', 'rate-limits.html']);
const pageRows = [];
let browserOk = true;

for (const f of htmlFiles) {
  const bag = [];
  pageErrors(page, bag);
  const url = 'file://' + path.join(previewDir, f);
  let cssSheets = -1, iconsReplaced = -1, svgLucide = -1, fontsLoaded = [], dirLang = '', maxCanvas = -1, bodyFont = '', bodyBg = '';
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 25000 });
    await page.waitForFunction(() => document.fonts && document.fonts.status !== 'loading', null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2200); // charts + entrance animations

    // Chart.js hover sweep — in, across, out (the reported crash pattern)
    if (CHART_PAGES.has(f)) {
      const before = bag.length;
      for (const c of await page.$$('canvas')) {
        const box = await c.boundingBox();
        if (!box) continue;
        for (let i = 0; i <= 10; i++) {
          await page.mouse.move(box.x + (box.width * i) / 10, box.y + box.height / 2, { steps: 2 });
        }
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 3);
        await page.mouse.move(box.x - 50, box.y - 50);
      }
      await page.waitForTimeout(500);
      const hoverErrs = bag.length - before;
      if (hoverErrs > 0) bag.push(`hover-errors: ${hoverErrs}`);
    }

    const state = await page.evaluate(() => {
      const sheets = [...document.styleSheets];
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
        mainSheets,
        remainingIconTags: document.querySelectorAll('i[data-lucide]').length,
        lucideSvg: document.querySelectorAll('svg.lucide').length,
        fonts: [...document.fonts].filter((x) => x.status === 'loaded').map((x) => x.family),
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        maxCanvas: canvases.length ? Math.max(...canvases) : -1,
        bodyFont: getComputedStyle(document.body).fontFamily,
        bodyBg: getComputedStyle(document.body).backgroundColor,
      };
    });
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
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.removeAllListeners('requestfailed');
  page.removeAllListeners('request');
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

  const before = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
  check(before.lang === 'fa' && before.dir === 'rtl', 'index opens Persian RTL by default', `${before.lang}/${before.dir}`);
  await page.click('[data-locale-toggle]');
  await page.waitForTimeout(700);
  const en = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
  check(en.lang === 'en' && en.dir === 'ltr', 'language switch flips to English LTR live', `${en.lang}/${en.dir}`);
  await page.click('[data-locale-toggle]');
  await page.waitForTimeout(700);
  const fa2 = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
  check(fa2.lang === 'fa' && fa2.dir === 'rtl', 'language switch returns to Persian RTL', `${fa2.lang}/${fa2.dir}`);

  const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark');
  await page.click('[data-theme-toggle]');
  await page.waitForTimeout(400);
  const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check(themeAfter !== themeBefore, 'theme toggle switches theme', `${themeBefore} → ${themeAfter}`);
  await page.click('[data-theme-toggle]');
  await page.waitForTimeout(400);
  const themeBack = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check(themeBack === themeBefore, 'theme toggle restores previous theme', themeBack);

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
check(browserOk, 'all pages pass the file:// browser sweep');

// ------------------------------------------------------------------
// 5. (Optional) Developer package builds from a clean extraction
// ------------------------------------------------------------------
if (process.env.AFX_VERIFY_DEV === '1') {
  console.log('\n== 5. Developer package — clean install + build ==');
  if (!fs.existsSync(devZip)) {
    check(false, 'developer zip exists', devZip);
  } else {
    const devDir = fs.mkdtempSync(path.join(os.tmpdir(), 'afx-dev-qa-'));
    execSync(`unzip -q -o "${devZip}" -d "${devDir}"`, { stdio: 'inherit' });
    const srcDir = path.join(devDir, 'APIForge-X-Developer');
    check(fs.existsSync(path.join(srcDir, 'package.json')) && fs.existsSync(path.join(srcDir, 'vite.config.js')), 'developer zip extracts with package.json + vite.config.js');
    check(fs.existsSync(path.join(srcDir, 'src')) && fs.existsSync(path.join(srcDir, 'index.html')), 'developer zip contains src/ + index.html');
    leakScan(srcDir, 'developer package');
    try {
      execSync('npm install --no-audit --no-fund --ignore-scripts', { cwd: srcDir, stdio: 'pipe', timeout: 900000 });
      check(true, 'npm install succeeds from clean extraction');
    } catch (e) {
      check(false, 'npm install succeeds from clean extraction', String(e.message).split('\n')[0]);
    }
    try {
      execSync('npm run build', { cwd: srcDir, stdio: 'pipe', timeout: 900000 });
      const built = fs.readdirSync(path.join(srcDir, 'dist')).filter((n) => n.endsWith('.html'));
      check(built.length === 30, `npm run build succeeds (30 pages emitted, got ${built.length})`);
    } catch (e) {
      check(false, 'npm run build succeeds', String(e.message).split('\n')[0]);
    }
  }
}

// ------------------------------------------------------------------
// 6. Summary (console only — no verification reports ship to buyers)
// ------------------------------------------------------------------
const passCount = results.filter((r) => r.ok).length;
console.log(`\n${failures === 0 ? 'VERIFY OK' : `VERIFY FAILED (${failures})`}`);
console.log(`checks: ${passCount}/${results.length} passed`);
process.exit(failures === 0 ? 0 : 1);
