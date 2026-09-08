// =============================================================
// APIForge X — Formatting utilities
// Relative time, latency color, status/method badge classes,
// Persian digits, HTML escaping, tabular number formatting.
// =============================================================

/** Escape HTML so mock data can't inject markup. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Relative time: "just now", "4m ago", "2h ago", "3d ago". */
export function relativeTime(iso) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (Number.isNaN(then)) return '—';
  const sec = Math.round(diff / 1000);
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

/** Absolute timestamp for the title attribute (hover). */
export function absoluteTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

/** Latency color class: fast <300ms, mid <1s, slow >=1s. */
export function latencyClass(ms) {
  if (ms < 300) return 'latency--fast';
  if (ms < 1000) return 'latency--mid';
  return 'latency--slow';
}

/** Human latency text. */
export function latencyText(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
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

/** Group thousands with comma (Western digits). */
export function formatNumber(n) {
  return Number(n).toLocaleString('en-US');
}

/** Compact number: 1.2M, 842K, 9.4K. */
export function compactNumber(n) {
  const v = Number(n);
  if (v >= 1e6) return `${(v / 1e6).toFixed(v >= 1e7 ? 1 : 2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(v >= 1e4 ? 0 : 1)}K`;
  return String(v);
}

/** Date → "Sep 7, 2026" (short). */
export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Percent with fixed decimals and % sign. */
export function percent(n, digits = 1) {
  return `${Number(n).toFixed(digits)}%`;
}
