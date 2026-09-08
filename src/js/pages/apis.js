// =============================================================
// APIForge X — API Explorer
// Catalog cards + endpoint list + reference documentation + interactive
// tester. Data-driven from mock-apis.json / mock-endpoints.json.
// =============================================================

import { localizedFixture } from '../data/localized.js';
import { boot } from '../main.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { initCodeBlock } from '../components/code-block.js';
import { createIcons, icons } from '../components/icons.js';
import { bindCopyButton } from '../components/copy.js';
import { currentEnv } from '../components/env-switcher.js';
import { escapeHtml, methodBadgeClass, number, latencyText } from '../utils/format.js';
import apisFa from '../data/mock-apis.json';
import apisEn from '../data/mock-apis.en.json';
import endpointsFa from '../data/mock-endpoints.json';
import endpointsEn from '../data/mock-endpoints.en.json';
import environmentsFa from '../data/mock-environments.json';
import environmentsEn from '../data/mock-environments.en.json';

const apis = localizedFixture(apisFa, apisEn);
const endpoints = localizedFixture(endpointsFa, endpointsEn);
const environments = localizedFixture(environmentsFa, environmentsEn);

boot();

const API_ICONS = {
  api_emails: 'folder-open',
  api_ai: 'activity',
  api_audiences: 'users',
  api_webhooks: 'webhook',
  api_platform: 'settings',
};
const apiName = (id) => apis.find((a) => a.id === id)?.name;
const STATUS_BADGE = { stable: 'success', beta: 'info', deprecated: 'warning' };
const baseUrlFor = (env) => (environments.find((e) => e.id === env) || environments[0]).baseUrl;

let activeEndpoint = endpoints[0];

// --- Catalog -----------------------------------------------------------
function renderCatalog() {
  const wrap = document.getElementById('api-catalog');
  wrap.innerHTML = apis
    .map(
      (api) => `
      <div class="col-12 col-md-6 col-xl-4">
        <button type="button" class="card card--interactive api-card text-body w-100 h-100 text-start" data-api="${api.id}">
          <span class="api-card__head">
            <span class="api-card__icon"><i data-lucide="${API_ICONS[api.id]}"></i></span>
            <span class="api-card__name">${escapeHtml(api.name)}</span>
            <span class="badge badge-neutral ms-auto">${escapeHtml(api.version)}</span>
          </span>
          <span class="api-card__desc">${escapeHtml(api.description)}</span>
          <span class="api-card__meta">
            <span class="badge badge-status badge-status--${STATUS_BADGE[api.status]}"><span class="dot"></span>${tr(`status.${api.status}`)}</span>
            <span class="text-tertiary caption">${tr('ui.endpointsCount', { count: number(api.endpointsCount) })}</span>
          </span>
        </button>
      </div>`
    )
    .join('');
  createIcons({ icons });
}

// --- Endpoint list -----------------------------------------------------
function endpointRows(list) {
  return list
    .map(
      (ep) => `
      <tr class="is-clickable" tabindex="0" data-endpoint="${ep.id}">
        <td><span class="badge badge-method ${methodBadgeClass(ep.method)}">${ep.method}</span></td>
        <td><code class="ltr-isolate mono-sm text-body">${escapeHtml(ep.path)}</code></td>
        <td class="text-secondary">${escapeHtml(ep.summary)}</td>
        <td class="text-secondary">${escapeHtml(apiName(ep.apiId) || ep.group)}</td>
      </tr>`
    )
    .join('');
}

function renderEndpointList(filter = '') {
  const q = filter.trim().toLowerCase();
  const list = endpoints.filter(
    (ep) => !q || ep.method.toLowerCase().includes(q) || ep.path.toLowerCase().includes(q) || ep.summary.toLowerCase().includes(q) || ep.group.toLowerCase().includes(q)
  );
  const tbody = document.getElementById('endpoint-list');
  tbody.innerHTML = list.length
    ? endpointRows(list)
    : `<tr><td colspan="4"><div class="empty-state"><span class="empty-icon"><i data-lucide="search"></i></span><h4 class="empty-title">${tr('ui.noEndpoints')}</h4><p class="empty-desc mb-0">${tr('ui.tryEndpoint')}</p></div></td></tr>`;
  createIcons({ icons });
}

// --- Code blocks -------------------------------------------------------
function jsonBlock(json, label = 'JSON') {
  return `
    <div class="code-block code-block--flush" data-code-block>
      <div class="code-block__header">
        <span class="code-block__lang"><i data-lucide="braces"></i> ${label}</span>
        <div class="code-block__actions"><button type="button" class="btn btn-icon btn-icon--sm" data-code-copy aria-label="${tr('aria.copyX', { name: escapeHtml(label) })}"><i data-lucide="copy"></i></button></div>
      </div>
      <pre class="code-block__body" data-code-pane><code>${escapeHtml(JSON.stringify(json, null, 2))}</code></pre>
    </div>`;
}

