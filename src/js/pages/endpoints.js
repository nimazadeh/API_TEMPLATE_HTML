// =============================================================
// APIForge X — Endpoint management
// Filterable endpoint table (method / path / service / version /
// status), a reference drawer (description, auth, parameters,
// request + response schema) and a create/edit modal. In-session
// mutation only, backed by mock-endpoints.json.
// =============================================================

import { trackLocalizedView } from '../components/localized-view.js';
import { localizedFixture } from '../data/localized.js';
import { boot } from '../main.js';
import { Modal, Offcanvas } from '../core/bootstrap.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { highlightJson } from '../components/code-block.js';
import { bindCopyButton } from '../components/copy.js';
import { escapeHtml, methodBadgeClass, number } from '../utils/format.js';
import endpointsDataFa from '../data/mock-endpoints.json';
import endpointsDataEn from '../data/mock-endpoints.en.json';
import apisFa from '../data/mock-apis.json';
import apisEn from '../data/mock-apis.en.json';

const endpointsData = localizedFixture(endpointsDataFa, endpointsDataEn);
const apis = localizedFixture(apisFa, apisEn);

boot();

const endpoints = [...endpointsData]; // in-session mutable copy
const API = Object.fromEntries(apis.map((a) => [a.id, a]));

const AUTH_BY_API = {
  api_emails: 'Bearer token',
  api_ai: 'Bearer token',
  api_audiences: 'Bearer token',
  api_webhooks: 'Signing secret',
  api_platform: 'API key',
};

const state = { search: '', method: 'all', service: 'all', status: 'all' };
let editingId = null;

function serviceName(ep) {
  return (API[ep.apiId] && API[ep.apiId].name) || ep.apiId;
}
function versionOf(ep) {
  return (API[ep.apiId] && API[ep.apiId].version) || 'v1';
}
function statusOf(ep) {
  return (API[ep.apiId] && API[ep.apiId].status) || 'stable';
}
function authOf(ep) {
  return ep.auth || AUTH_BY_API[ep.apiId] || 'API key';
}

function authLabel(ep) {
  const keys = { 'Bearer token': 'form.bearerToken', 'Signing secret': 'form.signingSecret', 'API key': 'keys.apiKeyLabel', 'None': 'form.none' };
  return tr(keys[authOf(ep)] || 'keys.apiKeyLabel');
}

function filtered() {
  const q = state.search.trim().toLowerCase();
  return endpoints.filter((ep) => {
    if (q && !`${ep.path} ${ep.description} ${ep.summary}`.toLowerCase().includes(q)) return false;
    if (state.method !== 'all' && ep.method !== state.method) return false;
    if (state.service !== 'all' && ep.apiId !== state.service) return false;
    if (state.status !== 'all' && statusOf(ep) !== state.status) return false;
    return true;
  });
}

