// =============================================================
// APIForge X — Command palette (⌘K / Ctrl+K)
// Overlay, grouped results, fuzzy subsequence search, keyboard nav
// (↑ ↓ Enter Esc). Vanilla JS, no library. Source: D-010.
// =============================================================

import { getCommandGroups } from '../data/commands.js';
import { t, onLocaleChange } from '../core/i18n.js';
import { createIcons, icons } from './icons.js';
import { escapeHtml } from '../utils/format.js';

const state = { open: false, results: [], selected: 0, query: '' };

function fuzzyScore(query, text) {
  const q = query.toLowerCase();
  const s = text.toLowerCase();
  if (!q) return 1;
  let score = 0;
  let qi = 0;
  let last = -2;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) {
      score += i === last + 1 ? 3 : 1;
      if (i === 0 || s[i - 1] === ' ' || s[i - 1] === '-') score += 2;
      last = i;
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

function highlight(text, query) {
  const s = String(text);
  if (!query) return escapeHtml(s);
  const q = query.toLowerCase();
  const lower = s.toLowerCase();
  let out = '';
  let qi = 0;
  for (let i = 0; i < s.length; i++) {
    if (qi < q.length && lower[i] === q[qi]) {
      out += `<mark>${escapeHtml(s[i])}</mark>`;
      qi++;
    } else {
      out += escapeHtml(s[i]);
    }
  }
  return out;
}

function paletteMarkup() {
  return `
    <div class="cmd-dialog">
      <div class="cmd-input-row">
        <i data-lucide="search"></i>
        <input type="text" placeholder="${t('palette.placeholder')}" aria-label="${t('palette.searchAria')}" autocomplete="off" spellcheck="false" />
        <kbd>esc</kbd>
      </div>
      <div class="cmd-results" role="listbox"></div>
      <div class="cmd-footer">
        <span class="cmd-footer__key"><kbd>↑</kbd><kbd>↓</kbd> ${t('palette.navigate')}</span>
        <span class="cmd-footer__key"><kbd>↵</kbd> ${t('palette.select')}</span>
        <span class="cmd-footer__key"><kbd>esc</kbd> ${t('palette.close')}</span>
      </div>
    </div>`;
}

function buildPalette() {
  let wrap = document.querySelector('.command-palette');
  if (wrap) return wrap;
  wrap = document.createElement('div');
  wrap.className = 'command-palette';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-label', t('palette.title'));
  wrap.hidden = true;
  wrap.innerHTML = paletteMarkup();
  document.body.appendChild(wrap);
  createIcons({ icons });
  return wrap;
}

function flatResults() {
  return state.results.flatMap((g) => g.items);
}

function render() {
  const box = document.querySelector('.cmd-results');
  if (!box) return;
  const flat = flatResults();
  if (!flat.length) {
    box.innerHTML = `<div class="cmd-empty">${t('palette.noResults', { query: escapeHtml(state.query) })}</div>`;
    return;
  }
  const selected = flat[Math.min(state.selected, flat.length - 1)];
  box.innerHTML = state.results
    .map(
      (group) => `
      <div class="cmd-group">
        <div class="cmd-group__label">${escapeHtml(group.label)}</div>
        ${group.items
          .map(
            (item) => `
          <button type="button" class="cmd-item ${item.id === selected?.id ? 'is-selected' : ''}" role="option" data-id="${item.id}">
            <span class="cmd-item__icon"><i data-lucide="${item.icon}"></i></span>
            <span class="cmd-item__body">
              <span class="cmd-item__title">${highlight(item.title, state.query)}</span>
              <span class="cmd-item__desc">${highlight(item.desc, state.query)}${item.disabled ? ' · ' + t('common.soon') : ''}</span>
            </span>
            ${item.href ? '<span class="cmd-item__hint">↵</span>' : ''}
          </button>`
          )
          .join('')}
      </div>`
    )
    .join('');
  createIcons({ icons });
}

function search(query) {
  return getCommandGroups()
    .map((g) => ({
      label: g.label,
      items: g.items
        .map((item) => {
          const score = Math.max(
            fuzzyScore(query, item.title),
            fuzzyScore(query, item.desc),
            fuzzyScore(query, item.id)
          );
          return score > 0 ? { ...item, score } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score),
    }))
    .filter((g) => g.items.length);
}

function move(delta) {
  const flat = flatResults().filter((i) => !i.disabled);
  if (!flat.length) return;
  const enabled = flatResults();
  const currentId = enabled[state.selected]?.id;
  const idx = enabled.findIndex((i) => i.id === currentId);
  state.selected = (idx + delta + enabled.length) % enabled.length;
  render();
  const btn = document.querySelector(`.cmd-item[data-id="${enabled[state.selected].id}"]`);
  btn?.scrollIntoView({ block: 'nearest' });
}

function activate(item) {
  if (!item || item.disabled) return;
  if (item.href) {
    window.location.href = item.href;
    return;
  }
  if (typeof item.run === 'function') {
    close();
    item.run();
  }
}

function open() {
  const wrap = buildPalette();
  wrap.hidden = false;
  state.open = true;
  requestAnimationFrame(() => wrap.classList.add('is-open'));
  state.query = '';
  state.results = search('');
  state.selected = 0;
  const input = wrap.querySelector('input');
  input.value = '';
  render();
  input.focus();
}

function close() {
  const wrap = document.querySelector('.command-palette');
  if (!wrap) return;
  state.open = false;
  wrap.classList.remove('is-open');
  setTimeout(() => {
    wrap.hidden = true;
  }, 150);
}

/**
 * Bind the live input's own events. The <input> is destroyed and
 * rebuilt inside the (persistent) dialog shell whenever the locale
 * flips, so this must be re-called after each rebuild.
 */
function bindInput(input) {
  if (!input) return;
  input.addEventListener('input', () => {
    state.query = input.value;
    state.results = search(input.value);
    state.selected = 0;
    render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const flat = flatResults();
      activate(flat[Math.min(state.selected, flat.length - 1)]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  });
}

export function initCommandPalette() {
  const wrap = buildPalette();

  // Re-translate the chrome and re-index when the locale flips. The
  // dialog <div class="command-palette"> persists, so only its inner
  // markup (including the <input>) is rebuilt and re-bound.
  onLocaleChange(() => {
    const w = document.querySelector('.command-palette');
    if (!w) return;
    w.setAttribute('aria-label', t('palette.title'));
    w.innerHTML = paletteMarkup();
    createIcons({ icons });
    state.results = search(state.query);
    state.selected = 0;
    render();
    const box = w.querySelector('.cmd-results');
    if (box) box.scrollTop = 0;
    bindInput(w.querySelector('input'));
  });

  bindInput(wrap.querySelector('input'));

  // Stable, once-only listeners — these live on persistent nodes, so
  // they must NOT be re-registered on every locale change.
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap) return close();
    const itemBtn = e.target.closest('.cmd-item');
    if (itemBtn) {
      const flat = flatResults();
      activate(flat.find((i) => i.id === itemBtn.dataset.id));
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      state.open ? close() : open();
    }
  });

  document.querySelectorAll('[data-command-palette]').forEach((el) => {
    el.addEventListener('click', () => (state.open ? close() : open()));
  });
}
