// =============================================================
// APIForge X — RTL test page script
// =============================================================

import { boot } from '../main.js';
import { renderLogs } from '../components/table.js';
import logs from '../data/mock-logs.json';

boot();

// Mixed-content table: LTR-isolated code columns inside an RTL page.
renderLogs(document.querySelector('#logs-demo'), logs, { limit: 8 });
