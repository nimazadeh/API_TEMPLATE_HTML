// =============================================================
// APIForge X — Environment management
// Production / Staging / Development switcher with a production
// warning banner, a per-environment summary, masked variables
// (reveal / copy / delete / add) and API keys separated by
// environment. In-session mutation only, backed by mock-*.json.
// =============================================================

import { localizedFixture } from '../data/localized.js';
import { boot } from '../main.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { Modal } from '../core/bootstrap.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';
import { bindCopyButton } from '../components/copy.js';
import { escapeHtml, relativeTime, absoluteTime, number } from '../utils/format.js';
import environmentsDataFa from '../data/mock-environments.json';
import environmentsDataEn from '../data/mock-environments.en.json';
import variablesDataFa from '../data/mock-variables.json';
import variablesDataEn from '../data/mock-variables.en.json';
import keysDataFa from '../data/mock-keys.json';
import keysDataEn from '../data/mock-keys.en.json';

const environmentsData = localizedFixture(environmentsDataFa, environmentsDataEn);
const variablesData = localizedFixture(variablesDataFa, variablesDataEn);
const keysData = localizedFixture(keysDataFa, keysDataEn);

boot();

const environments = environmentsData;
const variables = [...variablesData];
const keys = keysData;

let activeEnv = 'live';
const revealed = new Set();

const ENV_META = Object.fromEntries(environments.map((e) => [e.id, e]));

function envName(id) {
  return (ENV_META[id] && ENV_META[id].name) || id;
}

function varsFor() {
  return variables.filter((v) => v.environment === activeEnv);
}
function keysFor() {
  return keys.filter((k) => k.env === activeEnv);
}

// --- Production notice -------------------------------------------------------
function renderNotice() {
  const el = document.getElementById('env-notice');
  if (activeEnv === 'live') {
    el.innerHTML = `
      <div class="alert alert-warning" role="alert">
        <span class="alert-icon"><i data-lucide="alert-triangle"></i></span>
        <div class="alert-content">
          <div class="fw-medium">${tr('ui.inProduction')}</div>
          <div class="mt-1">${tr('ui.productionWarning')}</div>
        </div>
      </div>`;
  } else {
    el.innerHTML = '';
  }
  createIcons({ icons });
}

