// =============================================================
// APIForge X — Environment management
// Production / Staging / Development switcher with a production
// warning banner, a per-environment summary, masked variables
// (reveal / copy / delete / add) and API keys separated by
// environment. In-session mutation only, backed by mock-*.json.
// =============================================================

import { boot } from '../main.js';
import { Modal } from '../core/bootstrap.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';
import { bindCopyButton } from '../components/copy.js';
import { escapeHtml, relativeTime, absoluteTime } from '../utils/format.js';
import environmentsData from '../data/mock-environments.json';
import variablesData from '../data/mock-variables.json';
import keysData from '../data/mock-keys.json';

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
          <div class="fw-medium">You're working in Production</div>
          <div class="mt-1">Changes to variables and keys apply to live traffic immediately.</div>
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
          <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(env.baseUrl)}" aria-label="Copy base URL"><i data-lucide="copy"></i></button>
        </div>
      </div>
      <div class="d-flex align-items-center gap-4 text-end">
        <div>
          <div class="text-tertiary caption">API keys</div>
          <div class="fw-medium text-body tabular-nums">${keysFor().length}</div>
        </div>
        <div>
          <div class="text-tertiary caption">Created</div>
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
      <h4 class="empty-title">No variables</h4>
      <p class="empty-desc mb-0">Add your first variable for this environment.</p>
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
            <div class="text-tertiary caption">${v.secret ? 'Secret' : 'Plain text'} · added by ${escapeHtml(v.addedBy)}</div>
          </td>
          <td>
            <span class="d-inline-flex align-items-center gap-2">
              <code class="ltr-isolate mono-sm ${v.secret && !isRevealed ? 'text-secondary' : 'text-body'}">${escapeHtml(shown)}</code>
              ${v.secret ? `<button type="button" class="btn btn-icon btn-icon--sm" data-var-action="reveal" aria-label="${isRevealed ? 'Hide value' : 'Reveal value'}"><i data-lucide="${isRevealed ? 'eye-off' : 'eye'}"></i></button>` : ''}
              <button type="button" class="btn btn-icon btn-icon--sm" data-var-action="copy" data-copy="${escapeHtml(v.value)}" aria-label="Copy value"><i data-lucide="copy"></i></button>
              <button type="button" class="btn btn-icon btn-icon--sm" data-var-action="delete" aria-label="Delete variable"><i data-lucide="trash-2"></i></button>
            </span>
          </td>
          <td class="text-secondary" title="${escapeHtml(absoluteTime(v.updatedAt))}">${relativeTime(v.updatedAt)}</td>
        </tr>`;
      })
      .join('');
  }
  document.getElementById('var-count').textContent = `${list.length} variables in ${envName(activeEnv)}`;
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
      <h4 class="empty-title">No API keys</h4>
      <p class="empty-desc mb-0">Create a key in this environment to see it here.</p>
    </div></td></tr>`;
  } else {
    tbody.innerHTML = list
      .map(
        (k) => `
        <tr>
          <td>
            <div class="fw-medium text-body">${escapeHtml(k.name)}</div>
            <div class="text-tertiary caption">${k.permission === 'full' ? 'Full access' : 'Restricted'}</div>
          </td>
          <td>
            <span class="d-inline-flex align-items-center gap-2">
              <code class="ltr-isolate mono-sm text-secondary">${escapeHtml(k.prefix)}…</code>
              <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(k.prefix)}" aria-label="Copy key prefix"><i data-lucide="copy"></i></button>
            </span>
          </td>
          <td>${k.scopes.map((s) => `<span class="badge badge-accent ltr-isolate">${escapeHtml(s)}</span>`).join(' ')}</td>
          <td class="text-secondary" title="${escapeHtml(absoluteTime(k.lastUsedAt))}">${relativeTime(k.lastUsedAt)}</td>
        </tr>`
      )
      .join('');
  }
  document.getElementById('key-count').textContent = `${list.length} keys in ${envName(activeEnv)}`;
  tbody.querySelectorAll('[data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}

// --- Add variable --------------------------------------------------------------------
function saveVariable() {
  const name = document.getElementById('var-name').value.trim().toUpperCase();
  const value = document.getElementById('var-value').value;
  const secret = document.getElementById('var-secret').checked;
  if (!name || !value) {
    afxToast({ message: 'Name and value are required', type: 'error' });
    return;
  }
  variables.push({
    id: `var_new_${Date.now().toString(36)}`,
    name,
    value,
    secret,
    environment: activeEnv,
    updatedAt: new Date().toISOString(),
    addedBy: 'Arash P.',
  });
  Modal.getOrCreateInstance(document.getElementById('variable-modal')).hide();
  document.getElementById('var-name').value = '';
  document.getElementById('var-value').value = '';
  afxToast({ message: `Variable ${name} added to ${envName(activeEnv)}`, type: 'success' });
  renderVariables();
}

function deleteVariable(id) {
  const idx = variables.findIndex((v) => v.id === id);
  if (idx < 0) return;
  const [removed] = variables.splice(idx, 1);
  afxToast({
    message: `Deleted ${removed.name}`,
    type: 'info',
    action: {
      label: 'Undo',
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
