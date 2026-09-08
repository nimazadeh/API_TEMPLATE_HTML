import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const pages = fs.readdirSync('.').filter((file) => file.endsWith('.html')).sort();
const widths = [320, 360, 390, 576, 768, 992, 1200, 1440, 1920];
const locales = ['fa', 'en'];

test.use({ reducedMotion: 'reduce' });

async function preferences(page, locale, theme = 'dark', env = 'live') {
  await page.addInitScript(({ locale, theme, env }) => {
    localStorage.setItem('afx-locale', locale);
    localStorage.setItem('afx-theme', theme);
    localStorage.setItem('afx-env', env);
  }, { locale, theme, env });
}

async function ready(page, file) {
  await page.goto(`/${file}`);
  await expect(page.locator('.app-header svg,.site-header svg,.auth__brand svg,.rtl-test__bar svg').filter({ visible: true }).first()).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  if (file.startsWith('dashboard.html')) await expect(page.locator('#activity-feed .timeline')).toBeVisible();
}

async function settleLayout(page) {
  // Let ResizeObserver / Chart.js finish measuring the new grid tracks.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function layout(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const main = document.querySelector('.app-main');
    const sidebar = document.querySelector('.app-sidebar');
    const candidates = document.querySelectorAll([
      '.app-header', '.app-main__inner', '.card', '.card-header', '.auth__card',
      '.auth__brand', '.toolbar', '.seg', '.chart__head', '.code-block__header',
      '.table-footer', '.site-header__inner', '.hero-preview__body', '.hero-preview__pane',
    ].join(','));
    return {
      viewport: root.clientWidth,
      width: root.scrollWidth,
      rootOverflow: getComputedStyle(root).overflowX,
      bodyOverflow: getComputedStyle(document.body).overflowX,
      main: main && {
        overflowX: getComputedStyle(main).overflowX,
        overflowY: getComputedStyle(main).overflowY,
        extraWidth: main.scrollWidth - main.clientWidth,
        extraHeight: main.scrollHeight - main.clientHeight,
      },
      sidebar: sidebar && { display: getComputedStyle(sidebar).display, height: sidebar.getBoundingClientRect().height },
      clipped: [...candidates].filter((el) => el.checkVisibility() && el.scrollWidth > el.clientWidth + 1)
        .map((el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}.${el.className}: ${el.scrollWidth}/${el.clientWidth}`),
    };
  });
}

async function inViewport(page, locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize();
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

async function hitTarget(locator) {
  expect(await locator.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  })).toBe(true);
}

// 31 pages × 2 locales × 2 themes × 9 widths = 1,116 layout checks.
// Light-mode cases also exercise the longer, visible Test environment banner.
for (const file of pages) {
  for (const locale of locales) {
    for (const theme of ['dark', 'light']) {
      test(`${file}: ${locale}/${theme} fits every viewport without a nested main scrollbar`, async ({ page }) => {
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await preferences(page, locale, theme, theme === 'light' ? 'test' : 'live');
        await page.setViewportSize({ width: widths[0], height: 844 });
        await ready(page, file);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        for (const width of widths) {
          await test.step(`${width}px`, async () => {
            await page.setViewportSize({ width, height: width >= 992 ? 900 : 844 });
            await settleLayout(page);
            const result = await layout(page);
            expect(result.width).toBeLessThanOrEqual(result.viewport + 1);
            // Prevent regressions that merely hide the overflow on html/body.
            expect(['hidden', 'clip']).not.toContain(result.rootOverflow);
            expect(['hidden', 'clip']).not.toContain(result.bodyOverflow);
            expect(result.clipped).toEqual([]);
            if (result.main) {
              expect(result.main.overflowX).toBe('visible');
              expect(result.main.overflowY).toBe('visible');
              expect(result.main.extraWidth).toBeLessThanOrEqual(1);
              expect(result.main.extraHeight).toBeLessThanOrEqual(1);
              if (width < 768) expect(result.sidebar.display).toBe('none');
              else {
                expect(result.sidebar.display).toBe('flex');
                expect(result.sidebar.height).toBeLessThanOrEqual(page.viewportSize().height);
              }
            }
          });
        }
        expect(errors).toEqual([]);
      });
    }
  }
}

for (const locale of locales) {
  for (const width of [390, 1280]) {
    test(`Dashboard ${locale}/${width}: wheel scrolls the document, sticky chrome stays and the last card is reachable`, async ({ page }) => {
      await preferences(page, locale);
      await page.setViewportSize({ width, height: 720 });
      await ready(page, 'dashboard.html');
      await page.mouse.move(width / 2, 450);
      await page.mouse.wheel(0, 450);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
      expect(await page.locator('.app-main').evaluate((el) => el.scrollTop)).toBe(0);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await settleLayout(page);
      const positions = await page.evaluate(() => ({
        header: document.querySelector('.app-header').getBoundingClientRect().top,
        last: document.querySelector('.app-main__inner').lastElementChild.getBoundingClientRect().bottom,
        limit: innerWidth < 768 ? document.querySelector('.bottom-tabbar').getBoundingClientRect().top : innerHeight,
        sidebar: document.querySelector('.app-sidebar').getBoundingClientRect().top,
      }));
      expect(positions.header).toBe(0);
      expect(positions.last).toBeLessThanOrEqual(positions.limit);
      if (width >= 768) expect(Math.abs(positions.sidebar)).toBeLessThan(1);
      const lastAction = page.locator('.app-main .card--interactive').last();
      await inViewport(page, lastAction);
      await hitTarget(lastAction);
    });
  }

  test(`Mobile navigation ${locale}: every link, environment, language and theme control remains usable`, async ({ page }) => {
    await preferences(page, locale);
    await page.setViewportSize({ width: 320, height: 568 });
    await ready(page, 'dashboard.html');
    await page.locator('.header-burger').click();
    const drawer = page.locator('#sidebar-drawer');
    await expect(drawer).toHaveClass(/show/);
    await inViewport(page, drawer);
    const nav = drawer.locator('.sidebar-nav');
    expect(await nav.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    const lastLink = nav.locator('.nav-item').last();
    await lastLink.scrollIntoViewIfNeeded();
    await hitTarget(lastLink);
    await drawer.locator('[data-env="test"]').click();
    await drawer.locator('[data-bs-dismiss]').click();
    await expect(drawer).not.toHaveClass(/show/);
    await expect(page.locator('[data-env-banner]')).toBeVisible();
    expect((await layout(page)).width).toBe(320);

    const next = locale === 'fa' ? 'en' : 'fa';
    await page.locator('[data-locale-menu] > button').click();
    await hitTarget(page.locator(`[data-locale-menu] [data-locale="${next}"]`));
    await page.locator(`[data-locale-menu] [data-locale="${next}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('dir', next === 'fa' ? 'rtl' : 'ltr');
    await page.locator('[data-theme-menu] > button').click();
    await page.locator('[data-theme-menu] [data-mode="light"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect((await layout(page)).clipped).toEqual([]);

    await page.locator('.header-burger').click();
    await page.setViewportSize({ width: 1024, height: 720 });
    await expect(drawer).not.toHaveClass(/show/);
    await expect(page.locator('.offcanvas-backdrop')).toHaveCount(0);
    expect(await page.locator('body').evaluate((el) => getComputedStyle(el).overflow)).not.toBe('hidden');
    const railLink = page.locator('.app-sidebar .nav-item').first();
    await expect(railLink).toHaveAttribute('aria-label', next === 'en' ? 'Overview' : 'نمای کلی');
    await expect(railLink).toHaveAttribute('title', next === 'en' ? 'Overview' : 'نمای کلی');
    expect(await railLink.locator('span').isVisible()).toBe(false);
  });

  test(`Command search ${locale}: narrow/short screen, input and close control fit, touch dismissal works`, async ({ page }) => {
    await preferences(page, locale);
    await page.setViewportSize({ width: 320, height: 360 });
    await ready(page, 'dashboard.html');
    const search = page.locator('.header-search');
    const palette = page.locator('.command-palette');
    await search.click();
    await expect(palette).toHaveClass(/is-open/);
    await inViewport(page, palette.locator('.cmd-dialog'));
    await inViewport(page, palette.locator('input'));
    await inViewport(page, palette.locator('[data-command-close]'));
    expect(await palette.locator('.cmd-dialog').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await palette.locator('input').fill('logs');
    await palette.locator('[data-command-close]').click();
    await expect(palette).toBeHidden();
    await expect(search).toBeFocused();
    await search.click();
    await page.mouse.click(2, 2);
    await expect(palette).toBeHidden();
    await page.keyboard.press('Control+k');
    await expect(palette).toHaveClass(/is-open/);
    await page.keyboard.press('Shift+Tab');
    await expect(palette.locator('button').last()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(palette.locator('input')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(palette.locator('[data-command-close]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();
  });

  for (const file of ['logs.html', 'api-keys.html']) {
    test(`${file} ${locale}: wide tables scroll locally, not the page`, async ({ page }) => {
      await preferences(page, locale);
      await page.setViewportSize({ width: 320, height: 720 });
      await ready(page, file);
      const table = page.locator('.app-main .table-responsive').first();
      const result = await table.evaluate((el) => {
        const before = el.scrollLeft;
        el.scrollLeft = getComputedStyle(el).direction === 'rtl' ? -el.scrollWidth : el.scrollWidth;
        return { wide: el.scrollWidth > el.clientWidth, moved: Math.abs(el.scrollLeft - before) > 0, root: document.documentElement.scrollWidth };
      });
      expect(result).toEqual({ wide: true, moved: true, root: 320 });
    });
  }

  test(`Inspectors ${locale}: logical end alignment, all content reachable and close unlocks document`, async ({ page }) => {
    await preferences(page, locale);
    await page.setViewportSize({ width: 1280, height: 720 });
    await ready(page, 'logs.html');
    await page.locator('#logs-list tr').first().click();
    const drawer = page.locator('#log-drawer');
    await expect(drawer).toHaveClass(/show/);
    await inViewport(page, drawer);
    const box = await drawer.boundingBox();
    expect(locale === 'fa' ? box.x : 1280 - box.x - box.width).toBe(0);
    await page.setViewportSize({ width: 390, height: 568 });
    await inViewport(page, drawer);
    const body = drawer.locator('.offcanvas-body');
    expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    expect(await body.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(drawer).not.toHaveClass(/show/);
    expect(await page.locator('body').evaluate((el) => getComputedStyle(el).overflow)).not.toBe('hidden');
  });

  test(`Docs ${locale}: pager resets document scroll and sticky navigation stays below the header`, async ({ page }) => {
    await preferences(page, locale);
    await page.setViewportSize({ width: 1440, height: 720 });
    await ready(page, 'docs.html');
    const next = page.locator('#docs-pager a').last();
    const hash = await next.getAttribute('href');
    await next.click();
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 600));
    await settleLayout(page);
    const navTop = await page.locator('.docs-side').evaluate((el) => el.getBoundingClientRect().top);
    expect(navTop).toBeGreaterThanOrEqual(56);
    const toc = page.locator('.docs-toc a').last();
    const target = await toc.getAttribute('href');
    await toc.click();
    const headingTop = await page.evaluate((hash) => document.getElementById(decodeURIComponent(hash.slice(1))).getBoundingClientRect().top, target);
    expect(headingTop).toBeGreaterThanOrEqual(56);
  });

  for (const [file, drawerId, navId] of [
    ['docs.html', 'docs-nav-offcanvas', 'docs-nav-mobile'],
    ['api-reference.html', 'ref-nav-offcanvas', 'ref-nav-mobile'],
  ]) {
    test(`${file} ${locale}: short-screen navigation can reach its last item`, async ({ page }) => {
      await preferences(page, locale);
      await page.setViewportSize({ width: 390, height: 360 });
      await ready(page, file);
      await page.locator(`[data-bs-target="#${drawerId}"]`).click();
      const drawer = page.locator(`#${drawerId}`);
      await expect(drawer).toHaveClass(/show/);
      await inViewport(page, drawer);
      const last = page.locator(`#${navId} a`).last();
      await last.scrollIntoViewIfNeeded();
      await hitTarget(last);
      await last.click();
      await expect(drawer).not.toHaveClass(/show/);
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      expect((await layout(page)).width).toBe(390);
    });
  }

  for (const theme of ['dark', 'light']) {
    test(`Auth ${locale}/${theme}: invite matches login backdrop and a short screen keeps the whole form reachable`, async ({ page }) => {
      await preferences(page, locale, theme);
      await page.setViewportSize({ width: 390, height: 844 });
      const backgrounds = [];
      for (const file of ['login.html', 'invite.html', 'forgot-password.html']) {
        await ready(page, file);
        await expect(page.locator('.auth > .backdrop--auth')).toHaveAttribute('aria-hidden', 'true');
        backgrounds.push(await page.locator('.backdrop--auth').evaluate((el) => ({
          pointer: getComputedStyle(el).pointerEvents,
          grid: getComputedStyle(el.querySelector('.backdrop__grid')).backgroundImage,
          glow: getComputedStyle(el.querySelector('.backdrop__glow')).backgroundImage,
          size: getComputedStyle(el.querySelector('.backdrop__grid')).backgroundSize,
        })));
      }
      expect(backgrounds[0].pointer).toBe('none');
      expect(backgrounds[0].grid).toContain('linear-gradient');
      expect(backgrounds[1]).toEqual(backgrounds[0]);
      expect(backgrounds[2]).toEqual(backgrounds[0]);
      await page.setViewportSize({ width: 320, height: 360 });
      await ready(page, 'invite.html');
      await page.locator('#invite-submit').click();
      await expect(page.locator('.invalid-feedback').first()).toBeVisible();
      await page.locator('#invite-name').fill(locale === 'fa' ? 'کاربر آزمایشی' : 'Test User');
      await page.locator('#invite-password').fill('example-password');
      await page.locator('#invite-submit').click();
      await expect(page.locator('#invite-submit')).toBeEnabled();
      await expect(page.locator('.toast[data-type="success"]')).toBeVisible();
      const footer = page.locator('.auth__footer a');
      await footer.scrollIntoViewIfNeeded();
      await inViewport(page, footer);
      expect((await layout(page)).width).toBe(320);
    });
  }

  test(`Marketing ${locale}: language toggle is usable at 320px`, async ({ page }) => {
    await preferences(page, locale);
    await page.setViewportSize({ width: 320, height: 720 });
    await ready(page, 'index.html');
    const toggle = page.locator('.site-header [data-locale-toggle]');
    await inViewport(page, toggle);
    await hitTarget(toggle);
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('lang', locale === 'fa' ? 'en' : 'fa');
    expect((await layout(page)).width).toBe(320);
  });
}

test('Dashboard with motion enabled still reveals its last quick action on document scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await preferences(page, 'fa');
  await page.setViewportSize({ width: 390, height: 720 });
  await ready(page, 'dashboard.html');
  const last = page.locator('.app-main .card--interactive').last();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveClass(/is-inview/);
  await expect(last).toHaveCSS('opacity', '1');
  await hitTarget(last);
});
