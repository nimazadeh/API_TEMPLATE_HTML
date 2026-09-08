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
import { escapeHtml, compactNumber, formatDate } from '../utils/format.js';
import plans from '../data/mock-plans.json';
import invoices from '../data/mock-invoices.json';
import plan from '../data/mock-plan.json';

boot();
initConfirm({ modalId: 'confirm-modal', titleId: 'confirm-modal-title', bodyId: 'confirm-modal-body', submitId: 'confirm-modal-submit' });

const currentPlan = { ...plan, name: 'Scale', price: 199 };
const INVOICE_BADGE = { paid: 'badge-status--success', pending: 'badge-status--warning', failed: 'badge-status--error' };

// --- Current plan ---------------------------------------------------------
function renderCurrentPlan() {
  document.getElementById('billing-plan-name').textContent = currentPlan.name;
  document.getElementById('billing-price').textContent = `$${currentPlan.price}`;
  document.getElementById('billing-cycle').textContent = 'per month';
  document.getElementById('billing-renewal').textContent = formatDate(currentPlan.periodEnd);
  document.getElementById('billing-status').innerHTML = '<span class="badge badge-status badge-status--success"><span class="dot"></span>Active</span>';

  const pct = (currentPlan.requestsUsed / currentPlan.requestsLimit) * 100;
  document.getElementById('billing-usage-fill').style.width = `${pct.toFixed(1)}%`;
  document.getElementById('billing-usage').textContent = `${compactNumber(currentPlan.requestsUsed)} of ${compactNumber(currentPlan.requestsLimit)} requests`;
  document.getElementById('billing-usage-pct').textContent = `${pct.toFixed(1)}% used`;

  const remaining = Math.max(0, currentPlan.requestsLimit - currentPlan.requestsUsed);
  document.getElementById('billing-projected').textContent = `Projected for ${currentPlan.periodLabel}: ${compactNumber(currentPlan.requestsUsed + remaining * 0.12)} requests`;
}

// --- Plan comparison -------------------------------------------------------
function planCard(p) {
  const isCurrent = p.name === currentPlan.name;
  const isDowngrade = !isCurrent && p.price < currentPlan.price;
  const ctaLabel = isCurrent ? tr('billing.currentPlanCta') : isDowngrade ? tr('billing.downgrade') : tr('billing.upgradeTo', { plan: p.name });
  const ctaClass = isCurrent ? 'btn-secondary' : isDowngrade ? 'btn-ghost' : 'btn-primary';
  return `
    <div class="card plan ${isCurrent ? 'plan--current' : ''}">
      ${isCurrent ? '<span class="plan__tag">Current plan</span>' : ''}
      <div class="plan__name">${escapeHtml(p.name)}</div>
      <div class="plan__price"><span class="plan__amount">${p.priceLabel}</span><span class="plan__period">${p.period}</span></div>
      <p class="plan__blurb">${escapeHtml(p.blurb)}</p>
      <ul class="plan__features">
        <li><i data-lucide="check"></i> ${escapeHtml(p.requests)} requests</li>
        <li><i data-lucide="check"></i> ${escapeHtml(p.environments)} environments</li>
        <li><i data-lucide="check"></i> ${escapeHtml(p.members)} team members</li>
        <li><i data-lucide="check"></i> ${escapeHtml(p.webhooks)} webhook endpoints</li>
        <li><i data-lucide="check"></i> ${escapeHtml(p.retention)} log retention</li>
        <li><i data-lucide="check"></i> ${escapeHtml(p.rateLimit)} rate limit</li>
        <li><i data-lucide="check"></i> ${escapeHtml(p.support)} support</li>
      </ul>
      <button type="button" class="btn ${ctaClass} w-100 plan__cta" data-plan="${p.id}" ${isCurrent ? 'disabled' : ''}>${ctaLabel}</button>
    </div>`;
}

function renderPlans() {
  document.getElementById('plan-grid').innerHTML = plans.map(planCard).join('');
}

// --- Invoices ---------------------------------------------------------------
function invoiceRow(inv) {
  const label = inv.status.charAt(0).toUpperCase() + inv.status.slice(1);
  return `
    <tr>
      <td><code class="ltr-isolate mono-sm text-body">${escapeHtml(inv.id)}</code></td>
      <td class="text-secondary">${formatDate(inv.date)}</td>
      <td class="cell-num">$${inv.amount}.00</td>
      <td><span class="badge badge-status ${INVOICE_BADGE[inv.status]}"><span class="dot"></span>${label}</span></td>
      <td class="text-end"><button type="button" class="btn btn-icon btn-icon--sm" data-download aria-label="Download ${escapeHtml(inv.id)}"><i data-lucide="download"></i></button></td>
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
  const target = plans.find((p) => p.id === btn.dataset.plan);
  const isDowngrade = target.price < currentPlan.price;
  const ok = await ask({
    title: isDowngrade ? tr('billing.downgradeTitle') : tr('billing.upgradeTitle'),
    body: isDowngrade
      ? `Switch to ${target.name}? You will lose access to ${target.name} tier limits at the end of the billing cycle.`
      : `Upgrade to ${target.name} at ${target.priceLabel}${target.period}? The new limits apply immediately.`,
    confirmLabel: isDowngrade ? tr('billing.downgrade') : tr('billing.upgrade'),
    danger: isDowngrade,
  });
  if (ok) {
    currentPlan.name = target.name;
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
    document.getElementById('billing-cycle').textContent = seg.dataset.cycle === 'yearly' ? 'per year' : 'per month';
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
