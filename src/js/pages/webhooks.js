// =============================================================
// APIForge X — Webhooks debugger
// Endpoint list + recent-deliveries table, both opening the shared
// delivery drawer (timeline + payload/headers/response/signature).
// Retry / replay mutate the in-session copy and re-render; payload
// copy lives in the drawer. Data-driven from mock-*.json.
// =============================================================

import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { openDeliveryDrawer, renderDeliveryDrawer } from '../components/webhook-detail.js';
import { afxToast } from '../components/toast.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { escapeHtml, relativeTime, absoluteTime, latencyText } from '../utils/format.js';
import webhooksData from '../data/mock-webhooks.json';
import deliveriesData from '../data/mock-webhook-deliveries.json';

boot();

const webhooks = [...webhooksData];
const deliveries = [...deliveriesData];

const STATUS_BADGE = {
  delivered: 'badge-status--success',
  failed: 'badge-status--error',
  retrying: 'badge-status--warning',
  pending: 'badge-status--info',
};
const STATUS_LABEL = {
  delivered: 'webhooks.statusDelivered',
  failed: 'webhooks.statusFailed',
  retrying: 'webhooks.statusRetrying',
  pending: 'webhooks.statusPending',
};
const ENV = {
  live: { label: 'env.production', cls: 'badge-status--success' },
  staging: { label: 'env.staging', cls: 'badge-status--warning' },
  test: { label: 'env.testOption', cls: 'badge-status--info' },
};

function envBadge(env) {
  const e = ENV[env] || ENV.live;
  return `<span class="badge badge-status ${e.cls}"><span class="dot"></span>${tr(e.label)}</span>`;
}

function statusBadge(status) {
  return `<span class="badge badge-status ${STATUS_BADGE[status] || STATUS_BADGE.pending}"><span class="dot"></span>${tr(STATUS_LABEL[status] || STATUS_LABEL.pending)}</span>`;
}

function eventBadges(events) {
  const shown = events.slice(0, 2);
  const extra = events.length - shown.length;
  return `${shown.map((e) => `<span class="badge badge-accent ltr-isolate">${escapeHtml(e)}</span>`).join(' ')}${extra > 0 ? `<span class="badge badge-neutral">+${extra}</span>` : ''}`;
}

function attemptsFor(wh) {
  return deliveries.filter((d) => d.webhookId === wh.id).reduce((s, d) => s + d.attempts, 0);
}

function latestDelivery(wh) {
  return deliveries.find((d) => d.webhookId === wh.id) || null;
}

// --- Rendering -----------------------------------------------------------
function renderHealth() {
  const delivered = deliveries.filter((d) => d.status === 'delivered');
  const failed = deliveries.filter((d) => d.status !== 'delivered');
  const rate = deliveries.length ? Math.round((delivered.length / deliveries.length) * 1000) / 10 : 0;
  const avg = delivered.length ? Math.round(delivered.reduce((s, d) => s + d.latencyMs, 0) / delivered.length) : 0;
  document.getElementById('wh-endpoints').textContent = webhooks.length;
  document.getElementById('wh-success').textContent = `${rate}%`;
  document.getElementById('wh-failed').textContent = failed.length;
  document.getElementById('wh-latency').textContent = latencyText(avg);
}

