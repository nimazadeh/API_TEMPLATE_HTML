// =============================================================
// APIForge X — Documentation content (Persian / fa)
// Persian mirror of docs-content.en.js. Structure and code
// samples are identical — only prose, labels and table cells
// are translated. Technical identifiers stay Latin/LTR.
// =============================================================

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
  { label: 'شروع به کار', items: ['intro', 'quickstart', 'authentication', 'first-request'] },
  { label: 'مفاهیم پایه', items: ['api-keys', 'environments', 'endpoints', 'requests-responses', 'errors', 'rate-limits'] },
  { label: 'یکپارچه‌سازی', items: ['js', 'node', 'python', 'php', 'curl'] },
  { label: 'وب‌هوک‌ها', items: ['webhooks-overview', 'webhooks-create', 'webhooks-signature', 'webhooks-retries'] },
  { label: 'مرجع', items: ['api-reference', 'error-codes', 'status-codes'] },
];

export const docArticles = {
  intro: {
    id: 'intro',
    title: 'مقدمه',
    lead: 'APIForge یک پلتفرم API برای توسعه‌دهندگان است که ارسال ایمیل تراکنشی، استنتاج مدل‌های هوش مصنوعی و مدیریت مخاطبان را ممکن می‌کند. این راهنما شما را از یک فضای کاری تازه تا نخستین درخواست در محیط تولید همراهی می‌کند.',
    blocks: [
      { type: 'h2', text: 'چه چیزهایی می‌توانید بسازید' },
      { type: 'p', text: 'این پلتفرم یک REST API نسخه‌بندی‌شدهٔ واحد روی HTTPS ارائه می‌دهد. همهٔ منابع — `emails`، `completions`، `audiences`، `webhooks` — از قراردادهای یکسانی برای احراز هویت، صفحه‌بندی، خطاها و یکتایی درخواست پیروی می‌کنند؛ پس با یک مدل ذهنی می‌توانید کل سطح API را پوشش دهید.' },
      { type: 'ul', items: ['ارسال ایمیل تراکنشی و پیگیری وضعیت تحویل', 'اجرای استنتاج با مدل‌های `forge-1` و `embed-1`', 'ساخت بخش‌بندی مخاطبان برای پیام‌رسانی چرخهٔ عمر', 'دریافت رویدادهای لحظه‌ای از طریق وب‌هوک‌های امضاشده'] },
      { type: 'h2', text: 'نشانی پایه' },
      { type: 'p', text: 'به‌طور پیش‌فرض همهٔ درخواست‌ها به محیط عملیاتی ارسال می‌شوند. برای توسعه بدون تأثیر بر داده‌های تولید، به محیط آزمایشی سوئیچ کنید.' },
      { type: 'code', label: 'نشانی‌های پایه', tabs: [
        { lang: 'عملیاتی', code: 'https://api.apiforge.dev' },
        { lang: 'آزمایشی', code: 'https://api.test.apiforge.dev' },
      ] },
      { type: 'callout', tone: 'info', title: 'تازه با APIForge آشنا شده‌اید؟', body: 'راهنمای شروع سریع را دنبال کنید تا در کمتر از دو دقیقه یک درخواست واقعی ارسال کنید.' },
    ],
  },

  quickstart: {
    id: 'quickstart',
    title: 'شروع سریع',
    lead: 'یک کلید بسازید، محیط را انتخاب کنید و نخستین درخواست API خود را ارسال کنید.',
    blocks: [
      { type: 'h2', text: '۱. ساخت کلید API' },
      { type: 'p', text: 'هر درخواست با کلید احراز هویت می‌شود. در داشبورد بخش «کلیدهای API» را باز کنید و کلیدی با حوزهٔ دسترسی `emails:write` بسازید. همان لحظه آن را کپی کنید — به دلایل امنیتی کلید کامل تنها یک‌بار نمایش داده می‌شود.' },
      { type: 'h2', text: '۲. تنظیم کلید' },
      { type: 'p', text: 'کلید را در یک متغیر محیطی ذخیره کنید و به‌صورت توکن Bearer ارسال کنید. هرگز آن را مستقیماً در کد منبع قرار ندهید.' },
      { type: 'code', label: 'ترمینال', tabs: [
        { lang: 'شل', code: 'export APIFORGE_API_KEY=sk_live_4fJk9Lm2XpQz7RvW' },
      ] },
      { type: 'h2', text: '۳. ارسال درخواست' },
      { type: 'p', text: 'مثال زیر یک ایمیل تراکنشی را در صف قرار می‌دهد و شناسه‌ای با الگوی `eml_…` برمی‌گرداند که با آن می‌توانید وضعیت تحویل را پیگیری کنید.' },
      { type: 'code', label: 'ارسال ایمیل', tabs: [
        { lang: 'cURL', code: CURL('POST', '/v1/emails', '{"to":"user@example.com","subject":"Welcome","html":"<p>Thanks for signing up.</p>"}') },
        { lang: 'Node', code: NODE('POST', '/v1/emails', "{ to: 'user@example.com', subject: 'Welcome', html: '<p>Thanks for signing up.</p>' }") },
        { lang: 'پایتون', code: `import apiforge

client = apiforge.Client("YOUR_API_KEY")
resp = client.emails.send(
    to="user@example.com",
    subject="Welcome",
    html="<p>Thanks for signing up.</p>",
)
print(resp.id)  # eml_8Fk2mQx1Zw` },
      ] },
      { type: 'h2', text: '۴. بررسی پاسخ' },
      { type: 'json', label: 'پاسخ ۲۰۰', code: '{\n  "id": "eml_8Fk2mQx1Zw",\n  "status": "queued",\n  "to": "user@example.com"\n}' },
      { type: 'callout', tone: 'success', title: 'وارد شدید', body: 'اگر شناسه‌ای با الگوی `eml_…` دریافت کردید، احراز هویت به‌درستی کار می‌کند. برای آشنایی با کلیدها، محیط‌ها و خطاها به بخش مفاهیم پایه بروید.' },
    ],
  },

  authentication: {
    id: 'authentication',
    title: 'احراز هویت',
    lead: 'هر درخواست با یک کلید API که به‌صورت توکن Bearer ارسال می‌شود احراز هویت می‌گردد.',
    blocks: [
      { type: 'h2', text: 'توکن‌های Bearer' },
      { type: 'p', text: 'کلید خود را در هدر `Authorization` ارسال کنید. کلیدهای عملیاتی با پیشوند `sk_live_` روی داده‌های تولید اثر می‌گذارند و کلیدهای آزمایشی با پیشوند `sk_test_` روی داده‌های محیط آزمایشی.' },
      { type: 'code', label: 'هدرها', tabs: [
        { lang: 'HTTP', code: AUTH_HEADERS },
        { lang: 'cURL', code: CURL('GET', '/v1/models') },
      ] },
      { type: 'h2', text: 'حوزه‌های دسترسی' },
      { type: 'p', text: 'کلیدها بر اساس حوزهٔ دسترسی محدود می‌شوند. کلیدی با `emails:write` می‌تواند ایمیل ارسال کند اما نمی‌تواند مخاطب بسازد. اصل کمینهٔ دسترسی برای هر کلید اعمال می‌شود؛ نه برای هر کاربر.' },
      { type: 'table', headers: ['حوزهٔ دسترسی', 'مجاز به'], rows: [
        ['emails:read', 'فهرست کردن و دریافت ایمیل‌ها'],
        ['emails:write', 'ارسال ایمیل تراکنشی'],
        ['audiences:write', 'ایجاد و به‌روزرسانی مخاطبان'],
        ['webhooks:write', 'ثبت نقاط پایانی وب‌هوک'],
      ] },
      { type: 'h2', text: 'خطاها' },
      { type: 'p', text: 'کلیدِ ارسال‌نشده یا ابطال‌شده خطای `401 invalid_api_key` برمی‌گرداند. برای فهرست کامل و روش رفع هر مورد، بخش کدهای خطا را ببینید.' },
    ],
  },

  'first-request': {
    id: 'first-request',
    title: 'نخستین درخواست API',
    lead: 'یک درخواست و پاسخ کامل را فیلدبه‌فیلد مرور کنید.',
    blocks: [
      { type: 'h2', text: 'درخواست' },
      { type: 'code', label: 'cURL', tabs: [
        { lang: 'cURL', code: CURL('POST', '/v1/completions', '{"model":"forge-1","prompt":"Summarize the release notes.","max_tokens":256}') },
      ] },
      { type: 'h2', text: 'بدنهٔ درخواست' },
      { type: 'table', headers: ['فیلد', 'نوع', 'الزامی', 'توضیح'], rows: [
        ['model', 'string', 'بله', 'شناسهٔ مدل: forge-1 یا forge-1-turbo'],
        ['prompt', 'string', 'بله', 'دستوری که باید تکمیل شود'],
        ['max_tokens', 'integer', 'خیر', 'حداکثر توکن تولیدی (پیش‌فرض ۲۵۶)'],
        ['temperature', 'number', 'خیر', 'دمای نمونه‌برداری بین ۰ و ۱'],
      ] },
      { type: 'h2', text: 'پاسخ' },
      { type: 'json', label: 'پاسخ ۲۰۰', code: '{\n  "id": "cmpl_9xK2mQ",\n  "model": "forge-1",\n  "choices": [\n    { "text": "Hello from Forge." }\n  ]\n}' },
      { type: 'callout', tone: 'info', title: 'یکتایی درخواست', body: 'هدر `Idempotency-Key` را ارسال کنید تا بتوانید درخواست‌ها را بدون ایجاد اثر تکراری دوباره تلاش کنید.' },
    ],
  },

  'api-keys': {
    id: 'api-keys',
    title: 'کلیدهای API',
    lead: 'کلیدها هویت یکپارچه‌سازی شما هستند. آن‌ها را به تفکیک محیط و حوزهٔ دسترسی مدیریت کنید.',
    blocks: [
      { type: 'h2', text: 'چرخهٔ عمر کلید' },
      { type: 'p', text: 'کلیدها قابل ایجاد، نمایش یک‌باره، چرخش و ابطال هستند. چرخش، کلید جدیدی تولید می‌کند و کلید قبلی را بلافاصله بی‌اعتبار می‌سازد — اگر ابتدا کلید جدید را در سیستم خود جایگزین کنید، هیچ توقفی رخ نمی‌دهد.' },
      { type: 'ul', items: ['برای هر محیط کلید جداگانه بسازید: کلید عملیاتی برای تولید و کلید آزمایشی برای توسعه', 'کلیدها را طبق برنامه و هر زمان که احتمال نشت وجود دارد چرخش دهید', 'در صورت به خطر افتادن کلید، بلافاصله آن را ابطال کنید'] },
      { type: 'h2', text: 'Prefixes' },
      { type: 'p', text: 'پیشوند کلیدها برای ثبت در لاگ و نمایش امن است: `sk_live_…` برای تولید و `sk_test_…` برای محیط آزمایشی. خود کلید محرمانه است و تنها یک‌بار هنگام ایجاد نمایش داده می‌شود.' },
      { type: 'code', label: 'Example', tabs: [
        { lang: 'کلید عملیاتی', code: 'sk_live_4fJk9Lm2XpQz7RvW' },
        { lang: 'کلید آزمایشی', code: 'sk_test_4fJk9Lm2XpQz7RvW' },
      ] },
    ],
  },

  environments: {
    id: 'environments',
    title: 'محیط‌ها',
    lead: 'در محیط آزمایشی توسعه دهید و در محیط تولید عرضه کنید.',
    blocks: [
      { type: 'h2', text: 'آزمایشی در برابر عملیاتی' },
      { type: 'p', text: 'هر محیط داده‌ها، کلیدها و متغیرهای جداگانهٔ خود را دارد. محیط آزمایشی هرگز ایمیل واقعی ارسال نمی‌کند و وب‌هوک واقعی نمی‌فرستد؛ بنابراین می‌توانید با خیال راحت توسعه دهید.' },
      { type: 'table', headers: ['Environment', 'نشانی پایه', 'Purpose'], rows: [
        ['عملیاتی', 'https://api.apiforge.dev', 'ترافیک تولید'],
        ['Staging', 'https://api.staging.apiforge.dev', 'اعتبارسنجی پیش از عرضه'],
        ['Development', 'https://api.test.apiforge.dev', 'توسعهٔ محلی و CI'],
      ] },
      { type: 'h2', text: 'متغیرهای محیطی' },
      { type: 'p', text: 'مقادیر محرمانه را به تفکیک محیط در بخش «محیط‌ها» ذخیره کنید. مقدارها فقط نوشتنی هستند — می‌توانید آن‌ها را تنظیم و کپی کنید، اما هرگز نمی‌توانید دوباره بخوانیدشان.' },
    ],
  },

  endpoints: {
    id: 'endpoints',
    title: 'نقاط پایانی',
    lead: 'منابع و عملیات‌هایی که سطح API را می‌سازند.',
    blocks: [
      { type: 'h2', text: 'Conventions' },
      { type: 'p', text: 'مسیرها زیر `/v1` نسخه‌بندی شده‌اند. شناسهٔ منابع، رشته‌های نامشخص با پیشوند نوع هستند — `eml_…` برای ایمیل‌ها، `cmpl_…` برای تکمیل‌ها، `aud_…` برای مخاطبان.' },
      { type: 'ul', items: ['`POST` منابع را ایجاد می‌کند', '`GET` فهرست می‌گیرد یا دریافت می‌کند', '`DELETE` منابع را حذف می‌کند'] },
      { type: 'callout', tone: 'info', title: 'مرجع کامل', body: 'همهٔ نقاط پایانی را با پارامترها، طرح‌واره‌ها و مثال‌ها در مرجع API مرور کنید.' },
    ],
  },

  'requests-responses': {
    id: 'requests-responses',
    title: 'درخواست‌ها و پاسخ‌ها',
    lead: 'صفحه‌بندی، زمان‌ها و قالب پاسخ‌ها.',
    blocks: [
      { type: 'h2', text: 'Pagination' },
      { type: 'p', text: 'نقاط پایانی فهرستی، پارامترهای `limit` (پیش‌فرض ۵۰، حداکثر ۱۰۰) و `before` مبتنی بر نشانگر را می‌پذیرند. پاسخ شامل `has_more` برای نشان‌دادن وجود صفحهٔ بعد است.' },
      { type: 'json', label: 'پاسخ فهرست', code: '{\n  "data": [ { "id": "eml_8Fk2mQx1Zw" } ],\n  "has_more": true\n}' },
      { type: 'h2', text: 'Timestamps' },
      { type: 'p', text: 'همهٔ زمان‌ها در قالب ISO 8601 و با منطقهٔ زمانی UTC هستند، برای نمونه `2026-09-07T19:05:24Z`.' },
    ],
  },

  errors: {
    id: 'errors',
    title: 'خطاها',
    lead: 'خطاها ساختاریافته و همراه با گام بعدی هستند.',
    blocks: [
      { type: 'h2', text: 'قالب خطا' },
      { type: 'p', text: 'خطاها شیئی شامل `code` قابل خواندن توسط ماشین، `message` برای انسان و پیوند `docs` برمی‌گردانند.' },
      { type: 'json', label: 'پاسخ خطا', code: '{\n  "error": {\n    "code": "invalid_api_key",\n    "message": "The Authorization header was missing or invalid.",\n    "docs": "https://docs.apiforge.dev/errors/invalid_api_key"\n  }\n}' },
      { type: 'callout', tone: 'warning', title: 'با احتیاط تلاش مجدد کنید', body: 'فقط درخواست‌های یکتا را دوباره تلاش کنید و همیشه برای پاسخ‌های `429` و `5xx` از تأخیر نمایی استفاده کنید.' },
    ],
  },

  'rate-limits': {
    id: 'rate-limits',
    title: 'محدودیت نرخ',
    lead: 'محدودیت‌ها از پلتفرم محافظت می‌کنند و در هر پاسخ گزارش می‌شوند.',
    blocks: [
      { type: 'h2', text: 'محدودیت‌ها چگونه کار می‌کنند' },
      { type: 'p', text: 'محدودیت‌ها برای هر کلید و هر نقطهٔ پایانی اعمال می‌شوند و یک سقف کلی برای فضای کاری دارند. پاسخ‌ها مقدار باقی‌مانده را در هدرها نشان می‌دهند.' },
      { type: 'code', label: 'هدرهای محدودیت نرخ', tabs: [
        { lang: 'HTTP', code: 'RateLimit-Limit: 50\nRateLimit-Remaining: 12\nRateLimit-Reset: 6s' },
      ] },
      { type: 'h2', text: 'مدیریت خطای ۴۲۹' },
      { type: 'p', text: 'وقتی از سقف فراتر می‌روید، API خطای `429 rate_limit_exceeded` را همراه با هدر `Retry-After` برمی‌گرداند. تا پایان بازه صبر کنید و سپس دوباره تلاش کنید.' },
    ],
  },

  js: {
    id: 'js',
    title: 'جاوااسکریپت',
    lead: 'SDK رسمی مرورگر با تایپ‌های TypeScript.',
    blocks: [
      { type: 'h2', text: 'Install' },
      { type: 'code', label: 'Install', tabs: [
        { lang: 'npm', code: 'npm install @apiforge/sdk' },
        { lang: 'yarn', code: 'yarn add @apiforge/sdk' },
      ] },
      { type: 'h2', text: 'Usage' },
      { type: 'code', label: 'ارسال ایمیل', tabs: [
        { lang: 'جاوااسکریپت', code: `import { ApiForge } from '@apiforge/sdk';

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
    lead: 'کلاینت بدون وابستگی برای یکپارچه‌سازی سمت سرور.',
    blocks: [
      { type: 'h2', text: 'Install' },
      { type: 'code', label: 'Install', tabs: [
        { lang: 'npm', code: 'npm install apiforge' },
      ] },
      { type: 'h2', text: 'Usage' },
      { type: 'code', label: 'فهرست مدل‌ها', tabs: [
        { lang: 'Node.js', code: NODE('GET', '/v1/models') },
      ] },
    ],
  },

  python: {
    id: 'python',
    title: 'پایتون',
    lead: 'کلاینت‌های همزمان و ناهمزمان با پاسخ‌های تایپ‌شده.',
    blocks: [
      { type: 'h2', text: 'Install' },
      { type: 'code', label: 'Install', tabs: [
        { lang: 'pip', code: 'pip install apiforge' },
        { lang: 'poetry', code: 'poetry add apiforge' },
      ] },
      { type: 'h2', text: 'Usage' },
      { type: 'code', label: 'ایجاد تکمیل', tabs: [
        { lang: 'پایتون', code: `import apiforge

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
    lead: 'کلاینت سازگار با PSR-18 بر پایهٔ Guzzle.',
    blocks: [
      { type: 'h2', text: 'Install' },
      { type: 'code', label: 'Install', tabs: [
        { lang: 'composer', code: 'composer require apiforge/apiforge-php' },
      ] },
      { type: 'h2', text: 'Usage' },
      { type: 'code', label: 'ارسال ایمیل', tabs: [
        { lang: 'PHP', code: PHP('POST', '/v1/emails') },
      ] },
    ],
  },

  curl: {
    id: 'curl',
    title: 'cURL',
    lead: 'هر نقطهٔ پایانی را می‌توان از خط فرمان فراخوانی کرد.',
    blocks: [
      { type: 'h2', text: 'فهرست مدل‌ها' },
      { type: 'code', label: 'cURL', tabs: [
        { lang: 'cURL', code: CURL('GET', '/v1/models') },
      ] },
      { type: 'h2', text: 'ایجاد مخاطب' },
      { type: 'code', label: 'cURL', tabs: [
        { lang: 'cURL', code: CURL('POST', '/v1/audiences', '{"name":"Trial users"}') },
      ] },
    ],
  },

  'webhooks-overview': {
    id: 'webhooks-overview',
    title: 'معرفی وب‌هوک‌ها',
    lead: 'به‌جای پرس‌وجوی مداوم، رویدادها را لحظه‌ای دریافت کنید.',
    blocks: [
      { type: 'h2', text: 'نحوهٔ کار' },
      { type: 'p', text: 'وقتی رویدادی رخ می‌دهد — ایمیلی تحویل می‌شود، پرداختی ناموفق می‌ماند — APIForge یک درخواست `POST` با بدنهٔ JSON به نقطهٔ پایانی شما می‌فرستد. هر تحویل امضایی دارد که با آن می‌توانید اصالت پیام را بررسی کنید.' },
      { type: 'ul', items: ['تحویل حداقل یک‌بار با تلاش مجدد خودکار', 'بررسی امضا با کلید امضای شما', 'لاگ تحویل برای هر نقطهٔ پایانی جهت اشکال‌زدایی'] },
      { type: 'h2', text: 'نمونهٔ رویداد' },
      { type: 'json', label: 'email.sent', code: '{\n  "id": "evt_9xK2mQ",\n  "type": "email.sent",\n  "created": 1725735924,\n  "data": {\n    "id": "eml_8Fk2mQx1Zw",\n    "to": "user@example.com"\n  }\n}' },
    ],
  },

  'webhooks-create': {
    id: 'webhooks-create',
    title: 'ایجاد وب‌هوک',
    lead: 'یک نقطهٔ پایانی ثبت کنید و روی رویدادها مشترک شوید.',
    blocks: [
      { type: 'h2', text: 'ثبت نقطهٔ پایانی' },
      { type: 'p', text: 'یک نشانی HTTPS و رویدادهای مورد نظر را مشخص کنید. کلید امضا برای شما تولید می‌شود — آن را در جای امنی ذخیره کنید.' },
      { type: 'code', label: 'cURL', tabs: [
        { lang: 'cURL', code: CURL('POST', '/v1/webhooks', '{"url":"https://example.com/hooks","events":["email.sent","email.bounced"]}') },
      ] },
      { type: 'callout', tone: 'warning', title: 'فقط HTTPS', body: 'نشانی وب‌هوک باید با HTTPS باشد. نقاط پایانی با HTTP پذیرفته نمی‌شوند.' },
    ],
  },

  'webhooks-signature': {
    id: 'webhooks-signature',
    title: 'بررسی امضا',
    lead: 'مطمئن شوید تحویل واقعاً از سوی APIForge بوده است.',
    blocks: [
      { type: 'h2', text: 'هدر امضا' },
      { type: 'p', text: 'هر تحویل شامل هدر `ApiForge-Signature` است: چکیدهٔ هگز HMAC-SHA256 از بدنهٔ خام درخواست که با کلید امضای شما تولید و با یک زمان‌سنج پیشوندگذاری شده است.' },
      { type: 'code', label: 'بررسی (Node)', tabs: [
        { lang: 'Node.js', code: `import { createHmac, timingSafeEqual } from 'node:crypto';

function verify(payload, signature, secret) {
  const [t, v1] = signature.split(',');
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  return timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}` },
      ] },
      { type: 'callout', tone: 'info', title: 'از ابزار آماده استفاده کنید', body: 'هر SDK رسمی یک ابزار بررسی امضای وب‌هوک دارد — آن را خودتان پیاده‌سازی نکنید.' },
    ],
  },

  'webhooks-retries': {
    id: 'webhooks-retries',
    title: 'رفتار تلاش مجدد',
    lead: 'تحویل‌های ناموفق به‌طور خودکار دوباره تلاش می‌شوند.',
    blocks: [
      { type: 'h2', text: 'برنامهٔ تلاش مجدد' },
      { type: 'p', text: 'تحویلی که پاسخی غیر از ۲xx دریافت کند با تأخیر نمایی دوباره تلاش می‌شود: پس از ۲ دقیقه، سپس ۵، ۱۵، ۶۰ و ۳۰۰ دقیقه، تا حداکثر ۲۴ ساعت.' },
      { type: 'ul', items: ['با نخستین پاسخ ۲xx، تلاش‌ها متوقف می‌شود', 'پاسخ 410 Gone نقطهٔ پایانی را غیرفعال می‌کند', 'می‌توانید یک تحویل را به‌صورت دستی از داشبورد دوباره تلاش کنید'] },
      { type: 'callout', tone: 'warning', title: 'هندلرها را یکتا کنید', body: 'نقطهٔ پایانی شما باید تحویل‌های تکراری را تحمل کند — از `id` رویداد برای حذف موارد تکراری استفاده کنید.' },
    ],
  },

  'api-reference': {
    id: 'api-reference',
    title: 'مرجع API',
    lead: 'مرجع ساختاریافته برای هر نقطهٔ پایانی.',
    blocks: [
      { type: 'p', text: 'مرجع کامل — دسته‌بندی‌شده بر اساس سرویس، همراه با پارامترها، بدنهٔ درخواست، طرح‌وارهٔ پاسخ و نمونه‌کدها — در صفحهٔ اختصاصی مرجع API قرار دارد.' },
      { type: 'callout', tone: 'info', title: 'باز کردن مرجع', body: 'برای مشاهدهٔ کاتالوگ کامل نقاط پایانی، صفحهٔ مرجع API را باز کنید.' },
    ],
  },

  'error-codes': {
    id: 'error-codes',
    title: 'کدهای خطا',
    lead: 'کدهای قابل خواندن توسط ماشین و کاری که برای هر کدام باید انجام دهید.',
    blocks: [
      { type: 'table', headers: ['Code', 'معنا', 'راه حل'], rows: [
        ['invalid_api_key', 'هدر Authorization ارسال نشده یا نامعتبر است', 'یک توکن Bearer معتبر ارسال کنید'],
        ['invalid_request', 'بدنهٔ درخواست قابل تجزیه نبود', 'نام و نوع فیلدها را بررسی کنید'],
        ['not_found', 'منبع مورد نظر وجود ندارد', 'شناسهٔ موجود در مسیر را بررسی کنید'],
        ['rate_limit_exceeded', 'از محدودیت نرخ فراتر رفته‌اید', 'تا بازنشانی صبر کنید و دوباره تلاش کنید'],
        ['insufficient_scope', 'کلید حوزهٔ دسترسی لازم را ندارد', 'از کلیدی با دسترسی گسترده‌تر استفاده کنید'],
      ] },
    ],
  },

  'status-codes': {
    id: 'status-codes',
    title: 'کدهای وضعیت',
    lead: 'API از کدهای وضعیت استاندارد HTTP استفاده می‌کند.',
    blocks: [
      { type: 'table', headers: ['Code', 'معنا'], rows: [
        ['200', 'OK — درخواست با موفقیت انجام شد'],
        ['201', 'Created — منبع جدید ایجاد شد'],
        ['400', 'Bad request — ورودی نامعتبر است'],
        ['401', 'Unauthorized — کلید ارسال نشده یا نامعتبر است'],
        ['403', 'Forbidden — کلید حوزهٔ دسترسی لازم را ندارد'],
        ['404', 'Not found — منبع وجود ندارد'],
        ['429', 'Too many requests — محدودیت نرخ اعمال شده است'],
        ['500', 'خطای داخلی سرور'],
      ] },
    ],
  },
};

/** Flattened, ordered article list (for prev/next navigation). */
export const docOrder = docGroups.flatMap((g) => g.items);
