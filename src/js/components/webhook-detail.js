// =============================================================
// APIForge X — Webhook delivery inspector
// Renders a single webhook delivery into the shared offcanvas drawer:
// status head, attempt timeline (created → sent → delivered/failed/
// retrying), and a Payload / Headers / Response / Signature inspector.
// 100% data-driven from mock-webhook-deliveries.json (no regeneration).
// =============================================================

import { Offcanvas } from '../core/bootstrap.js';
import { escapeHtml, latencyText, relativeTime, absoluteTime } from '../utils/format.js';
import { copyText, flashCopied, bindCopyButton } from './copy.js';
import { highlightJson } from './code-block.js';
import { createIcons, icons } from './icons.js';

const STATUS = {
  delivered: { label: 'Delivered', cls: 'badge-status--success' },
  failed: { label: 'Failed', cls: 'badge-status--error' },
  retrying: { label: 'Retrying', cls: 'badge-status--warning' },
  pending: { label: 'Pending', cls: 'badge-status--info' },
};

const TIMELINE_STATES = {
  created: { label: 'Delivery created', icon: 'clock', cls: 'is-neutral' },
  sent: { label: 'Request sent', icon: 'arrow-up-right', cls: 'is-info' },
  delivered: { label: 'Delivered', icon: 'circle-check', cls: 'is-success' },
  failed: { label: 'Delivery failed', icon: 'alert-circle', cls: 'is-error' },
  retrying: { label: 'Retrying', icon: 'rotate-ccw', cls: 'is-pending' },
};

const DASH = '—';

function kvTable(rows) {
  return `<table class="kv"><tbody>${rows
    .map(([k, v]) => `<tr><th scope="row"><code class="ltr-isolate">${escapeHtml(k)}</code></th><td><code class="ltr-isolate">${escapeHtml(v)}</code></td></tr>`)
    .join('')}</tbody></table>`;
}

/** A dark JSON well with a copy button targeting the given code id. */
function jsonWell(title, icon, codeId, rawText) {
  return `
    <div class="code-block code-block--flush">
      <div class="code-block__header">
        <span class="code-block__lang"><i data-lucide="${icon}"></i> ${escapeHtml(title)}</span>
        <div class="code-block__actions">
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy data-copy-target="#${codeId}" aria-label="Copy ${escapeHtml(title)}"><i data-lucide="copy"></i></button>
        </div>
      </div>
      <pre class="code-block__body" id="${codeId}"><code>${highlightJson(rawText)}</code></pre>
    </div>`;
}

function timelineItem(entry) {
  const state = TIMELINE_STATES[entry.state] || TIMELINE_STATES.created;
  const metaBits = [];
  metaBits.push(new Date(entry.at).toLocaleTimeString('en-GB'));
  if (entry.code) metaBits.push(String(entry.code));
  if (entry.latencyMs != null) metaBits.push(latencyText(entry.latencyMs));
  return `
    <li class="timeline__item">
      <div class="timeline__rail"><span class="timeline__node ${state.cls}"><i data-lucide="${state.icon}"></i></span></div>
      <div class="timeline__content">
        <div class="timeline__title">${state.label}</div>
        <div class="timeline__meta">${metaBits.join(' · ')}</div>
      </div>
    </li>`;
}

