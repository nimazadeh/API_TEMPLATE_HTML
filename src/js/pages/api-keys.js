// =============================================================
// APIForge X — API Keys
// Masked key list with reveal-once modal, copy/rotate/revoke
// actions and a confirmation modal. Environment-aware, backed by
// the deterministic mock-keys.json (mutable in-session only).
// =============================================================

import { trackLocalizedView } from '../components/localized-view.js';
import { localizedFixture } from '../data/localized.js';
import { boot } from '../main.js';
import { Modal } from '../core/bootstrap.js';
import { createIcons, icons } from '../components/icons.js';
import { renderKeys } from '../components/table.js';
import { afxToast } from '../components/toast.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { currentEnv } from '../components/env-switcher.js';
import { number } from '../utils/format.js';
import keysDataFa from '../data/mock-keys.json';
import keysDataEn from '../data/mock-keys.en.json';

const keysData = localizedFixture(keysDataFa, keysDataEn);

boot();

const keys = [...keysData]; // in-session mutable copy
const secrets = new Map();

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function randomToken(seed) {
  let n = hash(seed) || 0x2b6a1;
  let out = '';
  for (let i = 0; i < 16; i++) {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    out += CHARS[n % CHARS.length];
  }
  return out;
}
function newPrefix(env) {
  return env === 'live' ? `sk_live_${randomToken(Date.now().toString() + Math.random())}` : `sk_test_${randomToken(Date.now().toString() + Math.random())}`;
}
function fullKey(key) {
  if (!secrets.has(key.id)) secrets.set(key.id, `${key.prefix}_${randomToken(key.id + key.prefix)}`);
  return secrets.get(key.id);
}

// --- Rendering ---------------------------------------------------------
function visibleKeys() {
  return keys.filter((k) => k.env === currentEnv());
}

function render() {
  const list = visibleKeys();
  const tbody = document.getElementById('keys-list');
  renderKeys(tbody, list);
  // Point each copy button at the full secret (the shared renderer already
  // bound the click handler, which reads dataset.copy at click time).
  tbody.querySelectorAll('tr').forEach((row) => {
    const key = list.find((k) => k.id === row.dataset.id);
    const btn = row.querySelector('[data-copy]');
    if (key && btn) btn.dataset.copy = fullKey(key);
  });
  document.getElementById('keys-count').textContent = tr('ui.keysCount', { count: number(list.length), env: tr(currentEnv() === 'live' ? 'env.liveOption' : 'env.testOption') });
  createIcons({ icons });
}

// --- Reveal-once modal -------------------------------------------------
function openReveal(key, { isNew = false } = {}) {
  const modal = Modal.getOrCreateInstance(document.getElementById('reveal-modal'));
  document.getElementById('reveal-modal-title').dataset.i18n = isNew ? 'keys.revealTitle' : 'ui.revealKey';
  document.getElementById('reveal-note').dataset.i18n = isNew ? 'keys.copyNow' : 'keys.copyOnce';
  document.getElementById('reveal-modal-title').textContent = tr(isNew ? 'keys.revealTitle' : 'ui.revealKey');
  document.getElementById('reveal-note').textContent = isNew
    ? tr('keys.copyNow')
    : tr('keys.copyOnce');
  document.getElementById('reveal-key-value').value = fullKey(key);
  const copied = document.getElementById('reveal-copied');
  const done = document.getElementById('reveal-done');
  copied.checked = false;
  done.disabled = true;
  modal.show();
}

function bindRevealModal() {
  document.getElementById('reveal-copied').addEventListener('change', (e) => {
    document.getElementById('reveal-done').disabled = !e.target.checked;
  });
}

// --- Confirm modal -----------------------------------------------------
let pendingAction = null;
function openConfirm({ title, body, confirmLabel = tr('action.confirm'), onConfirm }) {
  const resolveText = (value) => typeof value === 'function' ? value() : value;
  const paint = () => {
    document.getElementById('confirm-modal-title').textContent = resolveText(title);
    document.getElementById('confirm-modal-body').textContent = resolveText(body);
    const submit = document.getElementById('confirm-modal-submit');
    submit.textContent = resolveText(confirmLabel);
    submit.className = `btn ${resolveText(confirmLabel) === tr('action.revoke') ? 'btn-danger' : 'btn-primary'}`;
  };
  paint();
  trackLocalizedView(document.getElementById('confirm-modal'), paint);
  pendingAction = onConfirm;
  Modal.getOrCreateInstance(document.getElementById('confirm-modal')).show();
}
function bindConfirmModal() {
  document.getElementById('confirm-modal-submit').addEventListener('click', () => {
    const fn = pendingAction;
    pendingAction = null;
    Modal.getOrCreateInstance(document.getElementById('confirm-modal')).hide();
    // Wait for the hide transition so a follow-up modal opens cleanly.
    setTimeout(() => fn?.(), 320);
  });
}

// --- Actions -----------------------------------------------------------
function rotate(key) {
  openConfirm({
    title: () => (tr('keys.rotateTitle')),
    body: () => (tr('ui.rotateKeyBody', { name: key.name })),
    confirmLabel: () => (tr('action.rotate')),
    onConfirm: () => {
      key.prefix = newPrefix(key.env);
      secrets.delete(key.id);
      render();
      afxToast({ message: tr('keys.rotatedToast', { name: key.name }), type: 'success' });
      openReveal(key, { isNew: true });
    },
  });
}

function revoke(key) {
  openConfirm({
    title: () => (tr('keys.revokeTitle')),
    body: () => (tr('ui.revokeKeyBody', { name: key.name })),
    confirmLabel: () => (tr('action.revoke')),
    onConfirm: () => {
      key.status = 'revoked';
      render();
      afxToast({ message: tr('keys.revokedToast', { name: key.name }), type: 'info' });
    },
  });
}

// --- Create ------------------------------------------------------------
function bindCreateModal() {
  document.getElementById('key-create-submit').addEventListener('click', () => {
    const nameInput = document.getElementById('key-name');
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.classList.add('is-invalid');
      nameInput.focus();
      return;
    }
    nameInput.classList.remove('is-invalid');
    const scopes = [...document.querySelectorAll('#create-modal input[type="checkbox"]:checked')].map((c) => c.value);
    const env = currentEnv();
    const key = {
      id: `key_${randomToken(name + Date.now())}`,
      name,
      prefix: newPrefix(env),
      scopes,
      env,
      permission: scopes.includes('emails:write') ? 'full' : 'restricted',
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      lastUsedIp: null,
      status: 'active',
    };
    keys.unshift(key);
    Modal.getOrCreateInstance(document.getElementById('create-modal')).hide();
    nameInput.value = '';
    render();
    setTimeout(() => openReveal(key, { isNew: true }), 320);
  });
}

// --- Wiring ------------------------------------------------------------
render();
bindRevealModal();
bindConfirmModal();
bindCreateModal();

document.getElementById('keys-list').addEventListener('click', (e) => {
  const actionBtn = e.target.closest('[data-key-action]');
  if (!actionBtn) return;
  const row = actionBtn.closest('tr');
  const key = keys.find((k) => k.id === row.dataset.id);
  if (!key) return;
  const action = actionBtn.dataset.keyAction;
  if (action === 'reveal') openReveal(key);
  else if (action === 'rotate') rotate(key);
  else if (action === 'revoke') revoke(key);
});

// Re-render when the environment switcher changes.
document.addEventListener('afx:env', render);

// Deep link from the dashboard / command palette: open the create modal.
if (window.location.hash === '#create') {
  Modal.getOrCreateInstance(document.getElementById('create-modal')).show();
}

onLocaleChange(render);
