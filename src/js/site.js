// =============================================================
// APIForge X — Marketing site entry (Phase 4)
// Lightweight boot for the marketing layer (landing, pricing,
// changelog, status, 404). Reuses the same components as the app
// but does NOT pull in the command palette / env switcher /
// reveal-once — those are app-shell concerns.
// =============================================================

import '../scss/main.scss';

import { initI18n } from './core/i18n.js';
import { initIcons } from './components/icons.js';
import { initTheme } from './components/theme.js';
import { initCopy } from './components/copy.js';
import { initCodeBlocks } from './components/code-block.js';
import { initMotion } from './components/motion.js';
import './core/bootstrap.js';

/**
 * Highlight the active link in the site nav (desktop + drawer).
 * Each marketing page sets `data-page` on <body> to its slug.
 */
function initNavActive() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page) link.classList.add('is-active');
  });
}

/**
 * Close the mobile nav drawer when an in-drawer link is chosen,
 * so a user tapping "Pricing" is not left on a closed overlay.
 */
function initDrawerLinks() {
  document.querySelectorAll('.site-drawer-nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      const drawer = document.getElementById('site-drawer');
      if (drawer && window.bootstrap && window.bootstrap.Offcanvas) {
        const instance = window.bootstrap.Offcanvas.getInstance(drawer);
        if (instance) instance.hide();
      }
    });
  });
}

export function bootSite() {
  initI18n();
  initIcons();
  initTheme();
  initCopy();
  initCodeBlocks();
  initNavActive();
  initDrawerLinks();
  // Last: every reveal is measured after the DOM is final.
  initMotion();
}
