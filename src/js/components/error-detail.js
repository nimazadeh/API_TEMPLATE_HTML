// =============================================================
// APIForge X — Error detail inspector
// Sentry/Vercel-style issue drawer: message + type, simulated stack
// trace (code well, LTR), request info, user context, environment,
// and actions to mark resolved / assign. Data-driven from
// mock-errors.json.
// =============================================================

import { Offcanvas } from '../core/bootstrap.js';
import { escapeHtml, relativeTime, absoluteTime, formatNumber } from '../utils/format.js';
import { bindCopyButton } from './copy.js';
import { createIcons, icons } from './icons.js';

const SEVERITY = {
  error: { label: 'Error', cls: 'badge-status--error', icon: 'alert-circle' },
  warning: { label: 'Warning', cls: 'badge-status--warning', icon: 'alert-triangle' },
};

const TEAM = ['Arash P.', 'Sara R.'];

function kvTable(rows) {
  return `<table class="kv"><tbody>${rows
    .map(([k, v]) => `<tr><th scope="row"><code class="ltr-isolate">${escapeHtml(k)}</code></th><td><code class="ltr-isolate">${escapeHtml(v)}</code></td></tr>`)
    .join('')}</tbody></table>`;
}

function stackBlock(error) {
  const lines = error.stackTrace.map((f, i) => {
    const frame = `at <span class="tok-kw">${escapeHtml(f.fn)}</span> (<span class="tok-str">${escapeHtml(f.file)}</span>:<span class="tok-num">${f.line}:${f.col}</span>)${f.inApp ? ' <span class="tok-com">[in-app]</span>' : ''}`;
    const code = f.code ? `<span class="stack-frame__code">${escapeHtml(f.code)}</span>` : '';
    return `<span class="stack-frame__line${i === 0 ? ' is-fault' : ''}">${frame}</span>${code ? `\n${code}` : ''}`;
  });
  return `
    <div class="code-block code-block--flush stack">
      <div class="code-block__header">
        <span class="code-block__lang"><i data-lucide="bug"></i> Stack trace</span>
        <div class="code-block__actions">
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy data-copy-target="#err-stack" aria-label="Copy stack trace"><i data-lucide="copy"></i></button>
        </div>
      </div>
      <pre class="code-block__body" id="err-stack"><code>${lines.join('\n')}</code></pre>
    </div>`;
}

export function openErrorDrawer(error, opts = {}) {
  const drawer = document.querySelector('#error-drawer');
  if (!drawer) return;
  const title = drawer.querySelector('.inspector-title');
  const body = drawer.querySelector('.offcanvas-body');
  if (title) title.textContent = error.id;

  const severity = SEVERITY[error.severity] || SEVERITY.error;
  const resolved = error.status === 'resolved';

  body.innerHTML = `
    <div class="inspector-head">
      <div class="d-flex align-items-center gap-2 flex-wrap mb-2">
        <span class="badge badge-status ${severity.cls}"><span class="dot"></span>${severity.label}</span>
        <span class="badge badge-neutral ltr-isolate">${escapeHtml(error.type)}</span>
        <span class="badge badge-status ${resolved ? 'badge-status--success' : 'badge-status--warning'}"><span class="dot"></span>${resolved ? 'Resolved' : 'Unresolved'}</span>
      </div>
      <div class="fw-medium text-body ltr-isolate" style="word-break:break-word">${escapeHtml(error.message)}</div>
      <div class="d-flex align-items-center gap-3 mt-2 text-secondary caption flex-wrap">
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="activity"></i> ${formatNumber(error.occurrences)} occurrences</span>
        <span class="d-inline-flex align-items-center gap-1" title="${escapeHtml(absoluteTime(error.lastSeen))}"><i data-lucide="calendar"></i> last seen ${relativeTime(error.lastSeen)}</span>
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="globe"></i> ${escapeHtml(error.environment)}</span>
        ${error.assignee ? `<span class="d-inline-flex align-items-center gap-1"><i data-lucide="users"></i> ${escapeHtml(error.assignee)}</span>` : ''}
      </div>
      <div class="d-flex align-items-center gap-2 mt-3">
        <button type="button" class="btn btn-sm btn-secondary" data-error-action="resolve"><i data-lucide="circle-check"></i> ${resolved ? 'Reopen' : 'Mark resolved'}</button>
        <div class="dropdown" data-error-assign>
          <button type="button" class="btn btn-sm btn-ghost" data-bs-toggle="dropdown" aria-expanded="false"><i data-lucide="users"></i> Assign</button>
          <div class="dropdown-menu">
            ${TEAM.map((name) => `<button type="button" class="dropdown-item" data-assign="${escapeHtml(name)}"><i data-lucide="users"></i> ${escapeHtml(name)}</button>`).join('')}
            <hr class="dropdown-divider" />
            <button type="button" class="dropdown-item" data-assign=""><i data-lucide="ban"></i> Unassigned</button>
          </div>
        </div>
      </div>
    </div>

    <section class="inspector-section">
      <h4 class="inspector-label">Stack trace</h4>
      ${stackBlock(error)}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">Request information</h4>
      ${kvTable([
        ['Method', error.request.method],
        ['URL', error.request.url],
        ['API key', error.request.keyPrefix + '…'],
        ['User-Agent', error.request.userAgent],
        ['IP address', error.request.ip],
        ['Request ID', error.request.id],
      ])}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">User context</h4>
      ${kvTable([
        ['User ID', error.user.id],
        ['Email', error.user.email],
        ['Plan', error.user.plan],
      ])}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">Environment</h4>
      ${kvTable([
        ['Environment', error.environment],
        ['Endpoint', `${error.endpoint.method} ${error.endpoint.path}`],
        ['First seen', absoluteTime(error.firstSeen)],
        ['Last seen', absoluteTime(error.lastSeen)],
        ...(error.resolvedAt ? [['Resolved at', absoluteTime(error.resolvedAt)]] : []),
      ])}
    </section>`;

  createIcons({ icons });
  body.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  body.querySelector('[data-error-action]')?.addEventListener('click', () => opts.onResolve?.(error));
  body.querySelectorAll('[data-assign]').forEach((item) => {
    item.addEventListener('click', () => opts.onAssign?.(error, item.dataset.assign));
  });

  Offcanvas.getOrCreateInstance(drawer).show();
}
