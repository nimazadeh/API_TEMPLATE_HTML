// =============================================================
// APIForge X — Mock data generator (deterministic, seeded)
// Produces /src/js/data/*.json so the template feels real without a
// backend. Run: node scripts/generate-mock-data.mjs
//
// Entities (Phase 3A): APIs, endpoints, keys, logs, usage,
// environments, plan, attribution, activity, metrics.
// =============================================================

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/js/data');

// --- Deterministic PRNG (mulberry32) so the dataset is reproducible ---
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260907);

const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
const base62 = (len) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(rand() * chars.length)];
  return out;
};
const isoDaysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString();
const isoHoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();

// Weighted pick
function weighted(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, w] of entries) {
    r -= w;
    if (r <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

// =====================================================================
// Endpoints — hand-authored for quality, ids assigned deterministically.
// =====================================================================
const endpointDefs = [
  {
    apiId: 'api_emails', method: 'POST', path: '/v1/emails',
    summary: 'Send an email', group: 'Emails',
    description: 'Queues a transactional email for delivery to one or more recipients. Delivery status is available via the returned email id.',
    params: [
      { name: 'to', type: 'string', location: 'body', required: true, description: 'Recipient email address.' },
      { name: 'subject', type: 'string', location: 'body', required: true, description: 'Subject line for the email.' },
      { name: 'html', type: 'string', location: 'body', required: false, description: 'HTML body. Either html or text is required.' },
      { name: 'from', type: 'string', location: 'body', required: false, description: 'Sender address. Defaults to your verified domain.' },
    ],
    responseExample: { id: 'eml_8Fk2mQx1Zw', status: 'queued', to: 'user@example.com' },
  },
  {
    apiId: 'api_emails', method: 'GET', path: '/v1/emails/{id}',
    summary: 'Retrieve an email', group: 'Emails',
    description: 'Returns the delivery status and metadata for a single email.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'The email id (eml_…).' },
    ],
    responseExample: { id: 'eml_8Fk2mQx1Zw', status: 'delivered', deliveredAt: '2026-09-07T19:05:24Z' },
  },
  {
    apiId: 'api_emails', method: 'GET', path: '/v1/emails',
    summary: 'List emails', group: 'Emails',
    description: 'Lists recently sent emails, newest first. Paginate with limit and before.',
    params: [
      { name: 'limit', type: 'integer', location: 'query', required: false, description: 'Max results to return (default 50, max 100).' },
      { name: 'before', type: 'string', location: 'query', required: false, description: 'Return emails sent before this id.' },
    ],
    responseExample: { data: [{ id: 'eml_8Fk2mQx1Zw', status: 'delivered' }], has_more: false },
  },
  {
    apiId: 'api_ai', method: 'POST', path: '/v1/completions',
    summary: 'Create a completion', group: 'AI',
    description: 'Runs a model inference and streams the completion back.',
    params: [
      { name: 'model', type: 'string', location: 'body', required: true, description: 'Model id, e.g. forge-1 or forge-1-turbo.' },
      { name: 'prompt', type: 'string', location: 'body', required: true, description: 'The prompt to complete.' },
      { name: 'max_tokens', type: 'integer', location: 'body', required: false, description: 'Maximum tokens to generate (default 256).' },
      { name: 'temperature', type: 'number', location: 'body', required: false, description: 'Sampling temperature between 0 and 1.' },
    ],
    responseExample: { id: 'cmpl_9xK2mQ', model: 'forge-1', choices: [{ text: 'Hello from Forge.' }] },
  },
  {
    apiId: 'api_ai', method: 'POST', path: '/v1/embeddings',
    summary: 'Create embeddings', group: 'AI',
    description: 'Converts input text into a vector embedding for search and clustering.',
    params: [
      { name: 'model', type: 'string', location: 'body', required: true, description: 'Embedding model id, e.g. embed-1.' },
      { name: 'input', type: 'array', location: 'body', required: true, description: 'Text to embed — a string or array of strings.' },
    ],
    responseExample: { object: 'list', data: [{ index: 0, embedding: [0.014, -0.021, 0.038] }] },
  },
  {
    apiId: 'api_ai', method: 'GET', path: '/v1/models',
    summary: 'List available models', group: 'AI',
    description: 'Lists the models available to your workspace with capabilities.',
    params: [],
    responseExample: { data: [{ id: 'forge-1', object: 'model' }, { id: 'embed-1', object: 'model' }] },
  },
  {
    apiId: 'api_audiences', method: 'POST', path: '/v1/audiences',
    summary: 'Create an audience', group: 'Audiences',
    description: 'Creates a new audience segment from a set of filters.',
    params: [
      { name: 'name', type: 'string', location: 'body', required: true, description: 'Audience name.' },
      { name: 'filters', type: 'array', location: 'body', required: false, description: 'Array of filter conditions.' },
    ],
    responseExample: { id: 'aud_9xK2mQ', name: 'Trial users', size: 0 },
  },
  {
    apiId: 'api_audiences', method: 'GET', path: '/v1/audiences/{id}',
    summary: 'Retrieve an audience', group: 'Audiences',
    description: 'Returns a single audience with its current member count.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'The audience id (aud_…).' },
    ],
    responseExample: { id: 'aud_9xK2mQ', name: 'Trial users', size: 12840 },
  },
  {
    apiId: 'api_audiences', method: 'GET', path: '/v1/audiences',
    summary: 'List audiences', group: 'Audiences',
    description: 'Lists all audiences in the workspace.',
    params: [
      { name: 'limit', type: 'integer', location: 'query', required: false, description: 'Max results (default 50).' },
    ],
    responseExample: { data: [{ id: 'aud_9xK2mQ', name: 'Trial users', size: 12840 }], has_more: false },
  },
  {
    apiId: 'api_webhooks', method: 'POST', path: '/v1/webhooks',
    summary: 'Create a webhook endpoint', group: 'Webhooks',
    description: 'Registers a URL to receive real-time events for your workspace.',
    params: [
      { name: 'url', type: 'string', location: 'body', required: true, description: 'HTTPS endpoint that will receive events.' },
      { name: 'events', type: 'array', location: 'body', required: true, description: 'Event types to subscribe to, e.g. email.sent.' },
      { name: 'secret', type: 'string', location: 'body', required: false, description: 'Signing secret to verify deliveries.' },
    ],
    responseExample: { id: 'wh_8f3k2ma1', url: 'https://example.com/hooks', enabled: true },
  },
  {
    apiId: 'api_webhooks', method: 'GET', path: '/v1/webhooks',
    summary: 'List webhooks', group: 'Webhooks',
    description: 'Lists registered webhook endpoints and their state.',
    params: [],
    responseExample: { data: [{ id: 'wh_8f3k2ma1', enabled: true }] },
  },
  {
    apiId: 'api_webhooks', method: 'DELETE', path: '/v1/webhooks/{id}',
    summary: 'Delete a webhook', group: 'Webhooks',
    description: 'Permanently deletes a webhook endpoint.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'The webhook id (wh_…).' },
    ],
    responseExample: { id: 'wh_8f3k2ma1', deleted: true },
  },
  {
    apiId: 'api_platform', method: 'PUT', path: '/v1/api-keys/{id}',
    summary: 'Update an API key', group: 'Platform',
    description: 'Renames a key or changes its scope grants.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'The key id (key_…).' },
      { name: 'name', type: 'string', location: 'body', required: false, description: 'New display name.' },
      { name: 'scopes', type: 'array', location: 'body', required: false, description: 'Replacement scope list.' },
    ],
    responseExample: { id: 'key_DElNoSR8', name: 'Production backend', updated: true },
  },
  {
    apiId: 'api_platform', method: 'DELETE', path: '/v1/api-keys/{id}',
    summary: 'Revoke an API key', group: 'Platform',
    description: 'Immediately revokes a key. Requests using it will return 401.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'The key id (key_…).' },
    ],
    responseExample: { id: 'key_DElNoSR8', revoked: true },
  },
  {
    apiId: 'api_platform', method: 'GET', path: '/v1/usage',
    summary: 'Retrieve usage summary', group: 'Platform',
    description: 'Returns current-billing-period usage, broken out by endpoint.',
    params: [
      { name: 'from', type: 'string', location: 'query', required: false, description: 'ISO date range start.' },
      { name: 'to', type: 'string', location: 'query', required: false, description: 'ISO date range end.' },
    ],
    responseExample: { requests: 5382400, period: { start: '2026-09-01', end: '2026-09-30' } },
  },
];
const endpoints = endpointDefs.map((e) => ({ ...e, id: `ep_${base62(6)}` }));

