// =============================================================
// APIForge X — Dropdown
// [data-dropdown] wraps a trigger + .dropdown-menu. Toggles .is-open,
// closes on outside click and Escape.
// =============================================================

function closeAll(except) {
  document.querySelectorAll('.dropdown.is-open').forEach((d) => {
    if (d !== except) d.classList.remove('is-open');
  });
}

export function initDropdowns() {
  document.querySelectorAll('[data-dropdown]').forEach((wrap) => {
    const trigger = wrap.querySelector('[data-dropdown-toggle]') || wrap.firstElementChild;
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !wrap.classList.contains('is-open');
      closeAll(wrap);
      wrap.classList.toggle('is-open', willOpen);
    });
    wrap.querySelectorAll('.dropdown-item').forEach((item) => {
      item.addEventListener('click', () => wrap.classList.remove('is-open'));
    });
  });

  document.addEventListener('click', () => closeAll());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
}
