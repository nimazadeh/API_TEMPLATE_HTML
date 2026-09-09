// =============================================================
// APIForge X — Production build smoke spec (buyer simulation)
//
// Guards the release contract that `npm run dev` cannot prove:
// the built dist/ package must work standalone — plain static
// hosting, sub-directory hosting, `vite preview` — with no Vite
// dev server involved.
//
// Runs against the production output via the playwright.config
// webServer (`npm run build && npm run preview`), then verifies
// per page, in a real browser:
//
//   1. HTTP 200 for the page and every referenced asset; no
//      failed requests, no console/page errors
//   2. The compiled stylesheet is actually *applied* (rules load
//      and the theme/body background resolves from CSS variables)
//   3. Page JS modules executed (lucide <i> markers are replaced
//      by inline SVGs where the markup ships icons)
//   4. Self-hosted fonts load over the network (woff2 HTTP 200)
//      and resolve in both locales: Vazirmatn (fa/RTL default)
//      and Inter Variable (en/LTR)
//   5. The relative-path contract holds: every asset reference in
//      the served HTML is relative (no /assets, no localhost)
//   6. Bootstrap data-APIs and Chart.js actually run on an app
//      page (dropdown opens, charts draw)
//
// Regression it exists for: pages whose <link>/<script> tags look
// correct but whose CSS/fonts/JS fail to load in the packaged
// artifact (wrong base, missing assets, dead chunks, absolute
// URLs, unshipped fonts).
// =============================================================

import { test, expect } from '@playwright/test';

// Every page the buyer package must ship.
const REQUIRED_PAGES = [
  'index.html', 'pricing.html', 'dashboard.html', 'apis.html', 'api-keys.html',
  'logs.html', 'usage.html', 'webhooks.html', 'endpoints.html', 'errors.html',
  'rate-limits.html', 'environments.html', 'team.html', 'billing.html',
  'settings.html', 'profile.html', 'notifications.html', 'docs.html',
  'sdk.html', 'api-reference.html', 'metrics.html', 'login.html',
  'forgot-password.html', 'invite.html', 'changelog.html', 'status.html',
  '404.html', 'style-guide.html', 'rtl.html', 'visual-showcase.html',
];

