// =============================================================
// APIForge X — Forgot password (account state)
// Static template: validates the email and shows a confirmation
// state. No email is actually sent.
// =============================================================

import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';

boot();

const form = document.getElementById('forgot-form');
const email = document.getElementById('forgot-email');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  email.classList.toggle('is-invalid', !okEmail);
  if (!okEmail) {
    afxToast({ message: 'یک ایمیل معتبر وارد کنید.', type: 'error' });
    return;
  }
  document.getElementById('forgot-sent').hidden = false;
  form.hidden = true;
  afxToast({ message: 'اقدام نمایشی — ایمیلی ارسال نشد.', type: 'info' });
});

createIcons({ icons });
