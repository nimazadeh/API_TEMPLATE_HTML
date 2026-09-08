// =============================================================
// APIForge X — Documentation portal
// Three-pane developer docs: section nav + article + on-this-page
// TOC. Renders authored blocks (see data/docs-content.js) through a
// small engine. Code blocks reuse initCodeBlock (LTR, tabs, copy).
// =============================================================

import { boot } from '../main.js';
import { Offcanvas } from '../core/bootstrap.js';
import { createIcons, icons } from '../components/icons.js';
import { initCodeBlock } from '../components/code-block.js';
import { bindCopyButton } from '../components/copy.js';
import { escapeHtml } from '../utils/format.js';
import { docGroups, docArticles, docOrder } from '../data/docs-content.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';

boot();

const state = { active: 'intro', query: '' };

// Convert `inline code` backticks in prose into <code> spans (escaped).
function inline(text) {
  return String(text).replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
}

// --- Block renderers ----------------------------------------------------
function renderCode(block) {
  const tabs = (block.tabs || []).map((t, i) => `
    <button type="button" class="code-tabs__tab ${i === 0 ? 'is-active' : ''}" data-tab="${slugify(t.lang)}" aria-selected="${i === 0}">${escapeHtml(t.lang)}</button>`).join('');
  const panes = (block.tabs || []).map((t, i) => `
    <pre class="code-block__body" data-code-pane data-pane="${slugify(t.lang)}"${i === 0 ? '' : ' hidden'}><code>${escapeHtml(t.code)}</code></pre>`).join('');
  return `
    <div class="code-block mb-4" data-code-block>
      <div class="code-block__header">
        <div class="code-tabs" role="tablist" aria-label="${escapeHtml(block.label || 'Code')}">${tabs}</div>
        <div class="code-block__actions"><button type="button" class="btn btn-icon btn-icon--sm" data-code-copy aria-label="${tr('common.copy-code')}"><i data-lucide="copy"></i></button></div>
      </div>
      ${panes}
    </div>`;
}

function renderJson(block) {
  return `
    <div class="code-block code-block--flush mb-4" data-code-block>
      <div class="code-block__header">
        <span class="code-block__lang"><i data-lucide="braces"></i> ${escapeHtml(block.label || 'JSON')}</span>
        <div class="code-block__actions"><button type="button" class="btn btn-icon btn-icon--sm" data-code-copy aria-label="${tr('aria.copyJson')}"><i data-lucide="copy"></i></button></div>
      </div>
      <pre class="code-block__body" data-code-pane><code>${escapeHtml(block.code)}</code></pre>
    </div>`;
}

function renderTable(block) {
  const head = `<thead><tr>${block.headers.map((h) => `<th scope="col">${escapeHtml(h)}</th>`).join('')}</tr></thead>`;
  const body = `<tbody>${block.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `
    <div class="table-card mb-4">
      <div class="table-responsive">
        <table class="table">${head}${body}</table>
      </div>
    </div>`;
}

const CALLOUT_TONE = { info: 'info', success: 'success', warning: 'warning' };
const CALLOUT_ICON = { info: 'info', success: 'circle-check', warning: 'alert-triangle' };

function renderCallout(block) {
  const tone = CALLOUT_TONE[block.tone] || 'info';
  return `
    <div class="alert alert-${tone} mb-4" role="note">
      <span class="alert-icon"><i data-lucide="${CALLOUT_ICON[block.tone] || 'info'}"></i></span>
      <div class="alert-content">
        <div class="fw-medium">${escapeHtml(block.title)}</div>
        ${block.body ? `<div class="mt-1 text-secondary">${inline(block.body)}</div>` : ''}
      </div>
    </div>`;
}

function renderBlocks(blocks) {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'h2': return `<h2 id="${slugify(b.text)}"><span>${escapeHtml(b.text)}</span><a class="docs-anchor" href="#${slugify(b.text)}" aria-label="${tr('ui.linkTo', { heading: escapeHtml(b.text) })}"><i data-lucide="link"></i></a></h2>`;
        case 'h3': return `<h3 id="${slugify(b.text)}"><span>${escapeHtml(b.text)}</span><a class="docs-anchor" href="#${slugify(b.text)}" aria-label="${tr('ui.linkTo', { heading: escapeHtml(b.text) })}"><i data-lucide="link"></i></a></h3>`;
        case 'p': return `<p>${inline(b.text)}</p>`;
        case 'ul': return `<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
        case 'code': return renderCode(b);
        case 'json': return renderJson(b);
        case 'table': return renderTable(b);
        case 'callout': return renderCallout(b);
        default: return '';
      }
    })
    .join('');
}

