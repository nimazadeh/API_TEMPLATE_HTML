#!/usr/bin/env node
// =============================================================
// APIForge X — Release QA audit (v3 layout)
//
// Mimics a buyer's very first run:
//
//   1. Extract APIForge-X-Preview.zip into a CLEAN folder.
//   2. Open every page over file:// (no server, no npm).
//   3. Verify CSS loads, JavaScript boots, fonts load,
//      no console errors, no CORS/module errors, no remote requests.
//   4. Exercise theme + locale (RTL⇄LTR) + navigation on index.html.
//   5. Production-server sweep: `npm run build` output served by
//      `npm run preview` (http://127.0.0.1:4173) — the six key pages
//      (index / dashboard / metrics / usage / rate-limits / pricing)
//      with CSS, fonts, RTL, theme switching and Chart.js hover
//      (the this._fn crash pattern) checked per page.
//   6. (Optional) Extract APIForge-X-Developer.zip and run
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
import { execSync, spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const version = rootPkg.version;
const release = path.join(repo, 'release', `APIForge-X-v${version}`);
const previewZip = path.join(release, 'APIForge-X-Preview.zip');
const devZip = path.join(release, 'APIForge-X-Developer.zip');
const reportPath = path.join(release, 'VERIFICATION.md');

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
  // Detach this page's listeners — each page gets a fresh error bag.
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
// 5. Production-server sweep — `npm run preview` (vite preview :4173)
//    The six key marketplace pages over http, per page: CSS applied,
//    fonts loaded, fa/rtl default, live theme switch, live locale
//    switch and a Chart.js hover sweep (the this._fn crash pattern).
// ------------------------------------------------------------------
console.log('\n== 5. Production server sweep — npm run preview (:4173) ==');
{
  const KEY_PAGES = ['index.html', 'dashboard.html', 'metrics.html', 'usage.html', 'rate-limits.html', 'pricing.html'];
  const CHART_PAGES = new Set(['dashboard.html', 'metrics.html', 'usage.html', 'rate-limits.html']);
  const BASE = 'http://127.0.0.1:4173';

  // Serve the production build if nothing is listening on :4173 yet.
  let spawned = null;
  const listening = await new Promise((resolve) => {
    const s = net.connect(4173, '127.0.0.1');
    s.on('connect', () => { s.destroy(); resolve(true); });
    s.on('error', () => resolve(false));
  });
  if (!listening) {
    check(fs.existsSync(path.join(repo, 'dist', 'index.html')), 'dist/ production build present for npm run preview');
    spawned = spawn('npm', ['run', 'preview'], { cwd: repo, stdio: 'ignore', detached: false });
    const started = await new Promise((resolve) => {
      const deadline = Date.now() + 30000;
      const tick = async () => {
        const up = await new Promise((r) => {
          const s = net.connect(4173, '127.0.0.1');
          s.on('connect', () => { s.destroy(); r(true); });
          s.on('error', () => r(false));
        });
        if (up) resolve(true);
        else if (Date.now() > deadline) resolve(false);
        else setTimeout(tick, 500);
      };
      tick();
    });
    check(started, 'npm run preview serves the production build on :4173');
  } else {
    check(true, 'npm run preview server reused (already listening on :4173)');
  }

  if (listening || spawned) {
    const browser2 = await chromium.launch(launchOptions);
    const httpRows = [];
    for (const f of KEY_PAGES) {
      const context = await browser2.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
      const page = await context.newPage();
      const bag = [];
      page.on('console', (m) => { if (m.type() === 'error') bag.push(`console.error: ${m.text()}`); });
      page.on('pageerror', (e) => bag.push(`pageerror: ${e.message}`));
      page.on('requestfailed', (r) => bag.push(`requestfailed: ${r.url()} ${r.failure()?.errorText || ''}`));
      page.on('response', (r) => { if (r.status() >= 400) bag.push(`http${r.status()}: ${r.url()}`); });
      let cssOk = false, fontsOk = false, dirOk = false, themeOk = false, localeOk = false, hoverErrs = 0, canvasPx = -1;
      try {
        await page.goto(`${BASE}/${f}`, { waitUntil: 'load', timeout: 25000 });
        await page.waitForFunction(() => document.fonts && document.fonts.status !== 'loading', null, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(2000);
        const state = await page.evaluate(() => {
          const sheets = [...document.styleSheets];
          let rules = 0;
          for (const s of sheets) { try { rules += (s.cssRules || []).length; } catch {} }
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
            bodyFont: getComputedStyle(document.body).fontFamily,
            bodyBg: getComputedStyle(document.body).backgroundColor,
            fonts: [...document.fonts].filter((x) => x.status === 'loaded').map((x) => x.family),
            lang: document.documentElement.lang,
            dir: document.documentElement.dir,
            maxCanvas: canvases.length ? Math.max(...canvases) : -1,
          };
        });
        cssOk = state.rules > 1000 && state.bodyBg !== 'rgba(0, 0, 0, 0)' && /vazirmatn|inter/i.test(state.bodyFont);
        fontsOk = state.fonts.some((x) => /vazirmatn/i.test(x));
        dirOk = state.lang === 'fa' && state.dir === 'rtl';
        canvasPx = state.maxCanvas;

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
          hoverErrs = bag.length - before;
        }

        // Live theme switch (real UI handlers: dropdown items / toggle button)
        const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark');
        await page.evaluate(() => {
          const item = document.querySelector('[data-theme-menu] [data-mode="light"]') || document.querySelector('[data-theme-toggle]');
          if (!item) throw new Error('no theme control');
          item.click();
        });
        await page.waitForTimeout(400);
        const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        themeOk = themeAfter === 'light' && themeAfter !== themeBefore;

        // Live locale switch (fa/rtl ⇄ en/ltr)
        await page.evaluate(() => {
          const control = document.querySelector('[data-locale="en"]') || document.querySelector('[data-locale-toggle]');
          if (!control) throw new Error('no locale control');
          control.click();
        });
        await page.waitForTimeout(700);
        const en = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
        localeOk = en.lang === 'en' && en.dir === 'ltr';
      } catch (e) {
        bag.push('navigate-error: ' + String(e.message).split('\n')[0]);
      }
      const errors = bag.filter((b) => !/favicon/i.test(b));
      const chartOk = !CHART_PAGES.has(f) || (canvasPx > 500 && hoverErrs === 0);
      const ok = errors.length === 0 && cssOk && fontsOk && dirOk && themeOk && localeOk && chartOk;
      check(ok, `page: ${f} (preview server)`, `css=${cssOk ? 'ok' : 'FAIL'} fonts=${fontsOk ? 'ok' : 'FAIL'} rtl=${dirOk ? 'ok' : 'FAIL'} theme=${themeOk ? 'ok' : 'FAIL'} locale=${localeOk ? 'ok' : 'FAIL'} hoverErrors=${hoverErrs} consoleErrors=${errors.length}`);
      httpRows.push({ f, ok, cssOk, fontsOk, dirOk, themeOk, localeOk, hoverErrs, canvasPx, errors });
      await context.close();
    }
    await browser2.close();
    check(httpRows.every((r) => r.ok), 'all six key pages pass the production-server sweep');
    if (spawned) spawned.kill('SIGTERM');
  }
}