// =====================================================================
// APIs — catalog cards, counts derived from endpoints.
// =====================================================================
const apiMeta = {
  api_emails: { name: 'Emails API', status: 'stable', description: 'Send transactional email and track delivery status.', basePath: '/v1/emails' },
  api_ai: { name: 'AI Inference', status: 'stable', description: 'Run completions and embeddings on hosted models.', basePath: '/v1' },
  api_audiences: { name: 'Audiences', status: 'beta', description: 'Build and query audience segments.', basePath: '/v1/audiences' },
  api_webhooks: { name: 'Webhooks', status: 'stable', description: 'Receive real-time events for your workspace.', basePath: '/v1/webhooks' },
  api_platform: { name: 'Platform', status: 'stable', description: 'Manage keys and read usage across environments.', basePath: '/v1' },
};
const apis = Object.entries(apiMeta).map(([id, meta]) => ({
  id,
  ...meta,
  version: 'v1',
  endpointsCount: endpoints.filter((e) => e.apiId === id).length,
}));

// =====================================================================
// API keys (6) — env, permission, lastUsedIp.
// =====================================================================
const keyDefs = [
  { name: 'Production backend', env: 'live', permission: 'full', scopes: ['emails:read', 'emails:write', 'audiences:read', 'audiences:write'] },
  { name: 'CLI tool', env: 'live', permission: 'restricted', scopes: ['emails:read', 'emails:write'] },
  { name: 'Staging server', env: 'live', permission: 'restricted', scopes: ['audiences:read', 'audiences:write'] },
  { name: 'CI pipeline', env: 'live', permission: 'restricted', scopes: ['emails:read', 'emails:write'] },
  { name: 'Local dev', env: 'test', permission: 'full', scopes: ['emails:read', 'emails:write', 'audiences:read'] },
  { name: 'Analytics job', env: 'test', permission: 'restricted', scopes: ['usage:read'] },
];
const keys = keyDefs.map((k, i) => ({
  id: `key_${base62(8)}`,
  name: k.name,
  prefix: `${k.env === 'live' ? 'sk_live' : 'sk_test'}_${base62(8)}`,
  scopes: k.scopes,
  env: k.env,
  permission: k.permission,
  createdAt: isoDaysAgo(between(3, 320)),
  lastUsedAt: isoHoursAgo(between(1, 72)),
  lastUsedIp: `${between(20, 220)}.${between(0, 255)}.${between(0, 255)}.${between(1, 254)}`,
  status: i === 2 ? 'revoked' : 'active',
}));

