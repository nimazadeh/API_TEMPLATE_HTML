// Keep an already-open inspector in the selected language without losing its
// record, active tab or scroll position. Call after rendering its contents.
import { onLocaleChange } from '../core/i18n.js';
import { Tab } from '../core/bootstrap.js';

const views = new Map();

export function trackLocalizedView(root, render) {
  if (root) views.set(root, render);
}

onLocaleChange(() => {
  for (const [root, render] of views) {
    if (!root.isConnected) {
      views.delete(root);
      continue;
    }
    if (!root.classList.contains('show') && !root.classList.contains('showing')) continue;
    const activeTab = root.querySelector('[role="tab"][aria-selected="true"]')?.id;
    const body = root.querySelector('.offcanvas-body');
    const scrollTop = body?.scrollTop || 0;
    render();
    const tab = activeTab && document.getElementById(activeTab);
    if (tab) Tab.getOrCreateInstance(tab).show();
    if (body) body.scrollTop = scrollTop;
  }
});
