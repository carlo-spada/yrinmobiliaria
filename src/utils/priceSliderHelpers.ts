/**
 * Non-linear price slider helpers for wide MXN ranges.
 * UI range: slider 0–100 maps to prices 0–100,000,000 MXN.
 * Pure log curve for smooth progression: small steps at the low end, large at the high end.
 */

const MIN_PRICE = 100; // logical minimum for log scale
const MAX_PRICE = 100000000; // 100M MXN

/**
 * Convert linear slider value (0-100) to price.
 */
export const toLogPrice = (sliderValue: number): number => {
  const pos = Math.max(0, Math.min(100, sliderValue));
  if (pos === 0) return 0;
  const ratio = pos / 100; // 0..1
  const price = MIN_PRICE * Math.pow(MAX_PRICE / MIN_PRICE, ratio);
  // Round to nearest 1k for cleaner values
  return Math.round(price / 1000) * 1000;
};

/**
 * Convert price back to linear slider value (0-100).
 */
export const fromLogPrice = (price: number): number => {
  if (!price || price <= 0) return 0;
  const clamped = Math.max(MIN_PRICE, Math.min(MAX_PRICE, price));
  const ratio = Math.log(clamped / MIN_PRICE) / Math.log(MAX_PRICE / MIN_PRICE); // 0..1
  const pos = ratio * 100;
  return Math.max(0, Math.min(100, Math.round(pos)));
};

/**
 * Format price as Mexican currency.
 */
export const formatMXN = (value: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export { MIN_PRICE, MAX_PRICE };