// --- TOC -----------------------------------------------------------------
function renderToc(article) {
  const headings = article.blocks.filter((b) => b.type === 'h2' || b.type === 'h3');
  if (!headings.length) return '';
  return `
    <div class="docs-toc__label">${tr('aria.onThisPage')}</div>
    ${headings
      .map((h) => `<a class="docs-toc__item ${h.type === 'h3' ? 'is-sub' : ''}" href="#${slugify(h.text)}">${escapeHtml(h.text)}</a>`)
      .join('')}`;
}

// --- Nav -----------------------------------------------------------------
function renderNav() {
  const q = state.query.trim().toLowerCase();
  const match = (id) => !q || (docArticles()[id].title + ' ' + docArticles()[id].lead).toLowerCase().includes(q);
  return docGroups()
    .map((group) => {
      const items = group.items.filter(match);
      if (!items.length) return '';
      return `
        <div class="docs-nav__group">
          <div class="docs-nav__label">${escapeHtml(group.label)}</div>
          ${items
            .map(
              (id) => `<a class="docs-nav__item ${state.active === id ? 'is-active' : ''}" href="#${id}" data-doc="${id}">${escapeHtml(docArticles()[id].title)}</a>`
            )
            .join('')}
        </div>`;
    })
    .join('');
}

// --- Article + pager -------------------------------------------------------
function renderArticle() {
  const articles = docArticles();
  const order = docOrder();
  const article = articles[state.active] || articles.intro;
  const idx = order.indexOf(article.id);
  const prev = idx > 0 ? articles[order[idx - 1]] : null;
  const next = idx < order.length - 1 ? articles[order[idx + 1]] : null;

  document.getElementById('docs-crumb').textContent = article.title;
  document.getElementById('docs-article').innerHTML = `
    <h1 class="docs-article__title">${escapeHtml(article.title)}</h1>
    <p class="docs-article__lead">${escapeHtml(article.lead)}</p>
    ${renderBlocks(article.blocks)}`;

  const pager = document.getElementById('docs-pager');
  pager.innerHTML = `
    ${prev ? `<a class="docs-pager__link" href="#${prev.id}"><span class="docs-pager__dir">${tr('ui.previous')}</span><span class="docs-pager__title">${escapeHtml(prev.title)}</span></a>` : '<span></span>'}
    ${next ? `<a class="docs-pager__link text-end" href="#${next.id}"><span class="docs-pager__dir">${tr('ui.next')}</span><span class="docs-pager__title">${escapeHtml(next.title)}</span></a>` : '<span></span>'}`;

  document.querySelectorAll('#docs-article [data-code-block]').forEach(initCodeBlock);
  document.querySelectorAll('#docs-article [data-copy]').forEach(bindCopyButton);
  createIcons({ icons });
}

function renderNavInto() {
  const navHtml = renderNav();
  document.getElementById('docs-nav').innerHTML = navHtml;
  const mobile = document.getElementById('docs-nav-mobile');
  if (mobile) mobile.innerHTML = navHtml;
}

function render() {
  renderNavInto();
  document.getElementById('docs-toc').innerHTML = renderToc(docArticles()[state.active] || docArticles().intro);
  renderArticle();
}

function navigate(id) {
  state.active = id;
  window.history.replaceState(null, '', `#${id}`);
  render();
  document.querySelector('.app-main')?.scrollTo?.({ top: 0 });
  const offcanvas = document.getElementById('docs-nav-offcanvas');
  if (offcanvas) Offcanvas.getOrCreateInstance(offcanvas).hide();
}

// --- Wiring -----------------------------------------------------------------
render();

[document.getElementById('docs-search'), document.getElementById('docs-search-mobile')].forEach((input) => {
  if (!input) return;
  input.addEventListener('input', (e) => {
    state.query = e.target.value;
    renderNavInto();
  });
});

[document.getElementById('docs-nav'), document.getElementById('docs-nav-mobile')].forEach((nav) => {
  if (!nav) return;
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('[data-doc]');
    if (!item) return;
    e.preventDefault();
    navigate(item.dataset.doc);
  });
});

window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  if (docArticles()[id]) {
    state.active = id;
    render();
  }
});

// Re-render the article and navigation when the locale flips.
onLocaleChange(render);
