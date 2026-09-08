// =============================================================
// APIForge X — Status page (Phase 4)
// Deterministic (seeded) 90-day uptime bars, component health and
// incident history. Marketing content — authored here, not in the
// mock-data generator.
// =============================================================

import { bootSite } from '../site.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { createIcons, icons } from '../components/icons.js';
import { formatDate, number } from '../utils/format.js';

bootSite();

const COMPONENTS = [
  { nameKey: 'status.componentGateway', descKey: 'status.componentGatewayDesc' },
  { nameKey: 'status.componentLogs', descKey: 'status.componentLogsDesc' },
  { nameKey: 'status.componentWebhooks', descKey: 'status.componentWebhooksDesc' },
  { nameKey: 'status.componentDashboard', descKey: 'status.componentDashboardDesc' },
  { nameKey: 'status.componentBilling', descKey: 'status.componentBillingDesc' },
  { nameKey: 'status.componentStatus', descKey: 'status.componentStatusDesc' },
];

const INCIDENTS = [
  {
    date: '2026-09-02',
    titleKey: 'status.incident1Title',
    descKey: 'status.incident1Desc',
    statusKey: 'status.resolved',
  },
  {
    date: '2026-08-19',
    titleKey: 'status.incident2Title',
    descKey: 'status.incident2Desc',
    statusKey: 'status.resolved',
  },
];

// Deterministic LCG so the bars never change between loads.
function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function renderBars() {
  const host = document.getElementById('uptime-bars');
  const rng = seededRng(20260908);
  const bars = [];
  for (let i = 0; i < 90; i++) {
    const roll = rng();
    // Two deterministic "degraded" days for visual honesty.
    const degraded = i === 27 || i === 63;
    const height = degraded ? 62 + Math.round(roll * 8) : 92 + Math.round(roll * 8);
    bars.push(
      `<span class="uptime-bar${degraded ? ' is-degraded' : ''}" style="height:${height}%" title="${tr('ui.day', { count: number(90 - i) })}"></span>`
    );
  }
  host.innerHTML = bars.join('');
}

function renderComponents() {
  const host = document.getElementById('components-list');
  host.innerHTML = COMPONENTS.map(
    (c) => `
      <div class="status-components__row">
        <div>
          <div class="fw-medium">${tr(c.nameKey)}</div>
          <div class="caption text-tertiary">${tr(c.descKey)}</div>
        </div>
        <span class="badge badge-status--success"><i data-lucide="check"></i> ${tr('status.operational')}</span>
      </div>`
  ).join('');
  createIcons({ icons });
}

function renderIncidents() {
  const host = document.getElementById('incidents-list');
  host.innerHTML = INCIDENTS.map(
    (inc) => `
      <div class="incidents__item">
        <span class="incidents__date ltr-isolate">${formatDate(inc.date)}</span>
        <div>
          <div class="incidents__title">${tr(inc.titleKey)}</div>
          <div class="incidents__desc">${tr(inc.descKey)}</div>
          <span class="badge badge-neutral mt-2">${tr(inc.statusKey)}</span>
        </div>
      </div>`
  ).join('');
}

function render() {
  renderBars();
  renderComponents();
  renderIncidents();
}

render();

// Re-render when the locale flips.
onLocaleChange(render);
