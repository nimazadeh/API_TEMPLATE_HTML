// =============================================================
// APIForge X — Command palette index (static)
// Groups: Navigate, Quick actions. `run` receives the event for
// context. Extended per-phase as pages land.
// =============================================================

export const commandGroups = [
  {
    label: 'Navigate',
    items: [
      {
        id: 'nav-overview',
        title: 'Overview',
        desc: 'Platform health dashboard',
        icon: 'layout-dashboard',
        href: './dashboard.html',
      },
      {
        id: 'nav-apis',
        title: 'APIs',
        desc: 'Browse and test the API catalog',
        icon: 'code-2',
        href: './apis.html',
      },
      {
        id: 'nav-endpoints',
        title: 'Endpoints',
        desc: 'Reference docs and schemas',
        icon: 'braces',
        href: './endpoints.html',
      },
      {
        id: 'nav-keys',
        title: 'API Keys',
        desc: 'Manage and rotate keys',
        icon: 'key',
        href: './api-keys.html',
      },
      {
        id: 'nav-logs',
        title: 'Logs',
        desc: 'Request log inspector',
        icon: 'scroll-text',
        href: './logs.html',
      },
      {
        id: 'nav-webhooks',
        title: 'Webhooks',
        desc: 'Delivery debugger and payload inspector',
        icon: 'webhook',
        href: './webhooks.html',
      },
      {
        id: 'nav-usage',
        title: 'Usage',
        desc: 'Usage and attribution analytics',
        icon: 'bar-chart-3',
        href: './usage.html',
      },
      {
        id: 'nav-errors',
        title: 'Errors',
        desc: 'Issue monitoring and stack traces',
        icon: 'bug',
        href: './errors.html',
      },
      {
        id: 'nav-rate-limits',
        title: 'Rate Limits',
        desc: 'Current limits and per-API rules',
        icon: 'gauge',
        href: './rate-limits.html',
      },
      {
        id: 'nav-environments',
        title: 'Environments',
        desc: 'Variables and keys per environment',
        icon: 'server',
        href: './environments.html',
      },
      {
        id: 'nav-style-guide',
        title: 'Style Guide',
        desc: 'Design system & component showcase',
        icon: 'palette',
        href: './style-guide.html',
      },
      {
        id: 'nav-rtl',
        title: 'RTL Test — فارسی',
        desc: 'Persian / right-to-left demo',
        icon: 'languages',
        href: './rtl-test.html',
      },
    ],
  },
  {
    label: 'Quick actions',
    items: [
      {
        id: 'act-create-key',
        title: 'Create API key',
        desc: 'Generate a new key',
        icon: 'key',
        href: './api-keys.html#create',
      },
      {
        id: 'act-test-endpoint',
        title: 'Test an endpoint',
        desc: 'Open the API explorer tester',
        icon: 'play',
        href: './apis.html#endpoints',
      },
      {
        id: 'act-view-logs',
        title: 'View logs',
        desc: 'Open the request log inspector',
        icon: 'scroll-text',
        href: './logs.html',
      },
      {
        id: 'act-theme',
        title: 'Toggle theme',
        desc: 'Switch between dark and light',
        icon: 'sun-moon',
        run: () => {
          const btn = document.querySelector('[data-theme-toggle]');
          if (btn) btn.click();
        },
      },
      {
        id: 'act-env-test',
        title: 'Switch to Test environment',
        desc: 'View test data',
        icon: 'flask-conical',
        run: () => {
          document.querySelectorAll('[data-env-switcher] .env-option[data-env="test"]').forEach((b) => b.click());
        },
      },
      {
        id: 'act-env-live',
        title: 'Switch to Live environment',
        desc: 'View live data',
        icon: 'circle-check',
        run: () => {
          document.querySelectorAll('[data-env-switcher] .env-option[data-env="live"]').forEach((b) => b.click());
        },
      },
    ],
  },
];
