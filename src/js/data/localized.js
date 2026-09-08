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

/**
 * Mutable demo records with locale-aware prose. Only fields that differ in the
 * two authored fixtures get a getter; IDs, tokens, API payloads and enum values
 * remain unchanged. Explicit edits replace the getter with the user's value,
 * so switching language never resets edits, read flags or selected records.
 * Both fixtures must have the same shape/order (covered by the locale tests).
 */
export function localizedFixture(faValue, enValue) {
  if (!faValue || typeof faValue !== 'object') return localizedData(faValue, enValue);
  const result = Array.isArray(faValue) ? [] : {};
  for (const key of Object.keys(faValue)) {
    const original = faValue[key];
    const english = enValue?.[key] ?? original;
    if (original && typeof original === 'object') {
      result[key] = localizedFixture(original, english);
    } else if (typeof original === 'string' && original !== english) {
      Object.defineProperty(result, key, {
        enumerable: true,
        configurable: true,
        get: () => localizedData(original, english),
        set(value) {
          Object.defineProperty(result, key, { value, writable: true, enumerable: true, configurable: true });
        },
      });
    } else result[key] = original;
  }
  return result;
}
