import { format, formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

// Standard date format patterns
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: "dd 'de' MMMM, yyyy",
  DATETIME: 'dd/MM/yyyy HH:mm',
  DATETIME_FULL: 'dd/MM/yyyy HH:mm:ss',
  TIME: 'HH:mm',
} as const;

// Get locale based on language code
const getLocale = (lang: 'es' | 'en' = 'es') => (lang === 'es' ? es : enUS);

/**
 * Format a date to short format (dd/MM/yyyy)
 */
export const formatDate = (date: string | Date, lang: 'es' | 'en' = 'es'): string => {
  try {
    return format(new Date(date), DATE_FORMATS.SHORT, { locale: getLocale(lang) });
  } catch {
    return '-';
  }
};

/**
 * Format a date to long format (dd de MMMM, yyyy)
 */
export const formatDateLong = (date: string | Date, lang: 'es' | 'en' = 'es'): string => {
  try {
    const pattern = lang === 'es' ? DATE_FORMATS.LONG : 'MMMM dd, yyyy';
    return format(new Date(date), pattern, { locale: getLocale(lang) });
  } catch {
    return '-';
  }
};

/**
 * Format a date with time (dd/MM/yyyy HH:mm)
 */
export const formatDateTime = (date: string | Date, lang: 'es' | 'en' = 'es'): string => {
  try {
    return format(new Date(date), DATE_FORMATS.DATETIME, { locale: getLocale(lang) });
  } catch {
    return '-';
  }
};

/**
 * Format a date with full time including seconds (dd/MM/yyyy HH:mm:ss)
 */
export const formatDateTimeFull = (date: string | Date, lang: 'es' | 'en' = 'es'): string => {
  try {
    return format(new Date(date), DATE_FORMATS.DATETIME_FULL, { locale: getLocale(lang) });
  } catch {
    return '-';
  }
};

/**
 * Format a date as relative time (e.g., "hace 2 horas" / "2 hours ago")
 */
export const formatRelative = (date: string | Date, lang: 'es' | 'en' = 'es'): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: getLocale(lang) });
  } catch {
    return '-';
  }
};

/**
 * Format time only (HH:mm)
 */
export const formatTime = (date: string | Date): string => {
  try {
    return format(new Date(date), DATE_FORMATS.TIME);
  } catch {
    return '-';
  }
};
