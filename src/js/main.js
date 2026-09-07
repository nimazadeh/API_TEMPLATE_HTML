// =============================================================
// APIForge X — Application entry
// Imports styles + fonts, exposes boot() which wires all global
// components. Each page script calls boot() once (module scripts are
// deferred, so the DOM is ready).
// =============================================================

import '../scss/main.scss';

import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/vazirmatn/300.css';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/700.css';

import { initIcons } from './components/icons.js';
import { initTheme } from './components/theme.js';
import { initEnvSwitcher } from './components/env-switcher.js';
import { initCommandPalette } from './components/command-palette.js';
import { initCodeBlocks } from './components/code-block.js';
import { initCopy } from './components/copy.js';
import { initDropdowns } from './components/dropdown.js';
import { initTooltips } from './components/tooltip.js';
import { initModals } from './components/modal.js';
import { initToast } from './components/toast.js';
import { initReveal } from './components/reveal.js';

export function boot() {
  initIcons();
  initTheme();
  initEnvSwitcher();
  initCommandPalette();
  initCodeBlocks();
  initCopy();
  initDropdowns();
  initTooltips();
  initModals();
  initToast();
  initReveal();
}
