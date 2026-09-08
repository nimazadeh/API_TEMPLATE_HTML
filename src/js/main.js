// =============================================================
// APIForge X — Application entry
// Imports styles (SCSS, fonts) and exposes boot(), which wires all
// global behavior. Each page script calls boot() once — module scripts
// are deferred, so the DOM is ready. Bootstrap's data-APIs are bound
// by importing ./core/bootstrap.js (see that file).
// =============================================================

import '../scss/main.scss';

import { initIcons } from './components/icons.js';
import { initTheme } from './components/theme.js';
import { initEnvSwitcher } from './components/env-switcher.js';
import { initCommandPalette } from './components/command-palette.js';
import { initCodeBlocks } from './components/code-block.js';
import { initCopy } from './components/copy.js';
import { initToast } from './components/toast.js';
import { initReveal } from './components/reveal.js';
import { initShortcuts } from './components/shortcuts.js';
import './core/bootstrap.js';

export function boot() {
  initIcons();
  initTheme();
  initEnvSwitcher();
  initCommandPalette();
  initCodeBlocks();
  initCopy();
  initToast();
  initReveal();
  initShortcuts();
}
