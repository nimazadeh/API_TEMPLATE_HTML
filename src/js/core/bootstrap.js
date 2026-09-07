// =============================================================
// APIForge X — Bootstrap JS core
//
// Bootstrap 5.3 ships an ESM build with per-component data-API
// delegation. Importing a component here binds its data-APIs on the
// document (delegated), so the markup needs no per-instance wiring:
//   [data-bs-toggle="dropdown|modal|offcanvas|collapse|tab|tooltip"]
//   [data-bs-dismiss="modal|offcanvas|alert|toast"]
// Toast instances are created explicitly via Toast.getOrCreateInstance
// (see components/toast.js). Tooltips auto-initialize on hover/focus.
//
// Tree-shaken: only the imported components + their data-APIs ship.
// Requires @popperjs/core (declared in package.json) for dropdown and
// tooltip positioning.
// =============================================================

import { Dropdown, Modal, Offcanvas, Collapse, Tab, Toast, Tooltip } from 'bootstrap';

// Re-export for programmatic use elsewhere (charts drawers, log detail, …).
export { Dropdown, Modal, Offcanvas, Collapse, Tab, Toast, Tooltip };
