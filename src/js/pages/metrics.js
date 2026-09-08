// =============================================================
// APIForge X — Metrics / Observability
// API-infrastructure observability (not generic analytics): request
// volume, latency percentiles, error rate, availability, status-code
// distribution and per-endpoint/environment breakdowns. Range +
// Production/Staging compare. Deterministic mock-observability.json.
// =============================================================

import { boot } from '../main.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { makeChart, axis, tooltips, initCharts } from '../components/charts.js';
import { createIcons, icons } from '../components/icons.js';
import { formatNumber, compactNumber, percent, escapeHtml, methodBadgeClass, number } from '../utils/format.js';
import obs from '../data/mock-observability.json';
import apis from '../data/mock-apis.json';

boot();
initCharts();

let range = '24h';
let compare = 'live';

const RANGE_KEYS = { '1h': 'logs.lastHour', '24h': 'dashboard.range24h', '7d': 'dashboard.range7d', '30d': 'dashboard.range30d' };

function seriesFor() {
  if (range === '1h') return { points: obs.minutes.slice(-12), key: 'at' };
  if (range === '24h') return { points: obs.hourly, key: 'hour' };
  if (range === '7d') return { points: obs.series.slice(-7), key: 'date' };
  return { points: obs.series, key: 'date' };
}

function stagingFor() {
  if (range === '30d') return { points: obs.seriesStaging, key: 'date' };
  if (range === '7d') return { points: obs.seriesStaging.slice(-7), key: 'date' };
  if (range === '24h') return { points: obs.hourly.map((h) => ({ ...h, requests: Math.round(h.requests * 0.06) })), key: 'hour' };
  return { points: obs.minutes.slice(-12).map((m) => ({ ...m, requests: Math.round(m.requests * 0.06) })), key: 'at' };
}

function currentSeries() {
  return compare === 'live' ? seriesFor() : stagingFor();
}

// --- KPIs ----------------------------------------------------------------
function renderKpis() {
  const k = obs.ranges[range];
  const set = (id, val) => (document.getElementById(id).textContent = val);
  set('metric-requests', compactNumber(k.requests));
  set('metric-error-rate', `${k.errorRate}%`);
  set('metric-p95', `${k.p95} ms`);
  set('metric-p99', `${k.p99} ms`);
  set('metric-availability', `${k.availability}%`);
}

// --- Charts ---------------------------------------------------------------
let volumeChart, latencyChart, errorChart, statusChart;

function labelsOf(series) {
  return series.points.map((p) => (series.key === 'date' ? p[series.key].slice(5) : p[series.key]));
}

