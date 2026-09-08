import { localizedFixture } from '../data/localized.js';
// =============================================================
// APIForge X — Error detail inspector
// Sentry/Vercel-style issue drawer: message + type, simulated stack
// trace (code well, LTR), request info, user context, environment,
// and actions to mark resolved / assign. Data-driven from
// mock-errors.json.
// =============================================================

import { trackLocalizedView } from './localized-view.js';
import { Offcanvas } from '../core/bootstrap.js';
import { environmentLabel, escapeHtml, relativeTime, absoluteTime, formatNumber } from '../utils/format.js';
import { bindCopyButton } from './copy.js';
import { createIcons, icons } from './icons.js';
import { t } from '../core/i18n.js';

const SEVERITY = {
  error: { key: 'severity.error', cls: 'badge-status--error', icon: 'alert-circle' },
  warning: { key: 'severity.warning', cls: 'badge-status--warning', icon: 'alert-triangle' },
};

const TEAM = localizedFixture(['علی رضایی', 'سارا احمدی'], ['Ali Rezaei', 'Sara Ahmadi']);

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
        <span class="code-block__lang"><i data-lucide="bug"></i> ${t('errors.stackTrace')}</span>
        <div class="code-block__actions">
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy data-copy-target="#err-stack" aria-label="${t('aria.copyStackTrace')}"><i data-lucide="copy"></i></button>
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
        <span class="badge badge-status ${severity.cls}"><span class="dot"></span>${t(severity.key)}</span>
        <span class="badge badge-neutral ltr-isolate">${escapeHtml(error.type)}</span>
        <span class="badge badge-status ${resolved ? 'badge-status--success' : 'badge-status--warning'}"><span class="dot"></span>${resolved ? t('status.resolved') : t('status.unresolved')}</span>
      </div>
      <div class="fw-medium text-body ltr-isolate" style="word-break:break-word">${escapeHtml(error.message)}</div>
      <div class="d-flex align-items-center gap-3 mt-2 text-secondary caption flex-wrap">
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="activity"></i> ${formatNumber(error.occurrences)} ${t('errors.occurrencesUnit')}</span>
        <span class="d-inline-flex align-items-center gap-1" title="${escapeHtml(absoluteTime(error.lastSeen))}"><i data-lucide="calendar"></i> ${t('errors.lastSeenPrefix')} ${relativeTime(error.lastSeen)}</span>
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="globe"></i> ${escapeHtml(environmentLabel(error.environment))}</span>
        ${error.assignee ? `<span class="d-inline-flex align-items-center gap-1"><i data-lucide="users"></i> ${escapeHtml(error.assignee)}</span>` : ''}
      </div>
      <div class="d-flex align-items-center gap-2 mt-3">
        <button type="button" class="btn btn-sm btn-secondary" data-error-action="resolve"><i data-lucide="circle-check"></i> ${resolved ? t('errors.reopen') : t('errors.markResolved')}</button>
        <div class="dropdown" data-error-assign>
          <button type="button" class="btn btn-sm btn-ghost" data-bs-toggle="dropdown" aria-expanded="false"><i data-lucide="users"></i> ${t('errors.assign')}</button>
          <div class="dropdown-menu">
            ${TEAM.map((name) => `<button type="button" class="dropdown-item" data-assign="${escapeHtml(name)}"><i data-lucide="users"></i> ${escapeHtml(name)}</button>`).join('')}
            <hr class="dropdown-divider" />
            <button type="button" class="dropdown-item" data-assign=""><i data-lucide="ban"></i> ${t('errors.unassigned')}</button>
          </div>
        </div>
      </div>
    </div>

    <section class="inspector-section">
      <h4 class="inspector-label">${t('errors.stackTrace')}</h4>
      ${stackBlock(error)}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">${t('errors.requestInfo')}</h4>
      ${kvTable([
        [t('table.method'), error.request.method],
        [t('inspector.url'), error.request.url],
        [t('inspector.apiKey'), error.request.keyPrefix + '…'],
        [t('inspector.userAgent'), error.request.userAgent],
        [t('inspector.ip'), error.request.ip],
        [t('table.requestId'), error.request.id],
      ])}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">${t('errors.userContext')}</h4>
      ${kvTable([
        [t('inspector.userId'), error.user.id],
        [t('table.email'), error.user.email],
        [t('inspector.plan'), t({ Scale: 'pricing.scale', Pro: 'pricing.pro', Developer: 'shell.developer' }[error.user.plan] || error.user.plan)],
      ])}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">${t('inspector.environment')}</h4>
      ${kvTable([
        [t('inspector.environment'), environmentLabel(error.environment)],
        [t('table.endpoint'), `${error.endpoint.method} ${error.endpoint.path}`],
        [t('errors.firstSeen'), absoluteTime(error.firstSeen)],
        [t('errors.lastSeen'), absoluteTime(error.lastSeen)],
        ...(error.resolvedAt ? [[t('errors.resolvedAt'), absoluteTime(error.resolvedAt)]] : []),
      ])}
    </section>`;

  createIcons({ icons });
  body.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  body.querySelector('[data-error-action]')?.addEventListener('click', () => opts.onResolve?.(error));
  body.querySelectorAll('[data-assign]').forEach((item) => {
    item.addEventListener('click', () => opts.onAssign?.(error, item.dataset.assign));
  });

  trackLocalizedView(drawer, () => openErrorDrawer(error, opts));
  Offcanvas.getOrCreateInstance(drawer).show();
}