export function renderDeliveryDrawer(delivery, opts = {}) {
  const drawer = document.querySelector('#delivery-drawer');
  if (!drawer) return;
  const title = drawer.querySelector('.inspector-title');
  const body = drawer.querySelector('.offcanvas-body');
  if (title) title.textContent = delivery.id;

  const status = STATUS[delivery.status] || STATUS.pending;
  const payloadText = JSON.stringify(delivery.payload, null, 2);
  const responseText = delivery.response ? JSON.stringify(delivery.response.body, null, 2) : null;
  const canRetry = delivery.status !== 'delivered';

  body.innerHTML = `
    <div class="inspector-head">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="badge badge-accent ltr-isolate">${escapeHtml(delivery.event)}</span>
        <span class="badge badge-status ${status.cls}"><span class="dot"></span>${status.label}</span>
        ${delivery.responseCode ? `<span class="badge badge-neutral ltr-isolate">${delivery.responseCode}</span>` : ''}
      </div>
      <div class="mt-2">
        <code class="ltr-isolate mono-sm text-body" style="word-break:break-all">${escapeHtml(delivery.endpoint)}</code>
      </div>
      <div class="d-flex align-items-center gap-3 mt-2 text-secondary caption flex-wrap">
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="rotate-ccw"></i> ${delivery.attempts} attempt${delivery.attempts === 1 ? '' : 's'}</span>
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="timer"></i> ${latencyText(delivery.latencyMs)}</span>
        <span class="d-inline-flex align-items-center gap-1" title="${escapeHtml(absoluteTime(delivery.createdAt))}"><i data-lucide="calendar"></i> ${relativeTime(delivery.createdAt)}</span>
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="globe"></i> ${escapeHtml(delivery.environment)}</span>
      </div>
      <div class="d-flex align-items-center gap-2 mt-3">
        <button type="button" class="btn btn-sm btn-secondary" data-delivery-action="retry"${canRetry ? '' : ' disabled'}><i data-lucide="rotate-ccw"></i> Retry delivery</button>
        <button type="button" class="btn btn-sm btn-secondary" data-delivery-action="replay"><i data-lucide="play"></i> Replay event</button>
        <button type="button" class="btn btn-sm btn-ghost" data-delivery-action="copy-payload"><i data-lucide="copy"></i> Copy payload</button>
      </div>
    </div>

    <section class="inspector-section">
      <h4 class="inspector-label">Delivery timeline</h4>
      ${delivery.timeline && delivery.timeline.length
        ? `<ul class="timeline">${delivery.timeline.map(timelineItem).join('')}</ul>`
        : `<div class="text-secondary caption">Queued — no attempts yet.</div>`}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">Payload inspector</h4>
      <ul class="nav nav-pills mb-3" role="tablist" aria-label="Payload inspector">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="wd-tab-payload" data-bs-toggle="tab" data-bs-target="#wd-pane-payload" type="button" role="tab" aria-controls="wd-pane-payload" aria-selected="true"><i data-lucide="braces"></i> Payload</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="wd-tab-headers" data-bs-toggle="tab" data-bs-target="#wd-pane-headers" type="button" role="tab" aria-controls="wd-pane-headers" aria-selected="false"><i data-lucide="file-text"></i> Headers</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="wd-tab-response" data-bs-toggle="tab" data-bs-target="#wd-pane-response" type="button" role="tab" aria-controls="wd-pane-response" aria-selected="false"><i data-lucide="terminal"></i> Response</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="wd-tab-signature" data-bs-toggle="tab" data-bs-target="#wd-pane-signature" type="button" role="tab" aria-controls="wd-pane-signature" aria-selected="false"><i data-lucide="shield-check"></i> Signature</button>
        </li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane fade show active" id="wd-pane-payload" role="tabpanel" aria-labelledby="wd-tab-payload">
          ${jsonWell('Event payload', 'file-json', 'wd-payload-code', payloadText)}
        </div>
        <div class="tab-pane fade" id="wd-pane-headers" role="tabpanel" aria-labelledby="wd-tab-headers">
          ${kvTable(delivery.headers)}
        </div>
        <div class="tab-pane fade" id="wd-pane-response" role="tabpanel" aria-labelledby="wd-tab-response">
          ${delivery.response
            ? `
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge badge-status ${delivery.response.status < 300 ? 'badge-status--success' : 'badge-status--error'}"><span class="dot"></span>${delivery.response.status}</span>
                <span class="text-secondary caption">HTTP response body</span>
              </div>
              ${jsonWell('Response body', 'terminal', 'wd-response-code', responseText)}`
            : `<div class="empty-state py-4">
                <span class="empty-icon"><i data-lucide="clock"></i></span>
                <h4 class="empty-title">Awaiting response</h4>
                <p class="empty-desc mb-0">This delivery has not received a response yet.</p>
              </div>`}
        </div>
        <div class="tab-pane fade" id="wd-pane-signature" role="tabpanel" aria-labelledby="wd-tab-signature">
          <div class="code-block code-block--flush mb-2">
            <div class="code-block__header">
              <span class="code-block__lang"><i data-lucide="shield-check"></i> Signature</span>
              <div class="code-block__actions">
                <button type="button" class="btn btn-icon btn-icon--sm" data-copy data-copy-target="#wd-signature-code" aria-label="Copy signature"><i data-lucide="copy"></i></button>
              </div>
            </div>
            <pre class="code-block__body" id="wd-signature-code"><code>${escapeHtml(delivery.signature)}</code></pre>
          </div>
          <p class="text-secondary caption">
            Each delivery is signed with HMAC-SHA256 using your endpoint's signing
            secret. Verify the signature before processing the event.
          </p>
        </div>
      </div>
    </section>`;

  createIcons({ icons });
  body.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  body.querySelectorAll('[data-delivery-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.deliveryAction;
      if (action === 'retry') opts.onRetry?.(delivery);
      else if (action === 'replay') opts.onReplay?.(delivery);
      else if (action === 'copy-payload') copyText(JSON.stringify(delivery.payload, null, 2)).then((ok) => flashCopied(btn, ok));
    });
  });
}

export function openDeliveryDrawer(delivery, opts = {}) {
  const drawer = document.querySelector('#delivery-drawer');
  if (!drawer) return;
  renderDeliveryDrawer(delivery, opts);
  Offcanvas.getOrCreateInstance(drawer).show();
}
