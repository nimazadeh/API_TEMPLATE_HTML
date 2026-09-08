#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(repo, 'release', 'APIForge-X');
const pack = path.join(repo, 'packaging');

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}
function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}
function copyFile(src, dest) {
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
}
function copyDir(src, dest, filter) {
  mkdirp(dest);
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (ent.name === '.git' || ent.name === 'node_modules') continue;
    const from = path.join(src, ent.name);
    const to = path.join(dest, ent.name);
    if (filter && !filter(from, ent)) continue;
    if (ent.isDirectory()) copyDir(from, to, filter);
    else copyFile(from, to);
  }
}

rmrf(outRoot);
mkdirp(outRoot);

// Root meta
copyFile(path.join(pack, 'PACKAGE-README.md'), path.join(outRoot, 'README.md'));
copyFile(path.join(pack, 'CHANGELOG.md'), path.join(outRoot, 'CHANGELOG.md'));
copyFile(path.join(pack, 'LICENSE.txt'), path.join(outRoot, 'LICENSE.txt'));

// Documentation
copyDir(path.join(pack, 'Documentation'), path.join(outRoot, 'Documentation'));

// Assets
const assetsOut = path.join(outRoot, 'Assets');
mkdirp(assetsOut);
copyFile(path.join(pack, 'Assets', 'SCREENSHOTS.md'), path.join(assetsOut, 'SCREENSHOTS.md'));
const shotSrc = path.join(pack, 'Assets');
if (fs.existsSync(shotSrc)) {
  for (const f of fs.readdirSync(shotSrc).filter((n) => n.endsWith('.png'))) {
    copyFile(path.join(shotSrc, f), path.join(assetsOut, f));
  }
}

// HTML-Version from dist
const dist = path.join(repo, 'dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  execSync('npm run build', { cwd: repo, stdio: 'inherit' });
}
copyDir(dist, path.join(outRoot, 'HTML-Version'));

// Source-Version
const srcOut = path.join(outRoot, 'Source-Version');
mkdirp(srcOut);
const sourceTop = [
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'playwright.config.js',
  '.gitignore',
];
for (const f of sourceTop) copyFile(path.join(repo, f), path.join(srcOut, f));
for (const f of fs.readdirSync(repo).filter((n) => n.endsWith('.html'))) {
  copyFile(path.join(repo, f), path.join(srcOut, f));
}
copyDir(path.join(repo, 'src'), path.join(srcOut, 'src'));
copyDir(path.join(repo, 'scripts'), path.join(srcOut, 'scripts'));
copyDir(path.join(repo, 'tests'), path.join(srcOut, 'tests'));
copyDir(path.join(repo, 'docs'), path.join(srcOut, 'docs'));
copyFile(path.join(pack, 'LICENSE.txt'), path.join(srcOut, 'LICENSE.txt'));
fs.writeFileSync(
  path.join(srcOut, 'README.md'),
  `# APIForge X — Source

See the parent package \`Documentation/\` for installation, theming, RTL, and adding pages.

\`\`\`bash
npm install
npm run dev
npm run build
\`\`\`
`
);

// Verify HTML-Version
const htmlDir = path.join(outRoot, 'HTML-Version');
const htmlFiles = fs.readdirSync(htmlDir).filter((n) => n.endsWith('.html'));
const problems = [];
const refRe = /(href|src)="([^"]+)"/g;

for (const file of htmlFiles) {
  const text = fs.readFileSync(path.join(htmlDir, file), 'utf8');
  if (text.includes('src/js/') || text.includes('src/scss/')) {
    problems.push(`${file} still references source paths`);
  }
  if (/https?:\/\/(localhost|127\.0\.0\.1)/i.test(text)) {
    problems.push(`${file} contains localhost URL`);
  }
  let m;
  while ((m = refRe.exec(text))) {
    const url = m[2];
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('#')) continue;
    if (url.startsWith('data:')) continue;
    const clean = url.split('?')[0].split('#')[0];
    if (!clean) continue;
    const target = path.resolve(htmlDir, clean);
    if (!target.startsWith(htmlDir)) continue;
    if (!fs.existsSync(target)) problems.push(`${file} missing asset ${url}`);
  }
}

const assetFiles = fs.readdirSync(path.join(htmlDir, 'assets'));
if (!assetFiles.some((n) => n.endsWith('.css'))) problems.push('no CSS in HTML-Version/assets');
if (!assetFiles.some((n) => n.endsWith('.js'))) problems.push('no JS in HTML-Version/assets');
if (!assetFiles.some((n) => n.endsWith('.woff2'))) problems.push('no fonts in HTML-Version/assets');

if (htmlFiles.length !== 31) problems.push(`expected 31 HTML pages, found ${htmlFiles.length}`);

const srcPages = fs.readdirSync(srcOut).filter((n) => n.endsWith('.html'));
if (srcPages.length !== 31) problems.push(`source HTML count ${srcPages.length}`);

if (problems.length) {
  console.error('VERIFY FAIL');
  for (const p of problems) console.error(' -', p);
  process.exit(1);
}

console.log('VERIFY OK');
console.log(' HTML pages', htmlFiles.length);
console.log(' assets', assetFiles.length);
console.log(' source html', srcPages.length);
console.log(' out', outRoot);
