// =============================================================
// APIForge X — Theme (dark/light/system)
// The no-flash value is set by an inline script in <head>. This module
// wires toggles + a 3-option theme menu, persists the choice, follows
// the OS when "system" is active, and emits a theme-change event
// (Chart.js re-themes from it).
// =============================================================

const STORAGE_KEY = 'afx-theme';
const systemMedia = window.matchMedia('(prefers-color-scheme: light)');

export function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

/** Effective resolved theme (dark/light) for charts & UI decisions. */
export function resolvedTheme() {
  return currentTheme();
}

/** The user's *chosen* mode: 'dark' | 'light' | 'system'. */
export function themeMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  } catch {
    return 'system';
  }
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

export function applySystemTheme() {
  const light = systemMedia.matches;
  document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
  document.documentElement.style.colorScheme = 'dark light';
  document.dispatchEvent(new CustomEvent('afx:theme', { detail: { theme: light ? 'light' : 'dark' } }));
}

export function setThemeMode(mode) {
  if (mode === 'system') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    applySystemTheme();
  } else {
    setTheme(mode, { persist: true });
  }
  refreshControls();
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

/** Refresh 3-option theme menus ([data-theme-menu] [data-mode]). */
function refreshMenus() {
  const mode = themeMode();
  document.querySelectorAll('[data-theme-menu]').forEach((menu) => {
    menu.querySelectorAll('[data-mode]').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.mode === mode);
      item.setAttribute('aria-checked', String(item.dataset.mode === mode));
      const check = item.querySelector('.theme-check');
      if (check) check.hidden = item.dataset.mode !== mode;
    });
  });
}

function refreshControls() {
  refreshToggles();
  refreshMenus();
}

export function initTheme() {
  // Keep OS changes in sync while "system" is the active mode.
  systemMedia.addEventListener('change', () => {
    if (themeMode() === 'system') applySystemTheme();
  });

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleTheme();
      refreshControls();
    });
  });

  document.querySelectorAll('[data-theme-menu]').forEach((menu) => {
    menu.querySelectorAll('[data-mode]').forEach((item) => {
      item.addEventListener('click', () => setThemeMode(item.dataset.mode));
    });
  });

  refreshControls();
}
