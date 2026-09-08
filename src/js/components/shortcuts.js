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

// g + letter → page. One mnemonic letter per destination.
const G_NAV = {
  d: { href: './dashboard.html', label: 'Overview' },
  a: { href: './apis.html', label: 'APIs' },
  e: { href: './endpoints.html', label: 'Endpoints' },
  k: { href: './api-keys.html', label: 'API Keys' },
  l: { href: './logs.html', label: 'Logs' },
  w: { href: './webhooks.html', label: 'Webhooks' },
  u: { href: './usage.html', label: 'Usage' },
  r: { href: './rate-limits.html', label: 'Rate Limits' },
  m: { href: './metrics.html', label: 'Metrics' },
  v: { href: './environments.html', label: 'Environments' },
  t: { href: './team.html', label: 'Team' },
  b: { href: './billing.html', label: 'Billing' },
  n: { href: './notifications.html', label: 'Notifications' },
  s: { href: './settings.html', label: 'Settings' },
  p: { href: './profile.html', label: 'Profile' },
  h: { href: './index.html', label: 'Home' },
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
    .map(([letter, item]) => `<span class="kbd-hint">g&nbsp;${letter}</span> ${item.label}`)
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
          <h4 class="modal-title" id="shortcuts-modal-title">Keyboard shortcuts</h4>
          <button type="button" class="btn btn-icon" data-bs-dismiss="modal" aria-label="Close"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <table class="kv">
            <tbody>
              <tr><th><span class="kbd-hint">?</span></th><td>Toggle this panel</td></tr>
              <tr><th><span class="kbd-hint">⌘K</span></th><td>Command palette</td></tr>
              <tr><th><span class="kbd-hint">/</span></th><td>Focus the page search</td></tr>
              <tr><th><span class="kbd-hint">Esc</span></th><td>Close dialogs and overlays</td></tr>
            </tbody>
          </table>
          <div class="form-label mt-4 mb-2">Jump to a page — press <span class="kbd-hint">g</span>, then a letter</div>
          <p class="caption mb-0">${gKeys}</p>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  createIcons({ icons });
  helpModal = Modal.getOrCreateInstance(wrap, { keyboard: true });
  return helpModal;
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