function sdkBlock(ep) {
  const base = `${baseUrlFor(currentEnv())}${ep.path}`;
  const body = ep.method === 'GET' ? '' : ` -d '${JSON.stringify(ep.responseExample).slice(0, 120)}…'`;
  return `
    <div class="code-block" data-code-block>
      <div class="code-block__header">
        <div class="code-tabs" role="tablist" aria-label="${tr('profile.language')}">
          <button type="button" class="code-tabs__tab is-active" data-tab="curl">cURL</button>
          <button type="button" class="code-tabs__tab" data-tab="node">Node</button>
          <button type="button" class="code-tabs__tab" data-tab="python">Python</button>
        </div>
        <div class="code-block__actions"><button type="button" class="btn btn-icon" data-code-copy aria-label="${tr('common.copy-code')}"><i data-lucide="copy"></i></button></div>
      </div>
      <pre class="code-block__body" data-code-pane data-pane="curl">curl -X ${ep.method} ${base} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${body}</pre>
      <pre class="code-block__body" data-code-pane data-pane="node" hidden>import { ApiForge } from '@apiforge/sdk';

const client = new ApiForge('YOUR_API_KEY');
await client.request('${ep.method}', '${ep.path}');</pre>
      <pre class="code-block__body" data-code-pane data-pane="python" hidden>import apiforge

client = apiforge.Client("YOUR_API_KEY")
resp = client.request("${ep.method}", "${ep.path}")</pre>
    </div>`;
}

// --- Reference doc -----------------------------------------------------
function paramRows(ep) {
  if (!ep.params.length) return `<p class="text-secondary">${tr('ui.noParameters')}</p>`;
  return `
    <div class="table-card">
      <div class="table-responsive">
        <table class="params-table">
          <thead><tr><th>${tr('table.name')}</th><th>${tr('ui.type')}</th><th>${tr('ui.requiredHeading')}</th><th>${tr('table.description')}</th></tr></thead>
          <tbody>${ep.params
            .map(
              (p) => `<tr>
                <td><span class="param-name">${escapeHtml(p.name)}</span></td>
                <td><code class="ltr-isolate mono-sm text-tertiary">${escapeHtml(p.type)}</code></td>
                <td>${p.required ? `<span class="param-required">${tr('ui.required')}</span>` : `<span class="text-tertiary">${tr('ui.optional')}</span>`}</td>
                <td class="param-desc">${escapeHtml(p.description)}</td>
              </tr>`
            )
            .join('')}</tbody>
        </table>
      </div>
    </div>`;
}

function renderDoc(ep) {
  const doc = document.getElementById('api-doc');
  doc.innerHTML = `
    <div class="endpoint-head mb-3">
      <span class="badge badge-method ${methodBadgeClass(ep.method)}">${ep.method}</span>
      <code class="endpoint-path ltr-isolate">${escapeHtml(ep.path)}</code>
      <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(ep.path)}" aria-label="${tr('ui.copyPath')}"><i data-lucide="copy"></i></button>
    </div>
    <p class="text-secondary body-lg mb-4">${escapeHtml(ep.description)}</p>
    <h4 class="h4 mb-2">${tr('ui.parameters')}</h4>
    <div class="mb-4">${paramRows(ep)}</div>
    <h4 class="h4 mb-2">${tr('ui.codeExamples')}</h4>
    <div class="mb-4">${sdkBlock(ep)}</div>
    <h4 class="h4 mb-2">${tr('vs.tab3')}</h4>
    <div>${jsonBlock(ep.responseExample, tr('ui.response200'))}</div>`;

  doc.querySelectorAll('[data-code-block]').forEach(initCodeBlock);
  doc.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}

// --- Tester ------------------------------------------------------------
function inputFor(p) {
  const value = p.location === 'body' ? exampleValue(p) : '';
  return `
    <div class="tester__param">
      <label class="tester__param-label" for="param-${escapeHtml(p.name)}">
        <code class="ltr-isolate">${escapeHtml(p.name)}</code>
        <span class="text-tertiary caption">${escapeHtml(p.type)}${p.required ? ` · ${tr('ui.required')}` : ''}</span>
      </label>
      <input class="form-control${p.type !== 'string' ? ' form-control--mono' : ''}" id="param-${escapeHtml(p.name)}" type="text" placeholder="${escapeHtml(p.name)}" value="${escapeHtml(value)}" />
    </div>`;
}

function exampleValue(p) {
  const map = {
    model: 'forge-1', prompt: 'Summarize the release notes.', input: 'How do webhooks work?',
    to: 'user@example.com', subject: 'Welcome to APIForge', name: 'Trial users', url: 'https://example.com/hooks',
    max_tokens: '256', temperature: '0.7', limit: '50', from: 'team@yourco.dev',
  };
  return map[p.name] || '';
}

