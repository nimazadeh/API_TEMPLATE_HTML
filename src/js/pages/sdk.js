// =============================================================
// APIForge X — SDK catalog
// Official clients (JS/Node/Python/PHP/Go/Ruby) with install
// commands, quick-usage tabs, feature lists and copy actions.
// Technical content stays LTR.
// =============================================================

import { boot } from '../main.js';
import { createIcons, icons } from '../components/icons.js';
import { initCodeBlock } from '../components/code-block.js';
import { copyText, flashCopied } from '../components/copy.js';
import { escapeHtml, formatDate } from '../utils/format.js';
import sdks from '../data/mock-sdks.json';

boot();

const USAGE = {
  js: `import { ApiForge } from '@apiforge/sdk';

const api = new ApiForge('YOUR_API_KEY');
const email = await api.emails.send({ to: 'user@example.com', subject: 'Welcome' });`,
  node: `import { ApiForge } from 'apiforge';

const api = new ApiForge('YOUR_API_KEY');
await api.request('GET', '/v1/models');`,
  python: `import apiforge

client = apiforge.Client("YOUR_API_KEY")
resp = client.emails.send(to="user@example.com", subject="Welcome")
print(resp.id)`,
  php: `use ApiForge\\Client;

$client = new Client('YOUR_API_KEY');
$email = $client->emails->send(['to' => 'user@example.com', 'subject' => 'Welcome']);`,
  go: `package main

import "github.com/apiforge/apiforge-go"

func main() {
    c := apiforge.New("YOUR_API_KEY")
    _ = c.Emails.Send(apiforge.Email{To: "user@example.com"})
}`,
  ruby: `require "apiforge"

client = ApiForge::Client.new("YOUR_API_KEY")
email = client.emails.send(to: "user@example.com", subject: "Welcome")`,
};

function sdkCard(sdk) {
  return `
    <article class="card sdk-card d-flex flex-column" data-sdk="${sdk.id}">
      <div class="d-flex align-items-center gap-3 mb-3">
        <span class="sdk-mark sdk-mark--${sdk.accent}">${escapeHtml(sdk.lang)}</span>
        <div class="min-w-0">
          <h4 class="mb-0">${escapeHtml(sdk.name)}</h4>
          <div class="caption text-tertiary ltr-isolate">${escapeHtml(sdk.package)} · v${escapeHtml(sdk.version)}</div>
        </div>
      </div>
      <p class="text-secondary mb-3">${escapeHtml(sdk.registry)} · Updated ${formatDate(sdk.updated)}</p>
      <div class="install-row d-flex align-items-center gap-2 mb-3">
        <code class="ltr-isolate mono-sm text-body text-truncate flex-grow-1">${escapeHtml(sdk.install)}</code>
        <button type="button" class="btn btn-icon btn-icon--sm" data-copy="${escapeHtml(sdk.install)}" aria-label="Copy install command"><i data-lucide="copy"></i></button>
      </div>
      <ul class="list-unstyled d-flex flex-column gap-1 mb-4">
        ${sdk.features.map((f) => `<li class="caption text-secondary d-flex align-items-center gap-2"><i data-lucide="check" class="text-accent" style="width:13px;height:13px"></i> ${escapeHtml(f)}</li>`).join('')}
      </ul>
      <div class="mt-auto">
        <div class="code-block code-block--flush mb-3" data-code-block>
          <div class="code-block__header">
            <span class="code-block__lang"><i data-lucide="terminal"></i> Quick start</span>
            <div class="code-block__actions"><button type="button" class="btn btn-icon btn-icon--sm" data-code-copy aria-label="Copy example"><i data-lucide="copy"></i></button></div>
          </div>
          <pre class="code-block__body" data-code-pane><code>${escapeHtml(USAGE[sdk.id] || '')}</code></pre>
        </div>
        <a class="btn btn-ghost btn-sm w-100" href="${sdk.docsUrl}">Documentation <i data-lucide="arrow-up-right"></i></a>
      </div>
    </article>`;
}

function render(filter = '') {
  const q = filter.trim().toLowerCase();
  const list = sdks.filter((s) => !q || [s.name, s.package, s.lang, s.registry].some((f) => f.toLowerCase().includes(q)));
  const wrap = document.getElementById('sdk-grid');
  wrap.innerHTML = list.length
    ? list.map(sdkCard).join('')
    : `<div class="col-12"><div class="empty-state"><span class="empty-icon"><i data-lucide="package"></i></span><h4 class="empty-title">No SDKs match</h4><p class="empty-desc mb-0">Try a different language or package name.</p></div></div>`;

  wrap.querySelectorAll('[data-code-block]').forEach(initCodeBlock);
  wrap.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => flashCopied(btn, await copyText(btn.dataset.copy || '')));
  });
  createIcons({ icons });
}

render();

document.getElementById('sdk-search').addEventListener('input', (e) => render(e.target.value));
