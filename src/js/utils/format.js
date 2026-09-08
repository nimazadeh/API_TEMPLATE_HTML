// =============================================================
// APIForge X — Formatting utilities
// Relative time, latency color, status/method badge classes,
// HTML escaping, tabular number formatting.
//
// Everything here is locale-aware: with the Persian locale active,
// numbers use Persian digits and dates render in the Jalali calendar
// (`fa-IR`). Technical values — paths, ids, tokens, status codes —
// always stay Latin/LTR; they are wrapped in `.ltr-isolate` by the
// components that render them.
// =============================================================

import { getLocale, t } from '../core/i18n.js';

/** BCP-47 tag for the active locale (Jalali + Persian digits for fa). */
export function localeTag() {
  return getLocale() === 'fa' ? 'fa-IR' : 'en-GB';
}

/** Escape HTML so mock data can't inject markup. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Localized relative time: "just now", "4m ago", "2h ago", "3d ago". */
export function relativeTime(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diff = Date.now() - then;
  const num = (v) => number(v);
  const sec = Math.round(diff / 1000);
  if (sec < 45) return t('time.justNow');
  const min = Math.round(sec / 60);
  if (min < 60) return t('time.minutesAgo', { count: num(min) });
  const hr = Math.round(min / 60);
  if (hr < 24) return t('time.hoursAgo', { count: num(hr) });
  const day = Math.round(hr / 24);
  if (day < 30) return t('time.daysAgo', { count: num(day) });
  return formatDate(iso);
}

/** Absolute timestamp for the title attribute (hover). */
export function absoluteTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(localeTag(), {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

/** Clock time only (webhook delivery timeline). */
export function clockTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** Latency color class: fast <300ms, mid <1s, slow >=1s. */
export function latencyClass(ms) {
  if (ms < 300) return 'latency--fast';
  if (ms < 1000) return 'latency--mid';
  return 'latency--slow';
}

/** Human latency text — both digits and units follow the locale. */
export function latencyText(ms) {
  if (ms < 1000) return t('ui.latencyMs', { value: number(ms) });
  return t('ui.latencySeconds', { value: number(Number((ms / 1000).toFixed(2))) });
}

/** Status badge class from HTTP status code. */
export function statusBadgeClass(code) {
  if (code >= 200 && code < 300) return 'badge-status--success';
  if (code === 429) return 'badge-status--429';
  if (code >= 400 && code < 500) return 'badge-status--warning';
  if (code >= 500) return 'badge-status--error';
  return 'badge-status--neutral';
}

/** Method badge class. */
export function methodBadgeClass(method) {
  return `badge-method--${String(method).toUpperCase()}`;
}

/** Convert Western digits to Persian digits. */
export function faDigits(str) {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  return String(str).replace(/[0-9]/g, (d) => fa[+d]);
}

/** Group thousands — Persian digits and separators when fa is active. */
export function number(n) {
  return Number(n).toLocaleString(localeTag());
}

/** Backwards-compatible alias used across page modules. */
export function formatNumber(n) {
  return number(n);
}

/** Compact number: 1.2M, 842K, 9.4K (fa: «۱٫۲ میلیون»). */
export function compactNumber(n) {
  const v = Number(n);
  if (getLocale() === 'fa') {
    return new Intl.NumberFormat('fa-IR', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  }
  if (v >= 1e6) return `${(v / 1e6).toFixed(v >= 1e7 ? 1 : 2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(v >= 1e4 ? 0 : 1)}K`;
  return String(v);
}

/** Date → Jalali "۱۷ شهریور ۱۴۰۵" (fa) or "8 Sep 2026" (en). */
export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(localeTag(), { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Percent with fixed decimals and % sign (digits follow the locale). */
export function percent(n, digits = 1) {
  const v = Number(n).toFixed(digits);
  return `${getLocale() === 'fa' ? faDigits(v) : v}%`;
}

/** Short, locale-aware chart date (technical timestamps remain unchanged). */
export function chartDate(iso) {
  return new Date(iso).toLocaleDateString(localeTag(), { month: 'short', day: 'numeric' });
}

/** Environment enums are stable identifiers; only their UI labels translate. */
export function environmentLabel(env) {
  const key = { live: 'env.production', production: 'env.production', staging: 'env.staging', test: 'env.testOption' }[env];
  return key ? t(key) : env;
}