// =====================================================================
// Logs (80) — env derived from key prefix.
// =====================================================================
const logStatus = [
  [200, 74], [201, 8], [400, 3], [401, 3], [403, 1], [404, 4], [429, 2], [500, 3], [502, 1], [503, 1],
];
const userAgents = [
  'node-fetch/3.3.2', 'axios/1.7.4', 'curl/8.5.0', 'python-requests/2.32.3',
  'guzzlehttp/7.8.1', 'rest-client/2.1.0', 'postman-runtime/7.39.0', 'af-sdk-node/1.4.0',
];
const logs = [];
let t = Date.now() - 4 * 60e3;
for (let i = 0; i < 80; i++) {
  const ep = pick(endpoints);
  const method = ep.method;
  const status = weighted(logStatus);
  const latency = status >= 500 ? between(900, 4200) : status === 429 ? between(600, 2000) : between(38, 1400);
  t -= between(20, 55) * 60e3;
  const env = pick(['live', 'live', 'live', 'test']);
  logs.push({
    id: `req_${base62(10)}`,
    method,
    path: ep.path.replace('{id}', between(1000, 99999).toString()),
    status,
    latencyMs: latency,
    keyPrefix: `sk_${env}_${base62(6)}`,
    env,
    timestamp: new Date(t).toISOString(),
    userAgent: pick(userAgents),
  });
}
logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// =====================================================================
// Usage (30 days) — requests, errors, p95 latency.
// =====================================================================
const usage = [];
let base = 142000;
let latencyBase = 205;
for (let i = 29; i >= 0; i--) {
  base = Math.max(60000, base + between(-14000, 18000));
  latencyBase = Math.max(140, Math.min(340, latencyBase + between(-18, 22)));
  usage.push({
    date: isoDaysAgo(i).slice(0, 10),
    requests: base,
    errors: between(120, 640),
    latencyMs: latencyBase,
  });
}

// =====================================================================
// Environments (2).
// =====================================================================
const environments = [
  {
    id: 'live',
    name: 'Live',
    baseUrl: 'https://api.apiforge.dev',
    description: 'Production traffic and real data.',
    created: isoDaysAgo(320),
    keysCount: keys.filter((k) => k.env === 'live').length,
    requestsShare: 94.8,
  },
  {
    id: 'test',
    name: 'Test',
    baseUrl: 'https://api.test.apiforge.dev',
    description: 'Isolated sandbox for staging and local development.',
    created: isoDaysAgo(210),
    keysCount: keys.filter((k) => k.env === 'test').length,
    requestsShare: 5.2,
  },
];

// =====================================================================
// Plan — limits and billing period.
// =====================================================================
const plan = {
  name: 'Scale',
  price: 99,
  currency: 'USD',
  requestsLimit: 10000000,
  requestsUsed: 5382400,
  rateLimitPerSecond: 250,
  periodStart: '2026-09-01',
  periodEnd: '2026-09-30',
  periodLabel: 'September 2026',
};

