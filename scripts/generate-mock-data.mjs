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
    summary: 'ارسال ایمیل', group: 'ایمیل',
    description: 'یک ایمیل تراکنشی را برای تحویل به یک یا چند گیرنده در صف قرار می‌دهد. وضعیت تحویل از طریق شناسهٔ بازگشتی ایمیل قابل پیگیری است.',
    params: [
      { name: 'to', type: 'string', location: 'body', required: true, description: 'نشانی ایمیل گیرنده.' },
      { name: 'subject', type: 'string', location: 'body', required: true, description: 'موضوع ایمیل.' },
      { name: 'html', type: 'string', location: 'body', required: false, description: 'بدنهٔ HTML. ارسال یکی از html یا text الزامی است.' },
      { name: 'from', type: 'string', location: 'body', required: false, description: 'نشانی فرستنده. پیش‌فرض دامنهٔ تأییدشدهٔ شماست.' },
    ],
    responseExample: { id: 'eml_8Fk2mQx1Zw', status: 'queued', to: 'user@example.com' },
  },
  {
    apiId: 'api_emails', method: 'GET', path: '/v1/emails/{id}',
    summary: 'دریافت یک ایمیل', group: 'ایمیل',
    description: 'وضعیت تحویل و فرادادهٔ یک ایمیل را برمی‌گرداند.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'شناسهٔ ایمیل (eml_…).' },
    ],
    responseExample: { id: 'eml_8Fk2mQx1Zw', status: 'delivered', deliveredAt: '2026-09-07T19:05:24Z' },
  },
  {
    apiId: 'api_emails', method: 'GET', path: '/v1/emails',
    summary: 'فهرست ایمیل‌ها', group: 'ایمیل',
    description: 'ایمیل‌های ارسال‌شدهٔ اخیر را از جدید به قدیم فهرست می‌کند. برای صفحه‌بندی از limit و before استفاده کنید.',
    params: [
      { name: 'limit', type: 'integer', location: 'query', required: false, description: 'حداکثر تعداد نتایج (پیش‌فرض ۵۰، حداکثر ۱۰۰).' },
      { name: 'before', type: 'string', location: 'query', required: false, description: 'ایمیل‌های ارسال‌شده پیش از این شناسه را برمی‌گرداند.' },
    ],
    responseExample: { data: [{ id: 'eml_8Fk2mQx1Zw', status: 'delivered' }], has_more: false },
  },
  {
    apiId: 'api_ai', method: 'POST', path: '/v1/completions',
    summary: 'ایجاد تکمیل متن', group: 'هوش مصنوعی',
    description: 'یک استنتاج مدل را اجرا می‌کند و نتیجه را به‌صورت جریانی برمی‌گرداند.',
    params: [
      { name: 'model', type: 'string', location: 'body', required: true, description: 'شناسهٔ مدل، برای نمونه forge-1 یا forge-1-turbo.' },
      { name: 'prompt', type: 'string', location: 'body', required: true, description: 'دستوری که باید تکمیل شود.' },
      { name: 'max_tokens', type: 'integer', location: 'body', required: false, description: 'حداکثر توکن تولیدی (پیش‌فرض ۲۵۶).' },
      { name: 'temperature', type: 'number', location: 'body', required: false, description: 'دمای نمونه‌برداری بین ۰ و ۱.' },
    ],
    responseExample: { id: 'cmpl_9xK2mQ', model: 'forge-1', choices: [{ text: 'Hello from Forge.' }] },
  },
  {
    apiId: 'api_ai', method: 'POST', path: '/v1/embeddings',
    summary: 'ایجاد بردار (Embedding)', group: 'هوش مصنوعی',
    description: 'متن ورودی را برای جست‌وجو و خوشه‌بندی به بردار تبدیل می‌کند.',
    params: [
      { name: 'model', type: 'string', location: 'body', required: true, description: 'شناسهٔ مدل بردارساز، برای نمونه embed-1.' },
      { name: 'input', type: 'array', location: 'body', required: true, description: 'متن ورودی برای تبدیل به بردار — یک رشته یا آرایه‌ای از رشته‌ها.' },
    ],
    responseExample: { object: 'list', data: [{ index: 0, embedding: [0.014, -0.021, 0.038] }] },
  },
  {
    apiId: 'api_ai', method: 'GET', path: '/v1/models',
    summary: 'فهرست مدل‌های در دسترس', group: 'هوش مصنوعی',
    description: 'مدل‌های در دسترس فضای کاری را همراه با قابلیت‌هایشان فهرست می‌کند.',
    params: [],
    responseExample: { data: [{ id: 'forge-1', object: 'model' }, { id: 'embed-1', object: 'model' }] },
  },
  {
    apiId: 'api_audiences', method: 'POST', path: '/v1/audiences',
    summary: 'ایجاد گروه مخاطب', group: 'مخاطبان',
    description: 'یک بخش مخاطب جدید را بر اساس مجموعه‌ای از فیلترها ایجاد می‌کند.',
    params: [
      { name: 'name', type: 'string', location: 'body', required: true, description: 'نام گروه مخاطب.' },
      { name: 'filters', type: 'array', location: 'body', required: false, description: 'آرایه‌ای از شرط‌های فیلتر.' },
    ],
    responseExample: { id: 'aud_9xK2mQ', name: 'Trial users', size: 0 },
  },
  {
    apiId: 'api_audiences', method: 'GET', path: '/v1/audiences/{id}',
    summary: 'دریافت یک گروه مخاطب', group: 'مخاطبان',
    description: 'یک گروه مخاطب را همراه با تعداد اعضای فعلی برمی‌گرداند.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'شناسهٔ گروه مخاطب (aud_…).' },
    ],
    responseExample: { id: 'aud_9xK2mQ', name: 'Trial users', size: 12840 },
  },
  {
    apiId: 'api_audiences', method: 'GET', path: '/v1/audiences',
    summary: 'فهرست گروه‌های مخاطب', group: 'مخاطبان',
    description: 'همهٔ گروه‌های مخاطب فضای کاری را فهرست می‌کند.',
    params: [
      { name: 'limit', type: 'integer', location: 'query', required: false, description: 'حداکثر تعداد نتایج (پیش‌فرض ۵۰).' },
    ],
    responseExample: { data: [{ id: 'aud_9xK2mQ', name: 'Trial users', size: 12840 }], has_more: false },
  },
  {
    apiId: 'api_webhooks', method: 'POST', path: '/v1/webhooks',
    summary: 'ایجاد نقطهٔ پایانی وب‌هوک', group: 'وب‌هوک‌ها',
    description: 'یک نشانی را برای دریافت رویدادهای لحظه‌ای فضای کاری ثبت می‌کند.',
    params: [
      { name: 'url', type: 'string', location: 'body', required: true, description: 'نقطهٔ پایانی HTTPS که رویدادها را دریافت می‌کند.' },
      { name: 'events', type: 'array', location: 'body', required: true, description: 'نوع رویدادهای مورد اشتراک، برای نمونه email.sent.' },
      { name: 'secret', type: 'string', location: 'body', required: false, description: 'کلید امضا برای بررسی تحویل‌ها.' },
    ],
    responseExample: { id: 'wh_8f3k2ma1', url: 'https://example.com/hooks', enabled: true },
  },
  {
    apiId: 'api_webhooks', method: 'GET', path: '/v1/webhooks',
    summary: 'فهرست وب‌هوک‌ها', group: 'وب‌هوک‌ها',
    description: 'نقاط پایانی وب‌هوک ثبت‌شده و وضعیت آن‌ها را فهرست می‌کند.',
    params: [],
    responseExample: { data: [{ id: 'wh_8f3k2ma1', enabled: true }] },
  },
  {
    apiId: 'api_webhooks', method: 'DELETE', path: '/v1/webhooks/{id}',
    summary: 'حذف یک وب‌هوک', group: 'وب‌هوک‌ها',
    description: 'یک نقطهٔ پایانی وب‌هوک را برای همیشه حذف می‌کند.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'شناسهٔ وب‌هوک (wh_…).' },
    ],
    responseExample: { id: 'wh_8f3k2ma1', deleted: true },
  },
  {
    apiId: 'api_platform', method: 'PUT', path: '/v1/api-keys/{id}',
    summary: 'به‌روزرسانی کلید API', group: 'پلتفرم',
    description: 'نام کلید را تغییر می‌دهد یا حوزه‌های دسترسی آن را اصلاح می‌کند.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'شناسهٔ کلید (key_…).' },
      { name: 'name', type: 'string', location: 'body', required: false, description: 'نام نمایشی جدید.' },
      { name: 'scopes', type: 'array', location: 'body', required: false, description: 'فهرست جایگزین حوزه‌های دسترسی.' },
    ],
    responseExample: { id: 'key_DElNoSR8', name: 'Production backend', updated: true },
  },
  {
    apiId: 'api_platform', method: 'DELETE', path: '/v1/api-keys/{id}',
    summary: 'ابطال کلید API', group: 'پلتفرم',
    description: 'کلید را بلافاصله ابطال می‌کند. درخواست‌هایی که از آن استفاده کنند پاسخ ۴۰۱ می‌گیرند.',
    params: [
      { name: 'id', type: 'string', location: 'path', required: true, description: 'شناسهٔ کلید (key_…).' },
    ],
    responseExample: { id: 'key_DElNoSR8', revoked: true },
  },
  {
    apiId: 'api_platform', method: 'GET', path: '/v1/usage',
    summary: 'دریافت خلاصهٔ مصرف', group: 'پلتفرم',
    description: 'مصرف دورهٔ صورت‌حساب جاری را به تفکیک نقطهٔ پایانی برمی‌گرداند.',
    params: [
      { name: 'from', type: 'string', location: 'query', required: false, description: 'ابتدای بازهٔ زمانی (ISO).' },
      { name: 'to', type: 'string', location: 'query', required: false, description: 'انتهای بازهٔ زمانی (ISO).' },
    ],
    responseExample: { requests: 5382400, period: { start: '2026-09-01', end: '2026-09-30' } },
  },
];
const endpoints = endpointDefs.map((e) => ({ ...e, id: `ep_${base62(6)}` }));