// --- Rendering -----------------------------------------------------------
function render() {
  const tbody = document.getElementById('endpoint-list');
  const list = filtered();
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
      <span class="empty-icon"><i data-lucide="braces"></i></span>
      <h4 class="empty-title">${tr('ui.noEndpoints')}</h4>
      <p class="empty-desc mb-0">${tr('logs.emptyDesc')}</p>
    </div></td></tr>`;
  } else {
    tbody.innerHTML = list
      .map((ep) => {
        const status = statusOf(ep);
        return `
        <tr class="is-clickable" tabindex="0" data-id="${escapeHtml(ep.id)}">
          <td><span class="badge badge-method ${methodBadgeClass(ep.method)}">${ep.method}</span></td>
          <td><code class="ltr-isolate mono-sm text-body">${escapeHtml(ep.path)}</code></td>
          <td class="text-secondary">${escapeHtml(serviceName(ep))}</td>
          <td><span class="badge badge-neutral ltr-isolate">${escapeHtml(versionOf(ep))}</span></td>
          <td><span class="badge badge-status ${status === 'stable' ? 'badge-status--success' : 'badge-status--warning'}"><span class="dot"></span>${tr(status === 'stable' ? 'status.stable' : 'status.beta')}</span></td>
        </tr>`;
      })
      .join('');
  }
  document.getElementById('endpoint-count').textContent = tr('ui.endpointCountOf', { shown: number(list.length), total: number(endpoints.length) });
  createIcons({ icons });
}

function paramsTable(ep) {
  if (!ep.params || !ep.params.length) return `<div class="text-secondary caption">${tr('ui.noParams')}</div>`;
  return `
    <table class="params-table">
      <thead><tr><th>${tr('table.name')}</th><th>${tr('ui.type')}</th><th>${tr('ui.location')}</th><th>${tr('table.description')}</th></tr></thead>
      <tbody>${ep.params
        .map(
          (p) => `
        <tr>
          <td><span class="param-name ltr-isolate">${escapeHtml(p.name)}</span>${p.required ? ' <span class="param-required">*</span>' : ''}</td>
          <td><code class="ltr-isolate mono-sm text-secondary">${escapeHtml(p.type)}</code></td>
          <td><code class="ltr-isolate mono-sm text-secondary">${escapeHtml(p.location)}</code></td>
          <td class="param-desc">${escapeHtml(p.description)}</td>
        </tr>`
        )
        .join('')}</tbody>
    </table>`;
}

function schemaWell(title, icon, codeId, obj) {
  const text = JSON.stringify(obj, null, 2);
  return `
    <div class="code-block code-block--flush">
      <div class="code-block__header">
        <span class="code-block__lang"><i data-lucide="${icon}"></i> ${escapeHtml(title)}</span>
        <div class="code-block__actions">
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy data-copy-target="#${codeId}" aria-label="${tr('aria.copyX', { name: escapeHtml(title) })}"><i data-lucide="copy"></i></button>
        </div>
      </div>
      <pre class="code-block__body" id="${codeId}"><code>${highlightJson(text)}</code></pre>
    </div>`;
}

function requestSchema(ep) {
  const props = {};
  (ep.params || []).forEach((p) => {
    props[p.name] = { type: p.type, required: Boolean(p.required), location: p.location };
  });
  return { type: 'object', properties: props };
}

function openDrawer(ep) {
  const drawer = document.querySelector('#endpoint-drawer');
  const title = drawer.querySelector('.inspector-title');
  const body = drawer.querySelector('.offcanvas-body');
  title.textContent = ep.path;

  const status = statusOf(ep);
  body.innerHTML = `
    <div class="inspector-head">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="badge badge-method ${methodBadgeClass(ep.method)}">${ep.method}</span>
        <code class="ltr-isolate mono-sm text-body">${escapeHtml(ep.path)}</code>
      </div>
      <div class="d-flex align-items-center gap-2 mt-2 flex-wrap">
        <span class="badge badge-neutral">${escapeHtml(serviceName(ep))}</span>
        <span class="badge badge-neutral ltr-isolate">${escapeHtml(versionOf(ep))}</span>
        <span class="badge badge-status ${status === 'stable' ? 'badge-status--success' : 'badge-status--warning'}"><span class="dot"></span>${tr(status === 'stable' ? 'status.stable' : 'status.beta')}</span>
        <span class="d-inline-flex align-items-center gap-1 text-secondary caption"><i data-lucide="lock"></i> ${escapeHtml(authLabel(ep))}</span>
      </div>
      <div class="mt-3">
        <button type="button" class="btn btn-sm btn-secondary" data-endpoint-edit><i data-lucide="pencil"></i> ${tr('common.edit')}</button>
      </div>
    </div>

    <section class="inspector-section">
      <h4 class="inspector-label">${tr('table.description')}</h4>
      <p class="text-secondary mb-0">${escapeHtml(ep.description || ep.summary || '—')}</p>
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">${tr('form.authentication')}</h4>
      <div class="d-flex align-items-center gap-2">
        <span class="badge badge-accent"><i data-lucide="shield-check"></i> ${escapeHtml(authLabel(ep))}</span>
      </div>
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">${tr('ui.parameters')}</h4>
      ${paramsTable(ep)}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">${tr('ui.requestSchema')}</h4>
      ${schemaWell('application/json', 'braces', 'ep-request-schema', requestSchema(ep))}
    </section>

    <section class="inspector-section">
      <h4 class="inspector-label">${tr('ui.responseSchema')}</h4>
      ${schemaWell('application/json', 'file-json', 'ep-response-schema', ep.responseExample || {})}
    </section>`;

  createIcons({ icons });
  body.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  body.querySelector('[data-endpoint-edit]').addEventListener('click', () => openModal(ep));
  trackLocalizedView(drawer, () => openDrawer(ep));
  Offcanvas.getOrCreateInstance(drawer).show();
}

// --- Create / edit modal ---------------------------------------------------
function fillServices() {
  const options = apis.map((a) => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join('');
  document.getElementById('ep-service').innerHTML = options;
  document.getElementById('endpoint-service').innerHTML = `<option value="all">${tr('endpoints.allServices')}</option>${options}`;
}

function openModal(ep = null) {
  editingId = ep ? ep.id : null;
  document.getElementById('endpoint-modal-title').dataset.i18n = ep ? 'ui.editEndpoint' : 'endpoints.newEndpointTitle';
  document.getElementById('endpoint-modal-title').textContent = tr(ep ? 'ui.editEndpoint' : 'endpoints.newEndpointTitle');
  document.getElementById('ep-method').value = ep ? ep.method : 'GET';
  document.getElementById('ep-path').value = ep ? ep.path : '/v1/';
  document.getElementById('ep-service').value = ep ? ep.apiId : apis[0].id;
  document.getElementById('ep-auth').value = ep ? authOf(ep) : 'Bearer token';
  document.getElementById('ep-description').value = ep ? ep.description || '' : '';
  Modal.getOrCreateInstance(document.getElementById('endpoint-modal')).show();
}

function save() {
  const method = document.getElementById('ep-method').value;
  const path = document.getElementById('ep-path').value.trim();
  const apiId = document.getElementById('ep-service').value;
  const auth = document.getElementById('ep-auth').value;
  const description = document.getElementById('ep-description').value.trim();

  if (!path.startsWith('/')) {
    afxToast({ message: tr('endpoints.pathInvalid'), type: 'error' });
    return;
  }
  if (editingId) {
    const ep = endpoints.find((e) => e.id === editingId);
    if (ep) Object.assign(ep, { method, path, apiId, auth, description });
    afxToast({ message: tr('endpoints.updated'), type: 'success' });
  } else {
    endpoints.unshift({
      id: `ep_new_${Date.now().toString(36)}`,
      method,
      path,
      apiId,
      auth,
      description,
      summary: description,
      params: [],
      responseExample: { ok: true },
    });
    afxToast({ message: tr('endpoints.created'), type: 'success' });
  }
  Modal.getOrCreateInstance(document.getElementById('endpoint-modal')).hide();
  render();
}

// --- Wiring ---------------------------------------------------------------
fillServices();
render();

const tbody = document.getElementById('endpoint-list');
tbody.addEventListener('click', (e) => {
  const row = e.target.closest('tr[data-id]');
  if (row) {
    const ep = endpoints.find((x) => x.id === row.dataset.id);
    if (ep) openDrawer(ep);
  }
});
tbody.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const row = e.target.closest('tr[data-id]');
  if (row) {
    e.preventDefault();
    const ep = endpoints.find((x) => x.id === row.dataset.id);
    if (ep) openDrawer(ep);
  }
});

document.getElementById('endpoint-create').addEventListener('click', () => openModal());
document.getElementById('ep-save').addEventListener('click', save);

document.getElementById('endpoint-search').addEventListener('input', (e) => {
  state.search = e.target.value;
  render();
});
document.getElementById('endpoint-service').addEventListener('change', (e) => {
  state.service = e.target.value;
  render();
});
document.getElementById('endpoint-status').addEventListener('change', (e) => {
  state.status = e.target.value;
  render();
});
document.querySelectorAll('.filter-bar .seg__item[data-method]').forEach((seg) => {
  seg.addEventListener('click', () => {
    state.method = seg.dataset.method;
    document.querySelectorAll('.filter-bar .seg__item[data-method]').forEach((s) => {
      s.classList.toggle('is-active', s === seg);
      s.setAttribute('aria-pressed', String(s === seg));
    });
    render();
  });
});

onLocaleChange(() => {
  const service = document.getElementById('ep-service').value;
  fillServices();
  document.getElementById('endpoint-service').value = state.service;
  document.getElementById('ep-service').value = service;
  render();
});
