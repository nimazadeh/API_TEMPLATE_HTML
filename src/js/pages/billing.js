// =============================================================
// APIForge X — Billing
// Current plan, usage-based consumption + projection, plan
// comparison (Developer/Pro/Scale), payment method and invoice
// history with upgrade/downgrade + payment-method modals.
// =============================================================

import { boot } from '../main.js';
import { Modal } from '../core/bootstrap.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { ask, initConfirm } from '../components/confirm.js';
import { escapeHtml, compactNumber, formatDate, number } from '../utils/format.js';
import { localizedData, localizedFixture } from '../data/localized.js';
import faPlans from '../data/mock-plans.json';
import enPlans from '../data/mock-plans.en.json';
import invoices from '../data/mock-invoices.json';
import faPlan from '../data/mock-plan.json';
import enPlan from '../data/mock-plan.en.json';

boot();
initConfirm({ modalId: 'confirm-modal', titleId: 'confirm-modal-title', bodyId: 'confirm-modal-body', submitId: 'confirm-modal-submit' });

// The active plan's usage numbers are static demo data; its name and the
// current billing-period label are resolved from the locale-aware dataset so
// they render in the active language (fa/en) on every re-render.
const currentPlan = { ...faPlan, id: 'scale', price: 199 };
const INVOICE_BADGE = { paid: 'badge-status--success', pending: 'badge-status--warning', failed: 'badge-status--error' };
let currentPlanId = 'scale';
let billingCycle = 'monthly';
const plans = localizedFixture(faPlans, enPlans);

function getPlans() {
  return plans;
}

/** Mirror the selected tier's localized name + period label onto currentPlan. */
function refreshCurrentPlanMeta() {
  const tier = getPlans().find((p) => p.id === currentPlanId) || getPlans()[getPlans().length - 1];
  const period = localizedData(faPlan, enPlan);
  currentPlan.name = tier.name;
  currentPlan.periodLabel = period.periodLabel;
}

// --- Current plan ---------------------------------------------------------
function renderCurrentPlan() {
  refreshCurrentPlanMeta();
  document.getElementById('billing-plan-name').textContent = currentPlan.name;
  document.getElementById('billing-price').textContent = `$${number(currentPlan.price)}`;
  document.getElementById('billing-cycle').textContent = tr(billingCycle === 'yearly' ? 'ui.perYear' : 'ui.perMonth');
  document.getElementById('billing-renewal').textContent = formatDate(currentPlan.periodEnd);
  document.getElementById('billing-status').innerHTML = `<span class="badge badge-status badge-status--success"><span class="dot"></span>${tr('status.activePlain')}</span>`;

  const pct = (currentPlan.requestsUsed / currentPlan.requestsLimit) * 100;
  document.getElementById('billing-usage-fill').style.width = `${pct.toFixed(1)}%`;
  document.getElementById('billing-usage').textContent = tr('ui.requestsUsed', { used: compactNumber(currentPlan.requestsUsed), total: compactNumber(currentPlan.requestsLimit) });
  document.getElementById('billing-usage-pct').textContent = tr('usage.pctUsed', { pct: number(Number(pct.toFixed(1))) });

  const remaining = Math.max(0, currentPlan.requestsLimit - currentPlan.requestsUsed);
  document.getElementById('billing-projected').textContent = tr('ui.projected', { period: currentPlan.periodLabel, count: compactNumber(currentPlan.requestsUsed + remaining * 0.12) });
}

// --- Plan comparison -------------------------------------------------------
function planCard(p) {
  const isCurrent = p.id === currentPlanId;
  const isDowngrade = !isCurrent && p.price < currentPlan.price;
  const ctaLabel = isCurrent ? tr('billing.currentPlanCta') : isDowngrade ? tr('billing.downgrade') : tr('billing.upgradeTo', { plan: p.name });
  const ctaClass = isCurrent ? 'btn-secondary' : isDowngrade ? 'btn-ghost' : 'btn-primary';
  return `
    <div class="card plan ${isCurrent ? 'plan--current' : ''}">
      ${isCurrent ? `<span class="plan__tag">${tr('usage.currentPlan')}</span>` : ''}
      <div class="plan__name">${escapeHtml(p.name)}</div>
      <div class="plan__price"><span class="plan__amount">${p.priceLabel}</span><span class="plan__period">${p.period}</span></div>
      <p class="plan__blurb">${escapeHtml(p.blurb)}</p>
      <ul class="plan__features">
        <li><i data-lucide="check"></i> ${tr('plans.requestsValue', { value: escapeHtml(p.requests) })}</li>
        <li><i data-lucide="check"></i> ${tr('plans.environmentsValue', { value: number(p.environments) })}</li>
        <li><i data-lucide="check"></i> ${tr('plans.membersValue', { value: number(p.members) })}</li>
        <li><i data-lucide="check"></i> ${tr('plans.webhooksValue', { value: number(p.webhooks) })}</li>
        <li><i data-lucide="check"></i> ${tr('plans.retentionValue', { value: escapeHtml(p.retention) })}</li>
        <li><i data-lucide="check"></i> ${tr('plans.rateLimitValue', { value: escapeHtml(p.rateLimit) })}</li>
        <li><i data-lucide="check"></i> ${tr('ui.supportValue', { value: escapeHtml(p.support) })}</li>
      </ul>
      <button type="button" class="btn ${ctaClass} w-100 plan__cta" data-plan="${p.id}" ${isCurrent ? 'disabled' : ''}>${ctaLabel}</button>
    </div>`;
}

