// =============================================================
// APIForge X — Code block behavior
// Language tabs (pill), copy-active-pane, and API-key injection:
// YOUR_API_KEY / {{API_KEY}} is replaced with the current mock key
// (sk_test_… in Test env, sk_live_… in Live env).
// =============================================================

import { copyText, flashCopied } from './copy.js';
import { currentEnv } from './env-switcher.js';

const FAKE_KEY_SEED = '4fJk9Lm2XpQz7RvW';

function mockKey() {
  const prefix = currentEnv() === 'test' ? 'sk_test_' : 'sk_live_';
  return prefix + FAKE_KEY_SEED.slice(0, 10);
}

function injectKey(text) {
  return text.replace(/YOUR_API_KEY|\{\{\s*API_KEY\s*\}\}/g, mockKey());
}

function visiblePane(block) {
  return block.querySelector('[data-code-pane]:not([hidden])');
}

function activateTab(block, tab) {
  const target = tab.dataset.tab;
  block.querySelectorAll('.code-tabs__tab').forEach((t) => {
    t.classList.toggle('is-active', t === tab);
    t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
  });
  block.querySelectorAll('[data-code-pane]').forEach((pane) => {
    pane.hidden = pane.dataset.pane !== target;
  });
}

/** Initialize a single code block: key injection, tabs, and copy. */
export function initCodeBlock(block) {
  if (!block || block.dataset.initialized) return;
  block.dataset.initialized = 'true';

  // Cache the raw template once; env switching re-injects the key.
  block.querySelectorAll('[data-code-pane]').forEach((pane) => {
    if (pane.dataset.raw == null) pane.dataset.raw = pane.textContent;
    pane.textContent = injectKey(pane.dataset.raw);
  });

  const tabs = block.querySelectorAll('.code-tabs__tab');
  tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(block, tab)));
  const firstTab = block.querySelector('.code-tabs__tab.is-active') || tabs[0];
  if (firstTab) activateTab(block, firstTab);

  // Copy button copies the visible pane (uses [data-code-copy] so the
  // generic [data-copy] handler doesn't double-bind).
  const copyBtn = block.querySelector('[data-code-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const pane = visiblePane(block);
      if (pane) flashCopied(copyBtn, await copyText(pane.textContent.trim()));
    });
  }
}

export function initCodeBlocks() {
  document.querySelectorAll('[data-code-block]').forEach((block) => {
    initCodeBlock(block);
  });

  document.addEventListener('afx:env', () => {
    document.querySelectorAll('[data-code-block]').forEach((block) => {
      block.querySelectorAll('[data-code-pane]').forEach((pane) => {
        if (pane.dataset.raw != null) pane.textContent = injectKey(pane.dataset.raw);
      });
    });
  });
}
