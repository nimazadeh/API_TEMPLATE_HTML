// =============================================================
// APIForge X — Keyboard shortcuts (Phase 4 polish)
//   ?            toggle the help modal
//   ⌘K / Ctrl+K command palette (owned by command-palette.js)
//   g then key   jump to a page (GitHub-style prefix nav)
//   /            focus the page's primary search/filter
//   Esc          closes dialogs/overlays (Bootstrap keyboard)
// The help modal is built lazily and appended once — zero changes
// needed in the 22 app page files.
// =============================================================

import { Modal } from 'bootstrap';
import { createIcons, icons } from './icons.js';
import { t, onLocaleChange } from '../core/i18n.js';

// g + letter → page. One mnemonic letter per destination.
const G_NAV = {
  d: { href: './dashboard.html', key: 'page.dashboard' },
  a: { href: './apis.html', key: 'page.apis' },
  e: { href: './endpoints.html', key: 'page.endpoints' },
  k: { href: './api-keys.html', key: 'page.api-keys' },
  l: { href: './logs.html', key: 'page.logs' },
  w: { href: './webhooks.html', key: 'page.webhooks' },
  u: { href: './usage.html', key: 'page.usage' },
  r: { href: './rate-limits.html', key: 'page.rate-limits' },
  m: { href: './metrics.html', key: 'page.metrics' },
  v: { href: './environments.html', key: 'page.environments' },
  t: { href: './team.html', key: 'page.team' },
  b: { href: './billing.html', key: 'page.billing' },
  n: { href: './notifications.html', key: 'page.notifications' },
  s: { href: './settings.html', key: 'page.settings' },
  p: { href: './profile.html', key: 'page.profile' },
  h: { href: './index.html', key: 'cmd.homeTitle' },
};

const G_WINDOW_MS = 800;

let pendingG = null;
let helpModal = null;

function isTyping(e) {
  const t = e.target;
  if (!t) return false;
  const tag = (t.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
}

function buildHelpModal() {
  if (helpModal) return helpModal;

  const gKeys = Object.entries(G_NAV)
    .map(([letter, item]) => `<span class="kbd-hint">g&nbsp;${letter}</span> ${t(item.key)}`)
    .join(' · ');

  const wrap = document.createElement('div');
  wrap.className = 'modal fade';
  wrap.id = 'shortcuts-modal';
  wrap.tabIndex = -1;
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', 'shortcuts-modal-title');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="shortcuts-modal-title">${t('shortcuts.title')}</h4>
          <button type="button" class="btn btn-icon" data-bs-dismiss="modal" aria-label="${t('aria.close')}"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <table class="kv">
            <tbody>
              <tr><th><span class="kbd-hint">?</span></th><td>${t('shortcuts.togglePanel')}</td></tr>
              <tr><th><span class="kbd-hint">⌘K</span></th><td>${t('palette.title')}</td></tr>
              <tr><th><span class="kbd-hint">/</span></th><td>${t('shortcuts.focusSearch')}</td></tr>
              <tr><th><span class="kbd-hint">Esc</span></th><td>${t('shortcuts.closeOverlays')}</td></tr>
            </tbody>
          </table>
          <div class="form-label mt-4 mb-2">${t('shortcuts.jumpHint')}</div>
          <p class="caption mb-0">${gKeys}</p>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  createIcons({ icons });
  helpModal = Modal.getOrCreateInstance(wrap, { keyboard: true });
  return helpModal;
}

/** Rebuild the help panel copy when the locale flips. */
function refreshHelpModal() {
  if (!helpModal) return;
  const wrap = helpModal._element;
  if (!wrap) return;
  const body = wrap.querySelector('.modal-body');
  const title = wrap.querySelector('.modal-title');
  if (title) title.textContent = t('shortcuts.title');
  if (body) {
    const gKeys = Object.entries(G_NAV)
      .map(([letter, item]) => `<span class="kbd-hint">g&nbsp;${letter}</span> ${t(item.key)}`)
      .join(' · ');
    body.innerHTML = `
      <table class="kv">
        <tbody>
          <tr><th><span class="kbd-hint">?</span></th><td>${t('shortcuts.togglePanel')}</td></tr>
          <tr><th><span class="kbd-hint">⌘K</span></th><td>${t('palette.title')}</td></tr>
          <tr><th><span class="kbd-hint">/</span></th><td>${t('shortcuts.focusSearch')}</td></tr>
          <tr><th><span class="kbd-hint">Esc</span></th><td>${t('shortcuts.closeOverlays')}</td></tr>
        </tbody>
      </table>
      <div class="form-label mt-4 mb-2">${t('shortcuts.jumpHint')}</div>
      <p class="caption mb-0">${gKeys}</p>`;
  }
}

function toggleHelp() {
  const modal = buildHelpModal();
  if (wrapIsShown(modal)) modal.hide();
  else modal.show();
}

function wrapIsShown(modal) {
  const el = modal && modal._element;
  return !!el && el.classList.contains('show');
}

function focusSearch() {
  const candidates = [
    document.querySelector('[data-search-target]'),
    document.querySelector('input[type="search"]:not([hidden])'),
    document.querySelector('#endpoint-search'),
  ];
  const target = candidates.find((el) => el && !el.disabled);
  if (target) {
    target.focus();
    try {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch {
      /* jsdom stub */
    }
    return true;
  }
  // No visible search on this page — open the command palette instead.
  const palette = document.querySelector('[data-command-palette]');
  if (palette) {
    palette.click();
    return true;
  }
  return false;
}

export function initShortcuts() {
  onLocaleChange(refreshHelpModal);
  document.addEventListener('keydown', (e) => {
    if (isTyping(e)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    // ? (Shift+/)
    if (e.key === '?') {
      e.preventDefault();
      toggleHelp();
      return;
    }

    // / focuses search
    if (e.key === '/') {
      e.preventDefault();
      focusSearch();
      return;
    }

    // g + letter navigation
    if (e.key.length === 1 && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      pendingG = Date.now();
      return;
    }

    if (pendingG && e.key.length === 1) {
      const target = G_NAV[e.key.toLowerCase()];
      if (target && Date.now() - pendingG <= G_WINDOW_MS) {
        e.preventDefault();
        pendingG = null;
        window.location.href = target.href;
        return;
      }
      pendingG = null;
    }
  });
}
