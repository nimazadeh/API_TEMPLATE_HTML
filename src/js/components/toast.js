// =============================================================
// APIForge X — Toast
// afxToast({ message, type, action }) → transient feedback with an
// optional action (e.g. Undo). Stacks bottom-end, auto-dismisses.
// =============================================================

import { createIcons, icons } from './icons.js';
import { escapeHtml } from '../utils/format.js';

function stack() {
  let s = document.querySelector('.toast-stack');
  if (!s) {
    s = document.createElement('div');
    s.className = 'toast-stack';
    document.body.appendChild(s);
  }
  return s;
}

export function afxToast({ message, type = 'success', action = null, duration = 4000 } = {}) {
  const s = stack();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  const icon = type === 'success' ? 'check' : type === 'error' ? 'alert-circle' : 'info';
  toast.innerHTML = `
    <span class="toast__icon"><i data-lucide="${icon}"></i></span>
    <span class="toast__msg">${escapeHtml(message)}</span>
    ${action ? `<button type="button" class="btn btn-sm btn-ghost toast__action">${action.label}</button>` : ''}`;
  s.appendChild(toast);
  createIcons({ icons });

  const dismiss = () => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 220);
  };
  const actionBtn = toast.querySelector('.toast__action');
  actionBtn?.addEventListener('click', () => {
    action.onClick?.();
    dismiss();
  });

  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(dismiss, duration);
  return toast;
}

export function initToast() {
  // Ensure the stack exists for programmatic use.
  stack();
}

window.afxToast = afxToast;
