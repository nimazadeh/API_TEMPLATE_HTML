// =============================================================
// APIForge X — Sign in (account state)
// Static template: validates the form and models a successful
// sign-in with a toast. No real authentication is performed.
// =============================================================

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
    afxToast({ message: 'یک ایمیل معتبر و گذرواژهٔ دست‌کم ۶ نویسه‌ای وارد کنید.', type: 'error' });
    return;
  }

  submit.disabled = true;
  submit.innerHTML = '<span class="spinner"></span> در حال ورود…';
  setTimeout(() => {
    submit.disabled = false;
    submit.innerHTML = '<i data-lucide="log-in"></i> ورود';
    createIcons({ icons });
    afxToast({ message: 'اقدام نمایشی — احراز هویت شبیه‌سازی شد. برای کاوش به داشبورد بروید.', type: 'success', delay: 5000 });
  }, 700);
});

createIcons({ icons });
