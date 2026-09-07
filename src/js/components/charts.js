// =============================================================
// APIForge X — Chart.js theming helper
// Registers only the controllers/elements we use (line, bar, doughnut)
// and re-themes every chart from CSS variables on `afx:theme`.
// Charts stay LTR (their container carries direction: ltr).
// =============================================================

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
    font: g('--font-latin-ui'),
  };
}

/** Grid + tick styling shared by line/bar charts. */
export function axis(t) {
  return {
    grid: { color: t.borderSubtle, drawTicks: false },
    border: { display: false },
    ticks: { color: t.textTertiary, maxTicksLimit: 6 },
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
        displayColors: false,
        callbacks: opts.callbacks || {},
      },
      legend: { display: false, ...(opts.legend || {}) },
    },
  };
}

/** Create a chart whose config is a function of the current theme tokens. */
export function makeChart(canvas, factory) {
  const chart = new Chart(canvas, factory(readTokens()));
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
    chart.options = cfg.options;
    chart.update('none');
  });
}

export function initCharts() {
  document.addEventListener('afx:theme', refreshCharts);
}

export function destroyCharts() {
  registry.splice(0).forEach(({ chart }) => chart.destroy());
}
