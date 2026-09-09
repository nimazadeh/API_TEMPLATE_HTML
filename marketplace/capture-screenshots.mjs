#!/usr/bin/env node
// =============================================================
// APIForge X — Marketplace screenshot capture (Playwright)
//
// Captures the 10 listing screenshots required by the marketplace
// manifest (see SCREENSHOTS_MANIFEST.md) against the production
// build served by `npm run preview`.
//
// Requirements:
//   1. npm install
//   2. npm run build
//   3. A Chromium the script can drive:
//      - default: the browser registered with Playwright
//        (`npx playwright install chromium`), or
//      - env AFX_CHROMIUM_EXEC=/path/to/chromium
//        (+ optional AFX_CHROMIUM_LIBS=/path/to/libs for LD_LIBRARY_PATH)
//   4. node marketplace/capture-screenshots.mjs
//
// The script reuses a preview server already listening on :4173 and
// otherwise starts `npm run preview` itself. Shots are 1440×900
// viewport captures in the dark theme, Persian (fa/RTL) default state.
//
// If no browser is available the script DOES NOT fail the packaging
// process — it prints the manual capture instructions and exits 0.
// =============================================================

import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'marketplace', 'screenshots');
const BASE = 'http://127.0.0.1:4173';
const PORT = 4173;

const shots = [
  { name: '01-home', page: 'index.html' },
  { name: '02-dashboard', page: 'dashboard.html' },
  { name: '03-api-keys', page: 'api-keys.html' },
  { name: '04-webhooks', page: 'webhooks.html', click: '#delivery-list tr[data-id]', wait: 900 },
  { name: '05-metrics', page: 'metrics.html' },
  { name: '06-docs', page: 'docs.html' },
  { name: '07-pricing', page: 'pricing.html' },
  { name: '08-settings', page: 'settings.html' },
  { name: '09-auth', page: 'login.html' },
  { name: '10-rtl-demo', page: 'rtl.html' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function portOpen(port) {
  return new Promise((resolve) => {
    const s = net.connect(port, '127.0.0.1');
    s.on('connect', () => { s.destroy(); resolve(true); });
    s.on('error', () => resolve(false));
  });
}

async function startPreview() {
  const child = spawn('npm', ['run', 'preview'], { cwd: ROOT, stdio: 'ignore' });
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (await portOpen(PORT)) return child;
    await sleep(500);
  }
  child.kill('SIGTERM');
  throw new Error('vite preview did not start in time');
}

async function launchBrowser() {
  const { chromium } = await import('playwright-core');
  const execPath = process.env.AFX_CHROMIUM_EXEC;
  const libDir = process.env.AFX_CHROMIUM_LIBS;
  const launchOptions = { headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] };
  if (execPath) {
    launchOptions.executablePath = execPath;
    if (libDir) launchOptions.env = { ...process.env, LD_LIBRARY_PATH: libDir };
  }
  return chromium.launch(launchOptions);
}

async function main() {
  if (!existsSync(path.join(ROOT, 'dist', 'index.html'))) {
    console.error('No dist/ found. Run `npm run build` first.');
    process.exit(1);
  }

  let browser;
  try {
    browser = await launchBrowser();
  } catch (e) {
    console.error('Could not launch a browser — screenshots were NOT generated.');
    console.error(`  (${String(e && e.message ? e.message : e).split('\n')[0]})`);
    console.error('\nGenerate them manually (does not block the release):');
    console.error('  1. npm install && npm run build && npm run preview');
    console.error('  2. Open each page below at 1440x900, dark theme, Persian default state');
    console.error('  3. Screenshot the viewport and save as marketplace/screenshots/<name>.png:');
    for (const s of shots) console.error(`     ${s.name}.png  <-  ${s.page}`);
    process.exit(0); // browser unavailability must not fail packaging
  }

  mkdirSync(OUT, { recursive: true });
  const spawned = (await portOpen(PORT)) ? null : await startPreview();

  try {
    for (const shot of shots) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
      const page = await context.newPage();
      await page.goto(`${BASE}/${shot.page}`, { waitUntil: 'load', timeout: 30000 });
      await page
        .waitForFunction(() => document.fonts && document.fonts.status !== 'loading', null, { timeout: 15000 })
        .catch(() => {});
      await sleep(2200); // skeletons → content, charts paint, entrance motion settles

      if (shot.click) {
        await page.locator(shot.click).first().click({ timeout: 5000 }).catch(() => {});
        await sleep(shot.wait || 500);
      }

      await page.screenshot({ path: path.join(OUT, `${shot.name}.png`), fullPage: false });
      console.log(`captured ${shot.name}.png`);
      await context.close();
    }
  } finally {
    await browser.close();
    if (spawned) spawned.kill('SIGTERM');
  }
  console.log(`\nDone. ${shots.length} screenshots written to ${OUT}`);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
