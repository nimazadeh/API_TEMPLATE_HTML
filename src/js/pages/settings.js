// =============================================================
// APIForge X — Account settings
// General, developer preferences, security (2FA status UI + active
// sessions) and danger zone. Static HTML template — models the UI
// without claiming real server-side security.
// =============================================================

import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { ask, initConfirm } from '../components/confirm.js';
import { escapeHtml } from '../utils/format.js';

boot();
initConfirm({ modalId: 'confirm-modal', titleId: 'confirm-modal-title', bodyId: 'confirm-modal-body', submitId: 'confirm-modal-submit' });

const sessions = [
  { id: 's1', deviceKey: 'settings.deviceChrome', locationKey: 'settings.frankfurt', ip: '91.98.14.2', current: true, lastActiveKey: 'time.justNow' },
  { id: 's2', deviceKey: 'settings.deviceSafari', locationKey: 'settings.frankfurt', ip: '91.98.14.2', current: false, lastActiveKey: 'time.hoursAgo', lastActiveVars: { count: 2 } },
  { id: 's3', deviceKey: 'settings.deviceFirefox', locationKey: 'settings.berlin', ip: '185.22.9.41', current: false, lastActiveKey: 'time.daysAgo', lastActiveVars: { count: 3 } },
];

function renderSessions() {
  document.getElementById('session-list').innerHTML = sessions
    .map(
      (s) => `
      <div class="settings-section__row">
        <div class="d-flex align-items-center gap-3">
          <span class="empty-icon" style="width:32px;height:32px;margin:0"><i data-lucide="${s.deviceKey === 'settings.deviceSafari' ? 'smartphone' : 'monitor'}"></i></span>
          <div>
            <div class="settings-section__label">${escapeHtml(tr(s.deviceKey))}${s.current ? ` <span class="badge badge-accent ms-1">${tr('settings.currentDevice')}</span>` : ''}</div>
            <div class="settings-section__hint ltr-isolate">${escapeHtml(tr(s.locationKey))} · ${escapeHtml(s.ip)} · ${escapeHtml(tr(s.lastActiveKey, s.lastActiveVars))}</div>
          </div>
        </div>
        ${s.current ? '' : `<button type="button" class="btn btn-sm btn-ghost is-danger" data-revoke-session>${tr('action.revoke')}</button>`}
      </div>`
    )
    .join('');
}

function bindSessions() {
  document.getElementById('session-list').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-revoke-session]');
    if (!btn) return;
    const row = btn.closest('.settings-section__row');
    const ok = await ask({ title: tr('settings.revokeSessionTitle'), body: tr('settings.revokeSessionBody'), confirmLabel: tr('action.revoke'), danger: true });
    if (ok) {
      row.remove();
      afxToast({ message: tr('settings.sessionRevoked'), type: 'info' });
    }
  });
}

function bindDanger() {
  document.getElementById('danger-transfer').addEventListener('click', async () => {
    const ok = await ask({ title: tr('settings.transferOwnership'), body: tr('settings.transferBody'), confirmLabel: tr('action.transfer'), danger: true });
    if (ok) afxToast({ message: tr('settings.transferDemo'), type: 'info' });
  });

  document.getElementById('danger-delete').addEventListener('click', async () => {
    const ok = await ask({ title: tr('settings.deleteWorkspace'), body: tr('settings.deleteBody'), confirmLabel: tr('settings.deleteWorkspace'), danger: true });
    if (ok) afxToast({ message: tr('settings.deleteDemo'), type: 'info' });
  });
}

function bindGeneral() {
  document.getElementById('settings-save').addEventListener('click', () => {
    afxToast({ message: tr('settings.saved'), type: 'success' });
  });
}

function bindSecurity() {
  document.getElementById('fa-toggle').addEventListener('click', async () => {
    const ok = await ask({
      title: tr('settings.twoFactor'),
      body: 'Demo action — 2FA enrollment and recovery codes are simulated in this prototype. No security backend is configured.',
      confirmLabel: 'OK',
    });
    if (ok) afxToast({ message: 'Demo action — 2FA management is simulated.', type: 'info' });
  });
}

function render() {
  renderSessions();
}

render();
bindSessions();
bindDanger();
bindGeneral();
bindSecurity();
createIcons({ icons });

// Re-render when the locale flips.
onLocaleChange(render);