// =====================================================================
// APIs — catalog cards, counts derived from endpoints.
// =====================================================================
const apiMeta = {
  api_emails: { name: 'سرویس ایمیل', status: 'stable', description: 'ارسال ایمیل تراکنشی و پیگیری وضعیت تحویل.', basePath: '/v1/emails' },
  api_ai: { name: 'هوش مصنوعی', status: 'stable', description: 'اجرای تکمیل متن و تبدیل به بردار روی مدل‌های میزبانی‌شده.', basePath: '/v1' },
  api_audiences: { name: 'مخاطبان', status: 'beta', description: 'ساخت و جست‌وجوی بخش‌بندی مخاطبان.', basePath: '/v1/audiences' },
  api_webhooks: { name: 'وب‌هوک‌ها', status: 'stable', description: 'دریافت رویدادهای لحظه‌ای فضای کاری.', basePath: '/v1/webhooks' },
  api_platform: { name: 'پلتفرم', status: 'stable', description: 'مدیریت کلیدها و مشاهدهٔ مصرف در محیط‌های مختلف.', basePath: '/v1' },
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
  { name: 'درگاه پرداخت', env: 'live', permission: 'full', scopes: ['emails:read', 'emails:write', 'audiences:read', 'audiences:write'] },
  { name: 'ابزار خط فرمان', env: 'live', permission: 'restricted', scopes: ['emails:read', 'emails:write'] },
  { name: 'سرور آزمایشی', env: 'live', permission: 'restricted', scopes: ['audiences:read', 'audiences:write'] },
  { name: 'خط یکپارچه‌سازی (CI)', env: 'live', permission: 'restricted', scopes: ['emails:read', 'emails:write'] },
  { name: 'توسعهٔ محلی', env: 'test', permission: 'full', scopes: ['emails:read', 'emails:write', 'audiences:read'] },
  { name: 'سامانهٔ تحلیل کاربران', env: 'test', permission: 'restricted', scopes: ['usage:read'] },
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
  { name: 'سرور محیط آزمایشی', permission: 'restricted', scopes: ['emails:read', 'emails:write', 'audiences:read'] },
  { name: 'استقرار پیش‌نمایش', permission: 'restricted', scopes: ['audiences:read'] },
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
    name: 'تولید',
    baseUrl: 'https://api.apiforge.dev',
    description: 'ترافیک واقعی و داده‌های اصلی.',
    created: isoDaysAgo(320),
    keysCount: keys.filter((k) => k.env === 'live').length,
    requestsShare: 94.8,
  },
  {
    id: 'staging',
    name: 'آزمایشی',
    baseUrl: 'https://api.staging.apiforge.dev',
    description: 'اعتبارسنجی پیش از عرضه در محیط تولید.',
    created: isoDaysAgo(180),
    keysCount: keys.filter((k) => k.env === 'staging').length,
    requestsShare: 0,
  },
  {
    id: 'test',
    name: 'توسعه',
    baseUrl: 'https://api.test.apiforge.dev',
    description: 'محیط ایزوله برای توسعهٔ محلی.',
    created: isoDaysAgo(210),
    keysCount: keys.filter((k) => k.env === 'test').length,
    requestsShare: 5.2,
  },
];

