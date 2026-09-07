// =============================================================
// APIForge X — Toast (Bootstrap-backed)
// afxToast({ message, type, action, delay }) builds a Bootstrap toast,
// shows it, and cleans up on hide. `action` (e.g. Undo) disables
// auto-hide so the user has time to react.
// =============================================================

import { Toast } from '../core/bootstrap.js';
import { createIcons, icons } from './icons.js';
import { escapeHtml } from '../utils/format.js';

const ICONS = { success: 'check', error: 'alert-circle', info: 'info' };

function stack() {
  let s = document.querySelector('.toast-stack');
  if (!s) {
    s = document.createElement('div');
    s.className = 'toast-stack';
    document.body.appendChild(s);
  }
  return s;
}

export function afxToast({ message = '', type = 'success', action = null, delay = 4000 } = {}) {
  const s = stack();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <span class="toast__icon is-${type}"><i data-lucide="${ICONS[type] || 'info'}"></i></span>
      <span class="toast__msg">${escapeHtml(message)}</span>
      ${action ? `<button type="button" class="btn btn-sm btn-ghost toast__action">${escapeHtml(action.label)}</button>` : ''}
    </div>`;
  s.appendChild(el);
  createIcons({ icons });

  const toast = Toast.getOrCreateInstance(el, { delay, autohide: !action });
  const actionBtn = el.querySelector('.toast__action');
  actionBtn?.addEventListener('click', () => {
    action.onClick?.();
    toast.hide();
  });
  el.addEventListener('hidden.bs.toast', () => el.remove());
  toast.show();
  return el;
}

export function initToast() {
  // Ensure the stack container exists for programmatic use.
  stack();
}

window.afxToast = afxToast;
