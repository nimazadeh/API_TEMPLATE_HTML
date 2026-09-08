// =============================================================
// APIForge X — Copy utility
// [data-copy] button copies text from [data-copy-target] (selector)
// or the literal [data-copy] value. Flashes "Copied!" for 2s.
// =============================================================

import { icons } from './icons.js';
import { t } from '../core/i18n.js';

/** Write text to the clipboard with a fallback for non-secure contexts. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

/** Swap the button icon and optional .copy-label to "Copied!" for 2s. */
export function flashCopied(btn, ok = true) {
  const icon = btn.querySelector('[data-lucide], svg');
  if (icon && icons.check) {
    const svg = icons.check.toSvg({ width: 14, height: 14, 'stroke-width': 2 });
    icon.outerHTML = svg;
  }
  const labelEl = btn.querySelector('.copy-label');
  if (labelEl) {
    const original = labelEl.textContent;
    labelEl.textContent = ok ? t('copy.copied') : t('copy.failed');
    setTimeout(() => {
      labelEl.textContent = original;
      if (icon && icons.copy) {
        const el = btn.querySelector('[data-lucide], svg');
        if (el) el.outerHTML = icons.copy.toSvg({ width: 14, height: 14, 'stroke-width': 2 });
      }
    }, 2000);
  }
}

export function bindCopyButton(btn) {
  btn.addEventListener('click', async () => {
    const target = btn.dataset.copyTarget;
    let text = btn.dataset.copy || '';
    if (target) {
      const el = document.querySelector(target);
      if (el) text = (el.textContent || el.value || '').trim();
    }
    flashCopied(btn, await copyText(text));
  });
}

export function initCopy() {
  document.querySelectorAll('[data-copy]').forEach(bindCopyButton);
}
