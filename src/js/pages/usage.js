// =============================================================
// APIForge X — Usage
// Plan consumption, requests-over-time (7d/30d), consumption by API,
// top endpoints, and endpoint/environment attribution.
// =============================================================

import { boot } from '../main.js';
import { makeChart, axis, tooltips, initCharts } from '../components/charts.js';
import { formatNumber, compactNumber, percent, escapeHtml, methodBadgeClass } from '../utils/format.js';
import usage from '../data/mock-usage.json';
import attribution from '../data/mock-attribution.json';
import plan from '../data/mock-plan.json';
import metrics from '../data/mock-metrics.json';
import endpoints from '../data/mock-endpoints.json';
import apis from '../data/mock-apis.json';

boot();
initCharts();

const API_NAMES = Object.fromEntries(apis.map((a) => [a.id, a.name]));

function apiOf(path) {
  const ep = endpoints.find((e) => e.path === path);
  return ep ? ep.apiId : 'api_platform';
}

// --- Plan --------------------------------------------------------------
function renderPlan() {
  const pct = (plan.requestsUsed / plan.requestsLimit) * 100;
  document.getElementById('usage-period').textContent = plan.periodLabel;
  document.getElementById('usage-bar-fill').style.width = `${pct.toFixed(1)}%`;
  document.getElementById('usage-bar').setAttribute('aria-label', `${pct.toFixed(1)}% of plan used`);
  document.getElementById('usage-used').textContent = formatNumber(plan.requestsUsed);
  document.getElementById('usage-limit').textContent = formatNumber(plan.requestsLimit);

  const end = new Date(plan.periodEnd).getTime();
  const days = Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
  document.getElementById('usage-resets').textContent = Number.isFinite(days) ? `${days} days` : plan.periodLabel;

  const k = metrics.kpis['30d'];
  document.getElementById('usage-requests').textContent = compactNumber(plan.requestsUsed);
  document.getElementById('usage-latency').textContent = `${k.latencyMs} ms`;
  document.getElementById('usage-success').textContent = `${k.successRate}%`;
}

// --- Requests over time --------------------------------------------------
let range = '7d';
let requestsChart = null;

function requestSeries() {
  const days = range === '7d' ? usage.slice(-7) : usage;
  return {
    labels: days.map((d) => d.date.slice(5)),
    data: days.map((d) => d.requests),
  };
}

function renderRequestsChart() {
  requestsChart = makeChart(document.getElementById('usage-requests-chart'), (t) => {
    const { labels, data } = requestSeries();
    return {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: t.accent,
          backgroundColor: t.accentSoft,
          fill: true,
          tension: 0.35,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHitRadius: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: axis(t), y: axis(t) },
        ...tooltips(t, { callbacks: { label: (c) => `${compactNumber(c.parsed.y)} requests` } }),
      },
    };
  });
}

function setRange(next) {
  range = next;
  document.querySelectorAll('[data-range]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.range === range);
    b.setAttribute('aria-pressed', String(b.dataset.range === range));
  });
  const { labels, data } = requestSeries();
  requestsChart.data.labels = labels;
  requestsChart.data.datasets[0].data = data;
  requestsChart.update();
}

// --- Consumption by API ---------------------------------------------------
function byApi() {
  const map = new Map();
  attribution.byEndpoint.forEach((e) => {
    const id = apiOf(e.path);
    map.set(id, (map.get(id) || 0) + e.requests);
  });
  return [...map.entries()];
}

function renderConsumptionChart() {
  makeChart(document.getElementById('usage-consumption-chart'), (t) => {
    const entries = byApi();
    return {
      type: 'doughnut',
      data: {
        labels: entries.map(([id]) => API_NAMES[id] || id),
        datasets: [{
          data: entries.map(([, n]) => n),
          backgroundColor: [t.accent, t.info, t.success, t.warning, t.error],
          borderColor: t.surface2,
          borderWidth: 2,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        ...tooltips(t, {
          callbacks: { label: (c) => `${c.label}: ${compactNumber(c.parsed)} requests` },
        }),
      },
    };
  });
}

// --- Top endpoints ----------------------------------------------------------
function renderTopEndpoints() {
  const top = [...attribution.byEndpoint].sort((a, b) => b.requests - a.requests).slice(0, 5);
  document.getElementById('usage-top-endpoints').innerHTML = top
    .map(
      (e) => `
      <div class="top-list__row">
        <span class="badge badge-method ${methodBadgeClass(e.method)}">${e.method}</span>
        <code class="ltr-isolate mono-sm text-body text-truncate">${escapeHtml(e.path)}</code>
        <span class="top-list__value">${compactNumber(e.requests)} · ${percent(e.share, 1)}</span>
      </div>`
    )
    .join('');
}

// --- Attribution --------------------------------------------------------------
function attributionRow(method, path, requests, share) {
  return `
    <li class="usage-row">
      <div class="usage-row__head">
        <span class="usage-row__label">
          ${method ? `<span class="badge badge-method ${methodBadgeClass(method)}">${method}</span>` : ''}
          <code class="ltr-isolate mono-sm text-secondary">${escapeHtml(path)}</code>
        </span>
        <span class="usage-row__value">${compactNumber(requests)} · ${percent(share, 1)}</span>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${share}%"></div></div>
    </li>`;
}

function renderAttribution() {
  document.getElementById('attr-by-endpoint').innerHTML = attribution.byEndpoint
    .map((e) => attributionRow(e.method, e.path, e.requests, e.share))
    .join('');
  document.getElementById('attr-by-env').innerHTML = attribution.byEnvironment
    .map((e) => attributionRow(null, e.env === 'live' ? 'Live environment' : 'Test environment', e.requests, e.share))
    .join('');
}

// --- Export ----------------------------------------------------------------------
function exportCsv() {
  const header = ['date', 'requests', 'errors', 'latency_ms'];
  const lines = usage.map((d) => [d.date, d.requests, d.errors, d.latencyMs].join(','));
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'apiforge-usage.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- Wiring ---------------------------------------------------------------------
renderPlan();
renderRequestsChart();
renderConsumptionChart();
renderTopEndpoints();
renderAttribution();

document.querySelectorAll('[data-range]').forEach((btn) => {
  btn.addEventListener('click', () => setRange(btn.dataset.range));
});
document.getElementById('usage-export').addEventListener('click', exportCsv);
