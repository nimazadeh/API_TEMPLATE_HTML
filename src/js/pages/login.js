// =============================================================
// APIForge X — Sign in (account state)
// Static template: validates the form and models a successful
// sign-in with a toast. No real authentication is performed.
// =============================================================

import { t as tr, onLocaleChange } from '../core/i18n.js';
import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';

boot();

const form = document.getElementById('login-form');
const email = document.getElementById('login-email');
const password = document.getElementById('login-password');
const submit = document.getElementById('login-submit');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  const okPassword = password.value.length >= 6;

  email.classList.toggle('is-invalid', !okEmail);
  password.classList.toggle('is-invalid', !okPassword);

  if (!okEmail || !okPassword) {
    afxToast({ message: tr('auth.loginInvalid'), type: 'error' });
    return;
  }

  submit.disabled = true;
  submit.dataset.i18n = 'auth.signingIn';
  submit.innerHTML = tr('auth.signingIn');
  setTimeout(() => {
    submit.disabled = false;
    submit.dataset.i18n = 'auth.signIn';
    submit.innerHTML = tr('auth.signIn');
    createIcons({ icons });
    afxToast({ message: tr('auth.loginSuccess'), type: 'success', delay: 5000 });
  }, 700);
});

createIcons({ icons });
