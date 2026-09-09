// =============================================================
// APIForge X — Command palette index
// Groups: Navigate, Developer resources, Marketing, Quick actions.
// `run` receives the event for context.
//
// The index is built on demand (not at import time) because every
// label is translated: rebuilding after an `afx:localechange` keeps
// the palette in the active language.
// =============================================================

import { t } from '../core/i18n.js';

export function getCommandGroups() {
  return [
    {
      label: t('palette.groupNavigate'),
      items: [
        { id: 'nav-overview', title: t('page.dashboard'), desc: t('cmd.overviewDesc'), icon: 'layout-dashboard', href: './dashboard.html' },
        { id: 'nav-apis', title: t('page.apis'), desc: t('cmd.apisDesc'), icon: 'code-2', href: './apis.html' },
        { id: 'nav-endpoints', title: t('page.endpoints'), desc: t('cmd.endpointsDesc'), icon: 'braces', href: './endpoints.html' },
        { id: 'nav-keys', title: t('page.api-keys'), desc: t('cmd.keysDesc'), icon: 'key', href: './api-keys.html' },
        { id: 'nav-logs', title: t('page.logs'), desc: t('cmd.logsDesc'), icon: 'scroll-text', href: './logs.html' },
        { id: 'nav-webhooks', title: t('page.webhooks'), desc: t('cmd.webhooksDesc'), icon: 'webhook', href: './webhooks.html' },
        { id: 'nav-usage', title: t('page.usage'), desc: t('cmd.usageDesc'), icon: 'bar-chart-3', href: './usage.html' },
        { id: 'nav-errors', title: t('page.errors'), desc: t('cmd.errorsDesc'), icon: 'bug', href: './errors.html' },
        { id: 'nav-rate-limits', title: t('page.rate-limits'), desc: t('cmd.rateLimitsDesc'), icon: 'gauge', href: './rate-limits.html' },
        { id: 'nav-environments', title: t('page.environments'), desc: t('cmd.environmentsDesc'), icon: 'server', href: './environments.html' },
        { id: 'nav-metrics', title: t('page.metrics'), desc: t('cmd.metricsDesc'), icon: 'activity', href: './metrics.html' },
        { id: 'nav-team', title: t('page.team'), desc: t('cmd.teamDesc'), icon: 'users', href: './team.html' },
        { id: 'nav-billing', title: t('page.billing'), desc: t('cmd.billingDesc'), icon: 'credit-card', href: './billing.html' },
        { id: 'nav-settings', title: t('page.settings'), desc: t('cmd.settingsDesc'), icon: 'settings', href: './settings.html' },
        { id: 'nav-profile', title: t('page.profile'), desc: t('cmd.profileDesc'), icon: 'user', href: './profile.html' },
        { id: 'nav-notifications', title: t('page.notifications'), desc: t('cmd.notificationsDesc'), icon: 'bell', href: './notifications.html' },
        { id: 'nav-style-guide', title: t('page.style-guide'), desc: t('cmd.styleGuideDesc'), icon: 'palette', href: './style-guide.html' },
        { id: 'nav-rtl', title: t('cmd.rtlTitle'), desc: t('cmd.rtlDesc'), icon: 'languages', href: './rtl.html' },
      ],
    },
    {
      label: t('palette.groupDeveloper'),
      items: [
        { id: 'dev-docs', title: t('page.docs'), desc: t('cmd.docsDesc'), icon: 'book-open', href: './docs.html' },
        { id: 'dev-sdks', title: t('page.sdk'), desc: t('cmd.sdksDesc'), icon: 'package', href: './sdk.html' },
        { id: 'dev-api-reference', title: t('page.api-reference'), desc: t('cmd.referenceDesc'), icon: 'book-marked', href: './api-reference.html' },
      ],
    },
    {
      label: t('palette.groupMarketing'),
      items: [
        { id: 'site-home', title: t('cmd.homeTitle'), desc: t('cmd.homeDesc'), icon: 'zap', href: './index.html' },
        { id: 'site-pricing', title: t('site.pricing'), desc: t('cmd.pricingDesc'), icon: 'credit-card', href: './pricing.html' },
        { id: 'site-changelog', title: t('site.changelog'), desc: t('cmd.changelogDesc'), icon: 'clock', href: './changelog.html' },
        { id: 'site-status', title: t('site.status'), desc: t('cmd.statusDesc'), icon: 'activity', href: './status.html' },
      ],
    },
    {
      label: t('palette.groupActions'),
      items: [
        { id: 'act-create-key', title: t('action.createApiKey'), desc: t('cmd.createKeyDesc'), icon: 'key', href: './api-keys.html#create' },
        { id: 'act-test-endpoint', title: t('cmd.testEndpointTitle'), desc: t('cmd.testEndpointDesc'), icon: 'play', href: './apis.html#endpoints' },
        { id: 'act-view-logs', title: t('cmd.viewLogsTitle'), desc: t('cmd.viewLogsDesc'), icon: 'scroll-text', href: './logs.html' },
        {
          id: 'act-theme',
          title: t('cmd.toggleThemeTitle'),
          desc: t('cmd.toggleThemeDesc'),
          icon: 'sun-moon',
          run: () => {
            const btn = document.querySelector('[data-theme-toggle]');
            if (btn) btn.click();
          },
        },
        {
          id: 'act-env-test',
          title: t('cmd.envTestTitle'),
          desc: t('cmd.envTestDesc'),
          icon: 'flask-conical',
          run: () => {
            document.querySelectorAll('[data-env-switcher] .env-option[data-env="test"]').forEach((b) => b.click());
          },
        },
        {
          id: 'act-env-live',
          title: t('cmd.envLiveTitle'),
          desc: t('cmd.envLiveDesc'),
          icon: 'circle-check',
          run: () => {
            document.querySelectorAll('[data-env-switcher] .env-option[data-env="live"]').forEach((b) => b.click());
          },
        },
      ],
    },
  ];
}

/** Stable export for modules that only need the shape of the index. */
export const commandGroups = getCommandGroups();
