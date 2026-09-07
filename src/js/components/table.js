// =============================================================
// APIForge X — Table renderers (mock data → <tr>)
// Logs & keys for the style guide. Real pages (Phase 2+) reuse these
// builders with URL-state filters and pagination.
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
} from '../utils/format.js';
import { bindCopyButton } from './copy.js';

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
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(log.id)}" aria-label="Copy request ID" data-tooltip="Copy ID">
            <i data-lucide="copy"></i>
          </button>
        </span>
      </td>
      <td><code class="ltr-isolate mono-sm text-tertiary">${escapeHtml(log.keyPrefix)}</code></td>
    </tr>`;
}

export function keyRow(key) {
  const revoked = key.status === 'revoked';
  return `
    <tr class="is-clickable" tabindex="0">
      <td>
        <div class="fw-medium text-body">${escapeHtml(key.name)}</div>
        <div class="text-tertiary caption">Created ${escapeHtml(relativeTime(key.createdAt))}</div>
      </td>
      <td>
        <span class="d-inline-flex align-items-center gap-1">
          <code class="ltr-isolate mono-sm text-secondary">${escapeHtml(key.prefix)}…</code>
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(key.prefix)}" aria-label="Copy key" data-tooltip="Copy key">
            <i data-lucide="copy"></i>
          </button>
        </span>
      </td>
      <td>${key.scopes.map((s) => `<span class="badge badge-accent">${escapeHtml(s)}</span>`).join(' ')}</td>
      <td class="text-tertiary"><span class="tabular-nums">${escapeHtml(relativeTime(key.lastUsedAt))}</span></td>
      <td>
        <span class="badge badge-status ${revoked ? 'badge-status--error' : 'badge-status--success'}">
          <span class="dot"></span>${revoked ? 'Revoked' : 'Active'}
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

export function renderKeys(container, keys) {
  container.innerHTML = keys.map(keyRow).join('');
  container.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}
