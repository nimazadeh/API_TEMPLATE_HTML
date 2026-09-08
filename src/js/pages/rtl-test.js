// =============================================================
// APIForge X — RTL/LTR test harness
// Theme (dark/light/system) and direction (rtl/ltr) switching.
// Directional icons are re-chosen when direction changes.
// =============================================================

import { boot } from '../main.js';
import { setTheme } from '../components/theme.js';
import { renderLogs } from '../components/table.js';
import { createIcons, icons } from '../components/icons.js';
import logs from '../data/mock-logs.json';

boot();

const root = document.documentElement;
const DIR_KEY = 'afx-dir';
const systemMedia = window.matchMedia('(prefers-color-scheme: light)');

function highlightMode() {
  const stored = localStorage.getItem('afx-theme');
  const resolved = stored || (systemMedia.matches ? 'light' : 'dark');
  document.querySelectorAll('[data-mode]').forEach((btn) => {
    const mode = stored ? resolved : 'system';
    btn.classList.toggle('is-active', btn.dataset.mode === mode);
  });
}

function highlightDir() {
  document.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.dir === root.getAttribute('dir'));
  });
}

function setDir(dir) {
  root.setAttribute('dir', dir);
  root.setAttribute('lang', dir === 'rtl' ? 'fa' : 'en');
  try {
    localStorage.setItem(DIR_KEY, dir);
  } catch {
    /* ignore */
  }
  refreshDirIcons();
  highlightDir();
}

function refreshDirIcons() {
  const rtl = root.getAttribute('dir') === 'rtl';
  document.querySelectorAll('[data-dir-icon]').forEach((slot) => {
    const kind = slot.dataset.dirIcon;
    // "back" points toward the reading start; "next" toward the end.
    const name = kind === 'back' ? (rtl ? 'arrow-right' : 'arrow-left') : rtl ? 'arrow-left' : 'arrow-right';
    if (icons[name]) {
      slot.outerHTML = icons[name].toSvg({ width: 16, height: 16, 'stroke-width': 2 });
    }
  });
  createIcons({ icons });
}

function setMode(mode) {
  if (mode === 'system') {
    try {
      localStorage.removeItem('afx-theme');
    } catch {
      /* ignore */
    }
    setTheme(systemMedia.matches ? 'light' : 'dark', { persist: false });
    root.style.colorScheme = 'dark light';
  } else {
    setTheme(mode, { persist: true });
  }
  highlightMode();
}

// System theme: follow the OS live when in system mode.
systemMedia.addEventListener('change', () => {
  if (!localStorage.getItem('afx-theme')) {
    setTheme(systemMedia.matches ? 'light' : 'dark', { persist: false });
    root.style.colorScheme = 'dark light';
  }
});

// Controls
document.querySelectorAll('[data-dir]').forEach((btn) => {
  btn.addEventListener('click', () => setDir(btn.dataset.dir));
});
document.querySelectorAll('[data-mode]').forEach((btn) => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// Mixed-content table: LTR-isolated code columns inside an RTL page.
renderLogs(document.querySelector('#logs-demo'), logs, { limit: 6 });

refreshDirIcons();
highlightDir();
highlightMode();
