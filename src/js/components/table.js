// =============================================================
// APIForge X — Table renderers (mock data → <tr>)
// Logs & keys used by the app pages + style guide. Page modules reuse
// these builders with URL-state filters and pagination.
// =============================================================

import { createIcons, icons } from './icons.js';
import {
  escapeHtml,
  relativeTime,
  absoluteTime,
  latencyClass,
  latencyText,
  statusBadgeClass,
  methodBadgeClass,
  formatDate,
} from '../utils/format.js';
import { bindCopyButton } from './copy.js';
import { t } from '../core/i18n.js';

export function logRow(log) {
  return `
    <tr class="is-clickable" tabindex="0" data-id="${escapeHtml(log.id)}">
      <td class="text-tertiary" title="${escapeHtml(absoluteTime(log.timestamp))}">
        <span class="tabular-nums">${escapeHtml(relativeTime(log.timestamp))}</span>
      </td>
      <td><span class="badge badge-method ${methodBadgeClass(log.method)}">${escapeHtml(log.method)}</span></td>
      <td><code class="ltr-isolate mono-sm text-body">${escapeHtml(log.path)}</code></td>
      <td><span class="badge badge-status ${statusBadgeClass(log.status)}"><span class="dot"></span>${log.status}</span></td>
      <td class="cell-num"><span class="latency ${latencyClass(log.latencyMs)}">${latencyText(log.latencyMs)}</span></td>
      <td>
        <span class="d-inline-flex align-items-center gap-1">
          <code class="ltr-isolate mono-sm text-secondary">${escapeHtml(log.id)}</code>
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(log.id)}" aria-label="${t('aria.copyRequestId')}" data-bs-toggle="tooltip" data-bs-title="${t('aria.copyId')}">
            <i data-lucide="copy"></i>
          </button>
        </span>
      </td>
      <td><code class="ltr-isolate mono-sm text-tertiary">${escapeHtml(log.keyPrefix)}</code></td>
    </tr>`;
}

/**
 * Full log row for the Logs explorer — status/method/endpoint/latency/
 * timestamp/request-id/key. `openLogDrawer` is bound on click by the page.
 */
export function logRowFull(log) {
  return `
    <tr class="is-clickable" tabindex="0" data-id="${escapeHtml(log.id)}" data-env="${escapeHtml(log.env)}" data-method="${escapeHtml(log.method)}" data-status="${log.status}">
      <td><span class="badge badge-status ${statusBadgeClass(log.status)}"><span class="dot"></span>${log.status}</span></td>
      <td><span class="badge badge-method ${methodBadgeClass(log.method)}">${escapeHtml(log.method)}</span></td>
      <td><code class="ltr-isolate mono-sm text-body">${escapeHtml(log.path)}</code></td>
      <td class="cell-num"><span class="latency ${latencyClass(log.latencyMs)}">${latencyText(log.latencyMs)}</span></td>
      <td class="text-secondary tabular-nums" title="${escapeHtml(absoluteTime(log.timestamp))}">${escapeHtml(relativeTime(log.timestamp))}</td>
      <td>
        <span class="d-inline-flex align-items-center gap-1">
          <code class="ltr-isolate mono-sm text-secondary">${escapeHtml(log.id)}</code>
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(log.id)}" aria-label="${t('common.copy-request-id')}" data-bs-toggle="tooltip" data-bs-title="${t('common.copy-id')}">
            <i data-lucide="copy"></i>
          </button>
        </span>
      </td>
      <td><code class="ltr-isolate mono-sm text-tertiary">${escapeHtml(log.keyPrefix)}</code></td>
    </tr>`;
}

export function keyRow(key) {
  const revoked = key.status === 'revoked';
  const permissionLabel = key.permission === 'full' ? t('keys.permissionFull') : t('keys.permissionRestricted');
  return `
    <tr class="is-clickable" tabindex="0" data-id="${escapeHtml(key.id)}">
      <td>
        <div class="fw-medium text-body">${escapeHtml(key.name)}</div>
        <div class="text-tertiary caption">${t('keys.created')} ${escapeHtml(formatDate(key.createdAt))}</div>
      </td>
      <td>
        <span class="d-inline-flex align-items-center gap-1">
          <code class="ltr-isolate mono-sm text-secondary">${escapeHtml(key.prefix)}…</code>
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(key.prefix)}" aria-label="${t('aria.copyKey')}" data-bs-toggle="tooltip" data-bs-title="${t('aria.copyKey')}">
            <i data-lucide="copy"></i>
          </button>
        </span>
      </td>
      <td>
        <span class="badge ${revoked ? 'badge-neutral' : 'badge-accent'}">${permissionLabel}</span>
      </td>
      <td>
        <span class="badge ${key.env === 'live' ? 'badge-status--success' : 'badge-status--info'}"><span class="dot"></span>${key.env === 'live' ? t('env.liveOption') : t('env.testOption')}</span>
      </td>
      <td class="text-secondary tabular-nums" title="${escapeHtml(absoluteTime(key.lastUsedAt))}">${escapeHtml(relativeTime(key.lastUsedAt))}</td>
      <td class="text-tertiary">
        <span class="d-inline-flex align-items-center gap-2">
          <span class="badge badge-status ${revoked ? 'badge-status--error' : 'badge-status--success'}"><span class="dot"></span>${revoked ? t('status.revoked') : t('status.activePlain')}</span>
          <span class="row-actions dropdown" data-dropdown>
            <button type="button" class="btn btn-icon btn-icon--sm" data-bs-toggle="dropdown" aria-label="${t('aria.actionsFor', { name: escapeHtml(key.name) })}" aria-expanded="false">
              <i data-lucide="more-horizontal"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
              <button type="button" class="dropdown-item" data-key-action="reveal"><i data-lucide="eye"></i> ${t('action.reveal')}</button>
              <button type="button" class="dropdown-item" data-key-action="rotate"${revoked ? ' disabled' : ''}><i data-lucide="rotate-ccw"></i> ${t('action.rotate')}</button>
              <hr class="dropdown-divider" />
              <button type="button" class="dropdown-item is-danger" data-key-action="revoke"${revoked ? ' disabled' : ''}><i data-lucide="ban"></i> ${t('action.revoke')}</button>
            </div>
          </span>
        </span>
      </td>
    </tr>`;
}

export function renderLogs(container, logs, { limit } = {}) {
  const rows = (limit ? logs.slice(0, limit) : logs).map(logRow).join('');
  container.innerHTML = rows;
  container.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}

export function renderLogsFull(container, logs) {
  container.innerHTML = logs.map(logRowFull).join('');
  container.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}

export function renderKeys(container, keys) {
  container.innerHTML = keys.map(keyRow).join('');
  container.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}
