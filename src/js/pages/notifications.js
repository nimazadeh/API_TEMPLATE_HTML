// =============================================================
// APIForge X — Notifications
// Developer infrastructure notification center: unread counts,
// category/severity filters, read/unread state, mark all read and
// a meaningful empty state.
// =============================================================

import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { number } from '../utils/format.js';
import { escapeHtml, relativeTime } from '../utils/format.js';
import notificationsData from '../data/mock-notifications.json';

boot();

const notifications = [...notificationsData];
const state = { category: 'all', severity: 'all', query: '' };

const CATEGORY_LABEL = {
  'api-errors': 'notifications.catApiErrors',
  webhook: 'notifications.catWebhook',
  'rate-limit': 'notifications.catRateLimit',
  deployment: 'notifications.catDeployment',
  billing: 'notifications.catBilling',
  team: 'notifications.catTeam',
  security: 'notifications.catSecurity',
  error: 'notifications.catErrors',
};

const CATEGORY_ICON = {
  'api-errors': 'bug',
  webhook: 'webhook',
  'rate-limit': 'gauge',
  deployment: 'git-branch',
  billing: 'credit-card',
  team: 'users',
  security: 'shield-alert',
  error: 'alert-triangle',
};

const SEVERITY_TONE = { error: 'is-error', warning: 'is-warning', success: 'is-success', info: 'is-info' };

function unreadCount() {
  return notifications.filter((n) => !n.read).length;
}

function filtered() {
  const q = state.query.trim().toLowerCase();
  return notifications.filter((n) => {
    if (state.category !== 'all' && n.category !== state.category) return false;
    if (state.severity !== 'all' && n.severity !== state.severity) return false;
    if (q && !`${n.title} ${n.body}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

function envBadge(env) {
  if (!env) return '';
  const label = tr(env === 'live' ? 'env.production' : env === 'staging' ? 'env.staging' : 'env.testOption');
  const cls = env === 'live' ? 'badge-status--success' : env === 'staging' ? 'badge-status--warning' : 'badge-status--info';
  return `<span class="badge badge-status ${cls}"><span class="dot"></span>${label}</span>`;
}

function row(n) {
  return `
    <div class="notification ${n.read ? '' : 'is-unread'}" data-id="${n.id}">
      <span class="notification__icon ${SEVERITY_TONE[n.severity] || 'is-neutral'}"><i data-lucide="${CATEGORY_ICON[n.category] || 'bell'}"></i></span>
      <div class="notification__body">
        <div class="notification__title">${escapeHtml(n.title)}</div>
        <div class="notification__text">${escapeHtml(n.body)}</div>
        <div class="notification__meta">
          <span class="ltr-isolate">${relativeTime(n.createdAt)}</span>
          <span>·</span>
          <span>${escapeHtml(tr(CATEGORY_LABEL[n.category] || '')) || escapeHtml(n.category)}</span>
          ${envBadge(n.env)}
        </div>
      </div>
      <div class="notification__actions">
        <button type="button" class="btn btn-icon btn-icon--sm" data-toggle-read aria-label="${n.read ? tr('notifications.markUnread') : tr('notifications.markRead')}"><i data-lucide="${n.read ? 'mail' : 'check-check'}"></i></button>
      </div>
    </div>`;
}

function render() {
  const list = filtered();
  const wrap = document.getElementById('notification-list');
  wrap.innerHTML = list.length
    ? list.map(row).join('')
    : `<div class="empty-state py-5"><span class="empty-icon"><i data-lucide="inbox"></i></span><h4 class="empty-title">${tr('notifications.emptyTitle')}</h4><p class="empty-desc mb-0">${tr('notifications.emptyDesc')}</p></div>`;

  document.getElementById('notification-count').textContent = tr('notifications.unreadCount', { count: number(unreadCount()) });
  document.getElementById('mark-all').disabled = unreadCount() === 0;
  createIcons({ icons });
}

function bind() {
  document.getElementById('notification-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toggle-read]');
    if (!btn) return;
    const el = btn.closest('.notification');
    const n = notifications.find((x) => x.id === el.dataset.id);
    if (!n) return;
    n.read = !n.read;
    render();
  });

  document.getElementById('mark-all').addEventListener('click', () => {
    notifications.forEach((n) => (n.read = true));
    render();
    afxToast({ message: tr('notifications.toastAllRead'), type: 'success' });
  });

  document.getElementById('notif-category').addEventListener('change', (e) => {
    state.category = e.target.value;
    render();
  });
  document.getElementById('notif-severity').addEventListener('change', (e) => {
    state.severity = e.target.value;
    render();
  });
  document.getElementById('notif-search').addEventListener('input', (e) => {
    state.query = e.target.value;
    render();
  });
}

render();
bind();

// Re-render when the locale flips.
onLocaleChange(render);
