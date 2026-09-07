// =============================================================
// APIForge X — Dashboard (Overview)
// KPIs + request/latency charts per time range + activity feed.
// =============================================================

import { boot } from '../main.js';
import { makeChart, destroyChart, axis, tooltips, initCharts } from '../components/charts.js';
import { createIcons, icons } from '../components/icons.js';
import { formatNumber, compactNumber, relativeTime, escapeHtml } from '../utils/format.js';
import metrics from '../data/mock-metrics.json';
import usage from '../data/mock-usage.json';
import activity from '../data/mock-activity.json';
import plan from '../data/mock-plan.json';

boot();
initCharts();

const RANGE_LABELS = { '24h': 'Last 24 hours', '7d': 'Last 7 days', '30d': 'Last 30 days' };
let requestsChart = null;
let latencyChart = null;

function seriesFor(range) {
  if (range === '24h') {
    return {
      labels: metrics.hourly.map((h) => h.hour),
      requests: metrics.hourly.map((h) => h.requests),
      latency: metrics.hourly.map((h) => h.latencyMs),
    };
  }
  const days = usage.slice(range === '7d' ? -7 : -30);
  return {
    labels: days.map((d) => d.date.slice(5)),
    requests: days.map((d) => d.requests),
    latency: days.map((d) => d.latencyMs),
  };
}

function kpiInner(label, value, deltaHtml, dir, foot) {
  return `
    <span class="kpi-label">${label}</span>
    <span class="kpi-value">${value}</span>
    <span class="kpi-delta ${dir}">${deltaHtml}</span>
    <span class="stat-foot">${foot}</span>`;
}

function renderKpis(range) {
  const k = metrics.kpis[range];
  const grid = document.getElementById('kpi-strip');
  const cards = grid.querySelectorAll('[data-kpi]');

  const requestsDelta = `${k.requestsDelta > 0 ? '+' : ''}${k.requestsDelta}%`;
  const successDelta = `${k.successDelta > 0 ? '+' : ''}${k.successDelta}pp`;
  const latencyDelta = k.latencyDelta < 0 ? `${Math.abs(k.latencyDelta)}% faster` : `${k.latencyDelta}% slower`;
  const usagePct = plan.requestsUsed / plan.requestsLimit;

  cards[0].innerHTML = kpiInner('Requests · ' + RANGE_LABELS[range].toLowerCase().replace('last ', ''), formatNumber(k.requests), `${requestsDelta} <i data-lucide="trending-up"></i>`, k.requestsDelta >= 0 ? 'up' : 'down', 'vs previous period');
  cards[1].innerHTML = kpiInner('Success rate', `${k.successRate}%`, `${successDelta} <i data-lucide="${k.successDelta >= 0 ? 'trending-up' : 'trending-down'}"></i>`, k.successDelta >= 0 ? 'up' : 'down', '2xx responses');
  cards[2].innerHTML = kpiInner('Average latency', `${k.latencyMs}ms`, `${latencyDelta} <i data-lucide="timer"></i>`, k.latencyDelta <= 0 ? 'up' : 'down', 'P95 across endpoints');
  cards[3].innerHTML = `
    <span class="kpi-label">Monthly usage</span>
    <span class="kpi-value">${formatNumber(plan.requestsUsed)}</span>
    <span class="kpi-delta flat">of ${formatNumber(plan.requestsLimit)} requests</span>
    <div class="progress mt-1" role="img" aria-label="${Math.round(usagePct * 100)}% of plan used">
      <div class="progress-bar" style="width:${(usagePct * 100).toFixed(1)}%"></div>
    </div>
    <span class="stat-foot">${plan.periodLabel}</span>`;

  cards.forEach((c) => c.classList.remove('skeleton-kpi'));
  createIcons({ icons });
}

function lineConfig(labels, data, t, color, callbacks) {
  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: color,
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
      ...tooltips(t, { callbacks }),
    },
  };
}

function renderCharts(range) {
  const { labels, requests, latency } = seriesFor(range);
  document.querySelector('[data-chart-range]').textContent = RANGE_LABELS[range];
  document.querySelector('[data-chart-sentence="requests"]').textContent =
    `Requests ${metrics.kpis[range].requestsDelta >= 0 ? 'up' : 'down'} ${Math.abs(metrics.kpis[range].requestsDelta)}% vs previous period, driven by /v1/emails.`;

  if (requestsChart) destroyChart(requestsChart);
  if (latencyChart) destroyChart(latencyChart);

  requestsChart = makeChart(document.getElementById('chart-requests'), (t) =>
    lineConfig(labels, requests, t, t.accent, {
      label: (c) => `${compactNumber(c.parsed.y)} requests`,
    })
  );
  latencyChart = makeChart(document.getElementById('chart-latency'), (t) =>
    lineConfig(labels, latency, t, t.info, {
      label: (c) => `${c.parsed.y}ms P95`,
    })
  );
}

const ACTIVITY = {
  key_created: { icon: 'key', cls: 'is-success' },
  webhook_failed: { icon: 'webhook', cls: 'is-error' },
  endpoint_updated: { icon: 'code-2', cls: '' },
  key_revoked: { icon: 'ban', cls: 'is-error' },
  rate_limit: { icon: 'gauge', cls: 'is-pending' },
  deploy: { icon: 'zap', cls: 'is-success' },
};

function renderActivity() {
  const feed = document.getElementById('activity-feed');
  feed.innerHTML = `
    <ol class="timeline">
      ${activity.map((a) => {
        const meta = ACTIVITY[a.type] || { icon: 'activity', cls: '' };
        return `
        <li class="timeline__item">
          <span class="timeline__rail"><span class="timeline__node ${meta.cls}"><i data-lucide="${meta.icon}"></i></span></span>
          <div class="timeline__content">
            <div class="timeline__title">${escapeHtml(a.title)}</div>
            <div class="timeline__meta">${escapeHtml(a.detail)} · ${escapeHtml(relativeTime(a.timestamp))}</div>
          </div>
        </li>`;
      }).join('')}
    </ol>`;
  createIcons({ icons });
}

function render(range) {
  renderKpis(range);
  renderCharts(range);
  renderActivity();
}

// Range switching
document.querySelectorAll('[data-range]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-range]').forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    render(btn.dataset.range);
  });
});

// Skeleton → content (short simulated load so the loading state is visible).
setTimeout(() => render('24h'), 350);
