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
// Phase 3B helpers — a SEPARATE seeded PRNG so the Phase 3A datasets
// (keys, logs, usage, metrics, …) stay byte-identical while new
// entities (webhooks, deliveries, errors, rate limits, variables)
// remain fully deterministic. Same seed + offset = reproducible.
// =====================================================================
const randB = mulberry32(20260907 ^ 0x3b3b1a);
const pickB = (arr) => arr[Math.floor(randB() * arr.length)];
const betweenB = (min, max) => min + Math.floor(randB() * (max - min + 1));
const base62B = (len) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(randB() * chars.length)];
  return out;
};
const hexB = (len) => {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(randB() * chars.length)];
  return out;
};
const isoDaysAgoB = (d) => new Date(Date.now() - d * 864e5).toISOString();
const isoHoursAgoB = (h) => new Date(Date.now() - h * 3600e3).toISOString();
const isoMinutesAgoB = (m) => new Date(Date.now() - m * 60e3).toISOString();
function weightedB(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = randB() * total;
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
const liveTestKeys = keyDefs.map((k, i) => ({
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

// Staging keys (Phase 3B) — third environment, non-production prefixes.
const stagingKeys = [
  { name: 'Staging server', permission: 'restricted', scopes: ['emails:read', 'emails:write', 'audiences:read'] },
  { name: 'Preview deploy', permission: 'restricted', scopes: ['audiences:read'] },
].map((k) => ({
  id: `key_${base62B(8)}`,
  name: k.name,
  prefix: `sk_test_${base62B(8)}`,
  scopes: k.scopes,
  env: 'staging',
  permission: k.permission,
  createdAt: isoDaysAgoB(betweenB(10, 180)),
  lastUsedAt: isoHoursAgoB(betweenB(1, 96)),
  lastUsedIp: `${betweenB(20, 220)}.${betweenB(0, 255)}.${betweenB(0, 255)}.${betweenB(1, 254)}`,
  status: 'active',
}));
const keys = [...liveTestKeys, ...stagingKeys];

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
    name: 'Production',
    baseUrl: 'https://api.apiforge.dev',
    description: 'Production traffic and real data.',
    created: isoDaysAgo(320),
    keysCount: keys.filter((k) => k.env === 'live').length,
    requestsShare: 94.8,
  },
  {
    id: 'staging',
    name: 'Staging',
    baseUrl: 'https://api.staging.apiforge.dev',
    description: 'Pre-release validation before Production.',
    created: isoDaysAgo(180),
    keysCount: keys.filter((k) => k.env === 'staging').length,
    requestsShare: 0,
  },
  {
    id: 'test',
    name: 'Development',
    baseUrl: 'https://api.test.apiforge.dev',
    description: 'Isolated sandbox for local development.',
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
// Webhooks (Phase 3B) — registered endpoints per environment.
// =====================================================================
const webhookHosts = [
  'hooks.acme.dev', 'integrations.shopflow.io', 'api.mercuryhq.com',
  'events.pulse.run', 'backend.yourco.dev', 'sink.local.test',
];
const webhookDefs = [
  { slug: 'email-events', description: 'Email delivery events', events: ['email.sent', 'email.delivered', 'email.bounced'], environment: 'live', status: 'enabled' },
  { slug: 'audience-sync', description: 'Audience sync events', events: ['audience.created', 'audience.updated', 'audience.deleted'], environment: 'live', status: 'enabled' },
  { slug: 'usage-alerts', description: 'Usage threshold alerts', events: ['usage.warning', 'usage.limit_reached'], environment: 'live', status: 'disabled' },
  { slug: 'completion-stream', description: 'Model completion stream', events: ['completion.created', 'completion.failed'], environment: 'live', status: 'enabled' },
  { slug: 'staging-email', description: 'Staging email events', events: ['email.sent', 'email.bounced'], environment: 'staging', status: 'enabled' },
  { slug: 'dev-sink', description: 'Local development sink', events: ['email.delivered'], environment: 'test', status: 'enabled' },
];
const webhooks = webhookDefs.map((w, i) => ({
  id: `wh_${base62B(8)}`,
  url: `https://${webhookHosts[i % webhookHosts.length]}/hooks/${w.slug}`,
  ...w,
  signingSecret: `whsec_${base62B(24)}`,
  createdAt: isoDaysAgoB(betweenB(20, 300)),
}));

// =====================================================================
// Webhook deliveries (Phase 3B) — the debugger's source of truth.
// Each delivery carries a full attempt timeline + payload/headers/
// response/signature so the detail drawer is 100% data-driven.
// =====================================================================
const eventPayloads = {
  'email.sent': () => ({ id: `eml_${base62B(10)}`, to: pickB(['user@example.com', 'ceo@acme.dev', 'jane@yourco.io']), subject: pickB(['Welcome to Acme', 'Your receipt', 'Password reset']), from: 'team@yourco.dev' }),
  'email.delivered': () => ({ id: `eml_${base62B(10)}`, status: 'delivered', recipient: pickB(['user@example.com', 'ops@acme.dev']), deliveredAt: isoMinutesAgoB(betweenB(1, 60)) }),
  'email.bounced': () => ({ id: `eml_${base62B(10)}`, status: 'bounced', recipient: pickB(['noreply@acme.dev', 'old@yourco.io']), reason: pickB(['mailbox_full', 'address_not_found', 'blocked']), code: 550 }),
  'audience.created': () => ({ id: `aud_${base62B(8)}`, name: pickB(['Trial users', 'Enterprise leads', 'Churned accounts']), size: betweenB(100, 50000) }),
  'audience.updated': () => ({ id: `aud_${base62B(8)}`, name: pickB(['Trial users', 'VIP customers']), size: betweenB(100, 50000), changed: ['filters'] }),
  'audience.deleted': () => ({ id: `aud_${base62B(8)}`, name: pickB(['Legacy segment']), deletedAt: isoMinutesAgoB(betweenB(1, 120)) }),
  'usage.warning': () => ({ metric: 'requests', threshold: 80, current: betweenB(81, 95), window: 'day' }),
  'usage.limit_reached': () => ({ metric: 'requests', limit: 500000, window: 'day', reachedAt: isoMinutesAgoB(betweenB(1, 180)) }),
  'completion.created': () => ({ id: `cmpl_${base62B(8)}`, model: pickB(['forge-1', 'forge-1-turbo']), status: 'succeeded', tokens: betweenB(200, 4000) }),
  'completion.failed': () => ({ id: `cmpl_${base62B(8)}`, model: pickB(['forge-1', 'forge-1-turbo']), status: 'failed', error: 'context_length_exceeded' }),
};
const deliveryResponseBodies = {
  200: { ok: true },
  500: { error: { code: 'internal_error', message: 'Something went wrong on the receiver side.' } },
  502: { error: { code: 'bad_gateway', message: 'Upstream proxy returned an invalid response.' } },
  503: { error: { code: 'service_unavailable', message: 'Receiver temporarily overloaded.' } },
};

function deliveryTimeline(createdAt, status, attempts, latencyMs) {
  const tl = [];
  let t = new Date(createdAt).getTime();
  const push = (state, code, afterMs, lat) => {
    t += afterMs;
    tl.push({ at: new Date(t).toISOString(), state, code, latencyMs: lat });
  };
  tl.push({ at: new Date(t).toISOString(), state: 'created', code: null, latencyMs: null });
  push('sent', null, betweenB(20, 90), null);
  const failedCount = status === 'delivered' ? Math.max(0, attempts - 1) : attempts;
  const per = Math.max(80, Math.round(latencyMs / Math.max(1, attempts)));
  for (let i = 0; i < failedCount; i++) {
    push('failed', pickB([500, 502, 503]), per, per);
    push('retrying', null, betweenB(45, 180) * 1000, null);
  }
  if (status === 'delivered') push('delivered', 200, per, per);
  else if (status === 'retrying') push('retrying', null, betweenB(45, 180) * 1000, null);
  return tl;
}

// Intentionally-authored failure plan so the demo tells a coherent story:
// two fully-healthy endpoints, one with a single recent failure, one
// degraded, and one disabled after repeated failures.
const webhookFailurePlan = {
  'usage-alerts': { disabled: true },
  'completion-stream': { fail: 1, retry: 1 },
  'audience-sync': { fail: 1 },
  'email-events': {},
  'staging-email': {},
  'dev-sink': {},
};
const webhookDeliveries = [];
for (const wh of webhooks) {
  const plan = webhookFailurePlan[wh.slug] || {};
  const count = plan.disabled ? 3 : wh.environment === 'test' ? 3 : 5;
  for (let i = 0; i < count; i++) {
    const event = pickB(wh.events);
    let status;
    if (plan.disabled) status = 'failed';
    else if (i < (plan.fail || 0)) status = 'failed';
    else if (i < (plan.fail || 0) + (plan.retry || 0)) status = 'retrying';
    else status = 'delivered';
    const attempts = status === 'delivered' ? weightedB([[1, 70], [2, 30]]) : status === 'retrying' ? betweenB(1, 5) : betweenB(1, 6);
    const latencyMs = status === 'delivered' ? betweenB(180, 900) : betweenB(1200, 6000);
    const responseCode = status === 'delivered' ? 200 : status === 'failed' ? pickB([500, 502, 503]) : null;
    const createdAt = isoMinutesAgoB(betweenB(1, 1440));
    const id = `wd_${base62B(10)}`;
    webhookDeliveries.push({
      id,
      webhookId: wh.id,
      endpoint: wh.url,
      event,
      environment: wh.environment,
      status,
      attempts,
      latencyMs,
      responseCode,
      createdAt,
      payload: eventPayloads[event](),
      headers: [
        ['Content-Type', 'application/json'],
        ['User-Agent', 'APIForge-Webhooks/1.0'],
        ['X-APIForge-Event', event],
        ['X-APIForge-Delivery', id],
        ['X-APIForge-Webhook', wh.id],
      ],
      response: status === 'delivered' ? { status: 200, body: deliveryResponseBodies[200] } : status === 'failed' ? { status: responseCode, body: deliveryResponseBodies[responseCode] } : null,
      signature: `t=${Math.floor(Date.now() / 1000)},sha256=${hexB(64)}`,
      timeline: deliveryTimeline(createdAt, status, attempts, latencyMs),
    });
  }
}
webhookDeliveries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// Attach derived webhook health (success rate / last delivery) for the list.
for (const wh of webhooks) {
  const ds = webhookDeliveries.filter((d) => d.webhookId === wh.id);
  const delivered = ds.filter((d) => d.status === 'delivered').length;
  wh.successRate = ds.length ? Math.round((delivered / ds.length) * 1000) / 10 : null;
  wh.lastDeliveryAt = ds.length ? ds[0].createdAt : null;
  wh.failures24h = ds.filter((d) => d.status !== 'delivered').length;
}

// =====================================================================
// Errors (Phase 3B) — Sentry-style issue records + stack traces.
// =====================================================================
const errorFramePool = [
  { file: 'src/http/client.ts', fns: ['request', 'parseResponse'], inApp: true },
  { file: 'src/email/provider.ts', fns: ['sendViaProvider', 'handleDelivery'], inApp: true },
  { file: 'src/audiences/segment.ts', fns: ['applyFilters', 'hydrateAudience'], inApp: true },
  { file: 'src/ai/inference.ts', fns: ['runCompletion', 'streamResponse'], inApp: true },
  { file: 'src/db/redis.ts', fns: ['get', 'cacheGet'], inApp: true },
  { file: 'src/platform/usage.ts', fns: ['readUsage', 'aggregate'], inApp: true },
  { file: 'node_modules/express/lib/router/index.js', fns: ['handle', 'next'], inApp: false },
  { file: 'node_modules/axios/lib/adapters/http.js', fns: ['dispatchRequest'], inApp: false },
  { file: 'node_modules/ioredis/built/connectors/StandaloneConnector.js', fns: ['connect'], inApp: false },
  { file: 'node:internal/process/task_queues', fns: ['processTicksAndRejections'], inApp: false },
];
const errorDefs = [
  { type: 'TypeError', message: "Cannot read properties of undefined (reading 'id')", method: 'POST', path: '/v1/emails', env: 'live', severity: 'error', occurrences: 12840, status: 'unresolved', assignee: 'Arash P.', frame: { file: 'src/email/send.ts', fn: 'dispatchEmail', line: 142, col: 9, code: 'const user = await users.get(payload.recipientId);' } },
  { type: 'RangeError', message: 'Invalid array length', method: 'POST', path: '/v1/audiences', env: 'live', severity: 'error', occurrences: 8230, status: 'unresolved', assignee: null, frame: { file: 'src/audiences/segment.ts', fn: 'applyFilters', line: 88, col: 21, code: 'const slice = new Array(filter.limit);' } },
  { type: 'SyntaxError', message: "Unexpected token '<' in JSON at position 0", method: 'POST', path: '/v1/completions', env: 'live', severity: 'error', occurrences: 5121, status: 'resolved', assignee: 'Sara R.', frame: { file: 'src/ai/inference.ts', fn: 'parseJson', line: 54, col: 11, code: 'return JSON.parse(raw.trim());' } },
  { type: 'ReferenceError', message: 'handler is not defined', method: 'POST', path: '/v1/emails', env: 'live', severity: 'error', occurrences: 3402, status: 'resolved', assignee: 'Arash P.', frame: { file: 'src/email/routes.ts', fn: 'onEmailSent', line: 39, col: 5, code: 'return handler(event);' } },
  { type: 'ValidationError', message: "Missing required field: 'to'", method: 'POST', path: '/v1/emails', env: 'live', severity: 'warning', occurrences: 15840, status: 'unresolved', assignee: null, frame: { file: 'src/email/schema.ts', fn: 'validateEmail', line: 23, col: 12, code: "throw new ValidationError(\"Missing required field: 'to'\");" } },
  { type: 'RateLimitError', message: '429 Too Many Requests — retry after 2s', method: 'POST', path: '/v1/completions', env: 'live', severity: 'warning', occurrences: 9230, status: 'unresolved', assignee: null, frame: { file: 'src/ai/gateway.ts', fn: 'checkQuota', line: 117, col: 7, code: 'throw new RateLimitError(resetIn);' } },
  { type: 'ETIMEDOUT', message: 'connect ETIMEDOUT 10.0.4.21:6379', method: 'GET', path: '/v1/models', env: 'live', severity: 'error', occurrences: 2170, status: 'resolved', assignee: 'Sara R.', frame: { file: 'src/db/redis.ts', fn: 'cacheGet', line: 71, col: 16, code: 'await client.get(key);' } },
  { type: 'ECONNREFUSED', message: 'connect ECONNREFUSED 10.0.2.15:5432', method: 'GET', path: '/v1/usage', env: 'staging', severity: 'error', occurrences: 980, status: 'unresolved', assignee: null, frame: { file: 'src/db/pg.ts', fn: 'connect', line: 46, col: 13, code: 'await pool.connect();' } },
  { type: 'TypeError', message: "Cannot read properties of null (reading 'match')", method: 'GET', path: '/v1/emails/{id}', env: 'live', severity: 'warning', occurrences: 6540, status: 'resolved', assignee: 'Arash P.', frame: { file: 'src/email/parse.ts', fn: 'extractMeta', line: 28, col: 8, code: "return value.match(META_RE);" } },
  { type: 'ZodError', message: 'Invalid input: expected string, received number', method: 'POST', path: '/v1/embeddings', env: 'test', severity: 'warning', occurrences: 1890, status: 'unresolved', assignee: null, frame: { file: 'src/ai/embeddings.ts', fn: 'validateInput', line: 64, col: 17, code: 'const parsed = schema.parse(input);' } },
  { type: 'RangeError', message: 'Maximum call stack size exceeded', method: 'POST', path: '/v1/audiences/{id}', env: 'live', severity: 'error', occurrences: 402, status: 'unresolved', assignee: null, frame: { file: 'src/audiences/tree.ts', fn: 'walk', line: 112, col: 3, code: 'return walk(node.children);' } },
  { type: 'AbortError', message: 'The operation was aborted due to timeout', method: 'POST', path: '/v1/completions', env: 'staging', severity: 'warning', occurrences: 1330, status: 'resolved', assignee: 'Sara R.', frame: { file: 'src/http/client.ts', fn: 'request', line: 93, col: 9, code: 'const res = await fetch(url, { signal });' } },
];
const userAgentsB = ['af-sdk-node/1.4.0', 'af-sdk-python/0.9.2', 'af-sdk-go/1.1.0', 'curl/8.5.0'];
const errorTail = () => {
  const frames = [];
  const used = new Set();
  while (frames.length < 5) {
    const lib = pickB(errorFramePool);
    if (used.has(lib.file)) continue;
    used.add(lib.file);
    frames.push({ file: lib.file, fn: pickB(lib.fns), line: betweenB(12, 420), col: betweenB(1, 60), code: null, inApp: lib.inApp });
  }
  return frames;
};
const errors = errorDefs.map((e, i) => ({
  id: `err_${base62B(10)}`,
  type: e.type,
  message: e.message,
  severity: e.severity,
  status: e.status,
  assignee: e.assignee,
  endpoint: { method: e.method, path: e.path },
  environment: e.env,
  occurrences: e.occurrences,
  firstSeen: isoDaysAgoB(betweenB(2, 40)),
  lastSeen: isoMinutesAgoB(betweenB(3, 1200)),
  resolvedAt: e.status === 'resolved' ? isoDaysAgoB(betweenB(1, 10)) : null,
  request: {
    id: `req_${base62B(10)}`,
    url: `https://api${e.env === 'live' ? '' : e.env === 'staging' ? '.staging' : '.test'}.apiforge.dev${e.path.replace('{id}', String(betweenB(1000, 99999)))}`,
    method: e.method,
    keyPrefix: `${e.env === 'live' ? 'sk_live' : 'sk_test'}_${base62B(6)}`,
    userAgent: pickB(userAgentsB),
    ip: `${betweenB(20, 220)}.${betweenB(0, 255)}.${betweenB(0, 255)}.${betweenB(1, 254)}`,
  },
  user: { id: `usr_${base62B(8)}`, email: pickB(['arash@apiforge.dev', 'sara@yourco.io', 'dev@acme.dev']), plan: pickB(['Scale', 'Growth', 'Free']) },
  stackTrace: [{ ...e.frame, inApp: true }, ...errorTail()],
}));

// =====================================================================
// Rate limits (Phase 3B) — current usage + rules + 14-day history.
// =====================================================================
const rateLimits = {
  current: {
    perMinute: { limit: 15000, used: 12840, label: 'Requests / minute', resetIn: '6s' },
    perDay: { limit: 500000, used: 431200, label: 'Requests / day', resetIn: '4h 12m' },
    monthly: { limit: 10000000, used: 5382400, label: 'Monthly quota', resetIn: '23 days', periodLabel: 'September 2026' },
  },
  history: Array.from({ length: 14 }, (_, i) => {
    const used = betweenB(380000, 490000);
    return { date: isoDaysAgoB(13 - i).slice(0, 10), used, limit: 500000 };
  }),
  rules: [
    { id: 'rl_emails', api: 'Emails API', name: 'emails:write', limit: 50, window: 'per second', current: 31, status: 'ok' },
    { id: 'rl_completions', api: 'AI Inference', name: 'completions:create', limit: 25, window: 'per second', current: 24, status: 'warning' },
    { id: 'rl_embeddings', api: 'AI Inference', name: 'embeddings:create', limit: 40, window: 'per second', current: 42, status: 'breached' },
    { id: 'rl_audiences', api: 'Audiences', name: 'audiences:write', limit: 10, window: 'per second', current: 4, status: 'ok' },
    { id: 'rl_webhooks', api: 'Webhooks', name: 'deliveries', limit: 100, window: 'per minute', current: 62, status: 'ok' },
    { id: 'rl_global', api: 'Platform', name: 'global', limit: 250, window: 'per second', current: 208, status: 'warning' },
  ],
};

// =====================================================================
// Variables (Phase 3B) — per-environment secrets & plain values.
// =====================================================================
const variableDefs = [
  { environment: 'live', name: 'DATABASE_URL', value: 'postgres://apiforge:8xK2mQp4@db.apiforge.dev:5432/prod', secret: true },
  { environment: 'live', name: 'REDIS_URL', value: 'rediss://default:r7Xp2mK9@redis.apiforge.dev:6379', secret: true },
  { environment: 'live', name: 'WEBHOOK_SIGNING_SECRET', value: 'whsec_live_8f3k2ma1q7x9B4dL2nP', secret: true },
  { environment: 'live', name: 'OPENAI_API_KEY', value: 'sk-proj-9xK2mQp4r7Xv1L8nB3dF6', secret: true },
  { environment: 'live', name: 'LOG_LEVEL', value: 'info', secret: false },
  { environment: 'live', name: 'FEATURE_FLAGS', value: '{"billing_v2":true,"async_email":false}', secret: false },
  { environment: 'staging', name: 'DATABASE_URL', value: 'postgres://apiforge:9bQx7Kp2@db.staging.apiforge.dev:5432/staging', secret: true },
  { environment: 'staging', name: 'REDIS_URL', value: 'redis://redis.staging.apiforge.dev:6379', secret: true },
  { environment: 'staging', name: 'WEBHOOK_SIGNING_SECRET', value: 'whsec_stag_2mQp4r7Xv1L8nB3d', secret: true },
  { environment: 'staging', name: 'LOG_LEVEL', value: 'debug', secret: false },
  { environment: 'test', name: 'DATABASE_URL', value: 'postgres://localhost:5432/apiforge_dev', secret: true },
  { environment: 'test', name: 'REDIS_URL', value: 'redis://localhost:6379', secret: true },
  { environment: 'test', name: 'WEBHOOK_SIGNING_SECRET', value: 'whsec_test_7Xv1L8nB3dF6mQp4', secret: true },
  { environment: 'test', name: 'OPENAI_API_KEY', value: 'sk-proj-4r7Xv1L8nB3dF6mQp', secret: true },
  { environment: 'test', name: 'LOG_LEVEL', value: 'debug', secret: false },
  { environment: 'test', name: 'PORT', value: '4000', secret: false },
];
const variables = variableDefs.map((v) => ({
  id: `var_${base62B(8)}`,
  ...v,
  updatedAt: isoDaysAgoB(betweenB(0, 60)),
  addedBy: pickB(['Arash P.', 'Sara R.', 'system']),
}));

// =====================================================================
// Phase 3C helpers — another SEPARATE seeded PRNG so Phase 3A/3B
// datasets stay byte-identical while new entities (team, plans,
// invoices, notifications, SDKs, observability) remain deterministic.
// =====================================================================
const randC = mulberry32(20260907 ^ 0xc3c3c3);
const pickC = (arr) => arr[Math.floor(randC() * arr.length)];
const betweenC = (min, max) => min + Math.floor(randC() * (max - min + 1));
const base62C = (len) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(randC() * chars.length)];
  return out;
};
const isoDaysAgoC = (d) => new Date(Date.now() - d * 864e5).toISOString();
const isoHoursAgoC = (h) => new Date(Date.now() - h * 3600e3).toISOString();
const isoMinutesAgoC = (m) => new Date(Date.now() - m * 60e3).toISOString();

// =====================================================================
// Team (Phase 3C) — members + pending invitations.
// =====================================================================
const teamMemberDefs = [
  { name: 'Arash Pashaei', email: 'arash@apiforge.dev', role: 'Owner', status: 'active' },
  { name: 'Sara Rahimi', email: 'sara@apiforge.dev', role: 'Admin', status: 'active' },
  { name: 'Mehdi Karimi', email: 'mehdi@apiforge.dev', role: 'Developer', status: 'active' },
  { name: 'Niloofar Azimi', email: 'niloofar@apiforge.dev', role: 'Developer', status: 'active' },
  { name: 'Reza Hosseini', email: 'reza@apiforge.dev', role: 'Viewer', status: 'active' },
  { name: 'Dana Moradi', email: 'dana@apiforge.dev', role: 'Viewer', status: 'suspended' },
  { name: 'Kaveh Nouri', email: 'kaveh@apiforge.dev', role: 'Developer', status: 'active' },
  { name: 'Leyla Farhadi', email: 'leyla@apiforge.dev', role: 'Developer', status: 'active' },
];
const team = teamMemberDefs.map((m, i) => ({
  id: `usr_${base62C(8)}`,
  ...m,
  initials: m.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
  lastActive: isoHoursAgoC(betweenC(0, 96)),
  joined: isoDaysAgoC(betweenC(30, 700)),
  twoFactor: i < 4,
}));

const invitations = [
  { id: `inv_${base62C(8)}`, email: 'dev@yourco.io', role: 'Developer', invitedBy: 'Arash Pashaei', sentAt: isoDaysAgoC(2), expiresIn: '5 days' },
  { id: `inv_${base62C(8)}`, email: 'ops@yourco.io', role: 'Viewer', invitedBy: 'Sara Rahimi', sentAt: isoDaysAgoC(5), expiresIn: '2 days' },
];

// =====================================================================
// Plans + invoices (Phase 3C).
// =====================================================================
const plans = [
  {
    id: 'developer', name: 'Developer', price: 0, priceLabel: '$0', period: '/ month',
    blurb: 'For side projects and early prototypes.',
    requests: '100,000 / mo', environments: 2, members: 2, webhooks: 5,
    retention: '24 hours', rateLimit: '50 req/s', support: 'Community',
    cta: 'Downgrade', highlight: false,
  },
  {
    id: 'pro', name: 'Pro', price: 49, priceLabel: '$49', period: '/ month',
    blurb: 'For growing teams shipping in production.',
    requests: '2,000,000 / mo', environments: 3, members: 10, webhooks: 25,
    retention: '30 days', rateLimit: '150 req/s', support: 'Email',
    cta: 'Current plan', highlight: true,
  },
  {
    id: 'scale', name: 'Scale', price: 199, priceLabel: '$199', period: '/ month',
    blurb: 'For high-volume platforms and enterprises.',
    requests: '10,000,000 / mo', environments: 5, members: 50, webhooks: 100,
    retention: '90 days', rateLimit: '250 req/s', support: 'Priority + Slack',
    cta: 'Upgrade', highlight: false,
  },
];

const invoiceDefs = [
  { amount: 199, status: 'paid' },
  { amount: 199, status: 'paid' },
  { amount: 199, status: 'paid' },
  { amount: 248, status: 'paid' },
  { amount: 199, status: 'paid' },
  { amount: 199, status: 'pending' },
  { amount: 199, status: 'failed' },
  { amount: 199, status: 'paid' },
];
const invoices = invoiceDefs.map((inv, i) => {
  const period = new Date(Date.now() - i * 30 * 864e5);
  return {
    id: `inv_${period.getUTCFullYear()}${String(period.getUTCMonth() + 1).padStart(2, '0')}`,
    date: period.toISOString(),
    amount: inv.amount,
    currency: 'USD',
    status: inv.status,
    pdf: '#',
  };
});

// =====================================================================
// Notifications (Phase 3C) — developer infrastructure notification center.
// =====================================================================
const notificationDefs = [
  { category: 'security', severity: 'warning', title: 'New sign-in from an unknown device', body: 'A session was created from Tehran, IR (91.98.14.2). If this was not you, revoke the session.', env: null },
  { category: 'webhook', severity: 'error', title: 'Webhook delivery failing', body: 'customer.created has failed 12 times in the last hour. Last response: 500.', env: 'live' },
  { category: 'rate-limit', severity: 'warning', title: 'Rate limit at 85%', body: 'completions:create is approaching its per-second limit. Requests may be throttled.', env: 'live' },
  { category: 'billing', severity: 'info', title: 'Invoice payment received', body: 'Your September invoice for $199 was paid successfully.', env: null },
  { category: 'deployment', severity: 'success', title: 'Deployment succeeded', body: 'apiforge/api v2.4.1 deployed to production in 42s.', env: 'live' },
  { category: 'team', severity: 'info', title: 'Sara invited a new member', body: 'ops@yourco.io was invited as a Viewer.', env: null },
  { category: 'error', severity: 'error', title: 'Error spike detected', body: 'TypeError: Cannot read properties of null increased 3.2× in the last hour.', env: 'live' },
  { category: 'security', severity: 'error', title: 'API key created in production', body: 'A new live key (sk_live_4fJk…) was created from the dashboard.', env: 'live' },
  { category: 'rate-limit', severity: 'error', title: 'Rate limit breached', body: 'embeddings:create exceeded 40 req/s. Requests are returning 429.', env: 'staging' },
  { category: 'deployment', severity: 'warning', title: 'Deployment rolled back', body: 'apiforge/api v2.4.2 was rolled back after a failed health check.', env: 'staging' },
  { category: 'billing', severity: 'warning', title: 'Invoice payment failed', body: 'The July invoice could not be charged. Update your payment method to avoid interruption.', env: null },
  { category: 'team', severity: 'info', title: 'Dana was suspended', body: 'Sara suspended Dana Moradi from the workspace.', env: null },
  { category: 'webhook', severity: 'info', title: 'Webhook created', body: 'A new endpoint was registered for email.sent and email.bounced.', env: 'test' },
  { category: 'error', severity: 'warning', title: 'New error type detected', body: 'ECONNREFUSED 10.0.2.15:5432 first seen on GET /v1/usage.', env: 'staging' },
];
const notifications = notificationDefs.map((n) => ({
  id: `ntf_${base62C(8)}`,
  ...n,
  read: randC() < 0.45,
  createdAt: isoMinutesAgoC(betweenC(2, 10080)),
}));

// =====================================================================
// SDKs (Phase 3C) — official client catalog.
// =====================================================================
const sdks = [
  {
    id: 'js', name: 'JavaScript', lang: 'JS', accent: 'js',
    package: '@apiforge/sdk', version: '1.7.2', install: 'npm install @apiforge/sdk',
    registry: 'npm', updated: isoDaysAgoC(3),
    features: ['TypeScript types', 'Streaming support', 'Retry + idempotency', 'Webhook signature helper'],
    docsUrl: './docs.html',
  },
  {
    id: 'node', name: 'Node.js', lang: 'Node', accent: 'node',
    package: 'apiforge', version: '2.1.0', install: 'npm install apiforge',
    registry: 'npm', updated: isoDaysAgoC(9),
    features: ['Zero-dependency', 'Streaming support', 'Retry + idempotency', 'Works in ESM & CJS'],
    docsUrl: './docs.html',
  },
  {
    id: 'python', name: 'Python', lang: 'Py', accent: 'py',
    package: 'apiforge', version: '1.4.1', install: 'pip install apiforge',
    registry: 'PyPI', updated: isoDaysAgoC(14),
    features: ['Async + sync clients', 'Typed responses', 'Retry + idempotency', 'pytest fixtures'],
    docsUrl: './docs.html',
  },
  {
    id: 'php', name: 'PHP', lang: 'PHP', accent: 'php',
    package: 'apiforge/apiforge-php', version: '0.9.3', install: 'composer require apiforge/apiforge-php',
    registry: 'Packagist', updated: isoDaysAgoC(22),
    features: ['PSR-18 compatible', 'Guzzle transport', 'Webhook signature helper'],
    docsUrl: './docs.html',
  },
  {
    id: 'go', name: 'Go', lang: 'Go', accent: 'go',
    package: 'github.com/apiforge/apiforge-go', version: '1.2.4', install: 'go get github.com/apiforge/apiforge-go',
    registry: 'Go modules', updated: isoDaysAgoC(11),
    features: ['Context-aware', 'Zero allocations on hot path', 'Retry + idempotency'],
    docsUrl: './docs.html',
  },
  {
    id: 'ruby', name: 'Ruby', lang: 'Rb', accent: 'rb',
    package: 'apiforge', version: '0.8.0', install: 'gem install apiforge',
    registry: 'RubyGems', updated: isoDaysAgoC(30),
    features: ['ActiveSupport integration', 'Retry + idempotency', 'Webhook signature helper'],
    docsUrl: './docs.html',
  },
];

// =====================================================================
// Observability (Phase 3C) — metrics page data.
// =====================================================================
const obsRange = (scale, errBase) => ({
  requests: Math.round(betweenC(90000, 120000) * scale),
  errorRate: +(errBase + randC() * 0.5).toFixed(2),
  p95: betweenC(170, 240),
  p99: betweenC(260, 380),
  availability: +(99.9 + randC() * 0.09).toFixed(3),
});
const observability = {
  ranges: {
    '1h': obsRange(0.06, 0.3),
    '24h': obsRange(1, 0.5),
    '7d': obsRange(6.4, 0.6),
    '30d': obsRange(26, 0.7),
  },
  series: Array.from({ length: 30 }, (_, i) => ({
    date: isoDaysAgoC(29 - i).slice(0, 10),
    requests: betweenC(150000, 210000),
    p50: betweenC(70, 90),
    p95: betweenC(160, 250),
    p99: betweenC(250, 400),
    errorRate: +(0.3 + randC() * 0.9).toFixed(2),
    availability: +(99.85 + randC() * 0.14).toFixed(3),
  })),
  seriesStaging: Array.from({ length: 30 }, (_, i) => ({
    date: isoDaysAgoC(29 - i).slice(0, 10),
    requests: betweenC(4000, 9000),
    p50: betweenC(50, 70),
    p95: betweenC(130, 200),
    p99: betweenC(200, 320),
    errorRate: +(0.8 + randC() * 1.6).toFixed(2),
    availability: +(99.2 + randC() * 0.6).toFixed(3),
  })),
  hourly: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    requests: betweenC(24000, 52000),
    p50: betweenC(60, 95),
    p95: betweenC(150, 260),
    p99: betweenC(250, 410),
    errorRate: +(0.2 + randC() * 1.1).toFixed(2),
    availability: +(99.8 + randC() * 0.18).toFixed(3),
  })),
  minutes: Array.from({ length: 24 }, (_, i) => ({
    at: `${String((i * 5) % 60).padStart(2, '0')}:${String(Math.floor(i * 2.5) % 60).padStart(2, '0')}`,
    requests: betweenC(3800, 9000),
    p50: betweenC(55, 90),
    p95: betweenC(140, 240),
    p99: betweenC(240, 380),
    errorRate: +(0.2 + randC() * 1.0).toFixed(2),
  })),
  byEndpoint: [
    { apiId: 'api_emails', method: 'POST', path: '/v1/emails', requests: 1842011, p95: 214, errorRate: 0.4 },
    { apiId: 'api_ai', method: 'POST', path: '/v1/completions', requests: 1120800, p95: 341, errorRate: 0.8 },
    { apiId: 'api_ai', method: 'POST', path: '/v1/embeddings', requests: 861440, p95: 188, errorRate: 0.3 },
    { apiId: 'api_ai', method: 'GET', path: '/v1/models', requests: 549300, p95: 92, errorRate: 0.1 },
    { apiId: 'api_audiences', method: 'POST', path: '/v1/audiences', requests: 421500, p95: 251, errorRate: 0.5 },
    { apiId: 'api_emails', method: 'GET', path: '/v1/emails/{id}', requests: 306780, p95: 110, errorRate: 0.2 },
    { apiId: 'api_webhooks', method: 'POST', path: '/v1/webhooks', requests: 158430, p95: 276, errorRate: 0.6 },
    { apiId: 'api_platform', method: 'GET', path: '/v1/usage', requests: 122139, p95: 84, errorRate: 0.0 },
  ],
  byStatus: [
    { code: '2xx', count: 5319400, share: 98.8 },
    { code: '4xx', count: 48400, share: 0.9 },
    { code: '5xx', count: 10800, share: 0.2 },
    { code: '429', count: 5400, share: 0.1 },
  ],
  byEnvironment: [
    { env: 'live', requests: 5102400, errorRate: 0.6, p95: 198, availability: 99.96 },
    { env: 'staging', requests: 262000, errorRate: 1.9, p95: 172, availability: 99.61 },
    { env: 'test', requests: 18000, errorRate: 2.4, p95: 140, availability: 99.2 },
  ],
  byMethod: [
    { method: 'POST', requests: 3800200, share: 70.6 },
    { method: 'GET', requests: 1582600, share: 29.4 },
  ],
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
write('mock-webhooks.json', webhooks);
write('mock-webhook-deliveries.json', webhookDeliveries);
write('mock-errors.json', errors);
write('mock-rate-limits.json', rateLimits);
write('mock-variables.json', variables);
write('mock-team.json', team);
write('mock-invitations.json', invitations);
write('mock-plans.json', plans);
write('mock-invoices.json', invoices);
write('mock-notifications.json', notifications);
write('mock-sdks.json', sdks);
write('mock-observability.json', observability);

console.log(`Generated mock data into ${OUT_DIR}`);
console.log(`  apis: ${apis.length}, endpoints: ${endpoints.length}, keys: ${keys.length}, logs: ${logs.length}`);
console.log(`  usage: ${usage.length} days, environments: ${environments.length}, activity: ${activity.length}`);
console.log(`  webhooks: ${webhooks.length}, deliveries: ${webhookDeliveries.length}, errors: ${errors.length}`);
console.log(`  rate limits: ${rateLimits.rules.length} rules, variables: ${variables.length}`);
console.log(`  team: ${team.length} members, invitations: ${invitations.length}, plans: ${plans.length}`);
console.log(`  invoices: ${invoices.length}, notifications: ${notifications.length}, sdks: ${sdks.length}`);
console.log(`  observability: ${observability.series.length} days`);