function renderPlans() {
  document.getElementById('plan-grid').innerHTML = getPlans().map(planCard).join('');
}

// --- Invoices ---------------------------------------------------------------
function invoiceRow(inv) {
  const label = tr(`ui.${inv.status}`);
  return `
    <tr>
      <td><code class="ltr-isolate mono-sm text-body">${escapeHtml(inv.id)}</code></td>
      <td class="text-secondary">${formatDate(inv.date)}</td>
      <td class="cell-num">$${number(inv.amount)}</td>
      <td><span class="badge badge-status ${INVOICE_BADGE[inv.status]}"><span class="dot"></span>${label}</span></td>
      <td class="text-end"><button type="button" class="btn btn-icon btn-icon--sm" data-download aria-label="${tr('ui.downloadInvoice', { id: escapeHtml(inv.id) })}"><i data-lucide="download"></i></button></td>
    </tr>`;
}

function renderInvoices() {
  document.getElementById('invoice-list').innerHTML = invoices.map(invoiceRow).join('');
}

// --- Wiring ------------------------------------------------------------------
function render() {
  renderCurrentPlan();
  renderPlans();
  renderInvoices();
}

render();

// Plan upgrade / downgrade
document.getElementById('plan-grid').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-plan]');
  if (!btn || btn.disabled) return;
  const target = getPlans().find((p) => p.id === btn.dataset.plan);
  const isDowngrade = target.price < currentPlan.price;
  const ok = await ask({
    title: () => (isDowngrade ? tr('billing.downgradeTitle') : tr('billing.upgradeTitle')),
    body: () => (isDowngrade
      ? tr('ui.downgradeBody', { plan: target.name })
      : tr('ui.upgradeBody', { plan: target.name, price: target.priceLabel, period: target.period })),
    confirmLabel: () => (isDowngrade ? tr('billing.downgrade') : tr('billing.upgrade')),
    danger: isDowngrade,
  });
  if (ok) {
    currentPlanId = target.id;
    currentPlan.price = target.price;
    renderCurrentPlan();
    renderPlans();
    afxToast({ message: tr('billing.switched', { plan: target.name }), type: 'success' });
  }
});

// Billing cycle selector (visual demo)
document.querySelectorAll('[data-cycle]').forEach((seg) => {
  seg.addEventListener('click', () => {
    document.querySelectorAll('[data-cycle]').forEach((s) => {
      s.classList.toggle('is-active', s === seg);
      s.setAttribute('aria-pressed', String(s === seg));
    });
    billingCycle = seg.dataset.cycle;
    document.getElementById('billing-cycle').textContent = tr(billingCycle === 'yearly' ? 'ui.perYear' : 'ui.perMonth');
  });
});

// Invoice download (simulated)
document.getElementById('invoice-list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-download]');
  if (!btn) return;
  afxToast({ message: tr('billing.invoiceDemo'), type: 'info' });
});

// Payment method update modal
function bindPayment() {
  const card = document.getElementById('pm-card-number');
  const submit = document.getElementById('pm-save');
  submit.addEventListener('click', () => {
    const value = card.value.replace(/\s/g, '');
    const valid = /^\d{16}$/.test(value);
    card.classList.toggle('is-invalid', !valid);
    if (!valid) {
      card.focus();
      return;
    }
    card.classList.remove('is-invalid');
    const last4 = value.slice(-4);
    document.getElementById('pm-display').innerHTML = `Visa <span class="ltr-isolate">•••• ${last4}</span>`;
    Modal.getOrCreateInstance(document.getElementById('payment-modal')).hide();
    card.value = '';
    afxToast({ message: tr('billing.paymentUpdated'), type: 'success' });
  });
}
bindPayment();

createIcons({ icons });

// Re-render when the locale flips.
onLocaleChange(render);
