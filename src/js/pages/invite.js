// =============================================================
// APIForge X — Accept invitation (account state)
// Static template: shows the inviting workspace and role, then
// validates the account form. Models a successful accept with a
// toast — no backend exists.
// =============================================================

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
    afxToast({ message: 'نام و گذرواژهٔ دست‌کم ۸ نویسه‌ای وارد کنید.', type: 'error' });
    return;
  }
  submit.disabled = true;
  submit.innerHTML = '<span class="spinner"></span> در حال پیوستن…';
  setTimeout(() => {
    afxToast({ message: 'اقدام نمایشی — دعوت‌نامه در این نمونه پذیرفته شد.', type: 'success', delay: 5000 });
  }, 700);
});

createIcons({ icons });
