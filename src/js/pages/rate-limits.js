// =============================================================
// APIForge X — Rate limits
// Current-limit cards (per minute / per day / monthly), a 14-day
// usage chart with the daily limit, a monthly remaining doughnut,
// and the per-API rules table with warning states. Data-driven.
// =============================================================

import { boot } from '../main.js';
import { makeChart, axis, tooltips, initCharts } from '../components/charts.js';
import { createIcons, icons } from '../components/icons.js';
import { escapeHtml, formatNumber, compactNumber } from '../utils/format.js';
import rateLimits from '../data/mock-rate-limits.json';

boot();
initCharts();

const { current, history, rules } = rateLimits;

function pct(used, limit) {
  return Math.min(100, (used / limit) * 100);
}
function barClass(p) {
  if (p >= 95) return 'progress-bar--danger';
  if (p >= 80) return 'progress-bar--warning';
  return '';
}

// --- Warning banner ----------------------------------------------------------
function renderBanner() {
  const banner = document.getElementById('rl-banner');
  const breached = rules.filter((r) => r.status === 'breached');
  const near = Object.entries(current).filter(([, v]) => pct(v.used, v.limit) >= 80);
  if (!breached.length && !near.length) {
    banner.innerHTML = '';
    return;
  }
  const hasBreach = breached.length > 0;
  const names = breached.map((r) => r.name).join(', ');
  banner.innerHTML = `
    <div class="alert ${hasBreach ? 'alert-danger' : 'alert-warning'}" role="alert">
      <span class="alert-icon"><i data-lucide="${hasBreach ? 'alert-circle' : 'alert-triangle'}"></i></span>
      <div class="alert-content">
        <div class="fw-medium">${hasBreach ? `Rate limit breached: ${escapeHtml(names)}` : 'Approaching your rate limits'}</div>
        <div class="mt-1">${hasBreach ? 'Requests are returning 429 until the window resets. Review your limits below.' : 'One or more limits are above 80%. Consider raising limits or upgrading your plan.'}</div>
      </div>
    </div>`;
  createIcons({ icons });
}

// --- Current-limit cards ------------------------------------------------------
function card(label, v, icon) {
  const p = pct(v.used, v.limit);
  return `
    <div class="card limit-card">
      <div class="limit-card__head">
        <span class="limit-card__label">${label}</span>
        <i data-lucide="${icon}"></i>
      </div>
      <div class="limit-card__value">${formatNumber(v.used)} <span class="limit-card__limit">/ ${formatNumber(v.limit)}</span></div>
      <div class="progress" role="img" aria-label="${Math.round(p)}% used">
        <div class="progress-bar ${barClass(p)}" style="width:${p.toFixed(1)}%"></div>
      </div>
      <span class="limit-card__reset"><i data-lucide="clock"></i> Resets in ${escapeHtml(v.resetIn)}</span>
    </div>`;
}

function renderCards() {
  document.getElementById('rl-cards').innerHTML =
    card('Requests / minute', current.perMinute, 'clock') +
    card('Requests / day', current.perDay, 'calendar') +
    card('Monthly quota', current.monthly, 'pie-chart');
  createIcons({ icons });
}

// --- Charts --------------------------------------------------------------------
function renderHistoryChart() {
  makeChart(document.getElementById('rl-history-chart'), (t) => ({
    type: 'bar',
    data: {
      labels: history.map((d) => d.date.slice(5)),
      datasets: [
        {
          type: 'bar',
          label: 'Requests',
          data: history.map((d) => d.used),
          backgroundColor: t.accent,
          hoverBackgroundColor: t.accent,
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 22,
        },
        {
          type: 'line',
          label: 'Daily limit',
          data: history.map((d) => d.limit),
          borderColor: t.error,
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          pointHitRadius: 8,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: axis(t), y: axis(t) },
      ...tooltips(t, {
        callbacks: { label: (c) => `${c.dataset.label}: ${compactNumber(c.parsed.y)}` },
      }),
    },
  }));
}

function renderQuotaChart() {
  makeChart(document.getElementById('rl-quota-chart'), (t) => {
    const { used, limit } = current.monthly;
    return {
      type: 'doughnut',
      data: {
        labels: ['Used', 'Remaining'],
        datasets: [
          {
            data: [used, Math.max(0, limit - used)],
            backgroundColor: [t.accent, t.surface2],
            borderColor: t.surface2,
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        ...tooltips(t, {
          callbacks: { label: (c) => `${c.label}: ${formatNumber(c.parsed)} requests` },
        }),
      },
    };
  });
}

// --- Rules table ------------------------------------------------------------------
const RULE_STATUS = {
  ok: { label: 'OK', cls: 'badge-status--success' },
  warning: { label: 'Warning', cls: 'badge-status--warning' },
  breached: { label: 'Breached', cls: 'badge-status--error' },
};

function renderRules() {
  const tbody = document.getElementById('rl-rules');
  tbody.innerHTML = rules
    .map((r) => {
      const s = RULE_STATUS[r.status] || RULE_STATUS.ok;
      const p = pct(r.current, r.limit);
      return `
      <tr>
        <td>
          <div class="fw-medium text-body">${escapeHtml(r.api)}</div>
          <div class="text-tertiary caption ltr-isolate">${escapeHtml(r.name)}</div>
        </td>
        <td><code class="ltr-isolate mono-sm text-body">${r.limit} req</code></td>
        <td><span class="badge badge-neutral">${escapeHtml(r.window)}</span></td>
        <td>
          <div class="rule-usage">
            <div class="progress" role="img" aria-label="${Math.round(p)}% used">
              <div class="progress-bar ${barClass(p)}" style="width:${p.toFixed(1)}%"></div>
            </div>
            <span class="rule-usage__value">${r.current} / ${r.limit}</span>
          </div>
        </td>
        <td><span class="badge badge-status ${s.cls}"><span class="dot"></span>${s.label}</span></td>
      </tr>`;
    })
    .join('');
  document.getElementById('rl-count').textContent = `${rules.length} rules`;
  createIcons({ icons });
}

// --- Wire --------------------------------------------------------------------
renderBanner();
renderCards();
renderHistoryChart();
renderQuotaChart();
renderRules();
