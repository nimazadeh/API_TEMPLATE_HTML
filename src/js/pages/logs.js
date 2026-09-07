// =============================================================
// APIForge X — Logs explorer
// Dense request table with toolbar filters (method/status/env/
// time range/search) and a per-row detail drawer (request, response,
// headers, payload, timing, "Copy as cURL"). Developer debugging tool.
// =============================================================

import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { renderLogsFull } from '../components/table.js';
import { openLogDrawer } from '../components/log-detail.js';
import logs from '../data/mock-logs.json';

boot();

const state = { search: '', method: 'all', status: 'all', env: 'all', range: 'all' };
const RANGE_MS = { '1h': 3600_000, '24h': 86_400_000, '7d': 604_800_000 };

function filtered() {
  const q = state.search.trim().toLowerCase();
  const cutoff = RANGE_MS[state.range] ? Date.now() - RANGE_MS[state.range] : 0;
  return logs.filter((l) => {
    if (q && !l.path.toLowerCase().includes(q)) return false;
    if (state.method !== 'all' && l.method !== state.method) return false;
    if (state.status !== 'all') {
      const c = Math.floor(l.status / 100);
      const want = state.status === '2xx' ? 2 : state.status === '4xx' ? 4 : state.status === '5xx' ? 5 : 0;
      if (c !== want) return false;
    }
    if (state.env !== 'all' && l.env !== state.env) return false;
    if (cutoff && new Date(l.timestamp).getTime() < cutoff) return false;
    return true;
  });
}

function render() {
  const list = filtered();
  const tbody = document.getElementById('logs-list');
  if (!list.length) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <span class="empty-icon"><i data-lucide="search"></i></span>
          <h4 class="empty-title">No logs match</h4>
          <p class="empty-desc mb-0">Adjust or clear the filters to see more results.</p>
        </div>
      </td></tr>`;
  } else {
    renderLogsFull(tbody, list);
  }
  document.getElementById('logs-count').textContent = `${list.length} of ${logs.length} requests`;
  createIcons({ icons });
}

function openFromRow(row) {
  const log = logs.find((l) => l.id === row.dataset.id);
  if (log) openLogDrawer(log);
}

function exportCsv() {
  const list = filtered();
  const header = ['id', 'method', 'path', 'status', 'latency_ms', 'environment', 'timestamp'];
  const lines = list.map((l) => [l.id, l.method, l.path, l.status, l.latencyMs, l.env, l.timestamp].join(','));
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'apiforge-logs.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- Wiring ------------------------------------------------------------
render();

const tbody = document.getElementById('logs-list');
tbody.addEventListener('click', (e) => {
  const row = e.target.closest('tr[data-id]');
  if (row) openFromRow(row);
});
tbody.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const row = e.target.closest('tr[data-id]');
  if (row) {
    e.preventDefault();
    openFromRow(row);
  }
});

document.getElementById('logs-search').addEventListener('input', (e) => {
  state.search = e.target.value;
  render();
});

document.querySelectorAll('.filter-bar .seg__item[data-method]').forEach((seg) => {
  seg.addEventListener('click', () => {
    state.method = seg.dataset.method;
    document.querySelectorAll('.filter-bar .seg__item[data-method]').forEach((s) => {
      s.classList.toggle('is-active', s === seg);
      s.setAttribute('aria-pressed', String(s === seg));
    });
    render();
  });
});

document.getElementById('logs-status').addEventListener('change', (e) => {
  state.status = e.target.value;
  render();
});
document.getElementById('logs-env').addEventListener('change', (e) => {
  state.env = e.target.value;
  render();
});
document.getElementById('logs-range').addEventListener('change', (e) => {
  state.range = e.target.value;
  render();
});

document.getElementById('logs-clear').addEventListener('click', () => {
  Object.assign(state, { search: '', method: 'all', status: 'all', env: 'all', range: 'all' });
  document.getElementById('logs-search').value = '';
  document.getElementById('logs-status').value = 'all';
  document.getElementById('logs-env').value = 'all';
  document.getElementById('logs-range').value = 'all';
  document.querySelectorAll('.filter-bar .seg__item[data-method]').forEach((s) => {
    s.classList.toggle('is-active', s.dataset.method === 'all');
    s.setAttribute('aria-pressed', String(s.dataset.method === 'all'));
  });
  render();
});

document.getElementById('logs-refresh').addEventListener('click', render);
document.getElementById('logs-export').addEventListener('click', exportCsv);
