/**
 * Non-linear price slider helpers for wide MXN ranges.
 * UI range: slider 0–100 maps to prices 0–100,000,000 MXN.
 * Uses a small linear segment (0–5%) then a log curve to concentrate sensitivity at the low end.
 */

const MIN_PRICE = 0; // 0 MXN when slider is at 0
const MAX_PRICE = 100000000; // 100M MXN

/**
 * Convert linear slider value (0-100) to price.
 */
export const toLogPrice = (sliderValue: number): number => {
  const pos = Math.max(0, Math.min(100, sliderValue));
  if (pos === 0) return 0;

  // First 5% of the slider: small linear ramp up to ~100 MXN
  if (pos <= 5) {
    const price = (pos / 5) * 100; // 0 → 100 MXN
    return Math.round(price);
  }

  // Remaining 95%: log scale from 100 MXN to 100M
  const ratio = (pos - 5) / 95; // 0..1
  const price = Math.pow(10, 2 + 6 * ratio); // 10^2=100 to 10^8=100,000,000

  // Round to nearest 1k for cleaner values
  return Math.round(price / 1000) * 1000;
};

/**
 * Convert price back to linear slider value (0-100).
 */
export const fromLogPrice = (price: number): number => {
  if (!price || price <= 0) return 0;
  const clamped = Math.max(0, Math.min(MAX_PRICE, price));

  // If within the small linear ramp (0-100 MXN)
  if (clamped <= 100) {
    return Math.max(0, Math.min(5, (clamped / 100) * 5));
  }

  // In the log portion
  const ratio = (Math.log10(clamped) - 2) / 6; // 0..1
  const pos = 5 + ratio * 95;
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
