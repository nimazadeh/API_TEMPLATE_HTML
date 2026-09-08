import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const en = read('src/locales/en.json');
const fa = read('src/locales/fa.json');
const placeholders = (value) => [...new Set([...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();

function filesIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

test('Catalogs have matching keys, nonempty translations and interpolation variables', () => {
  expect(Object.keys(en).sort()).toEqual(Object.keys(fa).sort());
  for (const key of Object.keys(en)) {
    expect(en[key].trim(), key).not.toBe('');
    expect(fa[key].trim(), key).not.toBe('');
    expect(placeholders(en[key]), key).toEqual(placeholders(fa[key]));
  }
});

test('Every literal t()/tr() call resolves in both languages', () => {
  for (const file of filesIn('src/js').filter((f) => f.endsWith('.js'))) {
    const source = fs.readFileSync(file, 'utf8');
    for (const [, key] of source.matchAll(/\b(?:tr|t)\(['"]([^'"]+)['"]/g)) {
      expect(en[key], `${file}: ${key}`).toBeDefined();
      expect(fa[key], `${file}: ${key}`).toBeDefined();
    }
  }
});

test('Localized fixture pairs preserve shape, IDs, timestamps and technical data', () => {
  const technical = /^(id|apiId|endpointId|timestamp|createdAt|updatedAt|lastUsedAt|lastActive|sentAt|joined|date|periodStart|periodEnd|method|path|status|role|environment|env|prefix|permission|email|ip|url|baseUrl|basePath|package|install|version|type|location|scope|scopes|responseExample|requestSchema|stackTrace|request|user)$/;
  const compare = (left, right, key = '', where = '') => {
    if (technical.test(key)) {
      expect(right, where).toEqual(left);
    } else if (left && typeof left === 'object') {
      expect(Array.isArray(right), where).toBe(Array.isArray(left));
      expect(Object.keys(right).sort(), where).toEqual(Object.keys(left).sort());
      for (const child of Object.keys(left)) compare(left[child], right[child], child, `${where}.${child}`);
    } else if (typeof left !== 'string') {
      expect(right, where).toEqual(left);
    } else {
      expect(typeof right, where).toBe('string');
      expect(right.length, where).toBeGreaterThan(0);
    }
  };
  for (const file of fs.readdirSync('src/js/data').filter((f) => f.endsWith('.en.json'))) {
    const original = file.replace('.en.json', '.json');
    compare(read(`src/js/data/${original}`), read(`src/js/data/${file}`), '', file);
  }
});
