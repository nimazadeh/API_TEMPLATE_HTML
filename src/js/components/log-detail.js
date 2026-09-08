// =============================================================
// APIForge X — Log detail inspector
// Deterministically builds a realistic request/response/timing story
// from a log record (seeded by the log id — no backend), renders it
// into the shared offcanvas drawer, and builds the "Copy as cURL"
// command. Reused by logs.html; dashboard deep-links to logs.
// =============================================================

import { Offcanvas } from '../core/bootstrap.js';
import { escapeHtml, latencyText, absoluteTime } from '../utils/format.js';
import { t } from '../core/i18n.js';
import { copyText, flashCopied } from './copy.js';
import { createIcons, icons } from './icons.js';

// --- Deterministic seed from a string (FNV-1a) -------------------------
function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATUS_TEXT = {
  200: 'OK', 201: 'Created', 400: 'Bad Request', 401: 'Unauthorized',
  403: 'Forbidden', 404: 'Not Found', 429: 'Too Many Requests',
  500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable',
};

// Error explanations are user-facing copy, so they are translated on
// read (never at import time) — flipping the locale re-renders them.
const ERRORS = {
  400: { code: 'invalid_request', messageKey: 'error.invalidRequestMessage', explanationKey: 'error.invalidRequestExplanation', docsUrl: 'https://docs.apiforge.dev/errors/invalid_request' },
  401: { code: 'invalid_api_key', messageKey: 'error.invalidKeyMessage', explanationKey: 'error.invalidKeyExplanation', docsUrl: 'https://docs.apiforge.dev/errors/invalid_api_key' },
  403: { code: 'insufficient_scope', messageKey: 'error.insufficientScopeMessage', explanationKey: 'error.insufficientScopeExplanation', docsUrl: 'https://docs.apiforge.dev/errors/insufficient_scope' },
  404: { code: 'not_found', messageKey: 'error.notFoundMessage', explanationKey: 'error.notFoundExplanation', docsUrl: 'https://docs.apiforge.dev/errors/not_found' },
  429: { code: 'rate_limit_exceeded', messageKey: 'error.rateLimitMessage', explanationKey: 'error.rateLimitExplanation', docsUrl: 'https://docs.apiforge.dev/errors/rate_limit_exceeded' },
  500: { code: 'internal_error', messageKey: 'error.internalMessage', explanationKey: 'error.internalExplanation', docsUrl: 'https://docs.apiforge.dev/errors/internal_error' },
  502: { code: 'upstream_unavailable', messageKey: 'error.upstreamMessage', explanationKey: 'error.upstreamExplanation', docsUrl: 'https://docs.apiforge.dev/errors/upstream_unavailable' },
  503: { code: 'service_unavailable', messageKey: 'error.unavailableMessage', explanationKey: 'error.unavailableExplanation', docsUrl: 'https://docs.apiforge.dev/errors/service_unavailable' },
};

function errorFor(status) {
  const raw = ERRORS[status] || ERRORS[500];
  return {
    code: raw.code,
    message: t(raw.messageKey),
    explanation: t(raw.explanationKey),
    docsUrl: raw.docsUrl,
  };
}

const REQUEST_BODIES = {
  '/v1/emails': { to: 'user@example.com', subject: 'Welcome to APIForge', html: '<p>Thanks for signing up.</p>', from: 'team@yourco.dev' },
  '/v1/completions': { model: 'forge-1', prompt: 'Summarize the release notes.', max_tokens: 256, temperature: 0.7 },
  '/v1/embeddings': { model: 'embed-1', input: 'How do webhooks work?' },
  '/v1/audiences': { name: 'Trial users', filters: [{ field: 'plan', op: 'eq', value: 'trial' }] },
  '/v1/webhooks': { url: 'https://example.com/hooks', events: ['email.sent', 'email.bounced'], secret: 'whsec_••••' },
};

const RESPONSE_BODIES = {
  '/v1/emails': { id: 'eml_8Fk2mQx1Zw', status: 'queued', to: 'user@example.com' },
  '/v1/completions': { id: 'cmpl_9xK2mQ', model: 'forge-1', choices: [{ text: 'Release notes summary…' }] },
  '/v1/embeddings': { object: 'list', data: [{ index: 0, embedding: [0.014, -0.021, 0.038] }] },
  '/v1/models': { data: [{ id: 'forge-1', object: 'model' }, { id: 'embed-1', object: 'model' }] },
  '/v1/audiences': { id: 'aud_9xK2mQ', name: 'Trial users', size: 12840 },
  '/v1/webhooks': { id: 'wh_8f3k2ma1', url: 'https://example.com/hooks', enabled: true },
  '/v1/api-keys': { id: 'key_DElNoSR8', revoked: true },
  '/v1/usage': { requests: 5382400, period: { start: '2026-09-01', end: '2026-09-30' } },
};

