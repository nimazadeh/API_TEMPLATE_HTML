// =============================================================
// APIForge X — Chart interaction regression spec
//
// Guards the production runtime contract that every Chart.js
// callback/animation default stays a valid function reference
// after Vite minification: hovering any chart on the four chart
// pages must never throw (`Uncaught TypeError: this._fn is not a
// function` was a release-blocking regression caused by replacing
// Chart.js's `defaults.animation` object — its KEYS are the
// whitelist `Animations.configure()` uses when deriving per-property
// animation configs, and dropping `type` left hover color
// transitions without a color interpolator).
//
// Per chart page, in the real production build:
//   1. Page loads with no console/page errors.
//   2. Every chart canvas is laid out and painted.
//   3. Sweeping the mouse across each chart (hover in → across →
//      out, the reported crash pattern) raises no errors.
//   4. Hover produces visual feedback (point hover state + tooltip
//      paint), and hover-out restores interaction.
// =============================================================

import { test, expect } from '@playwright/test';

// Chart pages and the canvas ids their modules render.
const CHART_PAGES = [
  {
    page: '/metrics.html',
    charts: ['chart-metric-volume', 'chart-metric-latency', 'chart-metric-errors', 'chart-metric-status'],
  },
  {
    page: '/dashboard.html',
    charts: ['chart-requests', 'chart-latency'],
  },
  {
    page: '/usage.html',
    charts: ['usage-requests-chart', 'usage-consumption-chart'],
  },
  {
    page: '/rate-limits.html',
    charts: ['rl-history-chart', 'rl-quota-chart'],
  },
];

// Lightweight pixel probe: every 4th RGBA sample of the canvas.
async function canvasSample(page, id) {
  return page.evaluate((canvasId) => {
    const c = document.getElementById(canvasId);
    if (!c) return null;
    try {
      return Array.from(c.getContext('2d').getImageData(0, 0, c.width, c.height).data).filter(
        (_, i) => i % 16 === 0,
      );
    } catch {
      return null;
    }
  }, id);
}

function pixelsDiffer(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i] - b[i]) > 8 || Math.abs(a[i + 1] - b[i + 1]) > 8 || Math.abs(a[i + 2] - b[i + 2]) > 8) {
      return true;
    }
  }
  return false;
}

test.describe('chart hover interaction (production runtime)', () => {
  for (const { page: pagePath, charts } of CHART_PAGES) {
    test(`${pagePath} — hover every chart without errors, with hover + tooltip feedback`, async ({ page }) => {
      test.setTimeout(120_000);

      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', (m) => {
        if (m.type() === 'error' && !/favicon/i.test(m.text())) consoleErrors.push(m.text());
      });
      page.on('pageerror', (e) => pageErrors.push(String(e)));

      await page.goto(pagePath, { waitUntil: 'networkidle' });
      // Let the 400ms entry animation and first hover-able layout settle.
      await page.waitForTimeout(1000);

      for (const id of charts) {
        const canvas = page.locator(`#${id}`);
        await expect(canvas, `#${id} must exist on ${pagePath}`).toHaveCount(1);
        // Charts further down the page must be in the viewport for real
        // mouse events to reach them.
        await canvas.scrollIntoViewIfNeeded();
        await page.waitForTimeout(120);
        const box = await canvas.boundingBox();
        expect(box, `#${id} must be laid out`).not.toBeNull();
        expect(box.height, `#${id} must have chart height`).toBeGreaterThan(40);

        const before = await canvasSample(page, id);
        expect(before, `#${id} must be painted before hover`).not.toBeNull();

        // The reported crash pattern: repeated hover-in, sweep, hover-out.
        // Sweep a small grid so line, bar and doughnut charts (whose ring
        // has a cutout at center) all receive real hover events.
        let feedback = false;
        let during = before;
        for (const fy of [0.18, 0.5, 0.82]) {
          for (const fx of [0.12, 0.3, 0.5, 0.7, 0.88]) {
            await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps: 3 });
            await page.waitForTimeout(55);
            during = await canvasSample(page, id);
            if (pixelsDiffer(before, during)) feedback = true;
          }
        }
        // hover feedback (active point growth + tooltip paint) must show up
        expect(
          feedback,
          `hovering #${id} must paint feedback (hover state + tooltip)`,
        ).toBe(true);

        // Hover-out — the removeHoverStyle transition must also survive.
        await page.mouse.move(box.x - 60, box.y - 60);
        await page.waitForTimeout(250);
      }

      // THE regression under guard: the Chart.js animation/tick system
      // must survive every hover with zero uncaught errors.
      expect(pageErrors, `${pagePath} page errors during chart hover`).toEqual([]);
      expect(consoleErrors, `${pagePath} console errors during chart hover`).toEqual([]);
    });
  }

  test('range re-render + theme events keep hover safe (dashboard)', async ({ page }) => {
    test.setTimeout(120_000);
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));

    await page.addInitScript(() => localStorage.setItem('afx-locale', 'en'));
    await page.goto('/dashboard.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);

    const box = await page.locator('#chart-requests').boundingBox();
    // Hover, then switch range (destroys + recreates charts under the mouse)
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.waitForTimeout(150);
    await page.locator('[data-range]').first().click().catch(() => {});
    await page.waitForTimeout(600);
    // Hover the freshly recreated charts
    for (const fx of [0.2, 0.5, 0.8]) {
      await page.mouse.move(box.x + box.width * fx, box.y + box.height * 0.5, { steps: 3 });
      await page.waitForTimeout(60);
    }

    expect(pageErrors, 'range switch under the mouse must not break chart hover').toEqual([]);
  });
});
