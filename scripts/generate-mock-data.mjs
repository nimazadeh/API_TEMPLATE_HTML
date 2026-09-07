// =============================================================
// APIForge X — Mock data generator (deterministic, seeded)
// Produces /src/js/data/*.json so the template feels real without a
// backend. Run: node scripts/generate-mock-data.mjs
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

// --- Endpoints (10, grouped) ---
const endpoints = [
  { method: 'POST', path: '/v1/emails', group: 'Emails', description: 'Send an email' },
  { method: 'GET', path: '/v1/emails/{id}', group: 'Emails', description: 'Retrieve an email' },
  { method: 'POST', path: '/v1/completions', group: 'AI', description: 'Create a completion' },
  { method: 'POST', path: '/v1/embeddings', group: 'AI', description: 'Create embeddings' },
  { method: 'GET', path: '/v1/models', group: 'AI', description: 'List available models' },
  { method: 'POST', path: '/v1/audiences', group: 'Audiences', description: 'Create an audience' },
  { method: 'GET', path: '/v1/audiences/{id}', group: 'Audiences', description: 'Retrieve an audience' },
  { method: 'POST', path: '/v1/webhooks', group: 'Webhooks', description: 'Create a webhook endpoint' },
  { method: 'PUT', path: '/v1/api-keys/{id}', group: 'Platform', description: 'Update an API key' },
  { method: 'DELETE', path: '/v1/api-keys/{id}', group: 'Platform', description: 'Revoke an API key' },
].map((e, i) => ({ ...e, id: `ep_${base62(6)}` }));

// --- API keys (5) ---
const keyNames = ['Production backend', 'CLI tool', 'Staging server', 'CI pipeline', 'Local dev'];
const scopesPool = ['emails:write', 'emails:read', 'audiences:read', 'audiences:write', 'ai:inference', 'webhooks:write', 'usage:read'];
const keys = keyNames.map((name, i) => ({
  id: `key_${base62(8)}`,
  name,
  prefix: i < 4 ? `sk_live_${base62(8)}` : `sk_test_${base62(8)}`,
  scopes: scopesPool.slice(0, between(1, 4)).sort(),
  createdAt: new Date(Date.now() - between(3, 320) * 864e5).toISOString(),
  lastUsedAt: new Date(Date.now() - between(1, 72) * 3600e3).toISOString(),
  status: i === 2 ? 'revoked' : 'active',
}));

// --- Webhooks (3) ---
const webhooks = [
  {
    id: 'wh_8f3k2ma1',
    url: 'https://example.com/hooks/email-events',
    description: 'Email delivery events',
    events: ['email.sent', 'email.bounced', 'email.delivered'],
    status: 'enabled',
    successRate: 99.2,
    lastDelivery: new Date(Date.now() - between(1, 40) * 60e3).toISOString(),
  },
  {
    id: 'wh_2x9q7b04',
    url: 'https://example.com/hooks/audience-sync',
    description: 'Audience sync events',
    events: ['audience.created', 'audience.updated'],
    status: 'enabled',
    successRate: 97.8,
    lastDelivery: new Date(Date.now() - between(1, 120) * 60e3).toISOString(),
  },
  {
    id: 'wh_c7d1p9z3',
    url: 'https://example.com/hooks/usage-alerts',
    description: 'Usage threshold alerts',
    events: ['usage.warning', 'usage.limit_reached'],
    status: 'disabled',
    successRate: 0,
    lastDelivery: null,
  },
];

// --- Usage (30 days) ---
const usage = [];
const dayMs = 864e5;
let base = 142000;
for (let i = 29; i >= 0; i--) {
  base = Math.max(60000, base + between(-14000, 18000));
  const errors = between(120, 640);
  usage.push({
    date: new Date(Date.now() - i * dayMs).toISOString().slice(0, 10),
    requests: base,
    errors,
  });
}

// --- Logs (50) ---
const logStatus = [
  [200, 74], [201, 8], [400, 3], [401, 3], [403, 1], [404, 4], [429, 2], [500, 3], [502, 1], [503, 1],
];
const userAgents = [
  'node-fetch/3.3.2',
  'axios/1.7.4',
  'curl/8.5.0',
  'python-requests/2.32.3',
  'guzzlehttp/7.8.1',
  'rest-client/2.1.0',
  'postman-runtime/7.39.0',
];

const logs = [];
let t = Date.now() - 6 * 60e3;
for (let i = 0; i < 50; i++) {
  const ep = pick(endpoints);
  const method = ep.method;
  const status = weighted(logStatus);
  const latency = status >= 500 ? between(900, 4200) : status === 429 ? between(600, 2000) : between(38, 1400);
  t -= between(20, 55) * 60e3;
  logs.push({
    id: `req_${base62(10)}`,
    method,
    path: ep.path.replace('{id}', between(1000, 99999).toString()),
    status,
    latencyMs: latency,
    keyPrefix: `sk_${pick(['live', 'test'])}_${base62(6)}`,
    timestamp: new Date(t).toISOString(),
    userAgent: pick(userAgents),
  });
}
logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// --- Write ---
mkdirSync(OUT_DIR, { recursive: true });
const write = (name, data) =>
  writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2) + '\n', 'utf8');

write('mock-logs.json', logs);
write('mock-keys.json', keys);
write('mock-webhooks.json', webhooks);
write('mock-usage.json', usage);
write('mock-endpoints.json', endpoints);

console.log(`Generated mock data into ${OUT_DIR}`);
console.log(`  logs: ${logs.length}, keys: ${keys.length}, webhooks: ${webhooks.length}, usage: ${usage.length} days, endpoints: ${endpoints.length}`);
