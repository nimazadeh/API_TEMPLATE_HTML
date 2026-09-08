// =============================================================
// APIForge X — API Reference (public developer reference)
// Dense documentation-style endpoint reference: service + version
// selectors, grouped endpoint nav, and a full reference article
// (auth, parameters, request body, response, errors, code samples).
// Distinct from apis.html (interactive explorer with tester).
// =============================================================

import { boot } from '../main.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { Offcanvas } from '../core/bootstrap.js';
import { createIcons, icons } from '../components/icons.js';
import { initCodeBlock } from '../components/code-block.js';
import { highlightJson } from '../components/code-block.js';
import { bindCopyButton } from '../components/copy.js';
import { escapeHtml, methodBadgeClass } from '../utils/format.js';
import apis from '../data/mock-apis.json';
import endpoints from '../data/mock-endpoints.json';

boot();

const AUTH_BY_API = {
  api_emails: 'form.bearerToken',
  api_ai: 'form.bearerToken',
  api_audiences: 'form.bearerToken',
  api_webhooks: 'form.signingSecret',
  api_platform: 'API key',
};

const ERROR_CODES = {
  400: { code: 'invalid_request', messageKey: 'error.invalidRequestMessage' },
  401: { code: 'invalid_api_key', messageKey: 'error.invalidKeyMessage' },
  403: { code: 'insufficient_scope', messageKey: 'error.insufficientScopeMessage' },
  404: { code: 'not_found', messageKey: 'error.notFoundMessage' },
  429: { code: 'rate_limit_exceeded', messageKey: 'error.rateLimitMessage' },
  500: { code: 'internal_error', messageKey: 'error.internalMessage' },
};

const state = { service: 'all', endpoint: endpoints[0].id };

function serviceName(apiId) {
  return (apis.find((a) => a.id === apiId) || {}).name || apiId;
}

function visibleEndpoints() {
  return state.service === 'all' ? endpoints : endpoints.filter((e) => e.apiId === state.service);
}

function renderServiceSelect() {
  const options = ['<option value="all">All services</option>', ...apis.map((a) => `<option value="${a.id}">${escapeHtml(a.name)}</option>`)].join('');
  document.getElementById('ref-service').innerHTML = options;
}

function renderNav() {
  const groups = apis.map((api) => {
    const eps = visibleEndpoints().filter((e) => e.apiId === api.id);
    if (!eps.length) return '';
    return `
      <div class="docs-nav__group">
        <div class="docs-nav__label">${escapeHtml(api.name)}</div>
        ${eps
          .map(
            (ep) => `<a class="docs-nav__item ref-nav__item ${state.endpoint === ep.id ? 'is-active' : ''}" href="#${ep.id}" data-ep="${ep.id}">
              <span class="badge badge-method ${methodBadgeClass(ep.method)}">${ep.method}</span>
              <code class="ltr-isolate mono-sm text-secondary text-truncate">${escapeHtml(ep.path.replace('/v1/', ''))}</code>
            </a>`
          )
          .join('')}
      </div>`;
  });
  const navHtml = groups.join('');
  document.getElementById('ref-nav').innerHTML = navHtml;
  const mobile = document.getElementById('ref-nav-mobile');
  if (mobile) mobile.innerHTML = navHtml;
}

function paramTable(ep) {
  if (!ep.params.length) return '<p class="text-secondary mb-0">This endpoint takes no parameters.</p>';
  return `
    <div class="table-card">
      <div class="table-responsive">
        <table class="table params-table">
          <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Location</th><th scope="col">Required</th><th scope="col">Description</th></tr></thead>
          <tbody>${ep.params
            .map(
              (p) => `<tr>
                <td><code class="ltr-isolate mono-sm text-body">${escapeHtml(p.name)}</code></td>
                <td><code class="ltr-isolate mono-sm text-tertiary">${escapeHtml(p.type)}</code></td>
                <td><code class="ltr-isolate mono-sm text-tertiary">${escapeHtml(p.location)}</code></td>
                <td>${p.required ? '<span class="badge badge-accent">required</span>' : '<span class="text-tertiary">optional</span>'}</td>
                <td class="param-desc">${escapeHtml(p.description)}</td>
              </tr>`
            )
            .join('')}</tbody>
        </table>
      </div>
    </div>`;
}

function schemaWell(ep) {
  const props = {};
  (ep.params || []).forEach((p) => {
    if (p.location === 'body') props[p.name] = { type: p.type, required: Boolean(p.required) };
  });
  const schema = { type: 'object', properties: props };
  const text = JSON.stringify(schema, null, 2);
  return `
    <div class="code-block code-block--flush">
      <div class="code-block__header">
        <span class="code-block__lang"><i data-lucide="braces"></i> Request body schema</span>
        <div class="code-block__actions"><button type="button" class="btn btn-icon btn-icon--sm" data-copy-target="#ref-request-schema" aria-label="Copy schema"><i data-lucide="copy"></i></button></div>
      </div>
      <pre class="code-block__body" id="ref-request-schema"><code>${highlightJson(text)}</code></pre>
    </div>`;
}

function responseWell(ep) {
  const text = JSON.stringify(ep.responseExample, null, 2);
  return `
    <div class="code-block code-block--flush">
      <div class="code-block__header">
        <span class="code-block__lang"><i data-lucide="file-json"></i> 200 response</span>
        <div class="code-block__actions"><button type="button" class="btn btn-icon btn-icon--sm" data-copy-target="#ref-response" aria-label="Copy response"><i data-lucide="copy"></i></button></div>
      </div>
      <pre class="code-block__body" id="ref-response"><code>${highlightJson(text)}</code></pre>
    </div>`;
}