// --- Summary ------------------------------------------------------------------
function renderSummary() {
  const env = ENV_META[activeEnv];
  document.getElementById('env-summary').innerHTML = `
    <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
      <div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge badge-status ${activeEnv === 'live' ? 'badge-status--success' : activeEnv === 'staging' ? 'badge-status--warning' : 'badge-status--info'}"><span class="dot"></span>${escapeHtml(env.name)}</span>
          <span class="fw-medium text-body">${escapeHtml(env.description)}</span>
        </div>
        <div class="mt-2 d-flex align-items-center gap-3 flex-wrap text-secondary caption">
          <span class="d-inline-flex align-items-center gap-1"><i data-lucide="globe"></i></span>
          <code class="ltr-isolate mono-sm text-body">${escapeHtml(env.baseUrl)}</code>
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(env.baseUrl)}" aria-label="${tr('ui.copyBaseUrl')}"><i data-lucide="copy"></i></button>
        </div>
      </div>
      <div class="d-flex align-items-center gap-4 text-end">
        <div>
          <div class="text-tertiary caption">${tr('env.apiKeysHeading')}</div>
          <div class="fw-medium text-body tabular-nums">${keysFor().length}</div>
        </div>
        <div>
          <div class="text-tertiary caption">${tr('keys.created')}</div>
          <div class="fw-medium text-body">${escapeHtml(relativeTime(env.created))}</div>
        </div>
      </div>
    </div>`;
  document.querySelectorAll('#env-summary [data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}

// --- Variables ------------------------------------------------------------------
function mask(value) {
  return '•'.repeat(Math.min(16, Math.max(6, value.length)));
}

function renderVariables() {
  const tbody = document.getElementById('var-list');
  const list = varsFor();
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state">
      <span class="empty-icon"><i data-lucide="braces"></i></span>
      <h4 class="empty-title">${tr('ui.noVariables')}</h4>
      <p class="empty-desc mb-0">${tr('ui.addFirstVariable')}</p>
    </div></td></tr>`;
  } else {
    tbody.innerHTML = list
      .map((v) => {
        const isRevealed = revealed.has(v.id);
        const shown = !v.secret || isRevealed ? v.value : mask(v.value);
        return `
        <tr data-id="${escapeHtml(v.id)}">
          <td>
            <code class="ltr-isolate mono-sm text-body">${escapeHtml(v.name)}</code>
            <div class="text-tertiary caption">${v.secret ? tr('env.secret') : tr('env.plainText')} · ${tr('env.addedBy', { name: escapeHtml(v.addedBy) })}</div>
          </td>
          <td>
            <span class="d-inline-flex align-items-center gap-2">
              <code class="ltr-isolate mono-sm ${v.secret && !isRevealed ? 'text-secondary' : 'text-body'}">${escapeHtml(shown)}</code>
              ${v.secret ? `<button type="button" class="btn btn-icon btn-icon--sm" data-var-action="reveal" aria-label="${isRevealed ? tr('env.hideValue') : tr('env.revealValue')}"><i data-lucide="${isRevealed ? 'eye-off' : 'eye'}"></i></button>` : ''}
              <button type="button" class="btn btn-icon btn-icon--sm" data-var-action="copy" data-copy="${escapeHtml(v.value)}" aria-label="${tr('ui.copyValue')}"><i data-lucide="copy"></i></button>
              <button type="button" class="btn btn-icon btn-icon--sm" data-var-action="delete" aria-label="${tr('ui.deleteVariable')}"><i data-lucide="trash-2"></i></button>
            </span>
          </td>
          <td class="text-secondary" title="${escapeHtml(absoluteTime(v.updatedAt))}">${relativeTime(v.updatedAt)}</td>
        </tr>`;
      })
      .join('');
  }
  document.getElementById('var-count').textContent = tr('env.varsCount', { count: number(list.length), env: envName(activeEnv) });
  tbody.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}

// --- API keys ----------------------------------------------------------------------
function renderKeys() {
  const tbody = document.getElementById('env-keys');
  const list = keysFor();
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">
      <span class="empty-icon"><i data-lucide="key"></i></span>
      <h4 class="empty-title">${tr('ui.noKeys')}</h4>
      <p class="empty-desc mb-0">${tr('ui.firstKey')}</p>
    </div></td></tr>`;
  } else {
    tbody.innerHTML = list
      .map(
        (k) => `
        <tr>
          <td>
            <div class="fw-medium text-body">${escapeHtml(k.name)}</div>
            <div class="text-tertiary caption">${k.permission === 'full' ? tr('keys.permissionFull') : tr('keys.permissionRestricted')}</div>
          </td>
          <td>
            <span class="d-inline-flex align-items-center gap-2">
              <code class="ltr-isolate mono-sm text-secondary">${escapeHtml(k.prefix)}…</code>
              <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(k.prefix)}" aria-label="${tr('ui.copyPrefix')}"><i data-lucide="copy"></i></button>
            </span>
          </td>
          <td>${k.scopes.map((s) => `<span class="badge badge-accent ltr-isolate">${escapeHtml(s)}</span>`).join(' ')}</td>
          <td class="text-secondary" title="${escapeHtml(absoluteTime(k.lastUsedAt))}">${relativeTime(k.lastUsedAt)}</td>
        </tr>`
      )
      .join('');
  }
  document.getElementById('key-count').textContent = tr('env.keysCount', { count: number(list.length), env: envName(activeEnv) });
  tbody.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}

// --- Add variable --------------------------------------------------------------------
function saveVariable() {
  const name = document.getElementById('var-name').value.trim().toUpperCase();
  const value = document.getElementById('var-value').value;
  const secret = document.getElementById('var-secret').checked;
  if (!name || !value) {
    afxToast({ message: tr('env.nameValueRequired'), type: 'error' });
    return;
  }
  variables.push({
    id: `var_new_${Date.now().toString(36)}`,
    name,
    value,
    secret,
    environment: activeEnv,
    updatedAt: new Date().toISOString(),
    addedBy: 'علی رضایی',
  });
  Modal.getOrCreateInstance(document.getElementById('variable-modal')).hide();
  document.getElementById('var-name').value = '';
  document.getElementById('var-value').value = '';
  afxToast({ message: tr('ui.variableAdded', { name, env: envName(activeEnv) }), type: 'success' });
  renderVariables();
}

function deleteVariable(id) {
  const idx = variables.findIndex((v) => v.id === id);
  if (idx < 0) return;
  const [removed] = variables.splice(idx, 1);
  afxToast({
    message: tr('ui.variableDeleted', { name: removed.name }),
    type: 'info',
    action: {
      label: tr('ui.undo'),
      onClick: () => {
        variables.splice(idx, 0, removed);
        renderVariables();
      },
    },
  });
  renderVariables();
}

// --- Wiring -------------------------------------------------------------------------
function setEnv(id) {
  activeEnv = id;
  document.querySelectorAll('#env-switcher .seg__item').forEach((b) => {
    const active = b.dataset.envPage === id;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  renderNotice();
  renderSummary();
  renderVariables();
  renderKeys();
}

document.querySelectorAll('#env-switcher .seg__item').forEach((btn) => {
  btn.addEventListener('click', () => setEnv(btn.dataset.envPage));
});

document.getElementById('variable-create').addEventListener('click', () => {
  Modal.getOrCreateInstance(document.getElementById('variable-modal')).show();
});
document.getElementById('var-save').addEventListener('click', saveVariable);

document.getElementById('var-list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-var-action]');
  if (!btn) return;
  const row = btn.closest('tr[data-id]');
  const id = row && row.dataset.id;
  const action = btn.dataset.varAction;
  if (action === 'reveal') {
    if (revealed.has(id)) revealed.delete(id);
    else revealed.add(id);
    renderVariables();
  } else if (action === 'delete' && id) {
    deleteVariable(id);
  }
});

setEnv('live');

function render() {
  renderNotice();
  renderSummary();
  renderVariables();
  renderKeys();
}

// Re-render when the locale flips.
onLocaleChange(render);