// =====================================================================
// Plan — limits and billing period.
// =====================================================================
const plan = {
  name: 'سازمانی',
  price: 199,
  currency: 'USD',
  requestsLimit: 10000000,
  requestsUsed: 5382400,
  rateLimitPerSecond: 250,
  periodStart: '2026-09-01',
  periodEnd: '2026-09-30',
  periodLabel: 'شهریور ۱۴۰۵',
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
  { id: 'act_1', type: 'key_created', title: 'کلید API ایجاد شد', detail: '«سامانهٔ تحلیل کاربران» در محیط آزمایشی', actor: 'علی رضایی', timestamp: isoHoursAgo(2) },
  { id: 'act_2', type: 'webhook_failed', title: 'تحویل وب‌هوک ناموفق بود', detail: 'https://example.com/hooks/email-events پاسخ ۵۰۰ داد', actor: 'سیستم', timestamp: isoHoursAgo(4) },
  { id: 'act_3', type: 'endpoint_updated', title: 'نقطهٔ پایانی به‌روزرسانی شد', detail: 'POST /v1/emails — پارامتر `from` اضافه شد', actor: 'سارا احمدی', timestamp: isoHoursAgo(7) },
  { id: 'act_4', type: 'key_revoked', title: 'کلید API ابطال شد', detail: '«سرور آزمایشی» (sk_live_59TB…)', actor: 'علی رضایی', timestamp: isoHoursAgo(11) },
  { id: 'act_5', type: 'rate_limit', title: 'محدودیت نرخ اعمال شد', detail: 'POST /v1/completions به‌مدت ۴ ثانیه به ۲۵۰ درخواست در ثانیه رسید', actor: 'سیستم', timestamp: isoHoursAgo(16) },
  { id: 'act_6', type: 'deploy', title: 'فضای کاری به‌روزرسانی شد', detail: 'نسخهٔ v1.4.0 سرویس ایمیل عرضه شد', actor: 'سیستم', timestamp: isoHoursAgo(21) },
  { id: 'act_7', type: 'key_created', title: 'کلید API ایجاد شد', detail: '«خط یکپارچه‌سازی (CI)» در محیط عملیاتی', actor: 'سارا احمدی', timestamp: isoHoursAgo(30) },
  { id: 'act_8', type: 'webhook_failed', title: 'تحویل وب‌هوک ناموفق بود', detail: 'نقطهٔ پایانی usage-alerts پس از ۶ خطا غیرفعال شد', actor: 'سیستم', timestamp: isoHoursAgo(38) },
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
  { slug: 'email-events', description: 'رویدادهای تحویل ایمیل', events: ['email.sent', 'email.delivered', 'email.bounced'], environment: 'live', status: 'enabled' },
  { slug: 'audience-sync', description: 'رویدادهای همگام‌سازی مخاطبان', events: ['audience.created', 'audience.updated', 'audience.deleted'], environment: 'live', status: 'enabled' },
  { slug: 'usage-alerts', description: 'هشدارهای آستانهٔ مصرف', events: ['usage.warning', 'usage.limit_reached'], environment: 'live', status: 'disabled' },
  { slug: 'completion-stream', description: 'جریان تکمیل مدل', events: ['completion.created', 'completion.failed'], environment: 'live', status: 'enabled' },
  { slug: 'staging-email', description: 'رویدادهای ایمیل در محیط آزمایشی', events: ['email.sent', 'email.bounced'], environment: 'staging', status: 'enabled' },
  { slug: 'dev-sink', description: 'مقصد محلی توسعه', events: ['email.delivered'], environment: 'test', status: 'enabled' },
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
  { type: 'TypeError', message: "Cannot read properties of undefined (reading 'id')", method: 'POST', path: '/v1/emails', env: 'live', severity: 'error', occurrences: 12840, status: 'unresolved', assignee: 'علی رضایی', frame: { file: 'src/email/send.ts', fn: 'dispatchEmail', line: 142, col: 9, code: 'const user = await users.get(payload.recipientId);' } },
  { type: 'RangeError', message: 'Invalid array length', method: 'POST', path: '/v1/audiences', env: 'live', severity: 'error', occurrences: 8230, status: 'unresolved', assignee: null, frame: { file: 'src/audiences/segment.ts', fn: 'applyFilters', line: 88, col: 21, code: 'const slice = new Array(filter.limit);' } },
  { type: 'SyntaxError', message: "Unexpected token '<' in JSON at position 0", method: 'POST', path: '/v1/completions', env: 'live', severity: 'error', occurrences: 5121, status: 'resolved', assignee: 'سارا احمدی', frame: { file: 'src/ai/inference.ts', fn: 'parseJson', line: 54, col: 11, code: 'return JSON.parse(raw.trim());' } },
  { type: 'ReferenceError', message: 'handler is not defined', method: 'POST', path: '/v1/emails', env: 'live', severity: 'error', occurrences: 3402, status: 'resolved', assignee: 'علی رضایی', frame: { file: 'src/email/routes.ts', fn: 'onEmailSent', line: 39, col: 5, code: 'return handler(event);' } },
  { type: 'ValidationError', message: "Missing required field: 'to'", method: 'POST', path: '/v1/emails', env: 'live', severity: 'warning', occurrences: 15840, status: 'unresolved', assignee: null, frame: { file: 'src/email/schema.ts', fn: 'validateEmail', line: 23, col: 12, code: "throw new ValidationError(\"Missing required field: 'to'\");" } },
  { type: 'RateLimitError', message: '429 Too Many Requests — retry after 2s', method: 'POST', path: '/v1/completions', env: 'live', severity: 'warning', occurrences: 9230, status: 'unresolved', assignee: null, frame: { file: 'src/ai/gateway.ts', fn: 'checkQuota', line: 117, col: 7, code: 'throw new RateLimitError(resetIn);' } },
  { type: 'ETIMEDOUT', message: 'connect ETIMEDOUT 10.0.4.21:6379', method: 'GET', path: '/v1/models', env: 'live', severity: 'error', occurrences: 2170, status: 'resolved', assignee: 'سارا احمدی', frame: { file: 'src/db/redis.ts', fn: 'cacheGet', line: 71, col: 16, code: 'await client.get(key);' } },
  { type: 'ECONNREFUSED', message: 'connect ECONNREFUSED 10.0.2.15:5432', method: 'GET', path: '/v1/usage', env: 'staging', severity: 'error', occurrences: 980, status: 'unresolved', assignee: null, frame: { file: 'src/db/pg.ts', fn: 'connect', line: 46, col: 13, code: 'await pool.connect();' } },
  { type: 'TypeError', message: "Cannot read properties of null (reading 'match')", method: 'GET', path: '/v1/emails/{id}', env: 'live', severity: 'warning', occurrences: 6540, status: 'resolved', assignee: 'علی رضایی', frame: { file: 'src/email/parse.ts', fn: 'extractMeta', line: 28, col: 8, code: "return value.match(META_RE);" } },
  { type: 'ZodError', message: 'Invalid input: expected string, received number', method: 'POST', path: '/v1/embeddings', env: 'test', severity: 'warning', occurrences: 1890, status: 'unresolved', assignee: null, frame: { file: 'src/ai/embeddings.ts', fn: 'validateInput', line: 64, col: 17, code: 'const parsed = schema.parse(input);' } },
  { type: 'RangeError', message: 'Maximum call stack size exceeded', method: 'POST', path: '/v1/audiences/{id}', env: 'live', severity: 'error', occurrences: 402, status: 'unresolved', assignee: null, frame: { file: 'src/audiences/tree.ts', fn: 'walk', line: 112, col: 3, code: 'return walk(node.children);' } },
  { type: 'AbortError', message: 'The operation was aborted due to timeout', method: 'POST', path: '/v1/completions', env: 'staging', severity: 'warning', occurrences: 1330, status: 'resolved', assignee: 'سارا احمدی', frame: { file: 'src/http/client.ts', fn: 'request', line: 93, col: 9, code: 'const res = await fetch(url, { signal });' } },
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
    perMinute: { limit: 15000, used: 12840, label: 'درخواست در دقیقه', resetIn: '۶ ثانیه' },
    perDay: { limit: 500000, used: 431200, label: 'درخواست در روز', resetIn: '۴ ساعت و ۱۲ دقیقه' },
    monthly: { limit: 10000000, used: 5382400, label: 'سهمیهٔ ماهانه', resetIn: '۲۳ روز', periodLabel: 'شهریور ۱۴۰۵' },
  },
  history: Array.from({ length: 14 }, (_, i) => {
    const used = betweenB(380000, 490000);
    return { date: isoDaysAgoB(13 - i).slice(0, 10), used, limit: 500000 };
  }),
  rules: [
    { id: 'rl_emails', api: 'سرویس ایمیل', name: 'emails:write', limit: 50, window: 'در ثانیه', current: 31, status: 'ok' },
    { id: 'rl_completions', api: 'هوش مصنوعی', name: 'completions:create', limit: 25, window: 'در ثانیه', current: 24, status: 'warning' },
    { id: 'rl_embeddings', api: 'هوش مصنوعی', name: 'embeddings:create', limit: 40, window: 'در ثانیه', current: 42, status: 'breached' },
    { id: 'rl_audiences', api: 'مخاطبان', name: 'audiences:write', limit: 10, window: 'در ثانیه', current: 4, status: 'ok' },
    { id: 'rl_webhooks', api: 'وب‌هوک‌ها', name: 'deliveries', limit: 100, window: 'در دقیقه', current: 62, status: 'ok' },
    { id: 'rl_global', api: 'پلتفرم', name: 'global', limit: 250, window: 'در ثانیه', current: 208, status: 'warning' },
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
  addedBy: pickB(['علی رضایی', 'سارا احمدی', 'سیستم']),
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
  { name: 'علی رضایی', email: 'ali@apiforge.dev', role: 'Owner', status: 'active' },
  { name: 'سارا احمدی', email: 'sara@apiforge.dev', role: 'Admin', status: 'active' },
  { name: 'مهدی کریمی', email: 'mehdi@apiforge.dev', role: 'Developer', status: 'active' },
  { name: 'نیلوفر عظیمی', email: 'niloofar@apiforge.dev', role: 'Developer', status: 'active' },
  { name: 'رضا حسینی', email: 'reza@apiforge.dev', role: 'Viewer', status: 'active' },
  { name: 'دانا مرادی', email: 'dana@apiforge.dev', role: 'Viewer', status: 'suspended' },
  { name: 'کاوه نوری', email: 'kaveh@apiforge.dev', role: 'Developer', status: 'active' },
  { name: 'لیلا فرهادی', email: 'leyla@apiforge.dev', role: 'Developer', status: 'active' },
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
  { id: `inv_${base62C(8)}`, email: 'dev@yourco.io', role: 'Developer', invitedBy: 'علی رضایی', sentAt: isoDaysAgoC(2), expiresIn: '5 days' },
  { id: `inv_${base62C(8)}`, email: 'ops@yourco.io', role: 'Viewer', invitedBy: 'سارا احمدی', sentAt: isoDaysAgoC(5), expiresIn: '2 days' },
];