function renderTester(ep) {
  const tester = document.getElementById('tester');
  const bodyParams = ep.params.filter((p) => p.location !== 'path');
  tester.innerHTML = `
    <div class="d-flex align-items-center justify-content-between">
      <h4 class="mb-0">${tr('ui.requestBuilder')}</h4>
      <span class="badge badge-neutral">${escapeHtml(apiName(ep.apiId) || ep.group)}</span>
    </div>
    <div class="tester__url">
      <span class="tester__method">${ep.method}</span>
      <input class="form-control form-control--mono ltr-isolate" dir="ltr" value="${escapeHtml(baseUrlFor(currentEnv()) + ep.path)}" readonly aria-label="${tr('ui.requestUrl')}" />
    </div>
    ${bodyParams.length ? `<div class="d-flex flex-column gap-3">${bodyParams.map(inputFor).join('')}</div>` : `<p class="text-tertiary caption mb-0">${tr('ui.noParameters')}</p>`}
    <button type="button" class="btn btn-primary w-100" id="tester-send"><i data-lucide="play"></i> ${tr('ui.sendRequest')}</button>
    <div class="response-viewer" id="tester-response" aria-live="polite">
      <div class="response-viewer__status text-tertiary caption">${tr('ui.sendForResponse')}</div>
    </div>`;

  const send = tester.querySelector('#tester-send');
  const required = bodyParams.filter((p) => p.required);
  send.addEventListener('click', () => {
    const missing = required.filter((p) => !tester.querySelector(`#param-${p.name}`)?.value.trim());
    send.disabled = true;
    send.innerHTML = `<span class="spinner"></span> ${tr('ui.sending')}`;
    const latency = 60 + Math.floor(Math.random() * 320);
    setTimeout(() => {
      send.disabled = false;
      send.innerHTML = `<i data-lucide="play"></i> ${tr('ui.sendRequest')}`;
      const responseEl = tester.querySelector('#tester-response');
      if (missing.length) {
        responseEl.innerHTML = `
          <div class="response-viewer__status">
            <span class="badge badge-status badge-status--warning"><span class="dot"></span>400 Bad Request</span>
            <span class="response-viewer__latency">${latencyText(latency)}</span>
          </div>
          ${jsonBlock({ error: { code: 'invalid_request', message: `Missing required parameter${missing.length > 1 ? 's' : ''}: ${missing.map((m) => m.name).join(', ')}.` } }, tr('ui.response400'))}`;
      } else {
        responseEl.innerHTML = `
          <div class="response-viewer__status">
            <span class="badge badge-status badge-status--success"><span class="dot"></span>200 OK</span>
            <span class="response-viewer__latency">${latencyText(latency)}</span>
          </div>
          ${jsonBlock(ep.responseExample, tr('ui.response200'))}`;
      }
      responseEl.querySelectorAll('[data-code-block]').forEach(initCodeBlock);
      createIcons({ icons });
    }, 450);
  });
  createIcons({ icons });
}

function selectEndpoint(ep, { scroll = false } = {}) {
  activeEndpoint = ep;
  document.querySelectorAll('[data-endpoint]').forEach((row) => row.classList.toggle('is-selected', row.dataset.endpoint === ep.id));
  renderDoc(ep);
  renderTester(ep);
  if (scroll) {
    document.getElementById('api-doc').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// --- Wiring ------------------------------------------------------------
renderCatalog();
renderEndpointList();
selectEndpoint(activeEndpoint);

document.getElementById('api-catalog').addEventListener('click', (e) => {
  const card = e.target.closest('[data-api]');
  if (!card) return;
  const first = endpoints.find((ep) => ep.apiId === card.dataset.api);
  if (first) selectEndpoint(first, { scroll: true });
});

document.getElementById('endpoint-list').addEventListener('click', (e) => {
  const row = e.target.closest('[data-endpoint]');
  if (!row) return;
  const ep = endpoints.find((x) => x.id === row.dataset.endpoint);
  if (ep) selectEndpoint(ep, { scroll: true });
});

document.getElementById('endpoint-search').addEventListener('input', (e) => renderEndpointList(e.target.value));

// Keep tester URL in sync with the environment switcher.
document.addEventListener('afx:env', () => {
  const url = document.querySelector('.tester__url .form-control');
  if (url && activeEndpoint) url.value = baseUrlFor(currentEnv()) + activeEndpoint.path;
});

onLocaleChange(() => {
  // Retain unsent request values and the selected endpoint during a language swap.
  const values = [...document.querySelectorAll('#tester input[id]')].map((el) => [el.id, el.value]);
  renderCatalog();
  renderEndpointList(document.getElementById('endpoint-search').value);
  selectEndpoint(activeEndpoint);
  values.forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.value = value; });
});
