/**
 * Non-linear price slider helpers for wide MXN ranges.
 * UI range: slider 0–100 maps to prices 0–100,000,000 MXN.
 * Exponent pushes sensitivity to the low end (midpoint ~50k).
 */

const MIN_PRICE = 0; // 0 MXN when slider is at 0
const MAX_PRICE = 100000000; // 100M MXN
const PRICE_EXPONENT = 11; // Higher exponent -> stronger low-end sensitivity

/**
 * Convert linear slider value (0-100) to price.
 */
export const toLogPrice = (sliderValue: number): number => {
  const pos = Math.max(0, Math.min(100, sliderValue));
  if (pos === 0) return 0;
  const ratio = pos / 100;
  const price = MAX_PRICE * Math.pow(ratio, PRICE_EXPONENT);
  // Round to nearest 1k for cleaner values
  return Math.round(price / 1000) * 1000;
};

/**
 * Convert price back to linear slider value (0-100).
 */
export const fromLogPrice = (price: number): number => {
  if (!price || price <= 0) return 0;
  const clamped = Math.max(0, Math.min(MAX_PRICE, price));
  const ratio = clamped / MAX_PRICE;
  const pos = Math.pow(ratio, 1 / PRICE_EXPONENT) * 100;
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

export { MIN_PRICE, MAX_PRICE, PRICE_EXPONENT };
