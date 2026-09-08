import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const pages = fs.readdirSync('.').filter((file) => file.endsWith('.html'));
const catalog = Object.fromEntries(['en', 'fa'].map((locale) => [locale, JSON.parse(fs.readFileSync(`src/locales/${locale}.json`, 'utf8'))]));

async function switchLanguage(page, locale) {
  // Use the real UI handler, not a second import of the runtime under Vite HMR.
  await page.evaluate((language) => {
    if (document.documentElement.lang === language) return;
    const control = document.querySelector(`[data-locale="${language}"]`) || document.querySelector('[data-locale-toggle]');
    if (!control) throw new Error('Missing language switcher');
    control.click();
  }, locale);
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator('html')).toHaveAttribute('dir', locale === 'fa' ? 'rtl' : 'ltr');
}

async function untranslatedPersian(page) {
  return page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const values = [];
    let node;
    while ((node = walker.nextNode())) {
      const el = node.parentElement;
      // Code/payloads, language names and the deliberate Persian numeral
      // specimens in the RTL QA pages are not UI translation failures.
      if (!el.checkVisibility() || el.closest('script,style,pre,code,option,[data-locale],[data-locale-label],.num-fa,[lang="fa"]:not(html)')) continue;
      const value = node.textContent.trim();
      if (/[\u0600-\u06ff]/.test(value)) values.push(value);
    }
    return [...new Set(values)];
  });
}

