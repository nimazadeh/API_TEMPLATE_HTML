// =============================================================
// APIForge X — Accept invitation (account state)
// Static template: shows the inviting workspace and role, then
// validates the account form. Models a successful accept with a
// toast — no backend exists.
// =============================================================

import { t as tr, onLocaleChange } from '../core/i18n.js';
import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';

boot();

const form = document.getElementById('invite-form');
const name = document.getElementById('invite-name');
const password = document.getElementById('invite-password');
const submit = document.getElementById('invite-submit');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const okName = name.value.trim().length >= 2;
  const okPassword = password.value.length >= 8;
  name.classList.toggle('is-invalid', !okName);
  password.classList.toggle('is-invalid', !okPassword);
  if (!okName || !okPassword) {
    afxToast({ message: tr('auth.inviteInvalid'), type: 'error' });
    return;
  }
  submit.disabled = true;
  submit.dataset.i18n = 'auth.joining';
  submit.innerHTML = tr('auth.joining');
  setTimeout(() => {
    submit.disabled = false;
    submit.dataset.i18n = 'auth.joinWorkspace';
    submit.innerHTML = tr('auth.joinWorkspace');
    createIcons({ icons });
    afxToast({ message: tr('auth.inviteSuccess'), type: 'success', delay: 5000 });
  }, 700);
});

createIcons({ icons });
