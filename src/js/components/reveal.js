// =============================================================
// APIForge X — Reveal (password / masked values)
// [data-reveal] toggles the nearest input between type password/text
// and swaps the eye / eye-off icon.
// =============================================================

import { t } from '../core/i18n.js';
import { createIcons, icons } from './icons.js';

export function initReveal() {
  document.querySelectorAll('[data-reveal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-group, .form-group')?.querySelector('input');
      if (!input) return;
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      const icon = btn.querySelector('[data-lucide], svg');
      const name = reveal ? 'eye-off' : 'eye';
      if (icon && icons[name]) {
        icon.outerHTML = icons[name].toSvg({ width: 14, height: 14, 'stroke-width': 2 });
      }
      btn.dataset.i18nAttr = `aria-label:${reveal ? 'ui.hideKey' : 'ui.revealValue'}`;
      btn.setAttribute('aria-label', t(reveal ? 'ui.hideKey' : 'ui.revealValue'));
      createIcons({ icons });
    });
  });
}
