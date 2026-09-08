// =============================================================
// APIForge X — Documentation content (authored, not generated)
// Structured article data for docs.html. Blocks render through a
// small engine in pages/docs.js: h2/h3/p/ul/code/callout/table/json.
// Inline `code` spans are marked with backticks in paragraphs.
// Keep it credible and technical — no lorem ipsum.
// =============================================================

const CURL = (method, path, body) =>
  `curl ${method === 'GET' ? '' : `-X ${method} `}https://api.apiforge.dev${path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${body ? ` \\
  -d '${body}'` : ''}`;

const NODE = (method, path, body) =>
  `import { ApiForge } from '@apiforge/sdk';

const client = new ApiForge('YOUR_API_KEY');
${body ? `await client.request('${method}', '${path}', ${body});` : `await client.request('${method}', '${path}');`}`;

const PY = (method, path) =>
  `import apiforge

client = apiforge.Client("YOUR_API_KEY")
resp = client.request("${method}", "${path}")
print(resp.status, resp.json())`;

const PHP = (method, path) =>
  `use ApiForge\\Client;

$client = new Client('YOUR_API_KEY');
$response = $client->request('${method}', '${path}');
echo $response->statusCode();`;

const AUTH_HEADERS = `Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`;

export const docGroups = [
  { label: 'Getting started', items: ['intro', 'quickstart', 'authentication', 'first-request'] },
  { label: 'Core concepts', items: ['api-keys', 'environments', 'endpoints', 'requests-responses', 'errors', 'rate-limits'] },
  { label: 'Integrations', items: ['js', 'node', 'python', 'php', 'curl'] },
  { label: 'Webhooks', items: ['webhooks-overview', 'webhooks-create', 'webhooks-signature', 'webhooks-retries'] },
  { label: 'Reference', items: ['api-reference', 'error-codes', 'status-codes'] },
];