// =====================================================================
// Attribution — where usage comes from.
// =====================================================================
const byEndpoint = [
  { method: 'POST', path: '/v1/emails', requests: 1842011, errorRate: 0.4, p95: 214, share: 34.2 },
  { method: 'POST', path: '/v1/completions', requests: 1120800, errorRate: 0.8, p95: 341, share: 20.8 },
  { method: 'POST', path: '/v1/embeddings', requests: 861440, errorRate: 0.3, p95: 188, share: 16.0 },
  { method: 'GET', path: '/v1/models', requests: 549300, errorRate: 0.1, p95: 92, share: 10.2 },
  { method: 'POST', path: '/v1/audiences', requests: 421500, errorRate: 0.5, p95: 251, share: 7.8 },
  { method: 'GET', path: '/v1/emails/{id}', requests: 306780, errorRate: 0.2, p95: 110, share: 5.7 },
  { method: 'POST', path: '/v1/webhooks', requests: 158430, errorRate: 0.6, p95: 276, share: 2.9 },
  { method: 'GET', path: '/v1/usage', requests: 122139, errorRate: 0.0, p95: 84, share: 2.3 },
];
const attribution = {
  byEndpoint,
  byEnvironment: [
    { env: 'live', requests: 5102400, share: 94.8 },
    { env: 'test', requests: 280000, share: 5.2 },
  ],
};

// =====================================================================
// Activity feed (8 events).
// =====================================================================
const activity = [
  { id: 'act_1', type: 'key_created', title: 'API key created', detail: '“Analytics job” in Test environment', actor: 'Arash P.', timestamp: isoHoursAgo(2) },
  { id: 'act_2', type: 'webhook_failed', title: 'Webhook delivery failed', detail: 'https://example.com/hooks/email-events returned 500', actor: 'system', timestamp: isoHoursAgo(4) },
  { id: 'act_3', type: 'endpoint_updated', title: 'Endpoint updated', detail: 'POST /v1/emails — added `from` parameter', actor: 'Sara R.', timestamp: isoHoursAgo(7) },
  { id: 'act_4', type: 'key_revoked', title: 'API key revoked', detail: '“Staging server” (sk_live_59TB…)', actor: 'Arash P.', timestamp: isoHoursAgo(11) },
  { id: 'act_5', type: 'rate_limit', title: 'Rate limit reached', detail: 'POST /v1/completions hit 250 req/s for 4s', actor: 'system', timestamp: isoHoursAgo(16) },
  { id: 'act_6', type: 'deploy', title: 'Workspace updated', detail: 'Emails API v1.4.0 rolled out', actor: 'system', timestamp: isoHoursAgo(21) },
  { id: 'act_7', type: 'key_created', title: 'API key created', detail: '“CI pipeline” in Live environment', actor: 'Sara R.', timestamp: isoHoursAgo(30) },
  { id: 'act_8', type: 'webhook_failed', title: 'Webhook delivery failed', detail: 'usage-alerts endpoint disabled after 6 failures', actor: 'system', timestamp: isoHoursAgo(38) },
];

// =====================================================================
// Metrics — dashboard KPIs per range + 24h hourly series.
// =====================================================================
const metrics = {
  kpis: {
    '24h': { requests: 842109, requestsDelta: 12.4, successRate: 99.42, successDelta: 0.12, latencyMs: 184, latencyDelta: -8.2, usagePct: 42.1 },
    '7d': { requests: 5120930, requestsDelta: 9.1, successRate: 99.31, successDelta: -0.21, latencyMs: 197, latencyDelta: -3.4, usagePct: 42.1 },
    '30d': { requests: 5382400, requestsDelta: 18.7, successRate: 99.25, successDelta: 0.31, latencyMs: 206, latencyDelta: 2.1, usagePct: 42.1 },
  },
  hourly: Array.from({ length: 24 }, (_, h) => {
    const wave = Math.round(12000 + 8000 * Math.sin((h / 24) * Math.PI * 2) + between(-1500, 2500));
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      requests: Math.max(4000, wave),
      latencyMs: Math.max(120, 185 + between(-40, 70)),
      errors: between(8, 90),
    };
  }),
};

// =====================================================================
// Write everything.
// =====================================================================
mkdirSync(OUT_DIR, { recursive: true });
const write = (name, data) =>
  writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2) + '\n', 'utf8');

write('mock-apis.json', apis);
write('mock-endpoints.json', endpoints);
write('mock-keys.json', keys);
write('mock-logs.json', logs);
write('mock-usage.json', usage);
write('mock-environments.json', environments);
write('mock-plan.json', plan);
write('mock-attribution.json', attribution);
write('mock-activity.json', activity);
write('mock-metrics.json', metrics);

console.log(`Generated mock data into ${OUT_DIR}`);
console.log(`  apis: ${apis.length}, endpoints: ${endpoints.length}, keys: ${keys.length}, logs: ${logs.length}`);
console.log(`  usage: ${usage.length} days, environments: ${environments.length}, activity: ${activity.length}`);
