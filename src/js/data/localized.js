// =============================================================
// APIForge X — Locale-aware dataset selection
//
// Several mock datasets carry prose (plan blurbs, activity feed,
// retention periods, …) that must render in the active language.
// Each of those has a Persian source (the JSON imported directly)
// and an `*.en.json` twin. This helper returns whichever copy
// matches the active locale, so a single renderer can feed both
// languages without branching on every field.
//
// Usage:
//   import faPlans from '../data/mock-plans.json';
//   import enPlans from '../data/mock-plans.en.json';
//   import { localizedData } from '../data/localized.js';
//   ...
//   const plans = localizedData(faPlans, enPlans);
// =============================================================

import { getLocale } from '../core/i18n.js';

/** Return the Persian or English dataset for the active locale. */
export function localizedData(faDataset, enDataset) {
  return getLocale() === 'en' ? enDataset : faDataset;
}
