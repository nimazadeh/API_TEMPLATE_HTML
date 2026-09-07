// =============================================================
// APIForge X — Tooltip
// Minimal, [data-tooltip="…"] + [data-tooltip-pos]. Inline help is
// preferred; tooltips are the last resort (Vercel principle).
// =============================================================

let active = null;

function createTooltip() {
  let t = document.querySelector('.tooltip');
  if (!t) {
    t = document.createElement('div');
    t.className = 'tooltip';
    t.setAttribute('role', 'tooltip');
    document.body.appendChild(t);
  }
  return t;
}

function show(el) {
  const t = createTooltip();
  t.textContent = el.dataset.tooltip;
  const rect = el.getBoundingClientRect();
  document.body.appendChild(t);
  t.classList.add('is-visible');
  const pos = el.dataset.tooltipPos || 'top';
  const tw = t.offsetWidth;
  const th = t.offsetHeight;
  let left = rect.left + rect.width / 2 - tw / 2;
  let top = rect.top - th - 8;
  if (pos === 'bottom') top = rect.bottom + 8;
  left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
  top = Math.max(8, top);
  t.style.left = `${left}px`;
  t.style.top = `${top}px`;
  active = el;
}

function hide() {
  const t = document.querySelector('.tooltip');
  t?.classList.remove('is-visible');
  active = null;
}

export function initTooltips() {
  let timer = null;
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (!el) return;
    clearTimeout(timer);
    timer = setTimeout(() => show(el), 300);
  });
  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (el) {
      clearTimeout(timer);
      hide();
    }
  });
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (el) show(el);
  });
  document.addEventListener('focusout', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (el) hide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
  window.addEventListener('scroll', () => {
    if (active) hide();
  }, { passive: true });
}
