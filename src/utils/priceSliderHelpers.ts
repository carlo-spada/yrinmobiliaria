/**
 * Non-linear price slider helpers for wide MXN ranges.
 * UI range: slider 0–100 maps to prices 1,000–100,000,000 MXN.
 * Pure log curve for smooth progression: small steps at the low end, large at the high end.
 */

const MIN_PRICE = 1000; // logical minimum for log scale and slider start
const MAX_PRICE = 100000000; // 100M MXN

// Round to two significant digits (e.g., 2345 -> 2300, 45385 -> 45000)
const roundToTwoSigDigits = (value: number): number => {
  if (value <= 0) return 0;
  const digits = Math.floor(Math.log10(value));
  const scale = Math.pow(10, Math.max(0, digits - 1));
  return Math.round(value / scale) * scale;
};

/**
 * Convert linear slider value (0-100) to price.
 */
export const toLogPrice = (sliderValue: number): number => {
  const pos = Math.max(0, Math.min(100, sliderValue));
  if (pos === 0) return MIN_PRICE;
  const ratio = pos / 100; // 0..1
  const price = MIN_PRICE * Math.pow(MAX_PRICE / MIN_PRICE, ratio);
  return roundToTwoSigDigits(price);
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
