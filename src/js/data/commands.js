// =============================================================
// APIForge X — Command palette index (static)
// Groups: Navigation, Actions. Extended per-phase (endpoints, recent
// in Phase 2+). `run` receives the event for context.
// =============================================================

export const commandGroups = [
  {
    label: 'Navigation',
    items: [
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
        href: './rtl.html',
      },
      {
        id: 'nav-overview',
        title: 'Overview',
        desc: 'App dashboard (Phase 2)',
        icon: 'layout-dashboard',
        disabled: true,
      },
      {
        id: 'nav-logs',
        title: 'Logs',
        desc: 'Request log inspector (Phase 2)',
        icon: 'scroll-text',
        disabled: true,
      },
      {
        id: 'nav-keys',
        title: 'API Keys',
        desc: 'Key management (Phase 2)',
        icon: 'key',
        disabled: true,
      },
    ],
  },
  {
    label: 'Actions',
    items: [
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
      {
        id: 'act-copy',
        title: 'Copy sample API key',
        desc: 'Copy sk_live_… to clipboard',
        icon: 'copy',
        run: () => {
          import('../components/copy.js').then(({ copyText, flashCopied }) => {
            copyText('sk_live_4fJk9Lm2XpQz7RvW');
          });
        },
      },
    ],
  },
];