// =====================================================================
// Plans + invoices (Phase 3C).
// =====================================================================
const plans = [
  {
    id: 'developer', name: 'توسعه‌دهنده', price: 0, priceLabel: '$۰', period: 'در ماه',
    blurb: 'برای پروژه‌های جانبی و نمونه‌های اولیه.',
    requests: '۱۰۰٬۰۰۰', environments: 2, members: 2, webhooks: 5,
    retention: '۲۴ ساعت', rateLimit: '۵۰ درخواست در ثانیه', support: 'انجمن',
    cta: 'تنزل طرح', highlight: false,
  },
  {
    id: 'pro', name: 'حرفه‌ای', price: 49, priceLabel: '$۴۹', period: 'در ماه',
    blurb: 'برای تیم‌های رو به رشد که در محیط تولید عرضه می‌کنند.',
    requests: '۲٬۰۰۰٬۰۰۰', environments: 3, members: 10, webhooks: 25,
    retention: '۳۰ روز', rateLimit: '۱۵۰ درخواست در ثانیه', support: 'ایمیل',
    cta: 'طرح فعلی', highlight: true,
  },
  {
    id: 'scale', name: 'سازمانی', price: 199, priceLabel: '$۱۹۹', period: 'در ماه',
    blurb: 'برای پلتفرم‌های پرمصرف و سازمان‌ها.',
    requests: '۱۰٬۰۰۰٬۰۰۰', environments: 5, members: 50, webhooks: 100,
    retention: '۹۰ روز', rateLimit: '۲۵۰ درخواست در ثانیه', support: 'ویژه + Slack',
    cta: 'ارتقا', highlight: false,
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
  { category: 'security', severity: 'warning', title: 'ورود از دستگاه ناشناس', body: 'یک نشست جدید از تهران، ایران (91.98.14.2) ایجاد شد. اگر این شما نبوده‌اید، نشست را ابطال کنید.', env: null },
  { category: 'webhook', severity: 'error', title: 'خطا در تحویل وب‌هوک', body: 'رویداد customer.created در یک ساعت گذشته ۱۲ بار ناموفق بوده است. آخرین پاسخ: ۵۰۰.', env: 'live' },
  { category: 'rate-limit', severity: 'warning', title: 'محدودیت نرخ در ۸۵٪', body: 'completions:create به سقف مجاز در هر ثانیه نزدیک شده است. ممکن است درخواست‌ها محدود شوند.', env: 'live' },
  { category: 'billing', severity: 'info', title: 'پرداخت فاکتور دریافت شد', body: 'فاکتور شهریور شما به مبلغ ۱۹۹ دلار با موفقیت پرداخت شد.', env: null },
  { category: 'deployment', severity: 'success', title: 'استقرار با موفقیت انجام شد', body: 'apiforge/api نسخهٔ v2.4.1 در ۴۲ ثانیه در محیط تولید مستقر شد.', env: 'live' },
  { category: 'team', severity: 'info', title: 'سارا یک عضو جدید دعوت کرد', body: 'ops@yourco.io با نقش «ناظر» دعوت شد.', env: null },
  { category: 'error', severity: 'error', title: 'افزایش ناگهانی خطا', body: 'خطای TypeError: Cannot read properties of null در یک ساعت گذشته ۳٫۲ برابر شده است.', env: 'live' },
  { category: 'security', severity: 'error', title: 'ایجاد کلید API در محیط تولید', body: 'یک کلید عملیاتی جدید (sk_live_4fJk…) از داشبورد ایجاد شد.', env: 'live' },
  { category: 'rate-limit', severity: 'error', title: 'عبور از محدودیت نرخ', body: '.embeddings:create از ۴۰ درخواست در ثانیه فراتر رفت. درخواست‌ها با کد ۴۲۹ پاسخ می‌گیرند.', env: 'staging' },
  { category: 'deployment', severity: 'warning', title: 'بازگشت استقرار', body: 'نسخهٔ v2.4.2 از apiforge/api پس از ناموفق‌بودن بررسی سلامت بازگردانده شد.', env: 'staging' },
  { category: 'billing', severity: 'warning', title: 'پرداخت فاکتور ناموفق بود', body: 'پرداخت فاکتور تیر انجام نشد. برای جلوگیری از اختلال در سرویس، روش پرداخت را به‌روزرسانی کنید.', env: null },
  { category: 'team', severity: 'info', title: 'تعلیق دانا', body: 'سارا دسترسی دانا مرادی را در فضای کاری تعلیق کرد.', env: null },
  { category: 'webhook', severity: 'info', title: 'وب‌هوک ایجاد شد', body: 'یک نقطهٔ پایانی جدید برای رویدادهای email.sent و email.bounced ثبت شد.', env: 'test' },
  { category: 'error', severity: 'warning', title: 'شناسایی نوع خطای جدید', body: 'خطای ECONNREFUSED 10.0.2.15:5432 نخستین‌بار روی GET /v1/usage دیده شد.', env: 'staging' },
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
    features: ['تایپ‌های TypeScript', 'پشتیبانی از جریان', 'تلاش مجدد و یکتایی', 'ابزار بررسی امضای وب‌هوک'],
    docsUrl: './docs.html',
  },
  {
    id: 'node', name: 'Node.js', lang: 'Node', accent: 'node',
    package: 'apiforge', version: '2.1.0', install: 'npm install apiforge',
    registry: 'npm', updated: isoDaysAgoC(9),
    features: ['بدون وابستگی', 'پشتیبانی از جریان', 'تلاش مجدد و یکتایی', 'سازگار با ESM و CJS'],
    docsUrl: './docs.html',
  },
  {
    id: 'python', name: 'Python', lang: 'Py', accent: 'py',
    package: 'apiforge', version: '1.4.1', install: 'pip install apiforge',
    registry: 'PyPI', updated: isoDaysAgoC(14),
    features: ['کلاینت همزمان و ناهمزمان', 'پاسخ‌های تایپ‌شده', 'تلاش مجدد و یکتایی', 'فیکسچرهای pytest'],
    docsUrl: './docs.html',
  },
  {
    id: 'php', name: 'PHP', lang: 'PHP', accent: 'php',
    package: 'apiforge/apiforge-php', version: '0.9.3', install: 'composer require apiforge/apiforge-php',
    registry: 'Packagist', updated: isoDaysAgoC(22),
    features: ['سازگار با PSR-18', 'انتقال بر پایهٔ Guzzle', 'ابزار بررسی امضای وب‌هوک'],
    docsUrl: './docs.html',
  },
  {
    id: 'go', name: 'Go', lang: 'Go', accent: 'go',
    package: 'github.com/apiforge/apiforge-go', version: '1.2.4', install: 'go get github.com/apiforge/apiforge-go',
    registry: 'Go modules', updated: isoDaysAgoC(11),
    features: ['آگاه از context', 'بدون تخصیص حافظه در مسیر پرمصرف', 'تلاش مجدد و یکتایی'],
    docsUrl: './docs.html',
  },
  {
    id: 'ruby', name: 'Ruby', lang: 'Rb', accent: 'rb',
    package: 'apiforge', version: '0.8.0', install: 'gem install apiforge',
    registry: 'RubyGems', updated: isoDaysAgoC(30),
    features: ['یکپارچه با ActiveSupport', 'تلاش مجدد و یکتایی', 'ابزار بررسی امضای وب‌هوک'],
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