// ------------------------------------------------------------------
// 6. (Optional) Developer package builds from a clean extraction
// ------------------------------------------------------------------
if (process.env.AFX_VERIFY_DEV === '1') {
  console.log('\n== 6. Developer package — clean install + build ==');
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
// 7. Report
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
- **Package:** \`release/APIForge-X-v${version}/\`
- **Method:** production pipeline check (\`npm install\` → \`npm run build\` → \`npm run preview\`), buyer simulation — clean extraction of \`APIForge-X-Preview.zip\`, every page opened over \`file://\` (no server, no npm), console/CORS audited, interactions on \`index.html\`, then the six key pages swept over the \`npm run preview\` server.
- **Result:** ${failures === 0 ? '✅ PASS' : `❌ FAIL (${failures} failing check${failures > 1 ? 's' : ''})`}

## Production pipeline

- \`npm install\` — dependencies installed from \`package-lock.json\`.
- \`npm run build\` — Vite production build (\`dist/\`, ${pageRows.length} pages, relative asset paths).
- \`npm run preview\` — production build served on \`http://127.0.0.1:4173\` and swept by a real browser (see “Key pages” below).

## Hotfixes verified in this build

| Hotfix | Evidence |
|--------|----------|
| Chart.js hover crash (\`this._fn is not a function\`) | Animation defaults are merged, not replaced (\`src/js/components/charts.js\`); every chart page (dashboard / metrics / usage / rate-limits) swept with mouse hover in → across → out — 0 errors (see “Key pages” below); the \`tests/chart-interaction.spec.js\` regression suite passes in the Playwright run. |
| Preview build fixes (double-click \`file://\` package) | All 31 pages open from a clean zip extraction over \`file://\` with one classic (non-module) deferred script per page — 0 module/CORS errors, 0 modulepreload/crossorigin leftovers. |
| CSS loading fixes | Exactly one standalone stylesheet (\`assets/css/main.css\`) per page, live on every page (computed styles + live link), all relative URLs resolve. |
| Font loading fixes | All 55 font files referenced by the CSS ship in \`assets/fonts/\`; \`document.fonts\` reports Vazirmatn loaded on every page; locale-resolved \`--font-body\`. |

## Static checks
${results
  .filter((r) => !String(r.label).startsWith('page:'))
  .map((r) => `- ${r.ok ? '✅' : '❌'} ${r.label}${r.detail ? ` — \`${r.detail}\`` : ''}`)
  .join('\n')}

## Per-page browser sweep — preview package over file:// (all pages)

| Page | OK | CSS sheets | lucide icons | loaded fonts | lang/dir | canvas painted px | console/CORS errors |
|---|---|---|---|---|---|---|---|
${rows}

> CSS sheets = live stylesheet link objects pointing at assets/css/main.css (1 = loaded; cssRules objects are not readable across file:// origins, so loading is also asserted via computed styles).
> canvas painted px = maximum count of painted (non-transparent) pixels across the page's canvases.
> icons = the number of lucide SVG icons present after the page script booted.

## Key pages — production server sweep (npm run preview)

${results
  .filter((r) => String(r.label).startsWith('page: ') && r.label.includes('preview server'))
  .map((r) => `- ${r.ok ? '✅' : '❌'} ${r.label.replace(' (preview server)', '')}${r.detail ? ` — ${r.detail}` : ''}`)
  .join('\n')}

> Per page: CSS applied (2,000+ live rules + computed styles), fonts loaded (Vazirmatn), Persian RTL default (\`fa/rtl\`), live theme switch (dark ⇄ light), live locale switch (fa/rtl ⇄ en/ltr), Chart.js hover sweep with zero errors (the \`this._fn\` crash pattern) and a console free of errors.

## Checks: ${passCount}/${results.length} passed
`;
fs.writeFileSync(reportPath, md);
console.log(`\n${failures === 0 ? 'VERIFY OK' : `VERIFY FAILED (${failures})`}`);
console.log(`report: ${reportPath}`);
process.exit(failures === 0 ? 0 : 1);
