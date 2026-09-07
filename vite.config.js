import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

// Multi-page inputs — every top-level HTML page the template ships.
// Phase 1 ships the foundation pages; Phase 3A adds the app pages;
// Phase 3B adds the advanced developer pages.
const pageInputs = {
  main: path.resolve(__dirname, 'index.html'),
  'style-guide': path.resolve(__dirname, 'style-guide.html'),
  rtl: path.resolve(__dirname, 'rtl.html'),
  'rtl-test': path.resolve(__dirname, 'rtl-test.html'),
  dashboard: path.resolve(__dirname, 'dashboard.html'),
  apis: path.resolve(__dirname, 'apis.html'),
  'api-keys': path.resolve(__dirname, 'api-keys.html'),
  logs: path.resolve(__dirname, 'logs.html'),
  usage: path.resolve(__dirname, 'usage.html'),
  webhooks: path.resolve(__dirname, 'webhooks.html'),
  endpoints: path.resolve(__dirname, 'endpoints.html'),
  errors: path.resolve(__dirname, 'errors.html'),
  'rate-limits': path.resolve(__dirname, 'rate-limits.html'),
  environments: path.resolve(__dirname, 'environments.html'),
};

export default defineConfig({
  // Relative base so the built template can be dropped into any folder /
  // sub-directory hosting without rewriting asset URLs.
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Tokens & mixins are imported explicitly per partial via
        // `@use "@/scss/tokens/_index" as *;` (injecting them here via
        // additionalData would create a Sass module loop because the
        // token partials themselves would @use the index).
        // Bootstrap 5.3.8's legacy Sass triggers `color-functions` /
        // `import` deprecation warnings; silence them by ID.
        silenceDeprecations: ['color-functions', 'import', 'global-builtin', 'if-function'],
      },
    },
  },
  build: {
    rollupOptions: {
      input: pageInputs,
    },
  },
  server: {
    // Bind to all interfaces so the Arena live preview can reach the server.
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // The preview is served behind a reverse proxy under an arbitrary host;
    // allow any host so Vite does not reject proxied requests.
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
});