function baseOf(path) {
  return Object.keys(REQUEST_BODIES).find((p) => path.startsWith(p)) || '/v1/emails';
}

export function buildLogDetail(log) {
  const rnd = mulberry32(hashSeed(log.id));
  const base = baseOf(log.path);
  const isGet = log.method === 'GET';
  const statusText = STATUS_TEXT[log.status] || 'Unknown';
  const error = log.status >= 400 ? errorFor(log.status) : null;

  const queue = Math.round(log.latencyMs * (0.08 + rnd() * 0.1));
  const processing = Math.round(log.latencyMs * (0.55 + rnd() * 0.15));
  const response = log.latencyMs - queue - processing;

  return {
    id: log.id,
    method: log.method,
    path: log.path,
    status: log.status,
    statusText,
    latencyMs: log.latencyMs,
    env: log.env,
    key: log.keyPrefix,
    timestamp: log.timestamp,
    userAgent: log.userAgent,
    ip: `${Math.floor(20 + rnd() * 200)}.${Math.floor(rnd() * 255)}.${Math.floor(rnd() * 255)}.${Math.floor(1 + rnd() * 254)}`,
    region: ['fra1', 'iad1', 'sin1', 'syd1'][Math.floor(rnd() * 4)],
    request: {
      headers: [
        ['Authorization', `Bearer ${log.keyPrefix}…`],
        ['Content-Type', 'application/json'],
        ['User-Agent', log.userAgent],
        ['Idempotency-Key', log.id],
        ['X-APIForge-Env', log.env],
      ],
      query: isGet ? { limit: 50, before: 'req_' + Math.floor(rnd() * 9e9) } : null,
      body: isGet ? null : REQUEST_BODIES[base],
    },
    response: {
      headers: [
        ['Content-Type', 'application/json'],
        ['Request-Id', log.id],
        ...(log.status === 429 ? [['Retry-After', '2']] : []),
      ],
      body: error ? { error: { code: error.code, message: error.message, docs: error.docsUrl } } : RESPONSE_BODIES[base],
    },
    timing: { queue, processing, response },
    error,
  };
}

/** The exact cURL command a developer would run to reproduce the request. */
export function cURLFor(d) {
  const lines = [`curl ${d.method === 'GET' ? '' : '-X ' + d.method} https://api${d.env === 'test' ? '.test' : ''}.apiforge.dev${d.path}`];
  d.request.headers.forEach(([k, v]) => lines.push(`  -H "${k}: ${v}"`));
  if (d.request.body) lines.push(`  -d '${JSON.stringify(d.request.body)}'`);
  return lines.join(' \\\n');
}

// --- Rendering --------------------------------------------------------
function kvTable(rows) {
  return `<table class="kv"><tbody>${rows
    .map(([k, v]) => `<tr><th scope="row"><code class="ltr-isolate">${escapeHtml(k)}</code></th><td><code class="ltr-isolate">${escapeHtml(v)}</code></td></tr>`)
    .join('')}</tbody></table>`;
}

function jsonWell(body) {
  const text = JSON.stringify(body, null, 2);
  return `
    <div class="code-block code-block--flush">
      <div class="code-block__header">
        <span class="code-block__lang"><i data-lucide="braces"></i> JSON</span>
        <div class="code-block__actions">
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy-json aria-label="${t('aria.copyJson')}"><i data-lucide="copy"></i></button>
        </div>
      </div>
      <pre class="code-block__body"><code>${escapeHtml(text)}</code></pre>
    </div>`;
}