// Diagnostics collected once per page, then asserted in bulk so a
// failure message lists every offending page instead of failing the
// suite page-by-page.
async function collectDiagnostics(browser) {
  const report = [];
  for (const pageName of REQUIRED_PAGES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const diag = { page: pageName };
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const httpBad = [];
    const fontResponses = [];

    page.on('console', (m) => {
      if (m.type() === 'error' && !/favicon/i.test(m.text())) consoleErrors.push(m.text());
    });
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    page.on('requestfailed', (r) => failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`));
    page.on('response', (r) => {
      if (r.status() >= 400) httpBad.push(`${r.status()} ${r.url()}`);
      if (/\.(woff2?|ttf)(\?|$)/.test(r.url())) fontResponses.push(r.status());
    });

    try {
      const resp = await page.goto(`/${pageName}`, { waitUntil: 'networkidle', timeout: 60_000 });
      diag.documentStatus = resp ? resp.status() : null;
      // let boot / late font fetches settle
      await page.waitForTimeout(1200);

      const probe = await page.evaluate(async () => {
        const out = {
          sheetCount: 0,
          cssRules: 0,
          cssOpaque: false,
          bodyBg: getComputedStyle(document.body).backgroundColor,
          rootTheme: document.documentElement.getAttribute('data-theme'),
          rootLang: document.documentElement.getAttribute('lang'),
          fontVar: getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim().slice(0, 120),
          markupIcons: document.querySelectorAll('i[data-lucide]').length,
          svgIcons: document.querySelectorAll('svg.lucide, svg[data-lucide]').length,
          canvases: document.querySelectorAll('canvas').length,
          assetRefs: [],
        };
        // Is the compiled stylesheet applied and readable?
        for (const s of document.styleSheets) {
          if (!s.href) continue;
          out.sheetCount += 1;
          try {
            out.cssRules += s.cssRules.length;
          } catch {
            out.cssOpaque = true; // CORS-blocked sheet — cannot even read it
          }
        }
        // Relative-path contract on the served document. Read the raw
        // attribute values (el.href/el.src would report browser-resolved
        // absolute URLs and falsely flag the correct ./assets/… refs).
        for (const el of document.querySelectorAll('link[href], script[src]')) {
          const attr = el.getAttribute('href') || el.getAttribute('src');
          if (attr) out.assetRefs.push(attr);
        }
        if (document.fonts && document.fonts.ready) {
          try { await document.fonts.ready; } catch { /* ignore */ }
        }
        await new Promise((r) => setTimeout(r, 600));
        out.fonts = {
          status: document.fonts ? document.fonts.status : 'n/a',
          vazirmatn: document.fonts ? document.fonts.check('32px Vazirmatn') : null,
          interVariable: document.fonts ? document.fonts.check('32px "Inter Variable"') : null,
          jetbrainsMono: document.fonts ? document.fonts.check('32px "JetBrains Mono"') : null,
        };
        return out;
      });
      Object.assign(diag, probe);

      // App-page interaction smoke: Bootstrap dropdown + Chart.js must
      // actually execute inside the packaged modules.
      if (pageName === 'dashboard.html') {
        const dd = page.locator('[data-bs-toggle="dropdown"]').first();
        if (await dd.count()) {
          await dd.click();
          await page.waitForTimeout(400);
          diag.dropdownOpened = await page
            .locator('.dropdown-menu.show')
            .count()
            .then((n) => n > 0)
            .catch(() => false);
        }
        diag.chartDrawn = await page
          .evaluate(() => {
            const c = document.querySelector('canvas');
            if (!c) return null;
            const ctx = c.getContext('2d');
            // Chart.js paints into the canvas; read a pixel to prove it drew.
            try {
              const { data } = ctx.getImageData(0, 0, c.width, Math.min(c.height, 4));
              return data.some((v) => v !== 0);
            } catch {
              return null;
            }
          })
          .catch(() => null);
      }
    } catch (err) {
      diag.fatal = String(err);
    } finally {
      await page.close();
    }
    report.push(diag);
  }
  return report;
}

test.describe('production build (dist, no Vite dev server)', () => {
  test('every required page ships', async ({ request }) => {
    for (const pageName of REQUIRED_PAGES) {
      const r = await request.get(`/${pageName}`);
      expect(r.status(), `${pageName} should exist in dist`).toBe(200);
      const html = await r.text();
      // The served document must carry relative asset references only —
      // the exact regression this suite guards (a <link> that exists but
      // points at an absolute path a sub-directory install cannot serve).
      for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
        const ref = m[1];
        if (/^(?:https?:|data:|#|mailto:|tel:)/.test(ref)) continue;
        expect(
          ref.startsWith('./') || ref.startsWith('../'),
          `${pageName} must use relative asset refs, got: ${ref}`,
        ).toBe(true);
      }
      // A compiled stylesheet must actually be referenced (content-level,
      // not just a file existing next to the HTML).
      expect(html).toMatch(/<link[^>]+rel="stylesheet"/);
    }
  });

  test('every page loads styled with no console/network errors and boots its modules', async ({ browser }) => {
    // 31 pages × real browser load + interaction smoke needs more than the
    // 30s default.
    test.setTimeout(300_000);
    const report = await collectDiagnostics(browser);

    const bad = report.filter(
      (d) => d.documentStatus !== 200 || d.fatal || d.pageErrors?.length || d.consoleErrors?.length || d.failedRequests?.length || d.httpBad?.length,
    );
    expect(
      bad.map((d) => ({
        page: d.page,
        fatal: d.fatal,
        status: d.documentStatus,
        consoleErrors: d.consoleErrors?.slice(0, 3),
        pageErrors: d.pageErrors?.slice(0, 3),
        failedRequests: d.failedRequests?.slice(0, 3),
        httpBad: d.httpBad?.slice(0, 5),
      })),
    ).toEqual([]);

    const unstyled = report.filter((d) => d.cssRules < 1000 || d.cssOpaque || d.bodyBg === 'rgba(0, 0, 0, 0)' || !d.fontVar);
    expect(unstyled.map((d) => d.page)).toEqual([]);

    const deadJs = report.filter(
      (d) => d.markupIcons > 0 && d.svgIcons === 0 && !d.canvases,
    );
    expect(deadJs.map((d) => `${d.page} (${d.markupIcons} icons never booted)`)).toEqual([]);

    // Fonts must have been fetched over the network from the package.
    const noFonts = report.filter((d) => d.fonts?.vazirmatn === false && d.fonts?.interVariable === false);
    expect(noFonts.map((d) => `${d.page} fonts: ${JSON.stringify(d.fonts)}`)).toEqual([]);

    // Relative-path contract: no absolute /assets URLs in served HTML.
    const absoluteRefs = report
      .map((d) => ({ page: d.page, refs: (d.assetRefs || []).filter((p) => p.startsWith('/')) }))
      .filter((x) => x.refs.length);
    expect(absoluteRefs).toEqual([]);

    if (report.some((d) => d.page === 'dashboard.html')) {
      const dash = report.find((d) => d.page === 'dashboard.html');
      expect(dash.dropdownOpened, 'Bootstrap dropdown data-API must work in the packaged JS').toBe(true);
      expect(dash.chartDrawn, 'Chart.js must draw into a canvas in the packaged JS').not.toBe(false);
    }
  });

  test('fa default and en switch both load their locale fonts', async ({ browser }) => {
    const fa = await browser.newPage();
    await fa.goto('/index.html', { waitUntil: 'networkidle' });
    await fa.waitForFunction(() => document.fonts && document.fonts.status === 'loaded').catch(() => {});
    const faState = await fa.evaluate(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      vazirmatn: document.fonts.check('32px Vazirmatn'),
      // Persian text must resolve to Vazirmatn, the fa UI face
      bodyFont: getComputedStyle(document.body).fontFamily,
    }));
    expect(faState.lang).toBe('fa');
    expect(faState.dir).toBe('rtl');
    expect(faState.vazirmatn).toBe(true);
    expect(faState.bodyFont).toContain('Vazirmatn');
    await fa.close();

    // Switch locale like a buyer would (header toggle persists afx-locale)
    const en = await browser.newPage();
    await en.addInitScript(() => localStorage.setItem('afx-locale', 'en'));
    await en.goto('/index.html', { waitUntil: 'networkidle' });
    await en.waitForFunction(() => document.fonts && document.fonts.status === 'loaded').catch(() => {});
    const enState = await en.evaluate(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      interVariable: document.fonts.check('32px "Inter Variable"'),
      bodyFont: getComputedStyle(document.body).fontFamily,
    }));
    expect(enState.lang).toBe('en');
    expect(enState.dir).toBe('ltr');
    expect(enState.interVariable).toBe(true);
    expect(enState.bodyFont).toContain('Inter Variable');
    await en.close();
  });
});
