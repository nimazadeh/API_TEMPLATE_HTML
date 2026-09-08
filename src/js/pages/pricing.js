// =============================================================
// APIForge X — Pricing page (Phase 4)
// Renders the three plans and the comparison table from the same
// deterministic `mock-plans.json` the in-app Billing page uses.
// =============================================================

import { bootSite } from '../site.js';
import plans from '../data/mock-plans.json';

bootSite();

const FEATURES = [
  { key: 'requests', label: 'Requests / month' },
  { key: 'environments', label: 'Environments' },
  { key: 'members', label: 'Team members' },
  { key: 'webhooks', label: 'Webhook endpoints' },
  { key: 'retention', label: 'Log retention' },
  { key: 'rateLimit', label: 'Rate limit' },
  { key: 'support', label: 'Support' },
];

function renderCards() {
  const grid = document.getElementById('pricing-grid');
  grid.innerHTML = plans
    .map(
      (p) => `
      <div class="pricing-card${p.highlight ? ' is-featured' : ''}">
        <span class="badge ${p.highlight ? 'badge-accent' : 'badge-neutral'} pricing-card__tag">${p.highlight ? 'Most popular' : p.name}</span>
        <div class="pricing-card__name">${p.name}</div>
        <div class="pricing-card__price"><span class="amount">${p.priceLabel}</span><span class="period">${p.period}</span></div>
        <p class="pricing-card__blurb">${p.blurb}</p>
        <ul class="pricing-card__features">
          <li><i data-lucide="check"></i> ${p.requests} requests</li>
          <li><i data-lucide="check"></i> ${p.environments} environments</li>
          <li><i data-lucide="check"></i> ${p.members} team members</li>
          <li><i data-lucide="check"></i> ${p.webhooks} webhook endpoints</li>
          <li><i data-lucide="check"></i> ${p.retention} log retention</li>
          <li><i data-lucide="check"></i> ${p.rateLimit} rate limit</li>
        </ul>
        <a class="btn ${p.highlight ? 'btn-primary' : 'btn-ghost'} pricing-card__cta" href="./dashboard.html">${p.highlight ? 'Choose ' + p.name : 'Start with ' + p.name}</a>
      </div>`
    )
    .join('');
}

function renderComparison() {
  const tbody = document.querySelector('#pricing-compare tbody');
  tbody.innerHTML = FEATURES.map(
    (f) => `
      <tr>
        <th scope="row">${f.label}</th>
        ${plans
          .map((p) => `<td class="cell-num">${p[f.key] ?? '—'}</td>`)
          .join('')}
      </tr>`
  ).join('');
}

renderCards();
renderComparison();
