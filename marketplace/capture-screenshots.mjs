#!/usr/bin/env node
// =============================================================
// APIForge X — Marketplace screenshot capture
//
// Captures the full set of listing screenshots required by the
// marketplace manifest (see SCREENSHOTS_MANIFEST.md) against the
// production build.
//
// Requirements (local machine only — not the sandbox):
//   1. npm install
//   2. npm run build
//   3. npm install --no-save puppeteer   (downloads a local Chromium)
//   4. node marketplace/capture-screenshots.mjs
//
// The script starts `vite preview` on :4173, drives a real Chromium
// through each page (opening drawers, the command palette, switching
// themes), and writes PNGs to marketplace/screenshots/.
// =============================================================

import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'marketplace', 'screenshots');
const BASE = 'http://localhost:4173';

let puppeteer;
try {
  puppeteer = await import('puppeteer');
} catch {
  console.error('puppeteer is not installed. Run: npm install --no-save puppeteer');
  process.exit(2);
}

const shots = [
  { name: '01-overview-dark', page: 'dashboard.html' },
  { name: '02-overview-light', page: 'dashboard.html', theme: 'light' },
  { name: '03-logs', page: 'logs.html' },
  { name: '04-api-keys', page: 'api-keys.html' },
  { name: '05-webhooks', page: 'webhooks.html', click: '#delivery-list tr[data-id]', wait: 600 },
  { name: '06-usage', page: 'usage.html' },
  { name: '07-rtl-persian', page: 'rtl.html', viewport: { width: 1440, height: 900 } },
  { name: '08-command-palette', page: 'dashboard.html', palette: true },
  { name: '09-code-blocks', page: 'docs.html' },
  { name: '10-landing', page: 'index.html' },
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function startPreview() {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('vite preview did not start in time'));
      }
    }, 15000);
    child.stdout.on('data', (d) => {
      const s = String(d);
      if (/4173/.test(s) && !settled) {
        settled = true;
        clearTimeout(timer);
        resolve(child);
      }
    });
    child.stderr.on('data', (d) => {
      const s = String(d);
      if (/4173/.test(s) && !settled) {
        settled = true;
        clearTimeout(timer);
        resolve(child);
      }
    });
    child.on('exit', (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`vite preview exited early (${code})`));
      }
    });
  });
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem('afx-theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
}

async function main() {
  if (!existsSync(path.join(ROOT, 'dist', 'index.html'))) {
    console.error('No dist/ found. Run `npm run build` first.');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  const preview = await startPreview();
  const browser = await puppeteer.default.launch({ headless: 'new' });

  try {
    for (const shot of shots) {
      const page = await browser.newPage();
      const viewport = shot.viewport || { width: 1440, height: 900 };
      await page.setViewport(viewport);
      await page.goto(`${BASE}/${shot.page}`, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(600); // let skeletons resolve and charts paint

      if (shot.theme) await setTheme(page, shot.theme);
      if (shot.palette) {
        await page.keyboard.down('Meta');
        await page.keyboard.press('KeyK');
        await page.keyboard.up('Meta');
        await sleep(300);
      }
      if (shot.click) {
        await page.click(shot.click);
        await sleep(shot.wait || 500);
      }

      await page.screenshot({ path: path.join(OUT, `${shot.name}.png`), fullPage: false });
      console.log(`captured ${shot.name}.png`);
      await page.close();
    }
  } finally {
    await browser.close();
    preview.kill('SIGTERM');
  }
  console.log(`\nDone. Screenshots written to ${OUT}`);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
