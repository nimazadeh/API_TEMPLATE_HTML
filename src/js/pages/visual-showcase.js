// =============================================================
// APIForge X — Visual & motion showcase (visual-showcase.html)
//
// The QA surface for the Phase 5.5 polish pass: it exercises the
// atmospheric backdrop, the three motion speeds, card/button micro
// -interactions, overlays and every toast state — live, in both
// themes and both directions. Nothing here ships to the product
// pages; the page only demonstrates the shared system.
// =============================================================

import { bootSite } from '../site.js';
import { setTheme } from '../components/theme.js';
import { afxToast } from '../components/toast.js';
import { t as tr, setLocale, onLocaleChange } from '../core/i18n.js';

bootSite();

const root = document.documentElement;
const systemMedia = window.matchMedia('(prefers-color-scheme: light)');

// --- Theme / direction switchers -------------------------------------------
function highlightMode() {
  const stored = localStorage.getItem('afx-theme');
  const resolved = stored || (systemMedia.matches ? 'light' : 'dark');
  document.querySelectorAll('[data-mode]').forEach((btn) => {
    const mode = stored ? resolved : 'system';
    btn.classList.toggle('is-active', btn.dataset.mode === mode);
  });
}

function highlightDir() {
  const dir = root.getAttribute('dir');
  document.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.dir === dir);
  });
}

function initSwitchers() {
  document.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => setTheme(btn.dataset.mode));
  });
  // Direction and language are the same switch: Persian is RTL, English LTR.
  document.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => setDir(btn.dataset.dir));
  });
  highlightMode();
  highlightDir();
  document.addEventListener('afx:theme', highlightMode);
  onLocaleChange(highlightDir);
}

/** Direction and language are one switch: Persian is RTL, English is LTR. */
function setDir(dir) {
  setLocale(dir === 'rtl' ? 'fa' : 'en');
}

// --- Backdrop toggle --------------------------------------------------------
function initBackdropToggle() {
  const btn = document.getElementById('vs-backdrop-toggle');
  const layers = document.querySelectorAll('[data-backdrop]');
  if (!btn || !layers.length) return;

  const sync = () => {
    const hidden = layers[0].hidden;
    btn.textContent = hidden ? tr('vs.showBackdrop') : tr('vs.hideBackdrop');
  };

  btn.addEventListener('click', () => {
    layers.forEach((layer) => {
      layer.hidden = !layer.hidden;
    });
    sync();
  });
  sync();
  onLocaleChange(sync);
}

// --- Entrance replay --------------------------------------------------------
// Clearing the animations, forcing a reflow and restoring them restarts
// every keyframe on the element from frame zero — no JS timing involved.
function replay(rootEl) {
  if (!rootEl) return;
  rootEl.classList.add('no-anim');
  void rootEl.offsetWidth;
  rootEl.classList.remove('no-anim');
}

function initReplay() {
  const hero = document.getElementById('vs-hero');
  document.getElementById('vs-replay')?.addEventListener('click', () => replay(hero));
}

// --- Motion speed comparison ------------------------------------------------
function initNudge() {
  const dots = document.querySelectorAll('.showcase-motion__dot');
  const btn = document.getElementById('vs-nudge');
  if (!btn || !dots.length) return;

  btn.addEventListener('click', () => {
    dots.forEach((dot) => dot.classList.toggle('is-nudged'));
    window.setTimeout(() => dots.forEach((dot) => dot.classList.remove('is-nudged')), 700);
  });
}

// --- Toast specimens --------------------------------------------------------
const TOASTS = {
  success: () => ({ type: 'success', title: tr('vs.toastSuccessTitle'), message: tr('vs.toastSuccessMsg') }),
  error: () => ({ type: 'error', title: tr('vs.toastErrorTitle'), message: tr('vs.toastErrorMsg') }),
  warning: () => ({ type: 'warning', title: tr('vs.toastWarningTitle'), message: tr('vs.toastWarningMsg') }),
  info: () => ({ type: 'info', title: tr('vs.toastInfoTitle'), message: tr('vs.toastInfoMsg') }),
  long: () => ({
    type: 'info',
    title: tr('vs.toastLongTitle'),
    message: tr('vs.toastLongMsg'),
    delay: 7000,
  }),
  action: () => ({
    type: 'success',
    title: tr('vs.toastUndoTitle'),
    message: tr('vs.toastUndoMsg'),
    action: { label: tr('vs.undo'), onClick: () => afxToast({ message: tr('vs.toastSuccessMsg'), type: 'info' }) },
  }),
};

function initToasts() {
  document.querySelectorAll('[data-toast]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const build = TOASTS[btn.dataset.toast];
      if (build) afxToast(build());
    });
  });
}

// --- Boot -------------------------------------------------------------------
initSwitchers();
initBackdropToggle();
initReplay();
initNudge();
initToasts();
