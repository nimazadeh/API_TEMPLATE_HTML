// =============================================================
// APIForge X — Environment switcher (Test / Live)
// Stripe-like pill toggle. Persists to localStorage, shows a "Test
// mode" banner and updates key prefixes rendered from mock data.
// =============================================================

const STORAGE_KEY = 'afx-env';

export function currentEnv() {
  return document.body.dataset.env || 'live';
}

export function setEnv(env, { persist = true } = {}) {
  document.body.dataset.env = env;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, env);
    } catch {
      /* ignore */
    }
  }
  refreshState();
  document.dispatchEvent(new CustomEvent('afx:env', { detail: { env } }));
}

function refreshState() {
  const env = currentEnv();
  document.querySelectorAll('[data-env-switcher] .env-option').forEach((opt) => {
    const active = opt.dataset.env === env;
    opt.classList.toggle('is-active', active);
    opt.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-env-banner]').forEach((banner) => {
    banner.hidden = env !== 'test';
  });
}

export function initEnvSwitcher() {
  // Restore persisted env before first paint of dependent content.
  let env = null;
  try {
    env = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  if (env === 'test' || env === 'live') document.body.dataset.env = env;

  document.querySelectorAll('[data-env-switcher]').forEach((switcher) => {
    switcher.querySelectorAll('.env-option').forEach((opt) => {
      opt.addEventListener('click', () => setEnv(opt.dataset.env));
    });
  });
  refreshState();
}
