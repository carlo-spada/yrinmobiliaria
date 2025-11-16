/**
 * Secure logging utility that only logs to console in development
 * In production, sensitive errors are hidden from the browser console
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log error messages - only visible in development
   * @param message - Human-readable error message
   * @param error - Optional error object (hidden in production)
   */
  error: (message: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // TODO: In production, send to server-side logging service
  },

  /**
   * Log informational messages - only visible in development
   * @param message - Human-readable message
   * @param data - Optional data object (hidden in production)
   */
  info: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(message, data);
    }
  },

  /**
   * Log warning messages - only visible in development
   * @param message - Human-readable warning message
   * @param data - Optional data object (hidden in production)
   */
  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },
};