function sdkTabs(ep) {
  const base = `https://api.apiforge.dev${ep.path}`;
  return `
    <div class="code-block" data-code-block>
      <div class="code-block__header">
        <div class="code-tabs" role="tablist" aria-label="Language">
          <button type="button" class="code-tabs__tab is-active" data-tab="curl">cURL</button>
          <button type="button" class="code-tabs__tab" data-tab="node">Node</button>
          <button type="button" class="code-tabs__tab" data-tab="python">Python</button>
          <button type="button" class="code-tabs__tab" data-tab="php">PHP</button>
        </div>
        <div class="code-block__actions"><button type="button" class="btn btn-icon btn-icon--sm" data-code-copy aria-label="Copy code"><i data-lucide="copy"></i></button></div>
      </div>
      <pre class="code-block__body" data-code-pane data-pane="curl"><code>${escapeHtml(`curl ${ep.method === 'GET' ? '' : `-X ${ep.method} `}${base} \\\n  -H "Authorization: Bearer YOUR_API_KEY"`)}</code></pre>
      <pre class="code-block__body" data-code-pane data-pane="node" hidden><code>${escapeHtml(`import { ApiForge } from '@apiforge/sdk';\n\nconst client = new ApiForge('YOUR_API_KEY');\nawait client.request('${ep.method}', '${ep.path}');`)}</code></pre>
      <pre class="code-block__body" data-code-pane data-pane="python" hidden><code>${escapeHtml(`import apiforge\n\nclient = apiforge.Client("YOUR_API_KEY")\nresp = client.request("${ep.method}", "${ep.path}")`)}</code></pre>
      <pre class="code-block__body" data-code-pane data-pane="php" hidden><code>${escapeHtml(`use ApiForge\\Client;\n\n$client = new Client('YOUR_API_KEY');\n$response = $client->request('${ep.method}', '${ep.path}');`)}</code></pre>
    </div>`;
}

function renderEndpoint() {
  const ep = endpoints.find((e) => e.id === state.endpoint) || endpoints[0];
  const auth = AUTH_BY_API[ep.apiId] || 'API key';
  document.getElementById('ref-crumb').textContent = ep.path;
  document.getElementById('ref-doc').innerHTML = `
    <div class="endpoint-head mb-3">
      <span class="badge badge-method ${methodBadgeClass(ep.method)}">${ep.method}</span>
      <code class="endpoint-path ltr-isolate">${escapeHtml(ep.path)}</code>
      <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(ep.path)}" aria-label="Copy path"><i data-lucide="copy"></i></button>
    </div>
    <p class="text-secondary body-lg mb-4">${escapeHtml(ep.description)}</p>

    <section class="inspector-section">
      <h4 class="inspector-label">Authentication</h4>
      <div class="d-flex align-items-center gap-2">
        <span class="badge badge-accent"><i data-lucide="shield-check"></i> ${escapeHtml(auth)}</span>
        <span class="text-tertiary caption">Include an <code class="ltr-isolate">Authorization</code> header on every request.</span>
      </div>
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">Parameters</h4>
      ${paramTable(ep)}
    </section>

    ${ep.params.some((p) => p.location === 'body') ? `<section class="inspector-section"><h4 class="inspector-label">Request body</h4>${schemaWell(ep)}</section>` : ''}

    <section class="inspector-section">
      <h4 class="inspector-label">Response</h4>
      ${responseWell(ep)}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">Errors</h4>
      <div class="table-card">
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th scope="col">Status</th><th scope="col">Code</th><th scope="col">Description</th></tr></thead>
            <tbody>${[400, 401, 403, 404, 429]
              .map(
                (s) => `<tr>
                  <td><span class="badge badge-status ${s === 429 ? 'badge-status--429' : 'badge-status--warning'}">${s}</span></td>
                  <td><code class="ltr-isolate mono-sm text-body">${ERROR_CODES[s].code}</code></td>
                  <td class="text-secondary">${escapeHtml(tr(ERROR_CODES[s].messageKey))}</td>
                </tr>`
              )
              .join('')}</tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">Code samples</h4>
      ${sdkTabs(ep)}
    </section>`;

  document.querySelectorAll('#ref-doc [data-code-block]').forEach(initCodeBlock);
  document.querySelectorAll('#ref-doc [data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}

function selectEndpoint(id) {
  state.endpoint = id;
  renderNav();
  renderEndpoint();
  const offcanvas = document.getElementById('ref-nav-offcanvas');
  if (offcanvas) Offcanvas.getOrCreateInstance(offcanvas).hide();
}

renderServiceSelect();
renderNav();
renderEndpoint();

document.getElementById('ref-service').addEventListener('change', (e) => {
  state.service = e.target.value;
  const first = visibleEndpoints()[0];
  if (first) state.endpoint = first.id;
  renderNav();
  renderEndpoint();
});

[document.getElementById('ref-nav'), document.getElementById('ref-nav-mobile')].forEach((nav) => {
  if (!nav) return;
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('[data-ep]');
    if (!item) return;
    e.preventDefault();
    selectEndpoint(item.dataset.ep);
  });
});

document.getElementById('ref-version').addEventListener('change', () => {
  // Single version shipped; future versions re-select the endpoint.
  renderEndpoint();
});