function renderVolumeChart() {
  volumeChart = makeChart(document.getElementById('chart-metric-volume'), (t) => {
    const s = currentSeries();
    return {
      type: 'line',
      data: {
        labels: labelsOf(s),
        datasets: [{
          data: s.points.map((p) => p.requests),
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
        responsive: true, maintainAspectRatio: false,
        scales: { x: axis(t), y: axis(t) },
        ...tooltips(t, { callbacks: { label: (c) => `${compactNumber(c.parsed.y)} ${tr('table.requests')}` } }),
      },
    };
  });
}

function renderLatencyChart() {
  latencyChart = makeChart(document.getElementById('chart-metric-latency'), (t) => {
    const s = currentSeries();
    return {
      type: 'line',
      data: {
        labels: labelsOf(s),
        datasets: [
          { label: 'p50', data: s.points.map((p) => p.p50), borderColor: t.success, borderWidth: 1.5, pointRadius: 0, pointHitRadius: 8, fill: false },
          { label: 'p95', data: s.points.map((p) => p.p95), borderColor: t.accent, borderWidth: 1.5, pointRadius: 0, pointHitRadius: 8, fill: false },
          { label: 'p99', data: s.points.map((p) => p.p99), borderColor: t.warning, borderWidth: 1.5, pointRadius: 0, pointHitRadius: 8, fill: false },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { x: axis(t), y: axis(t) },
        ...tooltips(t, { callbacks: { label: (c) => `${c.dataset.label}: ${number(c.parsed.y)} ms` } }),
      },
    };
  });
}

function renderErrorChart() {
  errorChart = makeChart(document.getElementById('chart-metric-errors'), (t) => {
    const s = currentSeries();
    return {
      type: 'line',
      data: {
        labels: labelsOf(s),
        datasets: [{
          data: s.points.map((p) => p.errorRate),
          borderColor: t.error,
          backgroundColor: 'rgba(239,68,68,0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHitRadius: 10,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { x: axis(t), y: { ...axis(t), ticks: { color: t.textTertiary, maxTicksLimit: 6, callback: (v) => `${v}%` } } },
        ...tooltips(t, { callbacks: { label: (c) => `${percent(c.parsed.y)} ${tr('metrics.errorRate')}` } }),
      },
    };
  });
}

function renderStatusChart() {
  statusChart = makeChart(document.getElementById('chart-metric-status'), (t) => {
    return {
      type: 'doughnut',
      data: {
        labels: obs.byStatus.map((s) => s.code),
        datasets: [{
          data: obs.byStatus.map((s) => s.count),
          backgroundColor: [t.success, t.warning, t.error, t.info],
          borderColor: t.surface2,
          borderWidth: 2,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        ...tooltips(t, { callbacks: { label: (c) => `${c.label}: ${compactNumber(c.parsed)} (${percent(c.parsed / 5382400, 1)})` } }),
      },
    };
  });
}

function reflowCharts() {
  const s = currentSeries();
  const labels = labelsOf(s);
  [volumeChart, errorChart].forEach((c) => {
    c.data.labels = labels;
    c.data.datasets[0].data = s.points.map((p) => (c === volumeChart ? p.requests : p.errorRate));
    c.update('none');
  });
  latencyChart.data.labels = labels;
  latencyChart.data.datasets[0].data = s.points.map((p) => p.p50);
  latencyChart.data.datasets[1].data = s.points.map((p) => p.p95);
  latencyChart.data.datasets[2].data = s.points.map((p) => p.p99);
  latencyChart.update('none');
}

// --- Breakdown tables -------------------------------------------------------
function endpointRows() {
  return obs.byEndpoint
    .map(
      (e) => `<tr>
        <td><span class="badge badge-method ${methodBadgeClass(e.method)}">${e.method}</span></td>
        <td><code class="ltr-isolate mono-sm text-body">${escapeHtml(e.path)}</code></td>
        <td class="cell-num">${formatNumber(e.requests)}</td>
        <td class="cell-num">${e.p95} ms</td>
        <td class="cell-num"><span class="latency ${e.errorRate > 1 ? 'latency--slow' : e.errorRate > 0.5 ? 'latency--mid' : 'latency--fast'}">${e.errorRate}%</span></td>
      </tr>`
    )
    .join('');
}

function envRows() {
  return obs.byEnvironment
    .map(
      (e) => `<tr>
        <td class="text-body fw-medium">${e.env === 'live' ? 'Live' : e.env === 'staging' ? 'Staging' : 'Test'}</td>
        <td class="cell-num">${formatNumber(e.requests)}</td>
        <td class="cell-num">${e.p95} ms</td>
        <td class="cell-num">${e.errorRate}%</td>
        <td class="cell-num">${e.availability}%</td>
      </tr>`
    )
    .join('');
}

function statusRows() {
  return obs.byStatus
    .map(
      (s) => `<tr>
        <td><code class="ltr-isolate mono-sm text-body">${s.code}</code></td>
        <td class="cell-num">${formatNumber(s.count)}</td>
        <td class="cell-num">${s.share}%</td>
      </tr>`
    )
    .join('');
}

function apiRows() {
  const byApi = {};
  obs.byEndpoint.forEach((e) => {
    const agg = byApi[e.apiId] || (byApi[e.apiId] = { requests: 0, weightedErrors: 0, weightedP95: 0 });
    agg.requests += e.requests;
    agg.weightedErrors += e.requests * e.errorRate;
    agg.weightedP95 += e.requests * e.p95;
  });
  const names = Object.fromEntries(apis.map((a) => [a.id, a.name]));
  return Object.entries(byApi)
    .sort((a, b) => b[1].requests - a[1].requests)
    .map(([apiId, agg]) => {
      const errorRate = (agg.weightedErrors / agg.requests).toFixed(1);
      const p95 = Math.round(agg.weightedP95 / agg.requests);
      return `<tr>
        <td class="text-body fw-medium">${escapeHtml(names[apiId] || apiId)}</td>
        <td class="cell-num">${formatNumber(agg.requests)}</td>
        <td class="cell-num">${p95} ms</td>
        <td class="cell-num"><span class="latency ${errorRate > 1 ? 'latency--slow' : errorRate > 0.5 ? 'latency--mid' : 'latency--fast'}">${errorRate}%</span></td>
      </tr>`;
    })
    .join('');
}

function methodRows() {
  return obs.byMethod
    .map(
      (m) => `<tr>
        <td><span class="badge badge-method ${methodBadgeClass(m.method)}">${m.method}</span></td>
        <td class="cell-num">${formatNumber(m.requests)}</td>
        <td class="cell-num">${m.share}%</td>
      </tr>`
    )
    .join('');
}

function renderBreakdowns() {
  document.getElementById('breakdown-endpoint').innerHTML = endpointRows();
  document.getElementById('breakdown-api').innerHTML = apiRows();
  document.getElementById('breakdown-env').innerHTML = envRows();
  document.getElementById('breakdown-status').innerHTML = statusRows();
  document.getElementById('breakdown-method').innerHTML = methodRows();
}

// --- Wiring -----------------------------------------------------------------
renderKpis();
renderVolumeChart();
renderLatencyChart();
renderErrorChart();
renderStatusChart();
renderBreakdowns();

document.querySelectorAll('[data-range]').forEach((btn) => {
  btn.addEventListener('click', () => {
    range = btn.dataset.range;
    document.querySelectorAll('[data-range]').forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    document.getElementById('metric-range-label').textContent = tr(RANGE_KEYS[range]);
    renderKpis();
    reflowCharts();
  });
});

document.querySelectorAll('[data-compare]').forEach((seg) => {
  seg.addEventListener('click', () => {
    compare = seg.dataset.compare;
    document.querySelectorAll('[data-compare]').forEach((s) => {
      s.classList.toggle('is-active', s === seg);
      s.setAttribute('aria-pressed', String(s === seg));
    });
    reflowCharts();
  });
});

createIcons({ icons });

// Re-render when the locale flips.
onLocaleChange(() => {
  const active = document.querySelector('[data-range].is-active');
  render(active ? active.dataset.range : '24h');
});
