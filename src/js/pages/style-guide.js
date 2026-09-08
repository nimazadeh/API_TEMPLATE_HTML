// =============================================================
// APIForge X — Style Guide page script
// =============================================================

import { boot } from '../main.js';
import { renderLogs } from '../components/table.js';
import { afxToast } from '../components/toast.js';
import logs from '../data/mock-logs.json';

boot();

// Hero table: render 8 of 50 mock requests.
renderLogs(document.querySelector('#logs-demo'), logs, { limit: 8 });

// Toast demo.
document.querySelector('#sg-toast')?.addEventListener('click', () => {
  afxToast({
    message: 'API key revoked',
    type: 'success',
    action: { label: 'Undo', onClick: () => console.log('undo revoke') },
  });
});