function renderWebhooks() {
  const tbody = document.getElementById('webhook-list');
  if (!webhooks.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
      <span class="empty-icon"><i data-lucide="webhook"></i></span>
      <h4 class="empty-title">${tr('webhooks.noEndpointsTitle')}</h4>
      <p class="empty-desc mb-0">${tr('webhooks.noEndpointsDesc')}</p>
    </div></td></tr>`;
  } else {
    tbody.innerHTML = webhooks
      .map((wh) => {
        const last = wh.lastDeliveryAt;
        return `
        <tr class="is-clickable" tabindex="0" data-id="${escapeHtml(wh.id)}">
          <td>${eventBadges(wh.events)}</td>
          <td><code class="ltr-isolate mono-sm text-body d-block text-truncate" style="max-width:320px" title="${escapeHtml(wh.url)}">${escapeHtml(wh.url)}</code></td>
          <td><span class="badge ${wh.status === 'enabled' ? 'badge-status--success' : 'badge-neutral'}"><span class="dot"></span>${wh.status === 'enabled' ? 'Enabled' : 'Disabled'}</span></td>
          <td class="cell-num">${attemptsFor(wh)}</td>
          <td class="text-secondary" ${last ? `title="${escapeHtml(absoluteTime(last))}"` : ''}>${last ? relativeTime(last) : '—'}</td>
          <td>${envBadge(wh.environment)}</td>
        </tr>`;
      })
      .join('');
  }
  document.getElementById('webhook-count').textContent = `${webhooks.length} endpoints`;
}

function renderDeliveries() {
  const tbody = document.getElementById('delivery-list');
  if (!deliveries.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <span class="empty-icon"><i data-lucide="scroll-text"></i></span>
      <h4 class="empty-title">${tr('webhooks.noDeliveriesTitle')}</h4>
      <p class="empty-desc mb-0">${tr('webhooks.noDeliveriesDesc')}</p>
    </div></td></tr>`;
  } else {
    tbody.innerHTML = deliveries
      .map(
        (d) => `
        <tr class="is-clickable" tabindex="0" data-id="${escapeHtml(d.id)}">
          <td><span class="badge badge-accent ltr-isolate">${escapeHtml(d.event)}</span></td>
          <td><code class="ltr-isolate mono-sm text-secondary d-block text-truncate" style="max-width:280px" title="${escapeHtml(d.endpoint)}">${escapeHtml(d.endpoint)}</code></td>
          <td>${statusBadge(d.status)}</td>
          <td class="cell-num">${d.attempts}</td>
          <td class="latency ${d.latencyMs < 300 ? 'latency--fast' : d.latencyMs < 1000 ? 'latency--mid' : 'latency--slow'} cell-num">${latencyText(d.latencyMs)}</td>
          <td class="text-secondary" title="${escapeHtml(absoluteTime(d.createdAt))}">${relativeTime(d.createdAt)}</td>
          <td>${envBadge(d.environment)}</td>
        </tr>`
      )
      .join('');
  }
  document.getElementById('delivery-count').textContent = `${deliveries.length} deliveries`;
}

function render() {
  renderHealth();
  renderWebhooks();
  renderDeliveries();
  createIcons({ icons });
}

// --- Actions --------------------------------------------------------------
function onRetry(d) {
  d.attempts += 1;
  d.status = 'delivered';
  d.responseCode = 200;
  d.response = { status: 200, body: { ok: true } };
  const now = new Date().toISOString();
  d.timeline.push({ at: now, state: 'sent', code: null, latencyMs: null });
  d.timeline.push({ at: now, state: 'delivered', code: 200, latencyMs: d.latencyMs });
  afxToast({ message: tr('webhooks.toastRetried'), type: 'success' });
  render();
  renderDeliveryDrawer(d, { onRetry, onReplay });
}

function onReplay(d) {
  const copy = {
    ...d,
    id: `wd_replay_${Date.now().toString(36)}`,
    status: 'pending',
    attempts: 0,
    responseCode: null,
    response: null,
    createdAt: new Date().toISOString(),
    timeline: [],
  };
  deliveries.unshift(copy);
  afxToast({ message: tr('webhooks.toastReplayed'), type: 'success' });
  render();
}

function openFromRow(row, source) {
  if (source === 'webhook') {
    const wh = webhooks.find((w) => w.id === row.dataset.id);
    const d = wh && latestDelivery(wh);
    if (d) openDeliveryDrawer(d, { onRetry, onReplay });
    else afxToast({ message: tr('webhooks.toastNoDeliveries'), type: 'info' });
  } else {
    const d = deliveries.find((x) => x.id === row.dataset.id);
    if (d) openDeliveryDrawer(d, { onRetry, onReplay });
  }
}

// --- Wiring ---------------------------------------------------------------
render();

const webhookTbody = document.getElementById('webhook-list');
const deliveryTbody = document.getElementById('delivery-list');
for (const [tbody, source] of [[webhookTbody, 'webhook'], [deliveryTbody, 'delivery']]) {
  tbody.addEventListener('click', (e) => {
    const row = e.target.closest('tr[data-id]');
    if (row) openFromRow(row, source);
  });
  tbody.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const row = e.target.closest('tr[data-id]');
    if (row) {
      e.preventDefault();
      openFromRow(row, source);
    }
  });
}

document.getElementById('webhooks-refresh').addEventListener('click', () => {
  render();
  afxToast({ message: tr('webhooks.toastRefreshed'), type: 'info' });
});

// Re-render tables and badges when the locale flips.
onLocaleChange(render);
