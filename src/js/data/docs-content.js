// =============================================================
// APIForge X — Documentation content (locale dispatcher)
//
// Long-form documentation is authored per locale (English and
// Persian) rather than key-by-key: the article *shape* is shared,
// the prose is not. Code samples and technical identifiers are
// identical in both files and always render LTR.
// =============================================================

import { getLocale } from '../core/i18n.js';
import * as en from './docs-content.en.js';
import * as fa from './docs-content.fa.js';

function source() {
  return getLocale() === 'fa' ? fa : en;
}

/** Sidebar groups for the active locale. */
export function docGroups() {
  return source().docGroups;
}

/** Article map for the active locale. */
export function docArticles() {
  return source().docArticles;
}

/** Flattened, ordered article ids (prev/next navigation). */
export function docOrder() {
  return source().docOrder;
}