export const docArticles = {
  intro: {
    id: 'intro',
    title: 'Introduction',
    lead: 'APIForge is a developer API platform for shipping transactional email, AI inference and audiences. This guide gets you from a fresh workspace to your first production request.',
    blocks: [
      { type: 'h2', text: 'What you can build' },
      { type: 'p', text: 'The platform exposes a single, versioned REST API over HTTPS. Every resource — `emails`, `completions`, `audiences`, `webhooks` — follows the same conventions for authentication, pagination, errors and idempotency, so one mental model covers the whole surface.' },
      { type: 'ul', items: ['Send transactional email and track delivery status', 'Run model inference with `forge-1` and `embed-1`', 'Build audience segments for lifecycle messaging', 'Receive real-time events through signed webhooks'] },
      { type: 'h2', text: 'Base URL' },
      { type: 'p', text: 'All requests target the live environment by default. Switch to the Test environment to develop without affecting production data.' },
      { type: 'code', label: 'Base URLs', tabs: [
        { lang: 'Live', code: 'https://api.apiforge.dev' },
        { lang: 'Test', code: 'https://api.test.apiforge.dev' },
      ] },
      { type: 'callout', tone: 'info', title: 'New to APIForge?', body: 'Follow the quickstart to send a real request in under two minutes.' },
    ],
  },

  quickstart: {
    id: 'quickstart',
    title: 'Quickstart',
    lead: 'Create a key, choose an environment, and send your first API request.',
    blocks: [
      { type: 'h2', text: '1. Create an API key' },
      { type: 'p', text: 'Keys authenticate every request. In the dashboard, open `API Keys` and create a key with the `emails:write` scope. Copy it immediately — for security the full key is shown only once.' },
      { type: 'h2', text: '2. Set your key' },
      { type: 'p', text: 'Store the key as an environment variable and pass it as a Bearer token. Never hard-code it in source control.' },
      { type: 'code', label: 'Terminal', tabs: [
        { lang: 'Shell', code: 'export APIFORGE_API_KEY=sk_live_4fJk9Lm2XpQz7RvW' },
      ] },
      { type: 'h2', text: '3. Send a request' },
      { type: 'p', text: 'The example below queues a transactional email and returns an `eml_…` id you can use to track delivery.' },
      { type: 'code', label: 'Send an email', tabs: [
        { lang: 'cURL', code: CURL('POST', '/v1/emails', '{"to":"user@example.com","subject":"Welcome","html":"<p>Thanks for signing up.</p>"}') },
        { lang: 'Node', code: NODE('POST', '/v1/emails', "{ to: 'user@example.com', subject: 'Welcome', html: '<p>Thanks for signing up.</p>' }") },
        { lang: 'Python', code: `import apiforge

client = apiforge.Client("YOUR_API_KEY")
resp = client.emails.send(
    to="user@example.com",
    subject="Welcome",
    html="<p>Thanks for signing up.</p>",
)
print(resp.id)  # eml_8Fk2mQx1Zw` },
      ] },
      { type: 'h2', text: '4. Check the response' },
      { type: 'json', label: '200 response', code: '{\n  "id": "eml_8Fk2mQx1Zw",\n  "status": "queued",\n  "to": "user@example.com"\n}' },
      { type: 'callout', tone: 'success', title: 'You are in', body: 'If you received an `eml_…` id, authentication works. Continue to Core concepts to understand keys, environments and errors.' },
    ],
  },

  authentication: {
    id: 'authentication',
    title: 'Authentication',
    lead: 'Every request is authenticated with an API key sent as a Bearer token.',
    blocks: [
      { type: 'h2', text: 'Bearer tokens' },
      { type: 'p', text: 'Pass your key in the `Authorization` header. Live keys use the `sk_live_` prefix and act on production data; test keys use `sk_test_` and act on sandbox data.' },
      { type: 'code', label: 'Headers', tabs: [
        { lang: 'HTTP', code: AUTH_HEADERS },
        { lang: 'cURL', code: CURL('GET', '/v1/models') },
      ] },
      { type: 'h2', text: 'Scopes' },
      { type: 'p', text: 'Keys are restricted by scope. A key with `emails:write` can send email but cannot create audiences. Least privilege is enforced per key, not per user.' },
      { type: 'table', headers: ['Scope', 'Allows'], rows: [
        ['emails:read', 'List and retrieve emails'],
        ['emails:write', 'Send transactional email'],
        ['audiences:write', 'Create and update audiences'],
        ['webhooks:write', 'Register webhook endpoints'],
      ] },
      { type: 'h2', text: 'Errors' },
      { type: 'p', text: 'A missing or revoked key returns `401 invalid_api_key`. See Error codes for the full list and how to fix each one.' },
    ],
  },

  'first-request': {
    id: 'first-request',
    title: 'First API request',
    lead: 'Walk through a complete request and response, field by field.',
    blocks: [
      { type: 'h2', text: 'Request' },
      { type: 'code', label: 'cURL', tabs: [
        { lang: 'cURL', code: CURL('POST', '/v1/completions', '{"model":"forge-1","prompt":"Summarize the release notes.","max_tokens":256}') },
      ] },
      { type: 'h2', text: 'Request body' },
      { type: 'table', headers: ['Field', 'Type', 'Required', 'Description'], rows: [
        ['model', 'string', 'yes', 'Model id: forge-1 or forge-1-turbo'],
        ['prompt', 'string', 'yes', 'The prompt to complete'],
        ['max_tokens', 'integer', 'no', 'Maximum tokens to generate (default 256)'],
        ['temperature', 'number', 'no', 'Sampling temperature between 0 and 1'],
      ] },
      { type: 'h2', text: 'Response' },
      { type: 'json', label: '200 response', code: '{\n  "id": "cmpl_9xK2mQ",\n  "model": "forge-1",\n  "choices": [\n    { "text": "Hello from Forge." }\n  ]\n}' },
      { type: 'callout', tone: 'info', title: 'Idempotency', body: 'Pass an `Idempotency-Key` header to safely retry requests without duplicating side effects.' },
    ],
  },

  'api-keys': {
    id: 'api-keys',
    title: 'API keys',
    lead: 'Keys are the identity of your integration. Manage them per environment and scope.',
    blocks: [
      { type: 'h2', text: 'Key lifecycle' },
      { type: 'p', text: 'Keys can be created, revealed once, rotated and revoked. Rotation generates a new key and immediately invalidates the old one — no downtime if you swap the key in your integration first.' },
      { type: 'ul', items: ['Create keys per environment: live keys for production, test keys for development', 'Rotate on a schedule and when a key may have leaked', 'Revoke immediately when a key is compromised'] },
      { type: 'h2', text: 'Prefixes' },
      { type: 'p', text: 'Key prefixes are safe to log and display: `sk_live_…` for production and `sk_test_…` for the sandbox. The full key is sensitive and is only shown once at creation.' },
      { type: 'code', label: 'Example', tabs: [
        { lang: 'Live key', code: 'sk_live_4fJk9Lm2XpQz7RvW' },
        { lang: 'Test key', code: 'sk_test_4fJk9Lm2XpQz7RvW' },
      ] },
    ],
  },

  environments: {
    id: 'environments',
    title: 'Environments',
    lead: 'Develop against the sandbox, ship against production.',
    blocks: [
      { type: 'h2', text: 'Test vs live' },
      { type: 'p', text: 'Each environment has isolated data, keys and variables. The Test environment never sends real email or triggers real webhooks, so you can iterate safely.' },
      { type: 'table', headers: ['Environment', 'Base URL', 'Purpose'], rows: [
        ['Live', 'https://api.apiforge.dev', 'Production traffic'],
        ['Staging', 'https://api.staging.apiforge.dev', 'Pre-release validation'],
        ['Development', 'https://api.test.apiforge.dev', 'Local and CI development'],
      ] },
      { type: 'h2', text: 'Environment variables' },
      { type: 'p', text: 'Store secrets per environment under `Environments`. Values are write-only — you can set and copy them, but never read them back.' },
    ],
  },

  endpoints: {
    id: 'endpoints',
    title: 'Endpoints',
    lead: 'Resources and operations that make up the API surface.',
    blocks: [
      { type: 'h2', text: 'Conventions' },
      { type: 'p', text: 'Paths are versioned under `/v1`. Resource ids are opaque strings with a type prefix — `eml_…` for emails, `cmpl_…` for completions, `aud_…` for audiences.' },
      { type: 'ul', items: ['`POST` creates resources', '`GET` lists or retrieves', '`DELETE` removes resources'] },
      { type: 'callout', tone: 'info', title: 'Full reference', body: 'Browse every endpoint with parameters, schemas and examples in the API Reference.' },
    ],
  },

  'requests-responses': {
    id: 'requests-responses',
    title: 'Requests & responses',
    lead: 'Pagination, timestamps and response shapes.',
    blocks: [
      { type: 'h2', text: 'Pagination' },
      { type: 'p', text: 'List endpoints accept `limit` (default 50, max 100) and cursor-based `before`. The response includes `has_more` to indicate another page.' },
      { type: 'json', label: 'List response', code: '{\n  "data": [ { "id": "eml_8Fk2mQx1Zw" } ],\n  "has_more": true\n}' },
      { type: 'h2', text: 'Timestamps' },
      { type: 'p', text: 'All timestamps are ISO 8601 in UTC, e.g. `2026-09-07T19:05:24Z`.' },
    ],
  },

  errors: {
    id: 'errors',
    title: 'Errors',
    lead: 'Errors are structured and actionable.',
    blocks: [
      { type: 'h2', text: 'Error shape' },
      { type: 'p', text: 'Errors return an object with a machine-readable `code`, a human `message` and a `docs` link.' },
      { type: 'json', label: 'Error response', code: '{\n  "error": {\n    "code": "invalid_api_key",\n    "message": "The Authorization header was missing or invalid.",\n    "docs": "https://docs.apiforge.dev/errors/invalid_api_key"\n  }\n}' },
      { type: 'callout', tone: 'warning', title: 'Retry with care', body: 'Only retry idempotent requests, and always use exponential backoff for `429` and `5xx` responses.' },
    ],
  },

  'rate-limits': {
    id: 'rate-limits',
    title: 'Rate limits',
    lead: 'Limits protect the platform and are reported per response.',
    blocks: [
      { type: 'h2', text: 'How limits work' },
      { type: 'p', text: 'Limits are enforced per key and per endpoint, with a global workspace ceiling. Responses include the remaining budget in headers.' },
      { type: 'code', label: 'Rate limit headers', tabs: [
        { lang: 'HTTP', code: 'RateLimit-Limit: 50\nRateLimit-Remaining: 12\nRateLimit-Reset: 6s' },
      ] },
      { type: 'h2', text: 'Handling 429' },
      { type: 'p', text: 'When you exceed a limit, the API returns `429 rate_limit_exceeded` with a `Retry-After` header. Back off and retry after the reset window.' },
    ],
  },

  js: {
    id: 'js',
    title: 'JavaScript',
    lead: 'Official browser SDK with TypeScript types.',
    blocks: [
      { type: 'h2', text: 'Install' },
      { type: 'code', label: 'Install', tabs: [
        { lang: 'npm', code: 'npm install @apiforge/sdk' },
        { lang: 'yarn', code: 'yarn add @apiforge/sdk' },
      ] },
      { type: 'h2', text: 'Usage' },
      { type: 'code', label: 'Send an email', tabs: [
        { lang: 'JavaScript', code: `import { ApiForge } from '@apiforge/sdk';

const api = new ApiForge('YOUR_API_KEY');

const email = await api.emails.send({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Thanks for signing up.</p>',
});
console.log(email.id); // eml_8Fk2mQx1Zw` },
      ] },
    ],
  },

  node: {
    id: 'node',
    title: 'Node.js',
    lead: 'Zero-dependency client for server-side integration.',
    blocks: [
      { type: 'h2', text: 'Install' },
      { type: 'code', label: 'Install', tabs: [
        { lang: 'npm', code: 'npm install apiforge' },
      ] },
      { type: 'h2', text: 'Usage' },
      { type: 'code', label: 'List models', tabs: [
        { lang: 'Node.js', code: NODE('GET', '/v1/models') },
      ] },
    ],
  },

  python: {
    id: 'python',
    title: 'Python',
    lead: 'Async and sync clients with typed responses.',
    blocks: [
      { type: 'h2', text: 'Install' },
      { type: 'code', label: 'Install', tabs: [
        { lang: 'pip', code: 'pip install apiforge' },
        { lang: 'poetry', code: 'poetry add apiforge' },
      ] },
      { type: 'h2', text: 'Usage' },
      { type: 'code', label: 'Create a completion', tabs: [
        { lang: 'Python', code: `import apiforge

client = apiforge.Client("YOUR_API_KEY")
resp = client.completions.create(
    model="forge-1",
    prompt="Summarize the release notes.",
)
print(resp.choices[0].text)` },
      ] },
    ],
  },

  php: {
    id: 'php',
    title: 'PHP',
    lead: 'PSR-18 compatible client over Guzzle.',
    blocks: [
      { type: 'h2', text: 'Install' },
      { type: 'code', label: 'Install', tabs: [
        { lang: 'composer', code: 'composer require apiforge/apiforge-php' },
      ] },
      { type: 'h2', text: 'Usage' },
      { type: 'code', label: 'Send an email', tabs: [
        { lang: 'PHP', code: PHP('POST', '/v1/emails') },
      ] },
    ],
  },

  curl: {
    id: 'curl',
    title: 'cURL',
    lead: 'Every endpoint is callable from the command line.',
    blocks: [
      { type: 'h2', text: 'List models' },
      { type: 'code', label: 'cURL', tabs: [
        { lang: 'cURL', code: CURL('GET', '/v1/models') },
      ] },
      { type: 'h2', text: 'Create an audience' },
      { type: 'code', label: 'cURL', tabs: [
        { lang: 'cURL', code: CURL('POST', '/v1/audiences', '{"name":"Trial users"}') },
      ] },
    ],
  },

  'webhooks-overview': {
    id: 'webhooks-overview',
    title: 'Webhooks overview',
    lead: 'Receive real-time events instead of polling.',
    blocks: [
      { type: 'h2', text: 'How they work' },
      { type: 'p', text: 'When an event occurs — an email is delivered, a payment fails — APIForge sends an HTTP `POST` to your endpoint with a JSON payload. Each delivery includes a signature so you can verify authenticity.' },
      { type: 'ul', items: ['At-least-once delivery with automatic retries', 'Signature verification with your signing secret', 'Per-endpoint delivery logs for debugging'] },
      { type: 'h2', text: 'Event example' },
      { type: 'json', label: 'email.sent', code: '{\n  "id": "evt_9xK2mQ",\n  "type": "email.sent",\n  "created": 1725735924,\n  "data": {\n    "id": "eml_8Fk2mQx1Zw",\n    "to": "user@example.com"\n  }\n}' },
    ],
  },

  'webhooks-create': {
    id: 'webhooks-create',
    title: 'Creating a webhook',
    lead: 'Register an endpoint and subscribe to events.',
    blocks: [
      { type: 'h2', text: 'Register an endpoint' },
      { type: 'p', text: 'Provide an HTTPS URL and the events to subscribe to. A signing secret is generated for you — store it securely.' },
      { type: 'code', label: 'cURL', tabs: [
        { lang: 'cURL', code: CURL('POST', '/v1/webhooks', '{"url":"https://example.com/hooks","events":["email.sent","email.bounced"]}') },
      ] },
      { type: 'callout', tone: 'warning', title: 'HTTPS only', body: 'Webhook URLs must use HTTPS. HTTP endpoints are rejected.' },
    ],
  },

  'webhooks-signature': {
    id: 'webhooks-signature',
    title: 'Signature verification',
    lead: 'Verify that a delivery really came from APIForge.',
    blocks: [
      { type: 'h2', text: 'The signature header' },
      { type: 'p', text: 'Each delivery includes an `ApiForge-Signature` header: an HMAC-SHA256 hex digest of the raw request body, keyed by your signing secret, prefixed with a timestamp.' },
      { type: 'code', label: 'Verify (Node)', tabs: [
        { lang: 'Node.js', code: `import { createHmac, timingSafeEqual } from 'node:crypto';

function verify(payload, signature, secret) {
  const [t, v1] = signature.split(',');
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  return timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}` },
      ] },
      { type: 'callout', tone: 'info', title: 'Use the helper', body: 'Every official SDK ships a webhook signature helper — do not hand-roll verification.' },
    ],
  },

  'webhooks-retries': {
    id: 'webhooks-retries',
    title: 'Retry behavior',
    lead: 'Failed deliveries are retried automatically.',
    blocks: [
      { type: 'h2', text: 'Retry schedule' },
      { type: 'p', text: 'A delivery that returns a non-2xx status is retried with exponential backoff: after 2 minutes, then 5, 15, 60 and 300 minutes, for up to 24 hours.' },
      { type: 'ul', items: ['Retries stop on the first 2xx response', 'A 410 Gone response disables the endpoint', 'You can retry a delivery manually from the dashboard'] },
      { type: 'callout', tone: 'warning', title: 'Make handlers idempotent', body: 'Your endpoint must tolerate duplicate deliveries — use the event `id` to deduplicate.' },
    ],
  },

  'api-reference': {
    id: 'api-reference',
    title: 'API Reference',
    lead: 'Structured reference for every endpoint.',
    blocks: [
      { type: 'p', text: 'The full reference — grouped by service, with parameters, request bodies, response schemas and code samples — lives in the dedicated API Reference.' },
      { type: 'callout', tone: 'info', title: 'Open the reference', body: 'Use the API Reference page for the complete endpoint catalog.' },
    ],
  },

  'error-codes': {
    id: 'error-codes',
    title: 'Error codes',
    lead: 'Machine-readable codes and what to do about each.',
    blocks: [
      { type: 'table', headers: ['Code', 'Meaning', 'Fix'], rows: [
        ['invalid_api_key', 'Missing or invalid Authorization header', 'Pass a valid Bearer token'],
        ['invalid_request', 'The request body could not be parsed', 'Check field names and types'],
        ['not_found', 'The resource does not exist', 'Verify the id in the path'],
        ['rate_limit_exceeded', 'You exceeded a rate limit', 'Back off and retry after reset'],
        ['insufficient_scope', 'The key lacks a required scope', 'Use a key with broader grants'],
      ] },
    ],
  },

  'status-codes': {
    id: 'status-codes',
    title: 'Status codes',
    lead: 'The API uses conventional HTTP status codes.',
    blocks: [
      { type: 'table', headers: ['Code', 'Meaning'], rows: [
        ['200', 'OK — the request succeeded'],
        ['201', 'Created — a resource was created'],
        ['400', 'Bad request — the input is invalid'],
        ['401', 'Unauthorized — the key is missing or invalid'],
        ['403', 'Forbidden — the key lacks the scope'],
        ['404', 'Not found — the resource does not exist'],
        ['429', 'Too many requests — rate limited'],
        ['500', 'Internal server error'],
      ] },
    ],
  },
};

/** Flattened, ordered article list (for prev/next navigation). */
export const docOrder = docGroups.flatMap((g) => g.items);
