// =============================================================
// APIForge X — Modal & Drawer
// [data-modal-open="#id"] / [data-drawer-open="#id"] opens the target;
// [data-close] and the shared backdrop close it; Escape closes all.
// A single global backdrop is managed here (fixed-position elements
// inside transformed containers would otherwise break).
// =============================================================

let openCount = 0;

function backdrop() {
  let b = document.querySelector('.afx-backdrop');
  if (!b) {
    b = document.createElement('div');
    b.className = 'backdrop afx-backdrop';
    b.hidden = true;
    document.body.appendChild(b);
  }
  return b;
}

function openDialog(dialog) {
  if (!dialog) return;
  const b = backdrop();
  b.hidden = false;
  requestAnimationFrame(() => b.classList.add('is-open'));
  b.classList.add('is-visible');
  dialog.hidden = false;
  requestAnimationFrame(() => dialog.classList.add('is-open'));
  document.body.style.overflow = 'hidden';
  openCount += 1;
  dialog.querySelector('[autofocus], input, button')?.focus?.();
}

function closeDialog(dialog) {
  if (!dialog || dialog.hidden) return;
  dialog.classList.remove('is-open');
  document.body.style.overflow = '';
  openCount = Math.max(0, openCount - 1);
  setTimeout(() => {
    dialog.hidden = true;
    if (openCount === 0) {
      const b = backdrop();
      b.classList.remove('is-open');
      setTimeout(() => {
        b.hidden = true;
      }, 200);
    }
  }, 220);
}

export function initModals() {
  document.querySelectorAll('[data-modal-open], [data-drawer-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const id = trigger.dataset.modalOpen || trigger.dataset.drawerOpen;
      openDialog(document.querySelector(id));
    });
  });

  document.querySelectorAll('[data-modal], [data-drawer]').forEach((dialog) => {
    dialog.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => closeDialog(dialog));
    });
  });

  backdrop().addEventListener('click', () => {
    document.querySelectorAll('[data-modal].is-open, [data-drawer].is-open').forEach(closeDialog);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-modal].is-open, [data-drawer].is-open').forEach(closeDialog);
    }
  });
}
