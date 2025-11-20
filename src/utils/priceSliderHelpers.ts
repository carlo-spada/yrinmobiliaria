/**
 * Logarithmic price slider helpers for better UX with wide MXN ranges
 * Range: 100,000 to 50,000,000 MXN
 */

const MIN_PRICE = 100000; // 100k MXN
const MAX_PRICE = 50000000; // 50M MXN

/**
 * Convert linear slider value (0-100) to logarithmic price
 */
export const toLogPrice = (sliderValue: number): number => {
  const minLog = Math.log(MIN_PRICE);
  const maxLog = Math.log(MAX_PRICE);
  const price = Math.exp(minLog + (maxLog - minLog) * (sliderValue / 100));
  // Round to nearest 50k for cleaner values
  return Math.round(price / 50000) * 50000;
};

/**
 * Convert price to linear slider value (0-100)
 */
export const fromLogPrice = (price: number): number => {
  const minLog = Math.log(MIN_PRICE);
  const maxLog = Math.log(MAX_PRICE);
  const clampedPrice = Math.max(MIN_PRICE, Math.min(MAX_PRICE, price));
  return ((Math.log(clampedPrice) - minLog) / (maxLog - minLog)) * 100;
};

/**
 * Format price as Mexican currency
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
