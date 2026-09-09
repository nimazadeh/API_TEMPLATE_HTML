// =============================================================
// APIForge X — Chart.js theming helper
// Registers only the controllers/elements we use (line, bar, doughnut)
// and re-themes every chart from CSS variables on `afx:theme`.
// Charts stay LTR (their container carries direction: ltr).
// =============================================================

import { getLocale } from '../core/i18n.js';
import { localeTag } from '../utils/format.js';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
);

Chart.defaults.font.family = "'Inter Variable', Inter, -apple-system, sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#71717a';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

// Chart motion — one reveal at the product's slow speed
// (400ms, the hard ceiling) and nothing at all for reduced-motion users.
// NOTE: the non-reduced-motion branch MERGES into Chart.js's
// `defaults.animation` instead of replacing the object. Chart.js's
// `Animations.configure()` derives the per-property animation whitelist
// from the KEYS of `defaults.animation` (delay/duration/easing/fn/from/
// loop/to/type); replacing the object drops `type`, so hover-driven color
// transitions (element backgroundColor/borderColor) fall back to
// `interpolators[typeof value]`, find no string interpolator, and every
// animator tick under the mouse throws `TypeError: this._fn is not a
// function`. Reduced-motion keeps `false` (animation system off entirely).
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
Chart.defaults.animation = REDUCED_MOTION
  ? false
  : Object.assign(Chart.defaults.animation, { duration: 400, easing: 'easeOutQuart' });
// Hover feedback is shortened, not removed: charts should still feel
// like instruments without drifting into decorative motion.
Chart.defaults.transitions.active.animation = { duration: 120 };

const registry = [];

function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  const g = (n) => cs.getPropertyValue(n).trim();
  return {
    accent: g('--accent'),
    accentSoft: g('--accent-subtle-bg'),
    success: g('--success'),
    warning: g('--warning'),
    error: g('--error'),
    info: g('--info'),
    textPrimary: g('--text-primary'),
    textSecondary: g('--text-secondary'),
    textTertiary: g('--text-tertiary'),
    border: g('--border'),
    borderSubtle: g('--border-subtle'),
    surface2: g('--surface-2'),
    surface3: g('--surface-3'),
    font: g(getLocale() === 'fa' ? '--font-persian-ui' : '--font-latin-ui'),
  };
}

/** Grid + tick styling shared by line/bar charts. */
export function axis(t) {
  return {
    grid: { color: t.borderSubtle, drawTicks: false },
    border: { display: false },
    ticks: { color: t.textTertiary, maxTicksLimit: 6, font: { family: t.font } },
  };
}

/** Tooltip + interaction + legend options. */
export function tooltips(t, opts = {}) {
  return {
    interaction: { mode: 'index', intersect: false },
    plugins: {
      tooltip: {
        backgroundColor: t.surface3,
        titleColor: t.textPrimary,
        bodyColor: t.textSecondary,
        borderColor: t.border,
        borderWidth: 1,
        padding: 10,
        rtl: getLocale() === 'fa',
        textDirection: getLocale() === 'fa' ? 'rtl' : 'ltr',
        titleFont: { family: t.font },
        bodyFont: { family: t.font },
        displayColors: false,
        callbacks: opts.callbacks || {},
      },
      legend: { display: false, ...(opts.legend || {}) },
    },
  };
}

/** Create a chart whose config is a function of the current theme tokens. */
export function makeChart(canvas, factory) {
  // A locale/range change may render the same canvas again. Remove the old
  // instance from both Chart.js and our theme registry before reusing it.
  destroyChart(Chart.getChart(canvas));
  const cfg = factory(readTokens());
  cfg.options = { ...cfg.options, locale: localeTag(), font: { family: readTokens().font } };
  const chart = new Chart(canvas, cfg);
  registry.push({ chart, factory });
  return chart;
}

/** Destroy a chart and remove it from the re-theme registry. */
export function destroyChart(chart) {
  if (!chart) return;
  const i = registry.findIndex((r) => r.chart === chart);
  if (i >= 0) registry.splice(i, 1);
  chart.destroy();
}

/** Re-theme all live charts (called on afx:theme). */
export function refreshCharts() {
  registry.forEach(({ chart, factory }) => {
    if (!chart || !chart.canvas) return; // skip destroyed charts
    const cfg = factory(readTokens());
    chart.data = cfg.data;
    chart.options = { ...cfg.options, locale: localeTag(), font: { family: readTokens().font } };
    chart.update('none');
  });
}

export function initCharts() {
  document.addEventListener('afx:theme', refreshCharts);
}

export function destroyCharts() {
  registry.splice(0).forEach(({ chart }) => chart.destroy());
}