export function openLogDrawer(log, drawerEl = document.querySelector('#log-drawer')) {
  if (!drawerEl) return;
  const d = buildLogDetail(log);
  const title = drawerEl.querySelector('.inspector-title');
  const body = drawerEl.querySelector('.offcanvas-body');
  if (title) title.textContent = d.id;

  const methodBadge = `badge-method--${d.method}`;
  const statusBadge = d.status >= 500 ? 'badge-status--error' : d.status === 429 ? 'badge-status--429' : d.status >= 400 ? 'badge-status--warning' : 'badge-status--success';

  body.innerHTML = `
    <div class="inspector-head">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="badge badge-method ${methodBadge}">${d.method}</span>
        <code class="ltr-isolate mono-sm text-body">${escapeHtml(d.path)}</code>
        <span class="badge badge-status ${statusBadge}"><span class="dot"></span>${d.status} ${d.statusText}</span>
      </div>
      <div class="d-flex align-items-center gap-3 mt-2 text-secondary caption">
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="timer"></i> ${latencyText(d.latencyMs)}</span>
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="calendar"></i> ${escapeHtml(absoluteTime(d.timestamp))}</span>
        <span class="d-inline-flex align-items-center gap-1"><i data-lucide="globe"></i> ${d.env}</span>
      </div>
    </div>

    <section class="inspector-section">
      <h4 class="inspector-label">${t('inspector.timing')}</h4>
      <div class="timing-bars">
        <div class="timing-row">
          <span class="timing-row__name">${t('inspector.queue')}</span>
          <div class="timing-row__track"><div class="timing-row__fill" style="width:${Math.max(4, (d.timing.queue / d.latencyMs) * 100)}%"></div></div>
          <span class="timing-row__value">${d.timing.queue}ms</span>
        </div>
        <div class="timing-row">
          <span class="timing-row__name">${t('inspector.processing')}</span>
          <div class="timing-row__track"><div class="timing-row__fill is-accent" style="width:${Math.max(4, (d.timing.processing / d.latencyMs) * 100)}%"></div></div>
          <span class="timing-row__value">${d.timing.processing}ms</span>
        </div>
        <div class="timing-row">
          <span class="timing-row__name">${t('inspector.response')}</span>
          <div class="timing-row__track"><div class="timing-row__fill is-muted" style="width:${Math.max(4, (d.timing.response / d.latencyMs) * 100)}%"></div></div>
          <span class="timing-row__value">${d.timing.response}ms</span>
        </div>
      </div>
    </section>

    <section class="inspector-section">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h4 class="inspector-label mb-0">${t('inspector.request')}</h4>
        <button type="button" class="btn btn-sm btn-ghost" data-copy-curl aria-label="${t('inspector.copyAsCurl')}"><i data-lucide="copy"></i> ${t('inspector.copyAsCurl')}</button>
      </div>
      <div class="code-block code-block--flush mb-2">
        <div class="code-block__header"><span class="code-block__lang"><i data-lucide="terminal"></i> cURL</span></div>
        <pre class="code-block__body"><code>${escapeHtml(cURLFor(d))}</code></pre>
      </div>
      ${d.request.query ? kvTable(Object.entries(d.request.query)) : ''}
      ${d.request.body ? jsonWell(d.request.body) : ''}
      <div class="inspector-sub mt-2">${t('inspector.headers')}</div>
      ${kvTable(d.request.headers)}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">${t('inspector.response')}</h4>
      ${d.error ? `
        <div class="alert alert-danger mb-2" role="alert">
          <span class="alert-icon"><i data-lucide="alert-circle"></i></span>
          <div class="alert-content">
            <div class="fw-medium">${escapeHtml(d.error.message)}</div>
            <div class="mt-1">${escapeHtml(d.error.explanation)}</div>
            <a class="d-inline-flex align-items-center gap-1 mt-1" href="${d.error.docsUrl}" target="_blank" rel="noopener">${t('inspector.readDocs')} <i data-lucide="external-link"></i></a>
          </div>
        </div>` : ''}
      ${jsonWell(d.response.body)}
      <div class="inspector-sub mt-2">Headers</div>
      ${kvTable(d.response.headers)}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">${t('inspector.context')}</h4>
      ${kvTable([[t('inspector.environment'), d.env], [t('inspector.apiKey'), d.key + '…'], [t('inspector.ip'), d.ip], [t('inspector.region'), d.region]])}
    </section>`;

  createIcons({ icons });
  body.querySelectorAll('[data-copy-curl]').forEach((btn) => {
    btn.addEventListener('click', async () => flashCopied(btn, await copyText(cURLFor(d))));
  });
  body.querySelectorAll('[data-copy-json]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.closest('.code-block')?.querySelector('.code-block__body');
      flashCopied(btn, await copyText(code ? code.textContent.trim() : ''));
    });
  });

  Offcanvas.getOrCreateInstance(drawerEl).show();
}
