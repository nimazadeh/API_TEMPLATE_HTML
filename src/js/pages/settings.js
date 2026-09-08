// =============================================================
// APIForge X — Account settings
// General, developer preferences, security (2FA status UI + active
// sessions) and danger zone. Static HTML template — models the UI
// without claiming real server-side security.
// =============================================================

import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';
import { ask, initConfirm } from '../components/confirm.js';
import { escapeHtml } from '../utils/format.js';

boot();
initConfirm({ modalId: 'confirm-modal', titleId: 'confirm-modal-title', bodyId: 'confirm-modal-body', submitId: 'confirm-modal-submit' });

const sessions = [
  { id: 's1', device: 'Chrome on macOS', location: 'Frankfurt, DE', ip: '91.98.14.2', current: true, lastActive: 'Now' },
  { id: 's2', device: 'Safari on iPhone', location: 'Frankfurt, DE', ip: '91.98.14.2', current: false, lastActive: '2h ago' },
  { id: 's3', device: 'Firefox on Linux', location: 'Berlin, DE', ip: '185.22.9.41', current: false, lastActive: '3d ago' },
];

function renderSessions() {
  document.getElementById('session-list').innerHTML = sessions
    .map(
      (s) => `
      <div class="settings-section__row">
        <div class="d-flex align-items-center gap-3">
          <span class="empty-icon" style="width:32px;height:32px;margin:0"><i data-lucide="${s.device.includes('iPhone') ? 'smartphone' : 'monitor'}"></i></span>
          <div>
            <div class="settings-section__label">${escapeHtml(s.device)}${s.current ? ' <span class="badge badge-accent ms-1">Current</span>' : ''}</div>
            <div class="settings-section__hint ltr-isolate">${escapeHtml(s.location)} · ${escapeHtml(s.ip)} · ${escapeHtml(s.lastActive)}</div>
          </div>
        </div>
        ${s.current ? '' : '<button type="button" class="btn btn-sm btn-ghost is-danger" data-revoke-session>Revoke</button>'}
      </div>`
    )
    .join('');
}

function bindSessions() {
  document.getElementById('session-list').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-revoke-session]');
    if (!btn) return;
    const row = btn.closest('.settings-section__row');
    const ok = await ask({ title: 'Revoke session', body: 'This device will be signed out immediately.', confirmLabel: 'Revoke', danger: true });
    if (ok) {
      row.remove();
      afxToast({ message: 'Session revoked (demo).', type: 'info' });
    }
  });
}

function bindDanger() {
  document.getElementById('danger-transfer').addEventListener('click', async () => {
    const ok = await ask({ title: 'Transfer ownership', body: 'Transfer workspace ownership to another admin? This cannot be undone.', confirmLabel: 'Transfer', danger: true });
    if (ok) afxToast({ message: 'Demo action — ownership transfer is simulated.', type: 'info' });
  });

  document.getElementById('danger-delete').addEventListener('click', async () => {
    const ok = await ask({ title: 'Delete workspace', body: 'This permanently deletes the workspace, all keys, logs and webhooks. This cannot be undone.', confirmLabel: 'Delete workspace', danger: true });
    if (ok) afxToast({ message: 'Demo action — workspace deletion is simulated.', type: 'info' });
  });
}

function bindGeneral() {
  document.getElementById('settings-save').addEventListener('click', () => {
    afxToast({ message: 'Settings saved (demo).', type: 'success' });
  });
}

function bindSecurity() {
  document.getElementById('fa-toggle').addEventListener('click', async () => {
    const ok = await ask({
      title: 'Two-factor authentication',
      body: 'Demo action — 2FA enrollment and recovery codes are simulated in this prototype. No security backend is configured.',
      confirmLabel: 'OK',
    });
    if (ok) afxToast({ message: 'Demo action — 2FA management is simulated.', type: 'info' });
  });
}

renderSessions();
bindSessions();
bindDanger();
bindGeneral();
bindSecurity();
createIcons({ icons });
