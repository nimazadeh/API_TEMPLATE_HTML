// =============================================================
// APIForge X — Marketing landing (Phase 4)
// Replaces the temporary foundation hub. Renders a *live* product
// preview (KPIs, chart, activity) from the same seeded datasets the
// app pages use, honoring D-014 "product as hero" without shipping a
// fake screenshot. Marketing shell only — no app boot.
// =============================================================

import { bootSite } from '../site.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { makeChart, axis, tooltips, initCharts } from '../components/charts.js';
import { createIcons, icons } from '../components/icons.js';
import { compactNumber, relativeTime, escapeHtml, percent, latencyText } from '../utils/format.js';
import observability from '../data/mock-observability.json';
import activity from '../data/mock-activity.json';
import plans from '../data/mock-plans.json';

bootSite();
initCharts();

const ACTIVITY = {
  key_created: { icon: 'key', cls: 'is-success' },
  webhook_failed: { icon: 'webhook', cls: 'is-error' },
  endpoint_updated: { icon: 'code-2', cls: '' },
  key_revoked: { icon: 'ban', cls: 'is-error' },
  rate_limit: { icon: 'gauge', cls: 'is-pending' },
  deploy: { icon: 'zap', cls: 'is-success' },
};

function renderKpis() {
  const k = observability.ranges['24h'];
  const host = document.getElementById('hero-kpis');
  const cards = [
    { label: tr('kpi.requests24h'), value: compactNumber(k.requests), foot: tr('dashboard.acrossEndpoints') },
    { label: tr('metrics.errorRate'), value: percent(k.errorRate), foot: tr('kpi.responseSplit') },
    { label: tr('kpi.p95Latency'), value: latencyText(k.p95), foot: `${tr('kpi.p99')} ${latencyText(k.p99)}` },
    { label: tr('kpi.availability'), value: percent(k.availability, 2), foot: tr('kpi.rolling24') },
  ];
  host.innerHTML = cards
    .map(
      (c) => `
      <div class="card card--dense kpi">
        <span class="kpi-label">${c.label}</span>
        <span class="kpi-value">${c.value}</span>
        <span class="stat-foot">${c.foot}</span>
      </div>`
    )
    .join('');
}

function renderChart() {
  const canvas = document.getElementById('hero-chart');
  const days = observability.series.slice(-14);
  makeChart(canvas, (t) => ({
    type: 'line',
    data: {
      labels: days.map((d) => d.date.slice(5)),
      datasets: [
        {
          data: days.map((d) => d.requests),
          borderColor: t.accent,
          backgroundColor: t.accentSoft,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: axis(t),
        y: { ...axis(t), ticks: { ...axis(t).ticks, callback: (v) => compactNumber(v) } },
      },
      ...tooltips(t),
    },
  }));
}

function renderActivity() {
  const feed = document.getElementById('hero-activity');
  feed.innerHTML = `<ol class="timeline">
    ${activity
      .slice(0, 4)
      .map((a) => {
        const meta = ACTIVITY[a.type] || { icon: 'activity', cls: '' };
        return `
      <li class="timeline__item">
        <span class="timeline__rail"><span class="timeline__node ${meta.cls}"><i data-lucide="${meta.icon}"></i></span></span>
        <div class="timeline__content">
          <div class="timeline__title">${escapeHtml(a.title)}</div>
          <div class="timeline__meta">${escapeHtml(a.detail)} · ${escapeHtml(relativeTime(a.timestamp))}</div>
        </div>
      </li>`;
      })
      .join('')}
  </ol>`;
  createIcons({ icons });
}

// Pricing teaser — the same plans as pricing.html / billing.html.
function renderPricingTeaser() {
  const grid = document.getElementById('pricing-teaser');
  if (!grid) return;
  grid.innerHTML = plans
    .map(
      (p) => `
      <div class="pricing-card${p.highlight ? ' is-featured' : ''}">
        <span class="badge ${p.highlight ? 'badge-accent' : 'badge-neutral'} pricing-card__tag">${p.highlight ? tr('sg.mostPopular') : p.name}</span>
        <div class="pricing-card__name">${p.name}</div>
        <div class="pricing-card__price"><span class="amount">${p.priceLabel}</span><span class="period">${p.period}</span></div>
        <p class="pricing-card__blurb">${p.blurb}</p>
        <ul class="pricing-card__features">
          <li><i data-lucide="check"></i> ${tr('plans.requestsValue', { value: p.requests })}</li>
          <li><i data-lucide="check"></i> ${tr('plans.environmentsValue', { value: p.environments })}</li>
          <li><i data-lucide="check"></i> ${tr('plans.webhooksValue', { value: p.webhooks })}</li>
        </ul>
        <a class="btn ${p.highlight ? 'btn-primary' : 'btn-ghost'} pricing-card__cta" href="./pricing.html">${p.highlight ? tr('pricing.choosePlan', { plan: p.name }) : tr('pricing.startWithPlan', { plan: p.name })}</a>
      </div>`
    )
    .join('');
  createIcons({ icons });
}

renderKpis();
renderChart();
renderActivity();
renderPricingTeaser();

// Re-render the live preview when the locale flips.
onLocaleChange(() => {
  renderKpis();
  renderChart();
  renderActivity();
  renderPricingTeaser();
});
