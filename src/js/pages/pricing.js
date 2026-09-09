// =============================================================
// APIForge X — Pricing page
// Renders the three plans and the comparison table from the same
// deterministic `mock-plans.json` the in-app Billing page uses.
// =============================================================

import { createIcons, icons } from '../components/icons.js';
import { number } from '../utils/format.js';
import { bootSite } from '../site.js';
import { localizedData } from '../data/localized.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { observeMotion } from '../components/motion.js';
import faPlans from '../data/mock-plans.json';
import enPlans from '../data/mock-plans.en.json';

bootSite();

const FEATURES = [
  { key: 'requests', labelKey: 'plans.requests' },
  { key: 'environments', labelKey: 'plans.environments' },
  { key: 'members', labelKey: 'plans.members' },
  { key: 'webhooks', labelKey: 'plans.webhooks' },
  { key: 'retention', labelKey: 'plans.retention' },
  { key: 'rateLimit', labelKey: 'plans.rateLimit' },
  { key: 'support', labelKey: 'plans.support' },
];

function renderCards() {
  const grid = document.getElementById('pricing-grid');
  const plans = localizedData(faPlans, enPlans);
  grid.innerHTML = plans
    .map(
      (p) => `
      <div class="pricing-card${p.highlight ? ' is-featured' : ''}" data-motion>
        <span class="badge ${p.highlight ? 'badge-accent' : 'badge-neutral'} pricing-card__tag">${p.highlight ? tr('sg.mostPopular') : p.name}</span>
        <div class="pricing-card__name">${p.name}</div>
        <div class="pricing-card__price"><span class="amount">${p.priceLabel}</span><span class="period">${p.period}</span></div>
        <p class="pricing-card__blurb">${p.blurb}</p>
        <ul class="pricing-card__features">
          <li><i data-lucide="check"></i> ${tr('plans.requestsValue', { value: p.requests })}</li>
          <li><i data-lucide="check"></i> ${tr('plans.environmentsValue', { value: number(p.environments) })}</li>
          <li><i data-lucide="check"></i> ${tr('plans.membersValue', { value: number(p.members) })}</li>
          <li><i data-lucide="check"></i> ${tr('plans.webhooksValue', { value: number(p.webhooks) })}</li>
          <li><i data-lucide="check"></i> ${tr('plans.retentionValue', { value: p.retention })}</li>
          <li><i data-lucide="check"></i> ${tr('plans.rateLimitValue', { value: p.rateLimit })}</li>
        </ul>
        <a class="btn ${p.highlight ? 'btn-primary' : 'btn-ghost'} pricing-card__cta" href="./dashboard.html">${p.highlight ? tr('pricing.choosePlan', { plan: p.name }) : tr('pricing.startWithPlan', { plan: p.name })}</a>
      </div>`
    )
    .join('');
  createIcons({ icons });
  observeMotion(grid);
}

function renderComparison() {
  const tbody = document.querySelector('#pricing-compare tbody');
  const plans = localizedData(faPlans, enPlans);
  tbody.innerHTML = FEATURES.map(
    (f) => `
      <tr>
        <th scope="row">${tr(f.labelKey)}</th>
        ${plans
          .map((p) => `<td class="cell-num">${typeof p[f.key] === 'number' ? number(p[f.key]) : p[f.key] ?? '—'}</td>`)
          .join('')}
      </tr>`
  ).join('');
}

renderCards();
renderComparison();

onLocaleChange(() => {
  renderCards();
  renderComparison();
});
