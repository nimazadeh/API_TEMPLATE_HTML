// =============================================================
// APIForge X — Status page (Phase 4)
// Deterministic (seeded) 90-day uptime bars, component health and
// incident history. Marketing content — authored here, not in the
// mock-data generator.
// =============================================================

import { bootSite } from '../site.js';
import { createIcons, icons } from '../components/icons.js';

bootSite();

const COMPONENTS = [
  { name: 'API gateway', status: 'operational', desc: 'Routing and authentication for all requests.' },
  { name: 'Request logs', status: 'operational', desc: 'Ingestion pipeline for the log inspector.' },
  { name: 'Webhooks', status: 'operational', desc: 'Delivery queue, retries and signatures.' },
  { name: 'Dashboard', status: 'operational', desc: 'The web application and its API.' },
  { name: 'Billing', status: 'operational', desc: 'Invoices, usage metering and payment processing.' },
  { name: 'Status page', status: 'operational', desc: 'This page.' },
];

const INCIDENTS = [
  {
    date: 'Sep 02, 2026',
    title: 'Elevated webhook delivery latency',
    desc: 'Delivery retries queued for 38 minutes while a worker pool rescaled. No deliveries lost.',
    status: 'resolved',
  },
  {
    date: 'Aug 19, 2026',
    title: 'Log ingestion degraded',
    desc: 'Log tail latency reached 9s during a database failover. Resolved after 25 minutes.',
    status: 'resolved',
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
      `<span class="uptime-bar${degraded ? ' is-degraded' : ''}" style="height:${height}%" title="Day ${90 - i}"></span>`
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
          <div class="fw-medium">${c.name}</div>
          <div class="caption text-tertiary">${c.desc}</div>
        </div>
        <span class="badge badge-status--success"><i data-lucide="check"></i> Operational</span>
      </div>`
  ).join('');
  createIcons({ icons });
}

function renderIncidents() {
  const host = document.getElementById('incidents-list');
  host.innerHTML = INCIDENTS.map(
    (inc) => `
      <div class="incidents__item">
        <span class="incidents__date ltr-isolate">${inc.date}</span>
        <div>
          <div class="incidents__title">${inc.title}</div>
          <div class="incidents__desc">${inc.desc}</div>
          <span class="badge badge-neutral mt-2">${inc.status}</span>
        </div>
      </div>`
  ).join('');
}

renderBars();
renderComponents();
renderIncidents();
