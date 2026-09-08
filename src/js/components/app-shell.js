// Shared responsive navigation. The content itself scrolls with the document.
import { Offcanvas } from '../core/bootstrap.js';
import { onLocaleChange } from '../core/i18n.js';

export function initAppShell() {
  const sidebar = document.querySelector('.app-sidebar');
  if (!sidebar) return;

  const drawer = document.getElementById('sidebar-drawer');
  const environment = sidebar.querySelector('[data-env-switcher]');
  // The compact mobile header has no room for the environment pill.
  // Reuse it in the drawer BEFORE initEnvSwitcher binds its controls.
  if (drawer && environment && !drawer.querySelector('[data-env-switcher]')) {
    const footer = document.createElement('div');
    footer.className = 'sidebar-foot';
    footer.append(environment.cloneNode(true));
    drawer.append(footer);
  }

  function labelNavigation() {
    sidebar.querySelectorAll('.nav-item').forEach((link) => {
      // Hidden labels in the tablet icon rail still need an accessible
      // name and a hover hint, including after a live language change.
      const label = link.textContent.trim();
      link.setAttribute('aria-label', label);
      link.setAttribute('title', label);
      if (link.classList.contains('is-active')) link.setAttribute('aria-current', 'page');
    });
  }
  labelNavigation();
  onLocaleChange(labelNavigation);

  // Match the shell's md breakpoint. Do not leave a mobile backdrop and
  // body scroll lock behind when rotating/resizing into desktop mode.
  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches && drawer) Offcanvas.getInstance(drawer)?.hide();
  });
}
