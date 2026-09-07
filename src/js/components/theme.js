// =============================================================
// APIForge X — Theme (dark/light)
// The no-flash value is set by an inline script in <head>. This module
// wires toggles, persists the choice, and emits a theme-change event
// (Chart.js re-themes from it in later phases).
// =============================================================

const STORAGE_KEY = 'afx-theme';

export function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

export function setTheme(theme, { persist = true } = {}) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode — ignore */
    }
  }
  // Let other components (charts) react to the change.
  document.dispatchEvent(new CustomEvent('afx:theme', { detail: { theme } }));
}

export function toggleTheme() {
  setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

function refreshToggles() {
  const dark = currentTheme() === 'dark';
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(!dark));
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  });
}

export function initTheme() {
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleTheme();
      refreshToggles();
    });
  });
  refreshToggles();
}
