// =============================================================
// APIForge X — Confirmation dialog (reusable primitive)
// One Bootstrap modal per page can host confirmations for
// destructive/important actions. `ask()` resolves true when the
// user confirms. Configure ids per page so multiple pages can
// coexist without collision.
// =============================================================

import { trackLocalizedView } from './localized-view.js';
import { Modal } from '../core/bootstrap.js';
import { t } from '../core/i18n.js';

let pending = null;

/**
 * Open the confirmation modal and resolve the returned promise with
 * `true` when confirmed. `{ title, body, confirmLabel, danger }`.
 * Text options can be functions to resolve again when the locale changes.
 */
export function ask(opts = {}) {
  const modal = document.getElementById(opts.modalId || 'confirm-modal');
  const titleEl = document.getElementById(opts.titleId || 'confirm-modal-title');
  const bodyEl = document.getElementById(opts.bodyId || 'confirm-modal-body');
  const submit = document.getElementById(opts.submitId || 'confirm-modal-submit');

  const resolveText = (value) => typeof value === 'function' ? value() : value;
  const paint = () => {
    if (titleEl) titleEl.textContent = resolveText(opts.title) || t('confirm.areYouSure');
    if (bodyEl) bodyEl.textContent = resolveText(opts.body) || '';
    if (submit) {
      submit.textContent = resolveText(opts.confirmLabel) || t('action.confirm');
      submit.className = `btn ${opts.danger ? 'btn-danger' : 'btn-primary'}`;
    }
  };
  paint();
  trackLocalizedView(modal, paint);

  return new Promise((resolve) => {
    pending = resolve;
    Modal.getOrCreateInstance(modal).show();
  });
}

/** Wire the submit button to resolve the pending promise. */
export function initConfirm(opts = {}) {
  const modal = document.getElementById(opts.modalId || 'confirm-modal');
  const submit = document.getElementById(opts.submitId || 'confirm-modal-submit');
  submit.addEventListener('click', () => {
    Modal.getOrCreateInstance(modal).hide();
    // Wait for the hide transition before continuing.
    setTimeout(() => {
      const resolve = pending;
      pending = null;
      resolve?.(true);
    }, 320);
  });
}
