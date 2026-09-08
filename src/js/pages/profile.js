// =============================================================
// APIForge X — Profile
// Personal information, preferences (theme/language/timezone/
// notifications) and developer identity. Editable with save/cancel
// + validation and toasts.
// =============================================================

import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';
import { t as tr, onLocaleChange, setLocale, getLocale } from '../core/i18n.js';
import { formatDate } from '../utils/format.js';
import { setThemeMode } from '../components/theme.js';

boot();

let customName = null;
let nameDirty = false;
const PROFILE = {
  get name() { return customName ?? tr('profile.displayName'); },
  set name(value) { customName = value; },
  email: 'arash@apiforge.dev',
  role: 'Owner',
  timezone: 'Europe/Berlin',
  language: getLocale(),
  handle: 'arash',
  github: 'arashp',
  website: 'https://arash.dev',
  org: 'APIForge',
  developerId: 'dev_8Fk2mQx1Zw',
  joined: '2025-11-14',
};

const TIMEZONES = ['Europe/Berlin', 'Asia/Tehran', 'UTC', 'America/New_York', 'Asia/Tokyo'];

function fillForm() {
  document.getElementById('pf-name').value = PROFILE.name;
  document.getElementById('pf-email').value = PROFILE.email;
  document.getElementById('pf-timezone').innerHTML = TIMEZONES.map((tz) => `<option value="${tz}" ${tz === PROFILE.timezone ? 'selected' : ''}>${tz}</option>`).join('');
  document.getElementById('pf-language').value = PROFILE.language;
  document.getElementById('pf-handle').value = PROFILE.handle;
  document.getElementById('pf-github').value = PROFILE.github;
  document.getElementById('pf-website').value = PROFILE.website;
  document.getElementById('pf-org').value = PROFILE.org;
}

function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function renderMeta() {
  document.getElementById('pf-avatar').textContent = initialsOf(PROFILE.name) || 'عر';
  document.getElementById('pf-display-name').textContent = PROFILE.name;
  document.getElementById('pf-email-display').textContent = PROFILE.email;
  document.getElementById('pf-email').value = PROFILE.email;
  document.getElementById('pf-role').textContent = tr('profile.owner');
  document.getElementById('pf-joined').textContent = formatDate(PROFILE.joined);
  document.getElementById('pf-dev-id').textContent = PROFILE.developerId;
}

function validate() {
  const name = document.getElementById('pf-name');
  const email = document.getElementById('pf-email');
  const handle = document.getElementById('pf-handle');
  const okName = name.value.trim().length >= 2;
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  const okHandle = /^[a-z0-9_-]{3,30}$/.test(handle.value.trim());
  name.classList.toggle('is-invalid', !okName);
  email.classList.toggle('is-invalid', !okEmail);
  handle.classList.toggle('is-invalid', !okHandle);
  return okName && okEmail && okHandle;
}

function bind() {
  document.getElementById('pf-name').addEventListener('input', () => { nameDirty = true; });
  document.getElementById('pf-save').addEventListener('click', () => {
    if (!validate()) {
      afxToast({ message: tr('profile.fixFields'), type: 'error' });
      return;
    }
    PROFILE.name = document.getElementById('pf-name').value.trim();
    PROFILE.email = document.getElementById('pf-email').value.trim();
    PROFILE.handle = document.getElementById('pf-handle').value.trim();
    PROFILE.timezone = document.getElementById('pf-timezone').value;
    PROFILE.language = document.getElementById('pf-language').value;
    PROFILE.github = document.getElementById('pf-github').value.trim();
    PROFILE.website = document.getElementById('pf-website').value.trim();
    PROFILE.org = document.getElementById('pf-org').value.trim();
    setLocale(PROFILE.language);
    renderMeta();
    afxToast({ message: tr('profile.saved'), type: 'success' });
  });

  document.getElementById('pf-cancel').addEventListener('click', () => {
    fillForm();
    afxToast({ message: tr('profile.discarded'), type: 'info' });
  });

  document.querySelectorAll('[data-pref]').forEach((seg) => {
    seg.addEventListener('click', () => {
      document.querySelectorAll('[data-pref]').forEach((s) => {
        s.classList.toggle('is-active', s === seg);
        s.setAttribute('aria-pressed', String(s === seg));
      });
      setThemeMode(seg.dataset.pref);
      afxToast({ message: tr('profile.themeUpdated'), type: 'success' });
    });
  });

  document.getElementById('pf-notify').addEventListener('change', (e) => {
    afxToast({ message: e.target.checked ? tr('profile.notificationsOn') : tr('profile.notificationsOff'), type: 'info' });
  });
}

renderMeta();
fillForm();
bind();
createIcons({ icons });

onLocaleChange(() => {
  document.getElementById('pf-display-name').textContent = PROFILE.name;
  document.getElementById('pf-avatar').textContent = initialsOf(PROFILE.name);
  if (!nameDirty) document.getElementById('pf-name').value = PROFILE.name;
  document.getElementById('pf-role').textContent = tr('profile.owner');
  document.getElementById('pf-joined').textContent = formatDate(PROFILE.joined);
  PROFILE.language = getLocale();
  document.getElementById('pf-language').value = PROFILE.language;
});
