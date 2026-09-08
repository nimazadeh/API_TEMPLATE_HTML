// =============================================================
// APIForge X — Error monitoring
// Overview KPIs (total / endpoints / rate / resolved), a filterable
// issue list and a Sentry-style detail drawer (stack trace, request
// info, user context, resolve + assign). In-session mutation only.
// =============================================================

import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { openErrorDrawer } from '../components/error-detail.js';
import { afxToast } from '../components/toast.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { number } from '../utils/format.js';
import { escapeHtml, relativeTime, absoluteTime, formatNumber, percent, methodBadgeClass } from '../utils/format.js';
import errorsData from '../data/mock-errors.json';
import endpointsData from '../data/mock-endpoints.json';
import plan from '../data/mock-plan.json';

boot();

const errors = [...errorsData]; // in-session mutable copy

const SEVERITY_BADGE = { error: 'badge-status--error', warning: 'badge-status--warning' };
const ENV = { live: 'env.production', staging: 'env.staging', test: 'env.testOption' };

const state = { search: '', severity: 'all', status: 'all', env: 'all' };

function filtered() {
  const q = state.search.trim().toLowerCase();
  return errors.filter((e) => {
    if (q && !`${e.message} ${e.endpoint.path} ${e.type}`.toLowerCase().includes(q)) return false;
    if (state.severity !== 'all' && e.severity !== state.severity) return false;
    if (state.status !== 'all' && e.status !== state.status) return false;
    if (state.env !== 'all' && e.environment !== state.env) return false;
    return true;
  });
}

// --- Overview ---------------------------------------------------------------
function renderOverview() {
  const total = errors.reduce((s, e) => s + e.occurrences, 0);
  const endpoints = new Set(errors.map((e) => `${e.endpoint.method} ${e.endpoint.path}`)).size;
  const rate = (total / plan.requestsUsed) * 100;
  const resolved = errors.filter((e) => e.status === 'resolved').length;

  document.getElementById('err-total').innerHTML = `
    <span class="kpi-label">Total errors</span>
    <span class="kpi-value">${formatNumber(total)}</span>
    <span class="stat-foot">occurrences across all endpoints</span>`;
  document.getElementById('err-endpoints').innerHTML = `
    <span class="kpi-label">Affected endpoints</span>
    <span class="kpi-value">${endpoints}</span>
    <span class="stat-foot">of ${endpointsData.length} endpoints</span>`;
  document.getElementById('err-rate').innerHTML = `
    <span class="kpi-label">Error rate</span>
    <span class="kpi-value">${percent(rate, 2)}</span>
    <span class="stat-foot">of requests · last 30 days</span>`;
  document.getElementById('err-resolved').innerHTML = `
    <span class="kpi-label">Resolved</span>
    <span class="kpi-value">${percent((resolved / errors.length) * 100, 0)}</span>
    <span class="stat-foot">${resolved} of ${errors.length} issues</span>`;
}

// --- Rendering ---------------------------------------------------------------
function render() {
  const tbody = document.getElementById('error-list');
  const list = filtered();
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
      <span class="empty-icon"><i data-lucide="bug"></i></span>
      <h4 class="empty-title">${tr('errors.emptyTitle')}</h4>
      <p class="empty-desc mb-0">${tr('errors.emptyDesc')}</p>
    </div></td></tr>`;
  } else {
    tbody.innerHTML = list
      .map(
        (e) => `
        <tr class="is-clickable" tabindex="0" data-id="${escapeHtml(e.id)}">
          <td><span class="badge badge-status ${SEVERITY_BADGE[e.severity] || 'badge-status--neutral'}"><span class="dot"></span>${e.severity === 'error' ? 'Error' : 'Warning'}</span></td>
          <td>
            <div class="fw-medium text-body text-truncate" style="max-width:380px" title="${escapeHtml(e.message)}">${escapeHtml(e.message)}</div>
            <div class="text-tertiary caption ltr-isolate">${escapeHtml(e.type)}${e.assignee ? ` · assigned to ${escapeHtml(e.assignee)}` : ''}</div>
          </td>
          <td><span class="d-inline-flex align-items-center gap-2"><span class="badge badge-method ${methodBadgeClass(e.endpoint.method)}">${e.endpoint.method}</span><code class="ltr-isolate mono-sm text-secondary">${escapeHtml(e.endpoint.path)}</code></span></td>
          <td class="cell-num">${formatNumber(e.occurrences)}</td>
          <td class="text-secondary" title="${escapeHtml(absoluteTime(e.lastSeen))}">${relativeTime(e.lastSeen)} · ${ENV[e.environment] || e.environment}</td>
        </tr>`
      )
      .join('');
  }
  document.getElementById('error-count').textContent = tr('errors.countOf', { shown: number(list.length), total: number(errors.length) });
  createIcons({ icons });
}

// --- Actions ---------------------------------------------------------------
function onResolve(e) {
  if (e.status === 'resolved') {
    e.status = 'unresolved';
    e.resolvedAt = null;
    afxToast({ message: tr('errors.toastReopened'), type: 'info' });
  } else {
    e.status = 'resolved';
    e.resolvedAt = new Date().toISOString();
    afxToast({ message: tr('errors.toastResolved'), type: 'success' });
  }
  render();
  openErrorDrawer(e, { onResolve, onAssign });
}

function onAssign(e, name) {
  e.assignee = name || null;
  afxToast({ message: name ? tr('errors.toastAssigned', { name }) : tr('errors.toastUnassigned'), type: 'success' });
  render();
  openErrorDrawer(e, { onResolve, onAssign });
}

// --- Wiring ---------------------------------------------------------------
renderOverview();
render();

const tbody = document.getElementById('error-list');
tbody.addEventListener('click', (e) => {
  const row = e.target.closest('tr[data-id]');
  if (row) {
    const error = errors.find((x) => x.id === row.dataset.id);
    if (error) openErrorDrawer(error, { onResolve, onAssign });
  }
});
tbody.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const row = e.target.closest('tr[data-id]');
  if (row) {
    e.preventDefault();
    const error = errors.find((x) => x.id === row.dataset.id);
    if (error) openErrorDrawer(error, { onResolve, onAssign });
  }
});

document.getElementById('error-search').addEventListener('input', (e) => {
  state.search = e.target.value;
  render();
});
document.getElementById('error-severity').addEventListener('change', (e) => {
  state.severity = e.target.value;
  render();
});
document.getElementById('error-status').addEventListener('change', (e) => {
  state.status = e.target.value;
  render();
});
document.getElementById('error-env').addEventListener('change', (e) => {
  state.env = e.target.value;
  render();
});

// Re-render when the locale flips.
onLocaleChange(render);