for (const file of pages) {
  test(`${file}: fa ↔ en, persistence, complete bindings and no runtime errors`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/${file}`);
    // Initialization installs the switcher and paints icon placeholders.
    await expect(page.locator('[data-locale-toggle],[data-locale-menu] [data-locale]').first()).toBeAttached();
    for (const locale of ['en', 'fa', 'en', 'fa']) {
      await switchLanguage(page, locale);
      if (locale === 'en') expect(await untranslatedPersian(page)).toEqual([]);
    }
    const keys = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-attr]')].flatMap((el) => [
      el.dataset.i18n, el.dataset.i18nHtml,
      ...(el.dataset.i18nAttr || '').split(',').map((pair) => pair.split(':')[1]),
    ].filter(Boolean)));
    for (const key of keys) {
      expect(catalog.fa[key], `Missing Persian: ${key}`).toBeDefined();
      expect(catalog.en[key], `Missing English: ${key}`).toBeDefined();
    }
    await switchLanguage(page, 'en');
    await page.reload();
    await expect(page.locator('[data-locale-toggle],[data-locale-menu] [data-locale]').first()).toBeAttached();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await untranslatedPersian(page)).toEqual([]);
    await switchLanguage(page, 'fa');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    expect(errors).toEqual([]);
  });
}

test('Pricing cards, comparison, FAQ and home hero update in both directions', async ({ page }) => {
  await page.goto('/pricing.html');
  await expect(page.locator('#pricing-grid')).toContainText('توسعه‌دهنده');
  await expect(page.locator('#pricing-compare')).toContainText('درخواست در ثانیه');
  await switchLanguage(page, 'en');
  await expect(page.locator('#pricing-grid')).toContainText('Developer');
  await page.locator('[data-bs-target="#faq-1"]').click();
  await expect(page.locator('#faq-1')).toBeVisible();
  await switchLanguage(page, 'fa');
  await expect(page.locator('#faq-1')).toContainText('بله');
  await expect(page.locator('#pricing-grid svg')).not.toHaveCount(0);
  await page.goto('/index.html');
  for (const locale of ['en', 'fa', 'en', 'fa']) {
    await switchLanguage(page, locale);
    await expect(page.locator('#hero-activity')).toContainText(locale === 'fa' ? 'کلید API ایجاد شد' : 'API key created');
    await expect(page.locator('#pricing-teaser')).toContainText(locale === 'fa' ? 'توسعه‌دهنده' : 'Developer');
    await expect(page.locator('#hero-kpis')).toContainText(locale === 'fa' ? 'میلی‌ثانیه' : 'ms');
  }
});

test('Filters and unsent API request values survive a locale change', async ({ page }) => {
  await page.goto('/apis.html');
  await page.locator('#endpoint-search').fill('/v1/emails');
  await page.locator('#param-subject').fill('My unsent draft');
  await switchLanguage(page, 'en');
  await expect(page.locator('#endpoint-search')).toHaveValue('/v1/emails');
  await expect(page.locator('#param-subject')).toHaveValue('My unsent draft');
  await expect(page.locator('#endpoint-list tr')).toHaveCount(3);
  await switchLanguage(page, 'fa');
  await expect(page.locator('#param-subject')).toHaveValue('My unsent draft');
});

test('Open endpoint inspector and form use localized labels, stable auth values', async ({ page }) => {
  await page.goto('/endpoints.html');
  await page.locator('#endpoint-list tr').first().click();
  await expect(page.locator('#endpoint-drawer')).toHaveClass(/show/);
  await switchLanguage(page, 'en');
  await expect(page.locator('#endpoint-drawer')).toContainText('Parameters');
  await expect(page.locator('#endpoint-drawer')).toContainText('Bearer token');
  await switchLanguage(page, 'fa');
  await expect(page.locator('#endpoint-drawer')).toContainText('پارامترها');
  await page.locator('[data-endpoint-edit]').click();
  await expect(page.locator('#ep-auth')).toHaveValue('Bearer token');
});

test('Team role actions keep enum values and translate dropdown labels', async ({ page }) => {
  await page.goto('/team.html');
  const row = page.locator('#team-list tr').nth(2);
  await row.locator('[data-bs-toggle="dropdown"]').click();
  await row.locator('[data-role="Admin"]').click();
  await expect(page.locator('#team-list tr').nth(2).locator('.role-badge')).toContainText('مدیر');
  await switchLanguage(page, 'en');
  await expect(page.locator('#team-list tr').nth(2).locator('.role-badge')).toContainText('Admin');
  await expect(page.locator('#team-seats')).not.toContainText('undefined');
});

test('Auth messages follow the locale, including an in-flight submit', async ({ page }) => {
  await page.goto('/login.html');
  await page.locator('#login-email').fill('test@example.com');
  await page.locator('#login-password').fill('password123');
  await page.locator('#login-submit').click();
  await switchLanguage(page, 'en');
  await expect(page.locator('#login-submit')).toContainText('Signing in');
  await expect(page.locator('#login-submit')).toBeEnabled();
  await expect(page.locator('#login-submit')).toContainText('Sign in');
  await expect(page.locator('.toast')).toContainText('Demo action');
});

test('Selected billing cycle and notification read state survive language changes', async ({ page }) => {
  await page.goto('/billing.html');
  await page.locator('[data-cycle="yearly"]').click();
  await switchLanguage(page, 'en');
  await expect(page.locator('#billing-cycle')).toHaveText('per year');
  await switchLanguage(page, 'fa');
  await expect(page.locator('#billing-cycle')).toHaveText('در سال');

  await page.goto('/notifications.html');
  const toggle = page.locator('[data-toggle-read]').first();
  await expect(toggle).toBeVisible();
  {
    await toggle.click();
    const count = await page.locator('#notification-count').textContent();
    await switchLanguage(page, 'en');
    await switchLanguage(page, 'fa');
    await expect(page.locator('#notification-count')).toHaveText(count);
  }
});

test('Profile keeps user-entered names rather than translating or overwriting them', async ({ page }) => {
  await page.goto('/profile.html');
  await page.locator('#pf-name').fill('My custom name');
  await switchLanguage(page, 'en');
  await expect(page.locator('#pf-name')).toHaveValue('My custom name');
  await page.locator('#pf-save').click();
  await switchLanguage(page, 'fa');
  await expect(page.locator('#pf-display-name')).toHaveText('My custom name');
});

test('Confirmation text updates without losing the pending action', async ({ page }) => {
  await page.goto('/billing.html');
  await page.locator('[data-plan="pro"]').click();
  await expect(page.locator('#confirm-modal')).toHaveClass(/show/);
  await switchLanguage(page, 'en');
  await expect(page.locator('#confirm-modal-body')).toContainText('Switch to Pro');
  await page.locator('#confirm-modal-submit').click();
  await expect(page.locator('#billing-plan-name')).toHaveText('Pro');
  await switchLanguage(page, 'fa');
  await expect(page.locator('#billing-plan-name')).toHaveText('حرفه‌ای');
});

for (const [file, row, drawer, english, persian] of [
  ['logs.html', '#logs-list tr', '#log-drawer', 'Timing', 'زمان‌بندی'],
  ['errors.html', '#error-list tr', '#error-drawer', 'Stack trace', 'ردیابی پشته'],
  ['webhooks.html', '#delivery-list tr', '#delivery-drawer', 'Payload', 'بدنه'],
]) {
  test(`${file}: open inspector switches language without changing its record`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/${file}`);
    await page.locator(row).first().click();
    await expect(page.locator(drawer)).toHaveClass(/show/);
    await switchLanguage(page, 'en');
    await expect(page.locator(drawer)).toContainText(english);
    await switchLanguage(page, 'fa');
    await expect(page.locator(drawer)).toContainText(persian);
    await switchLanguage(page, 'en');
    await expect(page.locator(drawer)).toContainText(english);
    expect(errors).toEqual([]);
  });
}

test('Theme changes after repeated locale changes do not revive stale charts', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/index.html');
  for (const locale of ['en', 'fa', 'en', 'fa']) {
    await switchLanguage(page, locale);
    await page.locator('[data-theme-toggle]').click();
  }
  await expect(page.locator('#hero-activity')).toContainText('کلید API ایجاد شد');
  expect(errors).toEqual([]);
});
