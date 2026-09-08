// =============================================================
// APIForge X — Toast (Bootstrap-backed, premium surface)
// afxToast({ title?, message, type, action, delay }) builds a toast,
// shows it, and cleans up on hide. `action` (e.g. Undo) disables
// auto-hide so the user has time to react.
//
// Structure:  [icon] [ title / message ] [close]
// Types:      success · error · warning · info — all token colours.
// Direction:  logical properties only, so RTL mirrors for free while
//             technical strings (URLs, API paths) stay LTR.
// =============================================================

import { Toast } from '../core/bootstrap.js';
import { createIcons, icons } from './icons.js';
import { escapeHtml } from '../utils/format.js';
import { t as tr } from '../core/i18n.js';

const ICONS = {
  success: 'circle-check',
  error: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info',
};

// Errors interrupt; everything else is a polite status update.
const ASSERTIVE = { error: true, warning: true };

function stack() {
  let s = document.querySelector('.toast-stack');
  if (!s) {
    s = document.createElement('div');
    s.className = 'toast-stack';
    document.body.appendChild(s);
  }
  return s;
}

export function afxToast({ title = '', message = '', type = 'success', action = null, delay = 4000 } = {}) {
  const variant = ICONS[type] ? type : 'info';
  const s = stack();
  const el = document.createElement('div');
  el.className = 'toast';
  el.dataset.type = variant;
  el.setAttribute('role', ASSERTIVE[variant] ? 'alert' : 'status');
  el.setAttribute('aria-live', ASSERTIVE[variant] ? 'assertive' : 'polite');
  el.setAttribute('aria-atomic', 'true');

  const titleHtml = title ? `<span class="toast__title">${escapeHtml(title)}</span>` : '';
  const actionHtml = action
    ? `<button type="button" class="toast__action">${escapeHtml(action.label)}</button>`
    : '';

  el.innerHTML = `
    <span class="toast__icon" aria-hidden="true"><i data-lucide="${ICONS[variant]}"></i></span>
    <div class="toast__content">
      ${titleHtml}
      <span class="toast__message">${escapeHtml(message)}</span>
      ${actionHtml}
    </div>
    <button type="button" class="toast__close" aria-label="${escapeHtml(tr('aria.close'))}">
      <i data-lucide="x"></i>
    </button>`;

  s.appendChild(el);
  createIcons({ icons });

  const toast = Toast.getOrCreateInstance(el, { delay, autohide: !action });
  el.querySelector('.toast__action')?.addEventListener('click', () => {
    action.onClick?.();
    toast.hide();
  });
  el.querySelector('.toast__close')?.addEventListener('click', () => toast.hide());
  el.addEventListener('hidden.bs.toast', () => el.remove());
  toast.show();
  return el;
}

export function initToast() {
  // Ensure the stack container exists for programmatic use.
  stack();
}

window.afxToast = afxToast;
