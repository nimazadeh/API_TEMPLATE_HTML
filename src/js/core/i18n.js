// =============================================================
// APIForge X — Localization (fa / en) + RTL runtime
//
// The template is Persian-first: every page ships with Persian copy
// in the markup and a `data-i18n` key pointing at the translation
// catalog in `src/locales/*.json`. This module:
//   • resolves the active locale (localStorage → default `fa`)
//   • exposes `t()` for JS-rendered UI strings
//   • applies catalog values to [data-i18n] / [data-i18n-attr] nodes
//   • keeps <html lang|dir> in sync (RTL for fa, LTR for en)
//   • emits `afx:localechange` so page modules can re-render data
//
// Both catalogs are imported statically so Vite bundles them — no
// runtime fetch, no flash of untranslated text, works from file://.
// =============================================================

import { createIcons, icons } from '../components/icons.js';
import fa from '../../locales/fa.json';
import en from '../../locales/en.json';

const STORAGE_KEY = 'afx-locale';
const DEFAULT_LOCALE = 'fa';

/** Catalogs, keyed by locale code. */
export const catalogs = { fa, en };

/** Declared locales — order drives the switcher UI. */
export const locales = [
  { code: 'fa', label: 'فارسی', short: 'fa', dir: 'rtl' },
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
];

let current = resolveInitialLocale();

function resolveInitialLocale() {
  // The inline <head> script already set lang/dir without a flash;
  // prefer the persisted choice; fall back to the document on restricted storage.
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fa' || stored === 'en') return stored;
  } catch {
    /* private mode — ignore */
  }
  const attr = document.documentElement.getAttribute('lang');
  return catalogs[attr] ? attr : DEFAULT_LOCALE;
}

/** Active locale code: 'fa' | 'en'. */
export function getLocale() {
  return current;
}

/** True when the UI runs right-to-left (Persian). */
export function isRtl() {
  return localeMeta(current).dir === 'rtl';
}

/** Text direction for the active locale. */
export function getDir() {
  return localeMeta(current).dir;
}

export function localeMeta(code = current) {
  return locales.find((l) => l.code === code) || locales[0];
}

/** The "other" locale — what a toggle button switches to. */
export function alternateLocale() {
  return current === 'fa' ? 'en' : 'fa';
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
function decodeEntities(str) {
  return String(str).replace(/&(#39|nbsp|amp|lt|gt|quot);/g, (m, e) => ENTITIES[e] || m);
}

/**
 * Translate a key with optional `{var}` interpolation.
 * Fallback chain: active locale → Persian → English → the key itself,
 * so a missing translation never renders an empty UI.
 */
export function t(key, vars) {
  let value = catalogs[current]?.[key];
  if (value === undefined) value = catalogs[DEFAULT_LOCALE]?.[key];
  if (value === undefined) value = catalogs.en?.[key];
  if (value === undefined) return key;
  if (!vars) return value;
  return String(value).replace(/\{(\w+)\}/g, (m, name) => (vars[name] ?? m));
}

/** Translate, then decode HTML entities (safe for textContent use). */
export function tText(key, vars) {
  return decodeEntities(t(key, vars));
}

/** Apply a catalog value to a node — innerHTML when it carries markup. */
function paint(el, value) {
  if (/<[a-zA-Z/!]/.test(value)) el.innerHTML = value;
  else el.textContent = decodeEntities(value);
}

/** Walk a subtree and (re)apply every translation binding. */
export function applyTranslations(root = document) {
  const nodes = (selector) => [
    ...(root.matches?.(selector) ? [root] : []),
    ...root.querySelectorAll(selector),
  ];
  nodes('[data-i18n]').forEach((el) => {
    paint(el, t(el.dataset.i18n));
  });

  nodes('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':');
      if (!attr || !key) return;
      const value = t(key);
      el.setAttribute(attr, decodeEntities(value));
    });
  });

  nodes('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  // Translations may re-introduce <i data-lucide> placeholders.
  createIcons({ icons });
}

/** Keep <html lang|dir> aligned with the active locale. */
function applyDocumentAttributes(code) {
  const meta = localeMeta(code);
  const root = document.documentElement;
  root.setAttribute('lang', meta.code);
  root.setAttribute('dir', meta.dir);
}

/** Persist the choice (absent = use the default locale). */
function persist(code) {
  try {
    if (code === DEFAULT_LOCALE) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* private mode — ignore */
  }
}

/** Highlight the active locale inside [data-locale-menu] dropdowns. */
function refreshMenus() {
  document.querySelectorAll('[data-locale-menu]').forEach((menu) => {
    menu.querySelectorAll('[data-locale]').forEach((item) => {
      const active = item.dataset.locale === current;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-checked', String(active));
      const check = item.querySelector('.locale-check');
      if (check) check.hidden = !active;
    });
  });
}

/** Update toggle buttons that advertise the language they switch to. */
function refreshToggles() {
  const next = localeMeta(alternateLocale());
  document.querySelectorAll('[data-locale-toggle]').forEach((btn) => {
    const label = btn.querySelector('[data-locale-label]');
    if (label) label.textContent = btn.dataset.localeLabel === 'current' ? localeMeta(current).label : next.short;
    btn.setAttribute('aria-label', t('aria.switchLanguage'));
    btn.setAttribute('title', t('aria.switchLanguage'));
  });
}

/**
 * Switch locale live: repaint the DOM, flip direction, persist and
 * notify page modules so tables, charts and drawers re-render.
 */
export function setLocale(code, { persist: save = true } = {}) {
  if (!catalogs[code] || code === current) {
    // Still normalize direction for repeat calls (e.g. on boot).
    applyDocumentAttributes(current);
    refreshMenus();
    refreshToggles();
    return current;
  }
  current = code;
  if (save) persist(code);
  applyDocumentAttributes(code);
  applyTranslations(document);
  createIcons({ icons });
  refreshMenus();
  refreshToggles();
  document.dispatchEvent(new CustomEvent('afx:localechange', { detail: { locale: code } }));
  // Page listeners can insert new icon placeholders while re-rendering.
  createIcons({ icons });
  return current;
}

/** Subscribe to locale changes (page modules re-render on this). */
export function onLocaleChange(handler) {
  document.addEventListener('afx:localechange', () => handler(current));
  return handler;
}

/** Wire every [data-locale] / [data-locale-toggle] control on the page. */
function wireControls() {
  document.querySelectorAll('[data-locale]').forEach((btn) => {
    btn.addEventListener('click', () => setLocale(btn.dataset.locale));
  });
  document.querySelectorAll('[data-locale-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => setLocale(alternateLocale()));
  });
}

/**
 * Boot the localization layer. Call once per page, before other
 * components initialize so they see translated markup.
 */
export function initI18n() {
  applyDocumentAttributes(current);
  applyTranslations(document);
  refreshMenus();
  refreshToggles();
  wireControls();
}
