// =============================================================
// APIForge X — Persian RTL QA harness (rtl-persian-test.html)
//
// The single place to verify a release is marketplace-ready for
// Persian: mixed-script sentences, Persian/Latin digits, LTR
// isolation, code blocks, tables, forms, charts, dropdowns,
// modals, pagination, alerts, timelines — plus live switching of
// theme (dark/light/system) and language (fa ↔ en, RTL ↔ LTR).
// =============================================================

import { boot } from '../main.js';
import { setTheme } from '../components/theme.js';
import { renderLogs } from '../components/table.js';
import { createIcons, icons } from '../components/icons.js';
import { makeChart, axis, tooltips, initCharts } from '../components/charts.js';
import { setLocale, getLocale, onLocaleChange, t as tr } from '../core/i18n.js';
import { compactNumber } from '../utils/format.js';
import logs from '../data/mock-logs.json';
import observability from '../data/mock-observability.json';

boot();
initCharts();

const root = document.documentElement;
const systemMedia = window.matchMedia('(prefers-color-scheme: light)');

function highlightMode() {
  const stored = localStorage.getItem('afx-theme');
  const resolved = stored || (systemMedia.matches ? 'light' : 'dark');
  document.querySelectorAll('[data-mode]').forEach((btn) => {
    const mode = stored ? resolved : 'system';
    btn.classList.toggle('is-active', btn.dataset.mode === mode);
  });
}

function highlightDir() {
  const dir = root.getAttribute('dir');
  document.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.dir === dir);
  });
}

/** Direction switch == locale switch (Persian is RTL, English is LTR). */
function setDir(dir) {
  setLocale(dir === 'rtl' ? 'fa' : 'en');
}

/**
 * Back/next glyphs are chosen per direction: "back" points toward the
 * start of the reading line (right in RTL, left in LTR). These buttons
 * opt out of the CSS mirroring rule via `.no-dir-flip`.
 */
function refreshDirIcons() {
  const rtl = root.getAttribute('dir') === 'rtl';
  document.querySelectorAll('[data-dir-icon]').forEach((slot) => {
    const kind = slot.dataset.dirIcon;
    const name = kind === 'back' ? (rtl ? 'arrow-right' : 'arrow-left') : rtl ? 'arrow-left' : 'arrow-right';
    const host = slot.closest('button') || slot.parentElement;
    if (host) host.classList.add('no-dir-flip');
    if (icons[name]) {
      slot.outerHTML = icons[name].toSvg({ width: 16, height: 16, 'stroke-width': 2 });
    }
  });
  createIcons({ icons });
}

function setMode(mode) {
  if (mode === 'system') {
    try {
      localStorage.removeItem('afx-theme');
    } catch {
      /* ignore */
    }
    setTheme(systemMedia.matches ? 'light' : 'dark', { persist: false });
    root.style.colorScheme = 'dark light';
  } else {
    setTheme(mode, { persist: true });
  }
  highlightMode();
}

systemMedia.addEventListener('change', () => {
  if (!localStorage.getItem('afx-theme')) {
    setTheme(systemMedia.matches ? 'light' : 'dark', { persist: false });
    root.style.colorScheme = 'dark light';
  }
});

// Charts follow the active locale (digits, axis labels, tooltips).
function renderChart() {
  const canvas = document.getElementById('qa-chart');
  if (!canvas) return;
  const days = observability.series.slice(-14);
  makeChart(canvas, (theme) => ({
    type: 'line',
    data: {
      labels: days.map((d) => d.date.slice(5)),
      datasets: [{
        data: days.map((d) => d.requests),
        borderColor: theme.accent,
        backgroundColor: theme.accentSoft,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.35,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: axis(theme),
        y: { ...axis(theme), ticks: { ...axis(theme).ticks, callback: (v) => compactNumber(v) } },
      },
      ...tooltips(theme),
    },
  }));
}

// Mixed-content table: LTR-isolated code columns inside an RTL page.
function renderTable() {
  const host = document.querySelector('#logs-demo');
  if (host) renderLogs(host, logs, { limit: 6 });
}

document.querySelectorAll('[data-dir]').forEach((btn) => {
  btn.addEventListener('click', () => setDir(btn.dataset.dir));
});
document.querySelectorAll('[data-mode]').forEach((btn) => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

renderChart();
renderTable();
refreshDirIcons();
highlightDir();
highlightMode();

// Re-render chart + table when the locale flips.
onLocaleChange(() => {
  renderChart();
  renderTable();
  refreshDirIcons();
  highlightDir();
});
